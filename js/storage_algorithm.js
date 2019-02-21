function storage_algorithm_init()
{
    gen_type = 0
    oversupply = 1.0
    store_cap = 100.0
    store_charge_cap = store_cap
    store_type = "nostore"
    average_length = 12
}

function storage_algorithm_run()
{
    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    hours_met = 0
    
    store_SOC = store_cap * 0.5
    
    traditional_electric = 3300
    hourly_traditional_electric = traditional_electric / (hours/10)
    
    store_charge = 0
    store_discharge = 0
    
    forecast_ratio = 0
    
    // generation capacity requirement to match demand on annual basis
    // is calculated here using quick lookup capacity factors (obtained from running 1supply)
    CF = [0.3233,0.4796,0.2832,0.2387,0.0943]
    gen_capacity = (hourly_traditional_electric / CF[gen_type]) * oversupply

    data = {
      supply:[],
      demand_met:[],
      demand_unmet:[],
      charge:[],
      storeSOC:[],
      forecast_ratio:[]
    }

    var capacityfactors_all = [];
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        for (var i=0; i<capacityfactors.length; i++) {
            capacityfactors[i] = parseFloat(capacityfactors[i]);
        }
        capacityfactors_all.push(capacityfactors)
    }
    
    // 1. Calculation of balance before storage array
    var s1_balance_before_storage = []
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = capacityfactors_all[hour];
        
        supply = capacityfactors[gen_type] * gen_capacity
        total_supply += supply
        
        demand = hourly_traditional_electric
        total_demand += demand
        
        balance = supply - demand
        s1_balance_before_storage.push(balance)
    }        
    
    // 2. Calculate deviation from mean
    var s2_deviation_from_mean = []
    for (var hour = 0; hour < hours; hour++) {
        // Calculate average 12 hour balance
        var sum = 0; var n = 0;
        for (var i=-average_length; i<average_length; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index>=0) {
                sum += s1_balance_before_storage[index]
                n++;
            }
        }
        average_12h_balance = sum / n;
        s2_deviation_from_mean[hour] = s1_balance_before_storage[hour] - average_12h_balance
    }
    
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = capacityfactors_all[hour];
        supply = capacityfactors[gen_type] * gen_capacity
        demand = hourly_traditional_electric
        balance = supply - demand

        // ---------------------------------------------------------------------------------
        // 12h average, with forward sum
        // ---------------------------------------------------------------------------------  
        if (store_type=="average_8h_sum") {
            // a) generate forward 8h sum
            var sum_pos = 0; var sum_neg = 0;
            for (var i=0; i<8; i++) {
                var index = hour + i
                if (index>=hours) index-=hours
                if (index>=0) {
                    if (s2_deviation_from_mean[index]>0) {
                        sum_pos += s2_deviation_from_mean[index]
                    } else {
                        sum_neg += s2_deviation_from_mean[index]
                    }
                }
            }
            
            // b) calculate charge and discharge
            store_charge = 0
            store_discharge = 0
            if (s2_deviation_from_mean[hour]>0) {
                store_charge = (store_cap-store_SOC)*s2_deviation_from_mean[hour]/sum_pos           // Proportional charge
                if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate
                if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                store_SOC += store_charge
                balance -= store_charge
            } else {
                unmet = 0; if (balance<0) unmet = balance * -1
                store_discharge = unmet*s2_deviation_from_mean[hour]/sum_neg                        // Proportional discharge
                if (store_discharge>unmet) store_discharge = unmet                                  // Dont discharge by more than unmet demand
                if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                store_SOC -= store_discharge
                balance += store_discharge
            }
        }

        // ---------------------------------------------------------------------------------
        // average, without forward sum
        // ---------------------------------------------------------------------------------                
        else if (store_type=="average") {
            store_charge = 0
            store_discharge = 0
            if (s2_deviation_from_mean[hour]>0) {
                store_charge = (store_cap-store_SOC)*s2_deviation_from_mean[hour]/(store_cap*0.5)   // Proportional charge
                if (balance>0 && store_charge>balance) store_charge = balance
                if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate
                if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                store_SOC += store_charge
                balance -= store_charge
            } else {
                store_discharge = -1*store_SOC*s2_deviation_from_mean[hour]/(store_cap*0.5)         // Proportional discharge
                if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                store_SOC -= store_discharge
                balance += store_discharge
            }
        }
        // ---------------------------------------------------------------------------------
        // Slow charge at high SOC, slow discharge at low SOC
        // ---------------------------------------------------------------------------------
        else if (store_type=="basicSOC") {        
            store_charge = 0
            store_discharge = 0
            if (balance>0) {
                store_charge = balance * Math.pow((store_cap-store_SOC)/ store_cap,0.3)
                if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate 
                if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                store_SOC += store_charge
                balance -= store_charge
            } else {
                store_discharge = -1*balance * Math.pow(store_SOC / store_cap,0.5)
                if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                store_SOC -= store_discharge
                balance += store_discharge
            }
        }
        // ---------------------------------------------------------------------------------
        // Basic store
        // ---------------------------------------------------------------------------------
        else if (store_type=="forecast") {
            // 7 day forecast
            var sum_pos = 0; var sum_neg = 0;
            for (var i=0; i<average_length; i++) {
                var index = hour + i
                if (index>=hours) index-=hours
                if (index>=0) {
                    if (s1_balance_before_storage[index]>0) {
                        sum_pos += s1_balance_before_storage[index]
                    } else {
                        sum_neg += -1*s1_balance_before_storage[index]
                    }
                }
            }
            // Create scaling ratio value between 0 and 1
            // 1: excess power approaching
            // 0: power deficit approaching
            forecast_ratio = ((sum_pos-sum_neg)*0.005)+0.5
            if (forecast_ratio>1.0) forecast_ratio = 1.0;
            if (forecast_ratio<0.0) forecast_ratio = 0.0;
            
            store_charge = 0
            store_discharge = 0
            if (balance>0) {
                store_charge = balance * Math.pow(1.0 - forecast_ratio,0.3)
                if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate 
                if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                store_SOC += store_charge
                balance -= store_charge
            } else {
                store_discharge = -1*balance * Math.pow(forecast_ratio,0.3)                                                       // Discharge by extent of unmet demand
                if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                store_SOC -= store_discharge
                balance += store_discharge
            }
        }
        // ---------------------------------------------------------------------------------
        // Basic store
        // ---------------------------------------------------------------------------------
        else if (store_type=="basic") {
            store_charge = 0
            store_discharge = 0
            if (balance>0) {
                store_charge = balance                                                              // Charge by extend of available oversupply
                if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate 
                if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                store_SOC += store_charge
                balance -= store_charge
            } else {
                store_discharge = -1*balance                                                        // Discharge by extent of unmet demand
                if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                store_SOC -= store_discharge
                balance += store_discharge
            }
        }
        // ---------------------------------------------------------------------------------
        
        demand_met = 0
        demand_unmet = 0
        if (balance>=0) {
            exess_generation += balance
            hours_met += 1
            demand_met = demand
        } else {
            unmet_demand += -balance
            demand_met = demand+balance
        }
        demand_unmet = demand - demand_met
        
        var time = datastarttime + (hour * 3600 * 1000);
        data.supply.push([time,supply])
        data.demand_met.push([time,demand_met])
        data.demand_unmet.push([time,demand_met+demand_unmet])
        data.charge.push([time,demand_met+store_charge])
        data.storeSOC.push([time,store_SOC])
        // data.forecast_ratio.push([time,forecast_ratio])
    }

    gen_capacity_factor = total_supply / (gen_capacity*hours) * 100
    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    var out = "";
    out += "Percentage of demand supplied directly "+(prc_demand_supplied).toFixed(1)+"%\n"
    out += "Percentage of time supply was more or the same as the demand "+(prc_time_met).toFixed(1)+"%\n"
    out += "\n";
    out += "Generator capacity: "+gen_capacity.toFixed(3)+"kW\n"
    out += "Capacity factor: "+gen_capacity_factor.toFixed(1)+"%\n"
    out += "\n"
    out += "Total supply: " + (total_supply/10).toFixed(1) + "kWh/y\n"
    out += "Total demand: " + (total_demand/10).toFixed(1) + "kWh/y\n"
    out += "\n"
    out += "Exess generation: " + (exess_generation/10).toFixed(0) + "kWh/y\n"
    out += "Unmet demand: " + (unmet_demand/10).toFixed(0) + "kWh/y\n"

    $("#out").html(out);
}
// ---------------------------------------------------------------------------    
	
