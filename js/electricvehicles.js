// ---------------------------------------------------------------------------
// dataset index:
// 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
function electricvehicles_init()
{
    gen_type = 0
    oversupply = 1.0
    gen_capacity = 1.0
}

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

charge_type = "constantcharge"
// ---------------------------------------------------------------------------

function electricvehicles_run()
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
    
    var capacityfactors_all = [];
    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        for (var i=0; i<capacityfactors.length; i++) {
            capacityfactors[i] = parseFloat(capacityfactors[i]);
        }
        capacityfactors_all.push(capacityfactors)
    }
    
    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = capacityfactors_all[hour];

        // ---------------------------------------------------------------------------
        // Renewable supply
        // ---------------------------------------------------------------------------  
        supply = capacityfactors[gen_type] * gen_capacity
        total_supply += supply

        balance = supply
        demand = 0
        
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

        // EV Charge
        // Currently allows for charging all of the time
        // assumes that on average even in hours where the car drives
        // it is also plugged in for part of the time
        
        forecast = 0
        demand_forecast = 0
        
        if (charge_type=="smartcharge")
        {
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
                    forecast += capacityfactors_all[hour+h][gen_type] * gen_capacity
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
        }
        else
        {
            // Simple night time charge alternative
            
            EV_kWhd = EV_miles_day / EV_miles_per_kwh
            // Manual charge profile set to night time charging
            //                                           1 1 1                   1 1
            //                       0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
            if (charge_type=="constantcharge")
                EV_charge_profile = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            if (charge_type=="nightcharge")
                EV_charge_profile = [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            if (charge_type=="morenight")
                EV_charge_profile = [1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            if (charge_type=="moreday")
                EV_charge_profile = [1,1,1,1,1,1,1,1,2,2,3,3,4,4,4,3,3,2,1,1,1,1,1,1]
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
        data[1].push([time,EV_charge_rate]);
        data[2].push([time, 100*(EV_SOC/24)]);
    }

    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    // generation capacity requirement to match demand on annual basis
    // is calculated here using quick lookup capacity factors (obtained from running 1supply)
    CF = [0.3233,0.4796,0.2832,0.2387,0.0943]

    var out = "";
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
	
function electricvehicles_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    $.plot("#placeholder", [
        // charge rate
        {label: "EV Charge rate", data:dataout[1], yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }}, 
        // supply
        {label: "Renewable Supply", data:dataout[0], yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
        // EV SOC
        {label: "EV SOC", data:dataout[2], yaxis:2, color:"#cc0000", lines: {lineWidth:1, fill: false }},
        ], {
            xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
            yaxes: [{},{min: 0, max: 100}],
            grid: {hoverable: true, clickable: true},
            selection: { mode: "x" },
            legend: {position: "nw"}
            
        }
    );
}
