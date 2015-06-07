function all_init()
{
    // ---------------------------------------------------------------------------
    // dataset index:
    // 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
    onshorewind_capacity = 0.0
    offshorewind_capacity = 1.3
    solarpv_capacity = 1.3

    // ---------------------------------------------------------------------------
    traditional_electric = 2200
    hourly_traditional_electric = traditional_electric / 8764.8

    // ---------------------------------------------------------------------------
    // Space heating variables
    target_internal_temperature = 18.0
    fabric_efficiency = 0.120            // 120 W/K
    solar_gains_capacity = 5.0           // 5kW = average of about 500W from MyHomeEnergyPlanner model
    heatpump_COP = 3.0

    average_temperature = 0

    total_heat_demand = 0
    total_internal_gains_unused = 0
    total_solar_gains = 0
    total_solar_gains_unused = 0
    total_heating_demand = 0

    heatstore_capacity = 10
    heatstore = heatstore_capacity * 0.5
    total_heatpump_demand = 0

    // ---------------------------------------------------------------------------
    // EV performance and battery capacity
    // miles per kwh includes charge/discharge efficiency of battery (to simplify model)
    EV_miles_per_kwh = 4.0
    EV_battery_capacity = 24.0
    EV_SOC = EV_battery_capacity * 0.5

    // Electric vehicle use profile ( miles )
    //                                    1 1 1                   1 1
    //                0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
    EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

    // Calculate total miles per day travelled
    EV_miles_day = 0
    for (h in EV_use_profile) 
        EV_miles_day += EV_use_profile[h]

    total_miles_driven = 0
    // ---------------------------------------------------------------------------
    liion_capacity = 7
    liion_SOC = liion_capacity * 0.5
    // ---------------------------------------------------------------------------
}
function all_run()
{
    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    unmet_demand_atuse = 0
    hours_met = 0
    total_miles_driven = 0

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
        onshorewind = capacityfactors[0] * onshorewind_capacity
        offshorewind = capacityfactors[1] * offshorewind_capacity
        solarpv = capacityfactors[4] * solarpv_capacity
        supply = onshorewind + offshorewind + solarpv
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
        miles = EV_use_profile[hour%24]
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
        // Electric store remaining supply
        // ---------------------------------------------------------------------------
        liion_charge = 0
        liion_discharge = 0
        
        if (balance>0) {
            liion_charge = balance
            if ((liion_SOC+liion_charge)>liion_capacity) {
                liion_charge = liion_capacity - liion_SOC;
            }
            liion_SOC += liion_charge
            balance -= liion_charge
            
        } else {
            liion_discharge = -balance
            if ((liion_SOC-liion_discharge)<0) {
                liion_discharge = liion_SOC;
            }
            liion_SOC -= liion_discharge
            balance += liion_discharge
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

    var out = "";
    out += "-----------------------------------------------------------------\n"
    out += "Space heating\n"
    out += "-----------------------------------------------------------------\n"
    out += "Building fabric performance:\t\t"+(fabric_efficiency*1000)+" W/K\n"
    out += "Average external temperature:\t\t"+average_temperature+"C\n"
    out += "Target internal temperature:\t\t"+target_internal_temperature+"C\n"
    out += "\n"; 
    out += "Total heat demand\t\t\t"+(total_heat_demand/10).toFixed(0)+" kWh/y\n"
    out += "- Total utilized internal gains:\t"+(used_internal_gains/10).toFixed(0)+" kWh/y of "+(traditional_electric).toFixed(0)+" kWh/y\n"
    out += "- Total utilized solar gains:\t\t"+(used_solar_gains/10).toFixed(0)+" kWh/y of "+(total_solar_gains/10).toFixed(0)+" kWh/y\n"
    out += "= Total space heating demand:\t\t"+(total_heating_demand/10).toFixed(0)+" kWh/y\n"
    out += "= Total heatpump electricity demand:\t"+(total_heatpump_demand/10).toFixed(0)+" kWh/y\n"
    out += "\n";
    out += "-----------------------------------------------------------------\n"
    out += "Electric vehicles\n"
    out += "-----------------------------------------------------------------\n"
    out += "EV miles per year: "+(EV_miles_day*365.2)+" miles\n"
    out += "EV miles per year: "+(total_miles_driven/10)+" miles\n"
    out += "\n"
    out += "-----------------------------------------------------------------\n"
    out += "Final balance\n"
    out += "-----------------------------------------------------------------\n"
    out += "Total supply: " + (total_supply/10).toFixed(1) + "kWh/y\n"
    out += "Total demand: " + (total_demand/10).toFixed(1) + "kWh/y\n"
    out += "\n"
    out += "Exess generation: " + (exess_generation/10).toFixed(0) + "kWh/y\n"
    out += "Unmet elec demand: " + (unmet_demand/10).toFixed(0) + "kWh/y\n"
    out += "Unmet demand at use: " + (unmet_demand_atuse/10).toFixed(0) + "kWh/y\n"
    out += "\n"
    out += "Percentage of demand supplied directly "+(prc_demand_supplied).toFixed(1)+"%\n"
    out += "Percentage of time supply was more or the same as the demand "+(prc_time_met).toFixed(1)+"%\n"
        
    $("#out").html(out);
}
// ---------------------------------------------------------------------------    
	
function all_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
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
