# dataset index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity

offshore_wind_installed_capacity = 1.1635*1.2 # kW
wind_cost = 0.0825

solar_installed_capacity = 0.0 # kW
solar_cost = 0.07923

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

total_cost = 0

for hour in range(0, hours):
    values = content[hour].split(",")
    
    wind = float(values[0]) * offshore_wind_installed_capacity
    solar = float(values[4]) * solar_installed_capacity
    
    total_cost += (wind*wind_cost) + (solar*solar_cost)
    
    supply = wind + solar
    total_supply += supply
    
    demand = house_power
    total_demand += demand
    
    balance = supply - demand
    
    if balance>=0:
        exess_generation += balance
        hours_met += 1
    else:
        unmet_demand += -balance

prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100

prc_time_met = (1.0 * hours_met / hours) * 100

met_demand = total_demand - unmet_demand

unitcost = total_cost / met_demand
cost = total_cost / prc_demand_supplied

print "WIND CAP: "+str(offshore_wind_installed_capacity)
print "SOLAR CAP: "+str(solar_installed_capacity)
print
print "Total cost %0.2f " % (total_cost/10)
print "Unit cost %0.3f " % (unitcost)
print "cost %0.3f " % (cost)
print
print "Total supply: %d kWh" % total_supply
print "Total demand: %d kWh" % total_demand
print
print "Exess generation %d kWh" % exess_generation
print "Unmet demand %d kWh" % unmet_demand
print 
print "Percentage of demand supplied directly %0.2f%%" % prc_demand_supplied
print "Percentage of time supply was more or the same as the demand %d%%" % prc_time_met
