import math

# Load dataset
with open("../tenyearsdata.csv") as f:
    tenyearsdatalines = f.readlines()
hours = len(tenyearsdatalines)

with open("../temperature.csv") as f:
    temperaturelines = f.readlines()
days = len(temperaturelines)

print "Total hours in dataset: "+str(hours)+" hours"
print

# ---------------------------------------------------------------------------
# dataset index:
# 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
onshorewind_capacity = 0.0
offshorewind_capacity = 1.3
solarpv_capacity = 1.3

# ---------------------------------------------------------------------------
traditional_electric = 2200
hourly_traditional_electric = traditional_electric / 8764.8
# ---------------------------------------------------------------------------
# Space heating variables
target_internal_temperature = 18.0
fabric_efficiency = 0.120            # 120 W/K
solar_gains_capacity = 5.0           # 5kW = average of about 500W from MyHomeEnergyPlanner model
heatpump_COP = 3.0

hourly_internal_gains = hourly_traditional_electric

# heatstore_capacity = 10

# ---------------------------------------------------------------------------
# EV performance and battery capacity
# miles per kwh includes charge/discharge efficiency of battery (to simplify model)
EV_miles_per_kwh = 4.0
EV_battery_capacity = 24.0

# Electric vehicle use profile
#                                     1 1 1                   1 1
#                 0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

# Calculate total miles per day travelled
EV_miles_day = 0
for h in EV_use_profile:
    EV_miles_day += h

# ---------------------------------------------------------------------------
# liion_capacity = 7
# ---------------------------------------------------------------------------

