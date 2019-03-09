histogram = {}

function storage_algorithm_init()
{
    onshorewind_capacity = 1.165*0.6
    offshorewind_capacity = 0.0
    solarpv_capacity = 3.993*0.4
    hydro_capacity = 0.0
    wave_capacity = 0.0
    tidal_capacity = 0.0
    
    store_cap = 100.0
    store_charge_cap = store_cap
    store_type = "nostore"
    average_length = 168
    backup_capacity = 0.22
}

function storage_algorithm_run()
{
    total_supply = 0
    total_demand = 0
    total_backup = 0
    total_excess = 0
    total_unmet = 0
    total_direct_unmet = 0
    hours_met = 0
    
    store_SOC = store_cap * 0.5
    
    traditional_electric = 3300
    hourly_traditional_electric = traditional_electric / (hours/10)
    
    store_charge = 0
    store_discharge = 0
    forecast_ratio = 0
    
    max_demand = 0
    max_unmet = 0
    backup_capacity_used = 0
    backup_capacity *= 1.0

    data = {
      supply:[],
      direct:[],
      backup:[],
      unmet:[],
      excess:[],
      charge:[],
      storeSOC:[],
      forecast_ratio:[]
    }
    
    histogram = {}

    var capacityfactors_all = [];
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        for (var i=0; i<capacityfactors.length; i++) {
            capacityfactors[i] = parseFloat(capacityfactors[i]);
        }
        capacityfactors_all.push(capacityfactors)
    }
    
    // 1. Calculate balance before storage array
    var balance_before_storage = []
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = capacityfactors_all[hour];

        onshorewind = capacityfactors[0] * onshorewind_capacity
        offshorewind = capacityfactors[1] * offshorewind_capacity
        wave = capacityfactors[2] * wave_capacity
        tidal = capacityfactors[3] * tidal_capacity
        solarpv = capacityfactors[4] * solarpv_capacity
        hydro = 0.4 * hydro_capacity // Assuming 40% capacity factor
        
        supply = onshorewind + offshorewind + wave + tidal + solarpv + hydro
        total_supply += supply
        
        demand = hourly_traditional_electric
        total_demand += demand
        if (demand>max_demand) max_demand = demand;
        
        balance = supply - demand
        balance_before_storage.push(balance)
        
        var time = datastarttime + (hour * 3600 * 1000);
        data.supply.push([time,supply])
        
        if (balance<0) {
           total_direct_unmet += -balance
        }
    }        
    
    // 2. Calculate average balance for specified period
    //    Used as part of averaging based algorithms
    var average_balance = []
    var deviation_from_mean = []
    for (var hour = 0; hour < hours; hour++) {
        // Calculate average balance
        var sum = 0; var n = 0;
        for (var i=-average_length; i<average_length; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index>=0) {
                sum += balance_before_storage[index]
                n++;
            }
        }
        average_balance[hour] = sum / n;
        deviation_from_mean[hour] = balance_before_storage[hour] - average_balance[hour]
    }
    
    // 3. Main model
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = capacityfactors_all[hour]
        balance = balance_before_storage[hour]
        
        // ---------------------------------------------------------------------------------
        // Basic store
        // ---------------------------------------------------------------------------------
        if (store_type=="basic") {
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
        // average, without forward sum
        // ---------------------------------------------------------------------------------                
        else if (store_type=="average") {
            store_charge = 0
            store_discharge = 0
            
            if (balance>=0.0) {
                if (deviation_from_mean[hour]>=0.0) {
                    store_charge = (store_cap-store_SOC)*deviation_from_mean[hour]/(store_cap*0.5)      // Proportional charge
                    if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate
                    if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                    if (store_charge>balance) store_charge = balance                                    // Limit charge to available balance
                    store_SOC += store_charge
                    balance -= store_charge
                }
            } else {
                if (deviation_from_mean[hour]<0.0) {
                    store_discharge = -1*store_SOC*deviation_from_mean[hour]/(store_cap*0.5)            // Proportional discharge
                    if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                    if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                    if (store_discharge>-balance) store_discharge = -balance                            // Limit discharge to unmet
                    store_SOC -= store_discharge
                    balance += store_discharge
                }
            }
        }
        // ---------------------------------------------------------------------------------
        // average, with forward sum
        // ---------------------------------------------------------------------------------  
        else if (store_type=="average_8h_sum") {
            // a) generate forward 8h sum
            var sum_pos = 0; var sum_neg = 0;
            for (var i=0; i<8; i++) {
                var index = hour + i
                if (index>=hours) index-=hours
                if (index>=0) {
                    if (deviation_from_mean[index]>0) {
                        sum_pos += deviation_from_mean[index]
                    } else {
                        sum_neg += deviation_from_mean[index]
                    }
                }
            }
            
            // b) calculate charge and discharge
            store_charge = 0
            store_discharge = 0
            if (balance>=0.0) {
                if (deviation_from_mean[hour]>0.0) {
                    store_charge = (store_cap-store_SOC)*deviation_from_mean[hour]/sum_pos              // Proportional charge
                    if (store_charge>store_charge_cap) store_charge = store_charge_cap                  // Limit by max charge rate
                    if (store_charge>(store_cap-store_SOC)) store_charge = store_cap - store_SOC        // Limit by available SOC
                    if (store_charge>balance) store_charge = balance                                    // Limit charge to available balance
                    store_SOC += store_charge
                    balance -= store_charge
                }
            } else {
                if (deviation_from_mean[hour]<0.0) {
                    unmet = 0; if (balance<0) unmet = balance * -1
                    store_discharge = unmet*deviation_from_mean[hour]/sum_neg                           // Proportional discharge
                    if (store_discharge>unmet) store_discharge = unmet                                  // Dont discharge by more than unmet demand
                    if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                    if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                    if (store_discharge>-balance) store_discharge = -balance                            // Limit discharge to unmet
                    store_SOC -= store_discharge
                    balance += store_discharge
                }
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
                    if (balance_before_storage[index]>0) {
                        sum_pos += balance_before_storage[index]
                    } else {
                        sum_neg += -1*balance_before_storage[index]
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
                if (store_charge>balance) store_charge = balance                                    // Limit charge to available balance
                store_SOC += store_charge
                balance -= store_charge
            } else {
                store_discharge = -1*balance * Math.pow(forecast_ratio,0.3)                         // Discharge by extent of unmet demand
                if (store_discharge>store_charge_cap) store_discharge = store_charge_cap            // Limit by max discharge rate
                if (store_discharge>store_SOC) store_discharge = store_SOC                          // Limit by available SOC
                if (store_discharge>-balance) store_discharge = -balance                            // Limit discharge to unmet
                store_SOC -= store_discharge
                balance += store_discharge
                
            }
        }
        
        // ---------------------------------------------------------------------------------
        // Backup (e.g CCGT gas turbines)
        // ---------------------------------------------------------------------------------  
        backup = 0
        direct = 0
        
        if (balance>=0) {
            direct = demand
        } else {
            direct = demand+balance
            backup = -1*balance
            // limit backup to backup capacity
            if (backup>backup_capacity) backup = backup_capacity
            // record max backup capacity used
            if (backup>backup_capacity_used) backup_capacity_used = backup
            // apply backup to balance
            balance += backup
            total_backup += backup
        }
        // ---------------------------------------------------------------------------------
        // Final balance 
        // ---------------------------------------------------------------------------------
        excess = 0.0
        unmet = 0.0
        
        if (balance>=0.0) {
            excess = balance
            total_excess += excess
            hours_met ++
        } else {
            unmet = -balance
            total_unmet += unmet
        }
        if (unmet>max_unmet) max_unmet = unmet
        
        var time = datastarttime + (hour * 3600 * 1000);
        
        data.direct.push([time,direct])
        data.backup.push([time,backup])
        data.unmet.push([time,unmet])
        
        data.charge.push([time,store_charge])
        data.excess.push([time,excess])
        data.storeSOC.push([time,store_SOC])
        
        var backup_div = Math.floor(backup/0.01)*0.01;
        if (backup_div!=0.0) {
            if (histogram[backup_div]==undefined) histogram[backup_div] = 0.0
            histogram[backup_div] += backup
        }
    }
    
    
    
    prc_demand_supplied_direct = ((total_demand - total_direct_unmet) / total_demand) * 100
    prc_demand_supplied_store = ((total_demand - total_unmet - total_backup) / total_demand) * 100
    prc_demand_supplied_backup = ((total_demand - total_unmet) / total_demand) * 100
    prc_demand_unmet = (total_unmet / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100
    
    prc_of_max_demand = 100 * backup_capacity_used / max_demand

    $(".modeloutput[key=prc_demand_supplied_direct]").html(prc_demand_supplied_direct.toFixed(1)+"%");
    $(".modeloutput[key=prc_demand_supplied_store]").html(prc_demand_supplied_store.toFixed(1)+"%");
    $(".modeloutput[key=prc_demand_supplied_backup]").html(prc_demand_supplied_backup.toFixed(1)+"%");
    $(".modeloutput[key=prc_demand_unmet]").html(prc_demand_unmet.toFixed(1)+"%");
    $(".modeloutput[key=prc_time_met]").html(prc_time_met.toFixed(1)+"%");
    $(".modeloutput[key=total_supply]").html((total_supply/10).toFixed(0));
    $(".modeloutput[key=total_demand]").html((total_demand/10).toFixed(0));
    $(".modeloutput[key=total_backup]").html((total_backup/10).toFixed(0));
    $(".modeloutput[key=total_excess]").html((total_excess/10).toFixed(0));
    $(".modeloutput[key=total_unmet]").html((total_unmet/10).toFixed(0));
    $(".modeloutput[key=backup_capacity_used]").html((1*backup_capacity_used).toFixed(3)+" kW ("+prc_of_max_demand.toFixed(1)+"%)");
}
// ---------------------------------------------------------------------------    
	
function storage_algorithm_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    if (view_mode=="") 
    {
        $.plot("#placeholder", [
            {stack:true, label: "Direct", data:dataout.direct, yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }}, 
            {stack:true, label: "Unmet", data:dataout.unmet, yaxis:1, color:"#ec1d1d", lines: {lineWidth:0, fill: 1.0 }}, 
            {stack:true, label: "Backup", data:dataout.backup, yaxis:1, color:"#e7cd64", lines: {lineWidth:0, fill: 1.0 }}, 
            {stack:true, label: "Charge", data:dataout.charge, yaxis:1, color:"#00ccaa", lines: {lineWidth:0, fill: 1.0 }},
            {stack:true, label: "Excess", data:dataout.excess, yaxis:1, color:"#cdeae5", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Renewable Supply", data:dataout.supply, yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
            //{label: "Backup", data:dataout.supply, yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
            
            {label: "Store SOC", data:dataout.storeSOC, yaxis:2, color:"#0000ff", lines: {lineWidth:2, fill: false }}
            // {label: "Forecast Ratio", data:dataout.forecast_ratio, yaxis:3, color:"#cc0000", lines: {lineWidth:2, fill: false }},
            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
        console.log("Page load time: ", Date.now()-timerStart);
        $("#graph_notes").html("");
    }
    
    else if (view_mode=="backup")
    {
        var histogram2 = [];
        for (var z in histogram) {
            histogram2.push([1*z,histogram[z]])
        }
    
        $.plot("#placeholder", [
            { data:histogram2, yaxis:1, color:"#000", bars: { align: "center", fill: true, show: true, barWidth: 0.008 }},
            ], {
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );  
        
        $("#graph_notes").html("Y-axis: backup energy (kWh), X-axis: backup capacity (kW)")  
    }
}
