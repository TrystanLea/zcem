function load_capacityfactor_dataset(callback){
    // Load dataset as zip and decompress  - provides faster loading times
    tenyearsdatalines = []
    hours = 0
    
    JSZipUtils.getBinaryContent('highresolution.csv.zip', function(err, data) {
        if(err) {
        throw err; // or handle err
        }

        var zip = new JSZip(data);
        capacityfactorfile = zip.file("highresolution.csv").asText();
        tenyearsdatalines = capacityfactorfile.split(/\r\n|\n/);
        hours = 87648;
        callback();
    });
}

function load_temperature_dataset(callback){
    // Load dataset as zip and decompress  - provides faster loading times
    temperaturelines = []
    days = 0
    
    JSZipUtils.getBinaryContent('temperature.csv.zip', function(err, data) {
        if(err) {
        throw err; // or handle err
        }

        var zip = new JSZip(data);
        temperaturefile = zip.file("temperature.csv").asText();
        temperaturelines = temperaturefile.split(/\r\n|\n/);
        days = temperaturelines.length;
        callback();
    });
}

function load_test_dataset(callback){
    // Load dataset as zip and decompress  - provides faster loading times
    testlines = []
    
    JSZipUtils.getBinaryContent('test.csv.zip', function(err, data) {
        if(err) {
        throw err; // or handle err
        }

        var zip = new JSZip(data);
        testfile = zip.file("test.csv").asText();
        testlines = testfile.split(/\r\n|\n/);
        callback();
    });
}

$("body").bind("plotselected","#placeholder", function (event, ranges)
{
    start = ranges.xaxis.from;
    end = ranges.xaxis.to;
    interval = Math.round((end-start)/1200);
    if (interval<1) interval = 1;
    var view_fn = page+"_view";
    window[view_fn](start,end,interval);
});

$("body").on("click","#pan-left",function(){
    var range = end - start;
    start = start - range*0.25;
    end = end - range*0.25;
    interval = Math.round(range/1200);
    if (interval<1) interval = 1;
    var view_fn = page+"_view";
    window[view_fn](start,end,interval);
});

$("body").on("click","#pan-right",function(){
    var range = end - start;
    start = start + range*0.25;
    end = end + range*0.25;
    interval = Math.round(range/1200);
    if (interval<1) interval = 1;
    var view_fn = page+"_view";
    window[view_fn](start,end,interval);
});

$("body").on("click","#zoom-in",function(){
    var range = end - start;
    var mid = start + range*0.5;
    start = mid - range*0.25;
    end = mid + range*0.25;
    interval = Math.round(range/1200);
    if (interval<1) interval = 1;
    var view_fn = page+"_view";
    window[view_fn](start,end,interval);
});
	
$("body").on("click","#zoom-out",function(){
    var range = end - start;
    var mid = start + range*0.5;
    start = mid - range;
    end = mid + range;
    interval = Math.round(range/1200);
    if (interval<1) interval = 1;
    var view_fn = page+"_view";
    window[view_fn](start,end,interval);
});

$("body").on("click","#reset",function(){
    start = datastarttime;
    end = datastarttime + 10*24*365*3600*1000;
    interval = Math.round((end-start)/1000);
    if (interval<1) interval = 1;
    
    var view_fn = page+"_view";
    window[view_fn](start,end,interval);
});




$(window).resize(function(){
    resize();
    var view_fn = page+"_view";
    if (window[view_fn]!=undefined) window[view_fn](start,end,interval);
});

function resize()
{
    var width = $("#placeholder_bound").width();
    var height = $("#placeholder_bound").height();
    $("#placeholder").width(width);
    $("#placeholder").height(width*0.52);
}

function data_view(start,end,interval)
{
    start = Math.floor(start);
    end = Math.ceil(end);
    interval = Math.round(interval);
    if (interval<1) interval = 1;
    
    
    var dataout = [];
    for (var z in data) dataout[z] = [];
    
    var i = 0;
    var time = 0;
    var pos = 0;
    while (time<end) {
        time = start + (interval * i);
        pos = Math.round((time-datastarttime)/3600000);
        
        for (var z in data) {
            if (pos>=0 && pos<data[z].length) {
                dataout[z].push([data[z][pos][0],data[z][pos][1]]);  
            }
        }
        i++;
    }
    return dataout;
}
