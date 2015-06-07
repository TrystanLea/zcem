# dataset index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
gen_type = 0
installed_capacity = 0.870 # kW

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

# Electric vehicle use profile
#                                     1 1 1                   1 1
#                 0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

# Calculate total miles per day travelled
EV_miles_day = 0
for h in EV_use_profile:
    EV_miles_day += h

total_miles_driven = 0;

for hour in range(0, hours):
    values = content[hour].split(",")
    
    supply = float(values[gen_type]) * installed_capacity
    total_supply += supply
    
    balance = supply
    demand = 0
        
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
    # Currently allows for charging all of the time
    # assumes that on average even in hours where the car drives
    # it is also plugged in for part of the time
    
    EV_charge_rate_reducer = 1.0;
    
    EV_SOC_prc = EV_SOC / EV_battery_capacity
    
    if EV_SOC_prc>0.5:
        EV_charge_rate_reducer = (1.0 - 2*(EV_SOC_prc - 0.5))*0.3
    
    EV_charge_rate = 0
    if balance>0:
        if (EV_SOC+balance)>(EV_battery_capacity*0.8):
            EV_charge_rate = (EV_battery_capacity*0.8) - EV_SOC
        else:
            EV_charge_rate = balance
        EV_charge_rate *= EV_charge_rate_reducer
    
    EV_charge_rate_suppliment = 0
    if EV_SOC<(0.2*EV_battery_capacity) and EV_charge_rate<0.3:
        EV_charge_rate_suppliment = 0.3 - EV_charge_rate
        
    EV_SOC += EV_charge_rate + EV_charge_rate_suppliment
    
    balance -= EV_charge_rate
    balance -= EV_charge_rate_suppliment
        
    demand += EV_charge_rate   
    demand += EV_charge_rate_suppliment
    
    
    total_demand += demand
    
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
print "Generation capacity required to meet demand: %0.3f kW" % total_supply_req
