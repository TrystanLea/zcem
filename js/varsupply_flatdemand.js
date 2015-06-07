function varsupply_flatdemand_init()
{
    gen_type = 0
    oversupply = 1.0
}

function varsupply_flatdemand_run()
{
    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    hours_met = 0
    
    traditional_electric = 3300
    hourly_traditional_electric = traditional_electric / (hours/10)
    
    // generation capacity requirement to match demand on annual basis
    // is calculated here using quick lookup capacity factors (obtained from running 1supply)
    CF = [0.3233,0.4796,0.2832,0.2387,0.0943]
    gen_capacity = (hourly_traditional_electric / CF[gen_type]) * oversupply

    data = [];
    data[0] = [];
    data[1] = [];

    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
           
        supply = parseFloat(capacityfactors[gen_type]) * gen_capacity
        total_supply += supply
        
        demand = hourly_traditional_electric
        total_demand += demand
        
        balance = supply - demand
        
        if (balance>=0) {
            exess_generation += balance
            hours_met += 1
        } else {
            unmet_demand += -balance
        }
        
        var time = datastarttime + (hour * 3600 * 1000);
        data[0].push([time,supply]);
        data[1].push([time,demand]);
    }

    gen_capacity_factor = total_supply / (gen_capacity*hours) * 100
    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    var out = "";
    out += "Generator capacity: "+gen_capacity.toFixed(3)+"kW\n"
    out += "Capacity factor: "+gen_capacity_factor.toFixed(1)+"%\n"
    out += "\n"
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
	
function varsupply_flatdemand_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    $.plot("#placeholder", [
        {label: "Demand", data:dataout[1], yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }}, 
        {label: "Renewable Supply", data:dataout[0], yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
        ], {
            xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
            grid: {hoverable: true, clickable: true},
            selection: { mode: "x" },
            legend: {position: "nw"}
        }
    );
    console.log("Page load time: ", Date.now()-timerStart);
}

$("body").on("change","#varsupply_flatdemand_gen_type",function(){
    gen_type = parseInt($(this).val());
    varsupply_flatdemand_run();
    varsupply_flatdemand_view(start,end,interval);
});

$("body").on("change","#varsupply_flatdemand_oversupply",function(){
    oversupply = parseFloat($(this).val());
    varsupply_flatdemand_run();
    varsupply_flatdemand_view(start,end,interval);
});
