function varsupply_spaceheatingdemand_init()
{
    gen_type = 0
    gen_capacity = 1.0
    fabric_efficiency = 0.120            // 120 W/K
    target_internal_temperature = 18.0
    solar_gains_capacity = 5.0           // 5kW = average of about 500W from MyHomeEnergyPlanner model
    heatpump_COP = 3.0
    heatstore_capacity = 0
    traditional_electric = 2200
}

function varsupply_spaceheatingdemand_run()
{
    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    hours_met = 0
    
    // ---------------------------------------------------------------------------
    
    hourly_traditional_electric = traditional_electric / 8764.8

    // ---------------------------------------------------------------------------
    // Space heating variables
    
    hourly_internal_gains = hourly_traditional_electric

    average_temperature = 0

    total_heat_demand = 0
    total_internal_gains_unused = 0
    total_solar_gains = 0
    total_solar_gains_unused = 0
    total_heating_demand = 0

    heatstore = heatstore_capacity * 0.5
    total_heatpump_demand = 0

    // ---------------------------------------------------------------------------
    data = [];
    data[0] = [];
    data[1] = [];
    data[2] = [];
    data[3] = [];
    data[4] = [];
    
    for (var hour = 0; hour < hours-1; hour++) {
        var day = parseInt(Math.floor(hour / 24))
        var capacityfactors = tenyearsdatalines[hour].split(",");
        var temperature = parseFloat(temperaturelines[day].split(",")[1]);

        // ---------------------------------------------------------------------------
        // Renewable supply
        // ---------------------------------------------------------------------------  
        supply = parseFloat(capacityfactors[gen_type]) * gen_capacity
        total_supply += supply

        balance = supply
        demand = 0
        
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
        if ((heating_demand-hourly_internal_gains)>=0) {
            heating_demand -= hourly_internal_gains
        } else {
            total_internal_gains_unused += (hourly_internal_gains - heating_demand)
            heating_demand = 0
        }
            
        // 3) Calc solar gains and subtract from heat demand
        solar_gains = parseFloat(capacityfactors[4]) * solar_gains_capacity
        total_solar_gains += solar_gains
        
        if ((heating_demand-solar_gains)>=0) {
            heating_demand -= solar_gains
            solar_gains_used = solar_gains
        } else {
            total_solar_gains_unused += (solar_gains - heating_demand)
            heating_demand = 0
            solar_gains_used = heating_demand
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
        data[1].push([time,heatpump_electricity_demand+heatpump_electricity_demand_heatstore]);
        data[2].push([time,heating_demand+heatstore_discharge]);
        data[3].push([time,heating_demand+heatstore_discharge+solar_gains_used]);
        data[4].push([time,heating_demand+heatstore_discharge+solar_gains]);
    }

    average_temperature = average_temperature / hours

    used_solar_gains = total_solar_gains - total_solar_gains_unused
    used_internal_gains = (hourly_internal_gains*hours) - total_internal_gains_unused

    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    // generation capacity requirement to match demand on annual basis
    // is calculated here using quick lookup capacity factors (obtained from running 1supply)
    CF = [0.3233,0.4796,0.2832,0.2387,0.0943]

    var out = "";
    out += "-----------------------------------------------------------------\n"
    out += "Space heating\n"
    out += "-----------------------------------------------------------------\n"
    out += "Building fabric performance:\t\t"+(fabric_efficiency*1000)+" W/K\n"
    out += "Average external temperature:\t\t"+average_temperature+"C\n"
    out += "Target internal temperature:\t\t"+target_internal_temperature+"C\n"
    out += "\n"; 
    out += "Total heat demand\t\t\t"+(total_heat_demand/10).toFixed(0)+" kWh/y\n"
    out += "- Total utilized internal gains:\t"+(used_internal_gains/10).toFixed(0)+" kWh/y of "+((hourly_internal_gains*hours)/10).toFixed(0)+" kWh/y\n"
    out += "- Total utilized solar gains:\t\t"+(used_solar_gains/10).toFixed(0)+" kWh/y of "+(total_solar_gains/10).toFixed(0)+" kWh/y\n"
    out += "= Total space heating demand:\t\t"+(total_heating_demand/10).toFixed(0)+" kWh/y\n"
    out += "= Total heatpump electricity demand:\t"+(total_heatpump_demand/10).toFixed(0)+" kWh/y\n"
    out += "\n";
    out += "-----------------------------------------------------------------\n"
    out += "Final balance\n"
    out += "-----------------------------------------------------------------\n"
    out += "Total supply: " + (total_supply/10).toFixed(1) + "kWh/y\n"
    out += "Total demand: " + (total_demand/10).toFixed(1) + "kWh/y\n"
    out += "\n"
    out += "Exess generation: " + (exess_generation/10).toFixed(0) + "kWh/y\n"
    out += "Unmet demand: " + (unmet_demand/10).toFixed(0) + "kWh/y\n"
    out += "\n"
    out += "Percentage of demand supplied directly "+(prc_demand_supplied).toFixed(1)+"%\n"
    out += "Percentage of time supply was more or the same as the demand "+(prc_time_met).toFixed(1)+"%\n"
    $("#out").html(out);
}
// ---------------------------------------------------------------------------    
	
function varsupply_spaceheatingdemand_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    $.plot("#placeholder", [
        // unused solar gains
        {label: "Unused solar gains (lighter)", data:dataout[4], yaxis:1, color:"#eecc00", lines: {lineWidth:0, fill: 0.3 }}, 
        // used solar gains
        {label: "Used solar gains", data:dataout[3], yaxis:1, color:"#eecc00", lines: {lineWidth:0, fill: 1.0 }},
        // heatpump demand and store discharge
        {label: "Heatpump demand and heatstore discharge", data:dataout[2], yaxis:1, color:"#ff8800", lines: {lineWidth:0, fill: 1.0 }}, 
        // Heatpump electric
        {label: "Heatpump electric", data:dataout[1], yaxis:1, color:"#cc4400", lines: {lineWidth:0, fill: 1.0 }},
        // Electricity Supply
        {label: "Renewable Supply", data:dataout[0], yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
        ], {
            xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
            grid: {hoverable: true, clickable: true},
            selection: { mode: "x" },
            legend: {position: "nw"}
        }
    );
}
