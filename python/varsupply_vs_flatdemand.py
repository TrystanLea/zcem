# dataset index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
gen_type = 1

installed_capacity = 0.785 # kW

annual_house_demand = 3300 # kWh
house_power = (annual_house_demand * 10.0) / 87648   

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

hours_met = 0

for hour in range(0, hours):
    values = content[hour].split(",")
    
    supply = float(values[gen_type]) * installed_capacity
    total_supply += supply
    
    demand = house_power
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

print "Installed capacity: %s kW" % installed_capacity
print "Capacity factor: %d%%" % capacity_factor
print
print "Total supply: %d kWh" % total_supply
print "Total demand: %d kWh" % total_demand
print
print "Exess generation %d kWh" % exess_generation
print "Unmet demand %d kWh" % unmet_demand
print 
print "Percentage of demand supplied directly %d%%" % prc_demand_supplied
print "Percentage of time supply was more or the same as the demand %d%%" % prc_time_met
