
print
print "==================================================================="
print "Renewable supply and space heating demand model"
print "==================================================================="
print

import math
# line index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
gen_type = 3
gen_capacity = 0.776 * 1.2

target_internal_temperature = 18.0
fabric_efficiency = 0.120            # 120 W/K
solar_gains_capacity = 5.0           # 5kW = average of about 500W from MyHomeEnergyPlanner model
internal_gains = 2190                # kWh (captured internal gains)
heatpump_COP = 3.0

hourly_internal_gains = internal_gains / 8760.0

# Load dataset
with open("../dataset/tenyearsdata.csv") as f:
    tenyearsdatalines = f.readlines()
hours = len(tenyearsdatalines)

with open("../dataset/temperature.csv") as f:
    temperaturelines = f.readlines()
days = len(temperaturelines)

total_supply = 0
total_demand = 0

exess_generation = 0
unmet_demand = 0
hours_met = 0

average_temperature = 0

total_heat_demand = 0
total_internal_gains_unused = 0
total_solar_gains = 0
total_solar_gains_unused = 0
total_heating_demand = 0

heatstore_capacity =2100
heatstore = heatstore_capacity * 0.5

for hour in range(0, hours):
    day = int(math.floor(hour / 24))
    
    capacityfactors = tenyearsdatalines[hour].split(",")
    temperature = float(temperaturelines[day].split(",")[1])
    
    # Renewable supply
    gen_power = float(capacityfactors[gen_type]) * gen_capacity
    
    supply = gen_power
    total_supply += supply
    
    # External temperature
    average_temperature += temperature
    
    # 1) Total heat demand
    deltaT = target_internal_temperature - temperature
    heating_demand = fabric_efficiency * deltaT
    
    if heating_demand>0:
        total_heat_demand += heating_demand
    else:
        heating_demand = 0
        
    # 2) Subtract estimate for other internal gains
    if (heating_demand-hourly_internal_gains)>=0:
        heating_demand -= hourly_internal_gains
    else:
        total_internal_gains_unused += (hourly_internal_gains - heating_demand)
        heating_demand = 0
        
    # 3) Calc solar gains and subtract from heat demand
    solar_gains = float(capacityfactors[4]) * solar_gains_capacity
    total_solar_gains += solar_gains
    
    if (heating_demand-solar_gains)>=0: 
        heating_demand -= solar_gains
    else:
        total_solar_gains_unused += (solar_gains - heating_demand)
        heating_demand = 0
        
    total_heating_demand += heating_demand
    
    if heatstore>heating_demand:
        heatstore_discharge = heating_demand
        heatstore -= heatstore_discharge
        heating_demand = 0
    else:
        heating_demand -= heatstore
        heatstore_discharge = heatstore
        heatstore = 0
    
    heatpump_electricity_demand = heating_demand / heatpump_COP
    demand = heatpump_electricity_demand
    total_demand += demand
    
    balance = supply - demand
    
    heatstore_charge = 0
    
    if balance>=0:
        heatpump_electricity_demand = balance
        heatstore_charge = heatpump_electricity_demand * heatpump_COP
        
        if (heatstore+heatstore_charge)>heatstore_capacity:
            heatstore_charge = heatstore_capacity - heatstore 
            
        heatpump_electricity_demand = heatstore_charge / heatpump_COP
        
        heatstore += heatstore_charge
        balance -= heatpump_electricity_demand
        
        demand = heatpump_electricity_demand
        total_demand += demand

    if balance>=0:
        exess_generation += balance
        hours_met += 1
    else:
        unmet_demand += -balance

# ----------------------------------------------------------------

gen_capacity_factor = total_supply / (gen_capacity * hours) * 100

average_temperature = average_temperature / hours

used_solar_gains = total_solar_gains - total_solar_gains_unused
used_internal_gains = (hourly_internal_gains*hours) - total_internal_gains_unused

prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
prc_time_met = (1.0 * hours_met / hours) * 100

prc_over_supply = ((total_supply / total_demand) * 100) - 100
prc_exess = (exess_generation / total_demand) * 100

print "Building fabric performance:\t\t%d W/K" % (fabric_efficiency*1000)
print "Average external temperature:\t\t%0.2fC" % average_temperature
print "Target internal temperature:\t\t%0.2fC" % target_internal_temperature
print
print "Total heat demand\t\t\t%d kWh/y" % (total_heat_demand/10)
print "- Total utilized internal gains:\t%d kWh/y of %d kWh/y" % (used_internal_gains/10, (hourly_internal_gains*hours)/10)
print "- Total utilized solar gains:\t\t%d kWh/y of %d kWh/y" % (used_solar_gains/10,total_solar_gains/10)
print "= Total space heating demand:\t\t%d kWh/y" % (total_heating_demand/10)
print
print "Total heatpump electricity demand:\t%d kWh/y" % (total_demand/10)
print "Total electricity supply:\t\t%d kWh/y" % (total_supply/10)
print "Percentage over supply:\t\t\t%d%%" % prc_over_supply
print
print "Exess generation:\t\t\t%d kWh/y (%d%%)" % ((exess_generation/10), prc_exess)
print "Unmet demand:\t\t\t\t%d kWh/y" % (unmet_demand/10)
print
print "%% of demand supplied directly\t\t%d%%" % prc_demand_supplied
print "%% of time supply >= demand\t\t%d%%" % prc_time_met