for run in range(0,100):

    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    unmet_demand_atuse = 0

    hours_met = 0

    average_temperature = 0

    total_heat_demand = 0
    total_internal_gains_unused = 0
    total_solar_gains = 0
    total_solar_gains_unused = 0
    total_heating_demand = 0
    
    total_heatpump_demand = 0
    total_miles_driven = 0
    
    # heatstore = heatstore_capacity * 0.5
    EV_SOC = EV_battery_capacity * 0.5
    
    
    liion_total_charge = 0
    liion_total_discharge = 0
    
    liion_capacity = 0 + run
    liion_SOC = liion_capacity * 0.5

    for hour in range(0, hours):
        day = int(math.floor(hour / 24))
        capacityfactors = tenyearsdatalines[hour].split(",")
        temperature = float(temperaturelines[day].split(",")[1])

        # ---------------------------------------------------------------------------
        # Renewable supply
        # ---------------------------------------------------------------------------    
        onshorewind = float(capacityfactors[0]) * onshorewind_capacity
        offshorewind = float(capacityfactors[1]) * offshorewind_capacity
        solarpv = float(capacityfactors[4]) * solarpv_capacity
        supply = onshorewind + offshorewind + solarpv
        total_supply += supply
        
        balance = supply
        demand = 0

        # ---------------------------------------------------------------------------
        # Traditional electricity demand
        # ---------------------------------------------------------------------------
        tradelec = hourly_traditional_electric
        balance -= tradelec
        demand += tradelec
        
        # ---------------------------------------------------------------------------
        # Space Heating
        # ---------------------------------------------------------------------------
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
        """
        if heatstore>heating_demand:
            heatstore_discharge = heating_demand
            heatstore -= heatstore_discharge
            heating_demand = 0
        else:
            heating_demand -= heatstore
            heatstore_discharge = heatstore
            heatstore = 0
        """
        heatpump_electricity_demand = heating_demand / heatpump_COP

        balance -= heatpump_electricity_demand
        demand += heatpump_electricity_demand
        total_heatpump_demand += heatpump_electricity_demand
        
        # ---------------------------------------------------------------------------
        # Electric vehicles
        # --------------------------------------------------------------------------- 
        EV_charge_rate = 0
        
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

        """
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

        """
        # Simple night time charge alternative
        
        EV_kWhd = EV_miles_day / EV_miles_per_kwh
        # Manual charge profile set to night time charging
        #                                        1 1 1                   1 1
        #                    0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
        # EV_charge_profile = [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        # EV_charge_profile = [1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        EV_charge_profile = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        # Calcuate profile factor
        EV_profile_factor = 0
        for h in EV_charge_profile: EV_profile_factor += h
        EV_profile_scale = EV_kWhd / EV_profile_factor
        
        EV_charge_rate = EV_charge_profile[hour%24] * EV_profile_scale
        
        if ((EV_SOC+EV_charge_rate)>EV_battery_capacity):
            EV_charge_rate = EV_battery_capacity - EV_SOC
            
        EV_SOC += EV_charge_rate
        balance -= EV_charge_rate
        demand += EV_charge_rate
        
        # ---------------------------------------------------------------------------
        # Heatstore remaining supply
        # ---------------------------------------------------------------------------
        """
        heatstore_charge = 0
        heatpump_electricity_demand_heatstore = 0
        
        if balance>=0:
            heatpump_electricity_demand_heatstore = balance
            heatstore_charge = heatpump_electricity_demand_heatstore * heatpump_COP
            
            if (heatstore+heatstore_charge)>heatstore_capacity:
                heatstore_charge = heatstore_capacity - heatstore 
                
            heatpump_electricity_demand_heatstore = heatstore_charge / heatpump_COP
            heatstore += heatstore_charge

            balance -= heatpump_electricity_demand_heatstore
            demand += heatpump_electricity_demand_heatstore
            total_heatpump_demand += heatpump_electricity_demand_heatstore
        """
        # ---------------------------------------------------------------------------
        # Electric store remaining supply
        # ---------------------------------------------------------------------------
        liion_charge = 0
        liion_discharge = 0

        if balance>0:
            liion_charge = balance
            if (liion_SOC+liion_charge)>liion_capacity:
                liion_charge = liion_capacity - liion_SOC
            liion_SOC += liion_charge
            balance -= liion_charge
            liion_total_charge += liion_charge
            
        else:
            liion_discharge = -balance
            if (liion_SOC-liion_discharge)<0:
                liion_discharge = liion_SOC
            liion_SOC -= liion_discharge
            balance += liion_discharge
            liion_total_discharge += liion_discharge
        
        # ---------------------------------------------------------------------------
        # Final balance
        # ---------------------------------------------------------------------------
        total_demand += demand
        
        if balance>=0:
            exess_generation += balance
            hours_met += 1
        else:
            unmet_demand += -balance


    average_temperature = average_temperature / hours

    used_solar_gains = total_solar_gains - total_solar_gains_unused
    used_internal_gains = (hourly_internal_gains*hours) - total_internal_gains_unused

    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100
    
    number_of_cycles = 0
    if liion_capacity:
        number_of_cycles = liion_total_discharge / liion_capacity
    
    # print total_demand
    print "%s,%d,%d,%0.1f,%d,%0.1f" % (liion_capacity, liion_total_charge, liion_total_discharge, prc_demand_supplied,unmet_demand,number_of_cycles)

    """
    print "-----------------------------------------------------------------"
    print "Space heating"
    print "-----------------------------------------------------------------"
    print "Building fabric performance:\t\t%d W/K" % (fabric_efficiency*1000)
    print "Average external temperature:\t\t%0.2fC" % average_temperature
    print "Target internal temperature:\t\t%0.2fC" % target_internal_temperature
    print
    print "Total heat demand\t\t\t%d kWh/y" % (total_heat_demand/10)
    print "- Total utilized internal gains:\t%d kWh/y of %d kWh/y" % (used_internal_gains/10, (hourly_internal_gains*hours)/10)
    print "- Total utilized solar gains:\t\t%d kWh/y of %d kWh/y" % (used_solar_gains/10,total_solar_gains/10)
    print "= Total space heating demand:\t\t%d kWh/y" % (total_heating_demand/10)
    print "= Total heatpump electricity demand:\t%d kWh/y" % (total_heatpump_demand/10)
    print
    print "-----------------------------------------------------------------"
    print "Electric vehicles"
    print "-----------------------------------------------------------------"
    print "EV miles/year: %0.1f miles" % (EV_miles_day * 365.2)
    print "EV miles driven: %0.1f miles" % (total_miles_driven/10)
    print
    print "-----------------------------------------------------------------"
    print "Final balance"
    print "-----------------------------------------------------------------"
    print "Total supply: %0.1f kWh" % (total_supply/10)
    print "Total demand: %0.1f kWh" % ((total_demand)/10)
    print
    print "Exess generation %d kWh" % (exess_generation/10)
    print "Unmet elec demand %d kWh" % (unmet_demand/10)
    print "Unmet demand at use %d kWh" % (unmet_demand_atuse/10)
    print 
    print "Percentage of demand supplied directly %0.1f%%" % prc_demand_supplied
    print "Percentage of time supply was more or the same as the demand %0.1f%%" % prc_time_met
    """
