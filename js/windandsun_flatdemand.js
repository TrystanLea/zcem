function windandsun_flatdemand_init()
{
    gen_typeA = 0
    gen_capacityA = 1.0
    gen_costA = 82.5

    gen_typeB = 4
    gen_capacityB = 1.0
    gen_costB = 79.23

    traditional_electric = 3300
}

function windandsun_flatdemand_run()
{
    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    hours_met = 0
    
    total_cost = 0
    
    hourly_traditional_electric = traditional_electric / (hours/10)

    data = [];
    data[0] = [];
    data[1] = [];

    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
           
        genA = parseFloat(capacityfactors[gen_typeA]) * gen_capacityA
        genB = parseFloat(capacityfactors[gen_typeB]) * gen_capacityB
        
        total_cost += (genA*gen_costA*0.001) + (genB*gen_costB*0.001)
        
        supply = genA + genB
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

    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    var out = "";
    out += "Total cost: £"+(total_cost/10).toFixed(2)+"\n"
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
	
function windandsun_flatdemand_view(start,end,interval)
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
}

$("body").on("change","#windandsun_flatdemand_gen_typeA",function(){
    gen_typeA = parseInt($(this).val());
    windandsun_flatdemand_run();
    windandsun_flatdemand_view(start,end,interval);
});

$("body").on("change","#windandsun_flatdemand_gen_typeB",function(){
    gen_typeB = parseInt($(this).val());
    windandsun_flatdemand_run();
    windandsun_flatdemand_view(start,end,interval);
});

$("body").on("change","#windandsun_flatdemand_gen_capacityA",function(){
    gen_capacityA = parseFloat($(this).val());
    windandsun_flatdemand_run();
    windandsun_flatdemand_view(start,end,interval);
});

$("body").on("change","#windandsun_flatdemand_gen_capacityB",function(){
    gen_capacityB = parseFloat($(this).val());
    windandsun_flatdemand_run();
    windandsun_flatdemand_view(start,end,interval);
});

$("body").on("change","#windandsun_flatdemand_gen_costA",function(){
    gen_costA = parseFloat($(this).val());
    windandsun_flatdemand_run();
    windandsun_flatdemand_view(start,end,interval);
});

$("body").on("change","#windandsun_flatdemand_gen_costB",function(){
    gen_costB = parseFloat($(this).val());
    windandsun_flatdemand_run();
    windandsun_flatdemand_view(start,end,interval);
});
