/*

1. Renewable supply
2. Traditional electricity demand
3. Space Heating
4. Water Heating **
5. EV's
6. Heatstore
7. Lithium ion store
8. Pumped storage
-----
9. Hydrogen production, storage & fuelcell's
10. Synthetic fuel production: liquid and gas & stores
11. Industrial demand
12. Aviation demand
13. Gas turbines for backup

- electric trains
- hydrogen vehicles
- biofuel vehicles
- biofuel aircraft

*/


function national_init()
{
    // ---------------------------------------------------------------------------
    // dataset index:
    // 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
    onshorewind_capacity = 1.86
    offshorewind_capacity = 0.0
    solarpv_capacity = 1.86
    hydro_capacity = 0.0
    wave_capacity = 0.0
    tidal_capacity = 0.0
    nuclear_capacity = 0.0

    // ---------------------------------------------------------------------------
    traditional_electric = 2555
    hourly_traditional_electric = traditional_electric / 8764.8

    // ---------------------------------------------------------------------------
    // Space heating variables
    target_internal_temperature = 18.4
    fabric_efficiency = 0.120            // 120 W/K
    solar_gains_capacity = 5.0           // 5kW = average of about 500W from MyHomeEnergyPlanner model
    heatpump_COP = 3.0

    heatstore_capacity = 10
    heatstore = heatstore_capacity * 0.5

    // ---------------------------------------------------------------------------
    // EV performance and battery capacity
    // miles per kwh includes charge/discharge efficiency of battery (to simplify model)
    EV_miles_per_kwh = 4.0
    EV_battery_capacity = 24.0
    EV_SOC = EV_battery_capacity * 0.5

    EV_annual_miles = 6100;
    // Electric vehicle use profile ( miles )
    //                                    1 1 1                   1 1
    //                0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
    EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

    // Calculate total miles per day travelled
    EV_miles_day = 0; for (h in EV_use_profile) EV_miles_day += EV_use_profile[h]
    // Normalise
    for (h in EV_use_profile) EV_use_profile[h] = (EV_use_profile[h] / EV_miles_day)

    // ---------------------------------------------------------------------------
    liion_capacity = 0
    liion_SOC = liion_capacity * 0.5
    // ---------------------------------------------------------------------------
    electrolysis_capacity = 1.0;
    fuel_cell_capacity = 1.0;
    
    H2_store_capacity = 10.0;
    H2_store_level = 0
    
    liquid_store_capacity = 350.0
    liquid_store_level = 0
    
    methane_store_capacity = 12500.0
    methane_store_level = 0
    
    CCGT_capacity = 2.0
    
    // Aviation
    aviation_miles_per_kwh = 1.3  // passenger miles per kwh based on 50 kWh per 100p/km
    aviation_miles = 1200 
    
    view_mode = "supplydemand"
    
    $("#view-stores").click(function(){
        view_mode = "stores"
    });
}
function national_run()
{
    total_supply = 0
    total_demand = 0

    total_heat_demand = 0
    total_internal_gains_unused = 0
    total_solar_gains = 0
    total_solar_gains_unused = 0
    total_heating_demand = 0
    total_heatpump_demand = 0
    
    average_temperature = 0

    exess_generation = 0
    unmet_demand = 0
    unmet_demand_atuse = 0
    hours_met = 0
    total_miles_driven = 0
    
    total_liion_charge = 0
    total_liion_discharge = 0
    
    total_electrolysis_demand = 0
    total_fuel_cell_output = 0
    
    biomass_requirement = 0
    total_synthfuel_production = 0
    total_methane_production = 0
    total_CCGT_output = 0
    
    H2_store_level = 0
    liquid_store_level = 50
    methane_store_level = 300
    
    unmet_aviation_demand = 0

    data = [];
    data[0] = [];
    data[1] = [];
    data[2] = [];
    data[3] = [];
    data[4] = [];
    
    total_trad_demand = 0
    var capacityfactors_all = [];
    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        for (var i=0; i<capacityfactors.length; i++) {
            capacityfactors[i] = parseFloat(capacityfactors[i]);
        }
        capacityfactors_all.push(capacityfactors)
        total_trad_demand += parseFloat(capacityfactors[5])
    }

    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = capacityfactors_all[hour];
        
        var day = parseInt(Math.floor(hour / 24))
        var temperature = parseFloat(temperaturelines[day].split(",")[1]);
        
        // ---------------------------------------------------------------------------
        // Renewable supply
        // --------------------------------------------------------------------------- 
        // 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity   
        onshorewind = capacityfactors[0] * onshorewind_capacity
        offshorewind = capacityfactors[1] * offshorewind_capacity
        wave = capacityfactors[2] * wave_capacity
        tidal = capacityfactors[3] * tidal_capacity
        solarpv = capacityfactors[4] * solarpv_capacity
        hydro = 0.4 * hydro_capacity // Assuming 40% capacity factor
        nuclear = 0.9 * nuclear_capacity // Assuming 90% uptime
        
        supply = onshorewind + offshorewind + solarpv + wave + tidal + hydro + nuclear
        total_supply += supply
        
        balance = supply
        demand = 0

        // ---------------------------------------------------------------------------
        // Traditional electricity demand
        // ---------------------------------------------------------------------------
        trad_demand_factor = capacityfactors[5] / total_trad_demand
        tradelec = trad_demand_factor * traditional_electric * 10
        balance -= tradelec
        demand += tradelec
        
        // ---------------------------------------------------------------------------
        // Space Heating
        // ---------------------------------------------------------------------------
        // External temperature
        average_temperature += temperature
        
        // 1) Total heat demand
        deltaT = target_internal_temperature - temperature
        heating_demand = fabric_efficiency * deltaT
        
        if (heating_demand>0) {
            total_heat_demand += heating_demand
        } else {
            heating_demand = 0
        }
            
        // 2) Subtract estimate for other internal gains
        if ((heating_demand-tradelec)>=0) {
            heating_demand -= tradelec
        } else {
            total_internal_gains_unused += (tradelec - heating_demand)
            heating_demand = 0
        }
            
        // 3) Calc solar gains and subtract from heat demand
        solar_gains = parseFloat(capacityfactors[4]) * solar_gains_capacity
        total_solar_gains += solar_gains
        
        if ((heating_demand-solar_gains)>=0) {
            heating_demand -= solar_gains
        } else {
            total_solar_gains_unused += (solar_gains - heating_demand)
            heating_demand = 0
        }
            
        total_heating_demand += heating_demand
        
        if (heatstore>heating_demand) {
            heatstore_discharge = heating_demand;
            heatstore -= heatstore_discharge;
            heating_demand = 0;
        } else {
            heating_demand -= heatstore;
            heatstore_discharge = heatstore;
            heatstore = 0;
        }
        
        heatpump_electricity_demand = heating_demand / heatpump_COP

        balance -= heatpump_electricity_demand
        demand += heatpump_electricity_demand
        total_heatpump_demand += heatpump_electricity_demand
        
        // ---------------------------------------------------------------------------
        // Electric vehicles
        // ---------------------------------------------------------------------------
        EV_charge_rate = 0
        
        // EV Discharge
        unmet_discharge = 0
        miles = EV_use_profile[hour%24] * (EV_annual_miles/365.0)
        EV_discharge = miles / EV_miles_per_kwh
        if ((EV_SOC-EV_discharge)<0){
            EV_discharge = EV_SOC
            unmet_discharge = (miles / EV_miles_per_kwh) - EV_discharge
            unmet_demand_atuse += unmet_discharge
        }
        EV_SOC -= EV_discharge
        
        miles = EV_discharge * EV_miles_per_kwh
        total_miles_driven += miles

        // Smart charge based on forecast of available supply over the next 24 hours
        // if the available supply is more than the demand then the charge rate can 
        // be reduced. If there was twice as much supply forecast than demand then the
        // rate of charge could by dropped to half the available supply in order to 
        // distribute the charge better across the 24h.
        EV_kWhd = EV_miles_day / EV_miles_per_kwh
        
        forecast = 0
        forecast += supply
        forward = 24
        
        for (var h=1; h<forward; h++) {
            if ((hour+h)<hours-1) {
                onshorewind_forecast = capacityfactors_all[hour+h][0] * onshorewind_capacity
                offshorewind_forecast = capacityfactors_all[hour+h][1] * offshorewind_capacity
                solarpv_forecast = capacityfactors_all[hour+h][4] * solarpv_capacity
                supply_forecast = onshorewind_forecast + offshorewind_forecast + solarpv_forecast
                forecast += supply_forecast
            }
        }
        demand_forecast = ((EV_battery_capacity*0.65)-EV_SOC)+(EV_kWhd*(forward/24))
        EV_charge_rate_reducer = demand_forecast / forecast
        if (EV_charge_rate_reducer>1.0) EV_charge_rate_reducer = 1.0
        
        EV_SOC_prc = EV_SOC / EV_battery_capacity
        
        EV_charge_rate = 0
        if (balance>0) {
            if ((EV_SOC+balance)>(EV_battery_capacity*0.8)) {
                EV_charge_rate = (EV_battery_capacity*0.8) - EV_SOC
            } else {
                EV_charge_rate = balance
            }
            //if (EV_SOC_prc>0.3)
            //    EV_charge_rate_reducer = 1.0 - (EV_SOC_prc*0.8)
            EV_charge_rate *= EV_charge_rate_reducer
        }
        //EV_charge_rate = 0
        
        EV_charge_rate_suppliment = 0
        if ((EV_SOC<(0.2*EV_battery_capacity)) && EV_charge_rate<0.3) {
            EV_charge_rate_suppliment = 0.3 - EV_charge_rate
        }
            
        EV_SOC += (EV_charge_rate + EV_charge_rate_suppliment)
        
        balance -= EV_charge_rate
        balance -= EV_charge_rate_suppliment
            
        demand += EV_charge_rate   
        demand += EV_charge_rate_suppliment
        
        /*
        // Simple night time charge alternative
        
        EV_kWhd = EV_miles_day / EV_miles_per_kwh
        // Manual charge profile set to night time charging
        //                                        1 1 1                   1 1
        //                    0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
        EV_charge_profile = [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        
        // Calcuate profile factor
        EV_profile_factor = 0
        for (h in EV_charge_profile) EV_profile_factor += EV_charge_profile[h]
        EV_profile_scale = EV_kWhd / EV_profile_factor
        
        EV_charge_rate = EV_charge_profile[hour%24] * EV_profile_scale
        
        if ((EV_SOC+EV_charge_rate)>EV_battery_capacity) {
            EV_charge_rate = EV_battery_capacity - EV_SOC
        }
            
        EV_SOC += EV_charge_rate
        balance -= EV_charge_rate
        demand += EV_charge_rate
        */
        // ---------------------------------------------------------------------------
        // Heatstore remaining supply
        // ---------------------------------------------------------------------------
        heatstore_charge = 0
        heatpump_electricity_demand_heatstore = 0
        
        if (balance>=0) {
            heatpump_electricity_demand_heatstore = balance;
            heatstore_charge = heatpump_electricity_demand_heatstore * heatpump_COP;
            
            if ((heatstore+heatstore_charge)>heatstore_capacity) {
                heatstore_charge = heatstore_capacity - heatstore 
            }
            heatpump_electricity_demand_heatstore = heatstore_charge / heatpump_COP;
            
            heatstore += heatstore_charge;
            
            balance -= heatpump_electricity_demand_heatstore;
            demand += heatpump_electricity_demand_heatstore
            total_heatpump_demand += heatpump_electricity_demand_heatstore
        }
        
        // ---------------------------------------------------------------------------
        // Lithium ion store
        // ---------------------------------------------------------------------------
        liion_charge = 0
        liion_discharge = 0
        
        if (balance>0) {
            liion_charge = balance
            liion_charge_s2 = liion_charge * 0.92 // charge loss
            if ((liion_SOC+liion_charge_s2)>liion_capacity) {
                liion_charge_s2 = liion_capacity - liion_SOC;
            }
            liion_charge = liion_charge_s2 / 0.92
            
            liion_SOC += liion_charge_s2
            balance -= liion_charge
            total_liion_charge += liion_charge
            
        } else {
            liion_discharge = -balance
            liion_discharge_s2 = liion_discharge / 0.92
            if ((liion_SOC-liion_discharge_s2)<0) {
                liion_discharge_s2 = liion_SOC;
            }
            liion_discharge = liion_discharge_s2 * 0.92
            liion_SOC -= liion_discharge_s2
            balance += liion_discharge
            total_liion_discharge += liion_discharge
        }
        
        // ---------------------------------------------------------------------------
        // Hydrogen production
        // ---------------------------------------------------------------------------
        // Efficiency of alkaline electrolyzer is 70%, Efficiency of PEM fuel cell is 47%
        // Hydrogen or batteries for grid storage? A net energy analysis
        // http://pubs.rsc.org/en/content/articlehtml/2015/ee/c4ee04041d
        
        electricity_for_electrolysis = 0
        H2_balance = 0
        
        if (balance>0) {
            electricity_for_electrolysis = balance
            // Electrolysis capacity limit
            if (electricity_for_electrolysis>electrolysis_capacity) electricity_for_electrolysis = electrolysis_capacity
            
            // 70% efficiency of hydrogen production
            H2_produced = electricity_for_electrolysis * 0.7
            H2_balance += H2_produced
        }

        // ---------------------------------------------------------------------------
        // Synthetic liquid fuel production Efficiency:53% 
        // ---------------------------------------------------------------------------
        // 2.0 kWh of biomass + 1.0 kWh of hydrogen = 1.6 kWh of synthetic liquid fuel
        if (H2_balance>0) {
            var H2_for_FT = H2_balance
            var biomass_for_FT = H2_for_FT / 0.5
            var synthfuel = biomass_for_FT * 0.8
            
            if ((liquid_store_level+synthfuel)>liquid_store_capacity) {
                synthfuel = liquid_store_capacity - liquid_store_level
            }
            
            biomass_for_FT = synthfuel / 0.8
            H2_for_FT = biomass_for_FT * 0.5
            
            liquid_store_level += synthfuel
            H2_balance -= H2_for_FT
            biomass_requirement += biomass_for_FT
            total_synthfuel_production += synthfuel
        }
        
        // ---------------------------------------------------------------------------
        // Synthetic methane production Efficiency:67% 
        // 1.43 kWh of electric input results in 1.0 kWh of backup electric: 70% but 2.0 kWh of biomass are also required
        // ---------------------------------------------------------------------------
        // 2.0 kWh of biomass + 1.0 kWh of hydrogen = 2.0 kWh of synthetic methane
        if (H2_balance>0) {
            var H2_for_sabatier = H2_balance
            var biomass_for_sabatier = H2_for_sabatier * 2.0
            var methane = biomass_for_sabatier

            if ((methane_store_level+methane)>methane_store_capacity) {
                methane = methane_store_capacity - methane_store_level
            }
            biomass_for_sabatier = methane
            H2_for_sabatier = biomass_for_sabatier * 0.5
            
            methane_store_level += methane
            H2_balance -= H2_for_sabatier
            biomass_requirement += biomass_for_sabatier
            total_methane_production += methane
        }

        // ---------------------------------------------------------------------------
        // Hydrogen storage
        // ---------------------------------------------------------------------------
        if (H2_balance>0) {
            H2_stored = H2_balance;
            // Limit on hydrogen production if store is full
            if ((H2_store_level+H2_stored)>H2_store_capacity) {
                H2_stored = H2_store_capacity - H2_store_level
            }
            H2_unused = H2_balance - H2_stored
            
            // Work backwards to get the ammended electricity consumption
            electricity_for_electrolysis -= (H2_unused / 0.7)
            
            // Add hydrogen to store
            H2_store_level += H2_stored
        }
    
        // Subtract electric used for electrolysis from balance
        balance -= electricity_for_electrolysis
        total_electrolysis_demand += electricity_for_electrolysis

        // ---------------------------------------------------------------------------
        // Aviation demand distributed eavenly across the year
        // ---------------------------------------------------------------------------
        var hourly_aviation_demand = (aviation_miles / aviation_miles_per_kwh) / (365.0 * 24.0)
        
        if ((liquid_store_level-hourly_aviation_demand)<0) {
            unmet_aviation_demand += -1 * (liquid_store_level-hourly_aviation_demand)
            liquid_store_level = 0
        } else {
            liquid_store_level -= hourly_aviation_demand
        }
        
        // ---------------------------------------------------------------------------
        // Backup: H2 fuel cells
        // ---------------------------------------------------------------------------
        
        if (balance<0) {
            fuel_cell_output = -balance
            // Fuel cell capacity limit
            if (fuel_cell_output>fuel_cell_capacity) fuel_cell_output = fuel_cell_capacity
            // 47% efficiency of fuel cell
            H2_used = fuel_cell_output / 0.47
            // Low store level limit
            if (H2_used>H2_store_level) H2_used = H2_store_level
            fuel_cell_output = H2_used * 0.47
            // Remove hydrogen to store
            H2_store_level -= H2_used
            // Subtract electric used for electrolysis from balance
            balance += fuel_cell_output
            total_fuel_cell_output += fuel_cell_output;
        }
        
        // ---------------------------------------------------------------------------
        // Backup: Gas power stations
        // ---------------------------------------------------------------------------
        if (balance<0) {
            CCGT_output = -balance
            if (CCGT_output>CCGT_capacity) CCGT_output = CCGT_capacity
            
            CCGT_methane = CCGT_output / 0.5
            
            if ((methane_store_level-CCGT_methane)<0) {
               CCGT_methane = methane_store_level
            }
            
            CCGT_output = CCGT_methane * 0.5
            
            methane_store_level -= CCGT_methane
            balance += CCGT_output
            total_CCGT_output += CCGT_output
        }
        
        
        // ---------------------------------------------------------------------------
        // Final balance
        // ---------------------------------------------------------------------------
        total_demand += demand
        
        exess = 0
        if (balance>=0) {
            exess = balance
            exess_generation += balance
            hours_met += 1
        } else {
            unmet_demand += -balance
        }

        var time = datastarttime + (hour * 3600 * 1000);
        data[0].push([time,supply]);
        data[1].push([time,tradelec]);
        data[2].push([time,tradelec+heatpump_electricity_demand+heatpump_electricity_demand_heatstore]);
        data[3].push([time,tradelec+heatpump_electricity_demand+heatpump_electricity_demand_heatstore+EV_charge_rate]);
        data[4].push([time, 100*(EV_SOC/EV_battery_capacity)]);
        // data[2].push([time,heating_demand+heatstore_discharge]);
        
        // d1.push([hour,100*(liion_SOC/liion_capacity)]); // 100*(EV_SOC/24)
        //d1.push([hour, 100*(EV_SOC/24)]); // 100*(EV_SOC/24)
        //d2.push([hour,supply]);
        //d3.push([hour,tradelec]);
        //d4.push([hour,heatpump_electricity_demand+heatpump_electricity_demand_heatstore]);
        //d5.push([hour,EV_charge_rate]);
        // d5.push([hour,EV_charge_rate_suppliment+EV_charge_rate]);
    }
    
    

    average_temperature = average_temperature / hours

    used_solar_gains = total_solar_gains - total_solar_gains_unused
    used_internal_gains = (traditional_electric*10) - total_internal_gains_unused

    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    var units = "kWh";
    var out = "";
    out += "-----------------------------------------------------------------\n"
    out += "Space heating\n"
    out += "-----------------------------------------------------------------\n"
    out += "Building fabric performance:\t\t"+(fabric_efficiency*1000)+" W/K\n"
    out += "Average external temperature:\t\t"+average_temperature+"C\n"
    out += "Target internal temperature:\t\t"+target_internal_temperature+"C\n"
    out += "\n"; 
    out += "Total heat demand\t\t\t"+(total_heat_demand/10).toFixed(0)+" "+units+"/y\n"
    out += "- Total utilized internal gains:\t"+(used_internal_gains/10).toFixed(0)+" "+units+"/y of "+(traditional_electric*1).toFixed(0)+" "+units+"/y\n"
    out += "- Total utilized solar gains:\t\t"+(used_solar_gains/10).toFixed(0)+" "+units+"/y of "+(total_solar_gains/10).toFixed(0)+" "+units+"/y\n"
    out += "= Total space heating demand:\t\t"+(total_heating_demand/10).toFixed(0)+" "+units+"/y\n"
    out += "= Total heatpump electricity demand:\t"+(total_heatpump_demand/10).toFixed(0)+" "+units+"/y ("+(total_heatpump_demand/3650).toFixed(1)+" "+units+"/d)\n";
    out += "\n";
    out += "-----------------------------------------------------------------\n"
    out += "Electric vehicles\n"
    out += "-----------------------------------------------------------------\n"
    out += "EV miles per year: "+Math.round(total_miles_driven/10)+" miles\n"
    out += "\n"
    out += "-----------------------------------------------------------------\n"
    out += "Lithium ion (Charge: 92%, Discharge:92%, Round trip:85%)\n"
    out += "-----------------------------------------------------------------\n"
    out += "Total charge: "+Math.round(total_liion_charge/10)+" "+units+"/y\n";
    out += "Total discharge: "+Math.round(total_liion_discharge/10)+" "+units+"/y\n";
    out += "\n"
    out += "-----------------------------------------------------------------\n"
    out += "Hydrogen (Electrolysis:70%, FuelCell:47%, Round trip:33%)\n"
    out += "-----------------------------------------------------------------\n"
    out += "Total electrolysis demand: "+Math.round(total_electrolysis_demand/10)+" "+units+"/y\n";
    out += "Total fuel cell output: "+Math.round(total_fuel_cell_output/10)+" "+units+"/y\n";
    out += "\n"
    out += "-----------------------------------------------------------------\n"
    out += "Synthetic liquid and gas, Biomass\n"
    out += "Biomass land area 0.7 W/m2 (mix short rotation coppice and energy crops)\n"
    out += "There is 1160 m2 of arable land per household in the UK\n";
    out += "-----------------------------------------------------------------\n"
    out += "Total synthetic liquid fuel produced: "+Math.round(total_synthfuel_production/10)+" "+units+"/y\n";
    out += "Unmet aviation demand: "+Math.round(unmet_aviation_demand/10)+" "+units+"/y\n";
    out += "Total synthetic methane produced: "+Math.round(total_methane_production/10)+" "+units+"/y\n";
    out += "Total biomass required: "+Math.round(biomass_requirement/10)+" "+units+"/y\n";
    var biomass_m2 = ((biomass_requirement/3650)/0.024) / 0.7;
    out += "Total biomass land area: "+Math.round(biomass_m2)+" m2 = "+Math.round(100*biomass_m2/1160)+"% of arable land\n";
    
    out += "\n"
    out += "Total CCGT output: "+Math.round(total_CCGT_output/10)+" "+units+"/y\n"
    out += "\n"
    out += "-----------------------------------------------------------------\n"
    out += "Final balance\n"
    out += "-----------------------------------------------------------------\n"
    out += "Total supply (electric + biomass): " + ((total_supply+biomass_requirement)/10).toFixed(1) + " "+units+"/y ("+((total_supply+biomass_requirement)/3650).toFixed(1)+" "+units+"/d)\n";
    
    var total_demand_all = total_demand + (10*aviation_miles / aviation_miles_per_kwh);
    out += "Total demand (electric + aviation): " + (total_demand_all/10).toFixed(1) + " "+units+"/y ("+(total_demand_all/3650).toFixed(1)+" "+units+"/d)\n";
    
    out += "Total electricity supply: " + (total_supply/10).toFixed(1) + " "+units+"/y ("+(total_supply/3650).toFixed(1)+" "+units+"/d)\n";
    out += "Total electricity demand: " + (total_demand/10).toFixed(1) + " "+units+"/y ("+(total_demand/3650).toFixed(1)+" "+units+"/d)\n";
    out += "\n"
    out += "Exess generation: " + (exess_generation/10).toFixed(0) + ""+units+"/y\n"
    out += "Unmet elec demand: " + (unmet_demand/10).toFixed(0) + ""+units+"/y\n"
    out += "Unmet demand at use: " + (unmet_demand_atuse/10).toFixed(0) + ""+units+"/y\n"
    out += "\n"
    out += "Percentage of demand supplied directly "+(prc_demand_supplied).toFixed(1)+"%\n"
    out += "Percentage of time supply was more or the same as the demand "+(prc_time_met).toFixed(1)+"%\n"
    out += "\n"

        
    $("#out").html(out);
}
// ---------------------------------------------------------------------------    
	
function national_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    if (view_mode=="supplydemand")
    {
        $.plot("#placeholder", [

            // tradelec + heatpump + ev
            {label: "EV charging demand", data:dataout[3], yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }}, 
            // tradelec + heatpump
            {label: "Heatpump electric demand", data:dataout[2], yaxis:1, color:"#cc4400", lines: {lineWidth:0, fill: 1.0 }},
            // tradelec
            {label: "Traditional electric demand", data:dataout[1], yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }}, 
            // EV SOC
            {label: "EV SOC", data:dataout[4], yaxis:2, color:"#cc0000", lines: {lineWidth:1, fill: false }},
            // supply
            {label: "Renewable Supply", data:dataout[0], yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},

            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0, max: 100}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
}
