# dataset index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
gen_type = 1
installed_capacity = 0.5864 # kW

# reference        wind   wind   wave   tidal  solar
capacityfactors = [0.3233,0.4796,0.2832,0.2387,0.0943]

# Load dataset
with open("../dataset/tenyearsdata.csv") as f:
    content = f.readlines()
hours = len(content)

print "Total hours in dataset: "+str(hours)+" hours"
print

total_supply = 0
total_demand = 0

exess_generation = 0
unmet_demand = 0
unmet_demand_atuse = 0

hours_met = 0

# EV performance and battery capacity
# miles per kwh includes charge/discharge efficiency of battery (to simplify model)
EV_miles_per_kwh = 4.0           
EV_battery_capacity = 24.0
EV_SOC = EV_battery_capacity * 0.5

# Manual charge profile set to night time charging
#                                        1 1 1                   1 1
#                    0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
EV_charge_profile = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

# Electric vehicle use profile
#                                     1 1 1                   1 1
#                 0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

# Calculate total miles per day travelled
EV_miles_day = 0
for h in EV_use_profile:
    EV_miles_day += h

EV_kWhd = EV_miles_day / EV_miles_per_kwh

# Calcuate profile factor
EV_profile_factor = 0
for h in EV_charge_profile:
    EV_profile_factor += h
    
EV_profile_scale = EV_kWhd / EV_profile_factor

total_miles_driven = 0;

for hour in range(0, hours):
    values = content[hour].split(",")
    
    supply = float(values[gen_type]) * installed_capacity
    total_supply += supply
        
    # EV Discharge
    unmet_discharge = 0
    miles = EV_use_profile[hour%24]
    EV_discharge = miles / EV_miles_per_kwh
    if (EV_SOC-EV_discharge)<0:
        EV_discharge = EV_SOC
        unmet_discharge = (miles / EV_miles_per_kwh) - EV_discharge
        unmet_demand_atuse += unmet_discharge
    EV_SOC -= EV_discharge
    
    miles = EV_discharge * EV_miles_per_kwh
    total_miles_driven += miles

    # EV Charge 
    # charge rate here is set by manual charge profile scaled to the
    # amount required to meet the daily driving demand
    EV_charge_rate = EV_charge_profile[hour%24] * EV_profile_scale
    
    # Max capacity limit
    if ((EV_SOC+EV_charge_rate)>EV_battery_capacity):
        EV_charge_rate = EV_battery_capacity - EV_SOC
        
    EV_SOC += EV_charge_rate
    
    demand = EV_charge_rate
    total_demand += demand
    
    balance = supply - demand
    
    if balance>=0:
        exess_generation += balance
        hours_met += 1
    else:
        unmet_demand += -balance

capacity_factor = total_supply / (installed_capacity*hours) * 100

prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
prc_time_met = (1.0 * hours_met / hours) * 100

total_supply_req = total_demand / hours / capacityfactors[gen_type]

print "EV miles/year: %0.1f miles" % (EV_miles_day * 365.2)
print "EV miles driven: %0.1f miles" % (total_miles_driven/10)
print
print "Total supply: %0.1f kWh" % (total_supply/10)
print "Total demand: %0.1f kWh" % ((total_demand)/10)
print
print "Exess generation %d kWh" % (exess_generation/10)
print "Unmet elec demand %d kWh" % (unmet_demand/10)
print "Unmet demand at use %d kWh" % (unmet_demand_atuse/10)
print 
print "Percentage of demand supplied directly %d%%" % prc_demand_supplied
print "Percentage of time supply was more or the same as the demand %d%%" % prc_time_met
print 
print "Generation capacity required to meet demand: %0.4f kW" % total_supply_req
