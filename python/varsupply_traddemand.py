print "Renewable supply and traditional demand model"
print "Select renewable energy type to model below"
print "Automatically works out gen_capacity to match demand"
print

# line index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
gen_type = 0
oversupply = 1.0
annual_demand = 3300 # kWh

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

# normalize traditional demand data
total_trad_demand = 0
total_gen = 0
for hour in range(0, hours):
    line = content[hour]
    line = line[:-1]
    values = line.split(",")
    total_gen += float(values[gen_type])
    total_trad_demand += float(values[5])

gen_capacity_factor = total_gen / hours
gen_capacity = (oversupply*annual_demand*10) / (gen_capacity_factor * hours)

for hour in range(0, hours):
    line = content[hour]
    line = line[:-1]
    values = line.split(",")
    
    gen_power = float(values[gen_type]) * gen_capacity
    
    supply = gen_power
    total_supply += supply
    
    trad_demand_factor = float(values[5]) / total_trad_demand
    demand = trad_demand_factor * annual_demand * 10
    total_demand += demand
    
    balance = supply - demand
    
    if balance>=0:
        exess_generation += balance
        hours_met += 1
    else:
        unmet_demand += -balance

gen_capacity_factor = total_supply / (gen_capacity*hours) * 100

prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100

prc_time_met = (1.0 * hours_met / hours) * 100

print "Generator capacity: %s kW" % gen_capacity
print "Capacity factor: %d%%" % gen_capacity_factor
print
print "Total supply: %d kWh/y" % (total_supply/10)
print "Total demand: %d kWh/y" % (total_demand/10)
print
print "Exess generation %d kWh/y" % (exess_generation/10)
print "Unmet demand %d kWh/y" % (unmet_demand/10)
print 
print "Percentage of demand supplied directly %d%%" % prc_demand_supplied
print "Percentage of time supply was more or the same as the demand %d%%" % prc_time_met
