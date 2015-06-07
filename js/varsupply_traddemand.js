// ---------------------------------------------------------------------------
// dataset index:
// 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
function varsupply_traddemand_init()
{
    gen_type = 0
    oversupply = 1.0
}

function varsupply_traddemand_run()
{
    total_supply = 0
    total_demand = 0

    exess_generation = 0
    unmet_demand = 0
    hours_met = 0

    annual_demand = 3300

    // normalize traditional demand data
    total_trad_demand = 0
    total_gen = 0
    for (var hour=0; hour<hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        total_gen += parseFloat(capacityfactors[gen_type])
        total_trad_demand += parseFloat(capacityfactors[5])
    }
    gen_capacity_factor = total_gen / hours
    gen_capacity = (oversupply*annual_demand*10) / (gen_capacity_factor * hours)

    // holds hourly result for graph
    data = [];
    data[0] = [];
    data[1] = [];

    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
           
        supply = parseFloat(capacityfactors[gen_type]) * gen_capacity
        total_supply += supply
        
        trad_demand_factor = parseFloat(capacityfactors[5]) / total_trad_demand
        demand = trad_demand_factor * annual_demand * 10
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
	
function varsupply_traddemand_view(start,end,interval)
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

$("body").on("change","#varsupply_traddemand_gen_type",function(){
    gen_type = parseInt($(this).val());
    varsupply_traddemand_run();
    varsupply_traddemand_view(start,end,interval);
});

$("body").on("change","#varsupply_traddemand_oversupply",function(){
    oversupply = parseFloat($(this).val());
    varsupply_traddemand_run();
    varsupply_traddemand_view(start,end,interval);
});
