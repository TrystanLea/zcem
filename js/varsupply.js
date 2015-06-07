// ---------------------------------------------------------------------------
// dataset index:
// 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
function varsupply_init()
{
    gen_type = 0
    gen_capacity = 1.0
}

function varsupply_run()
{
    gen_capacity = 1.0
    total_supply = 0

    data = [];
    data[0] = [];

    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
           
        supply = parseFloat(capacityfactors[gen_type]) * gen_capacity
        total_supply += supply
        
        var time = datastarttime + (hour * 3600 * 1000);
        data[0].push([time,supply]);
    }

    gen_capacity_factor = total_supply / (gen_capacity*hours) * 100

    var out = "";
    out += "Generator capacity: "+gen_capacity.toFixed(3)+"kW\n"
    out += "Capacity factor: "+gen_capacity_factor.toFixed(1)+"%\n"
    out += "Total supply: " + (total_supply/10).toFixed(1) + "kWh/y\n"
    $("#out").html(out);
}
// ---------------------------------------------------------------------------    
	
function varsupply_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    $.plot("#placeholder", [
        {label: "Renewable Supply", data:dataout[0], yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
        ], {
            xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
            yaxes: [],
            grid: {hoverable: true, clickable: true},
            selection: { mode: "x" },
            legend: {position: "nw"}
        }
    );
    console.log("Page load time: ", Date.now()-timerStart);
}

$("body").on("change","#varsupply_gen_type",function(){
    gen_type = parseInt($(this).val());
    varsupply_run();
    varsupply_view(start,end,interval);
});