function storage_algorithm_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    $.plot("#placeholder", [
        {label: "Charge", data:dataout.charge, yaxis:1, color:"#00ccaa", lines: {lineWidth:0, fill: 1.0 }},
        {label: "Unmet Demand", data:dataout.demand_unmet, yaxis:1, color:"#ec1d1d", lines: {lineWidth:0, fill: 1.0 }}, 
        {label: "Met Demand", data:dataout.demand_met, yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }}, 

        {label: "Renewable Supply", data:dataout.supply, yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
        {label: "Store SOC", data:dataout.storeSOC, yaxis:2, color:"#0000ff", lines: {lineWidth:2, fill: false }},
        // {label: "Forecast Ratio", data:dataout.forecast_ratio, yaxis:3, color:"#cc0000", lines: {lineWidth:2, fill: false }},
        ], {
            xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
            grid: {hoverable: true, clickable: true},
            selection: { mode: "x" },
            legend: {position: "nw"}
        }
    );
    console.log("Page load time: ", Date.now()-timerStart);
}

$("body").on("change","#storage_algorithm_gen_type",function(){
    gen_type = parseInt($(this).val());
    storage_algorithm_run();
    storage_algorithm_view(start,end,interval);
});

$("body").on("change","#storage_algorithm_oversupply",function(){
    oversupply = parseFloat($(this).val());
    storage_algorithm_run();
    storage_algorithm_view(start,end,interval);
});

$("body").on("change","#storage_algorithm_store_type",function(){
    store_type = $(this).val();
    storage_algorithm_run();
    storage_algorithm_view(start,end,interval);
});
