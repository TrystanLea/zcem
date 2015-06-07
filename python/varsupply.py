# dataset index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
gen_type = 4

installed_capacity = 1.0 # kW

# Load dataset
with open("../dataset/tenyearsdata.csv") as f:
    content = f.readlines()
hours = len(content)

print "Total hours in dataset: "+str(hours)+" hours"

total_supply = 0

for hour in range(0, hours):
    values = content[hour].split(",")
    
    supply = float(values[gen_type]) * installed_capacity
    total_supply += supply

capacity_factor = total_supply / (installed_capacity*hours) * 100

print "Installed capacity: %s kW" % installed_capacity
print "Total supply: %d kWh" % total_supply
print "Capacity factor: %0.2f%%" % capacity_factor
