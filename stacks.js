  /*
   All Emoncms code is released under the GNU Affero General Public License.
   See COPYRIGHT.txt and LICENSE.txt.

    ---------------------------------------------------------------------
    Emoncms - open source energy visualisation
    Part of the OpenEnergyMonitor project:
    http://openenergymonitor.org
  */

//--------------------------------------------------------------------------------------------------
// Draw stacks
//--------------------------------------------------------------------------------------------------
  function draw_stacks(stacks,element,width,height,units)
  {
    var canvas = document.getElementById(element);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,width,height);
    
    var textscale = Math.round(width * 0.01);

    var bwidth = width/(stacks.length);
    if (bwidth>100) bwidth = 100;

    // Find max height to find how much the graph needs to be scaled by to fit everything on the page
    var top = 0;
    for (var i in stacks) if (top<stacks[i]['height']) top = stacks[i]['height'];
    //top =176;
    var scale = (height-90) / top;

    //$('.stacktotal').popover('destroy');
    $('.stacktotal').remove();

    var mov; var x = 5;
    for (var i in stacks)
    {
      mov = height-80;

      var textwidth = (""+stacks[i]['name']).length*8.0;
      //if (textwidth<(bwidth-10)) draw_text(ctx,x+(bwidth-10)/2,mov,stacks[i]['name']);

      var textwidth = (stacks[i]['height'].toFixed(0)+" "+units).length*6.0;
      //if (textwidth<(bwidth-10)) draw_text(ctx,x+(bwidth-10)/2,mov+20,stacks[i]['height'].toFixed(0)+" "+units);

     // if (stacks[i].context) stacks[i]['name'] = "H"+stacks[i]['name']; // Complete hack!
      $('<a class="stacktotal" stackid='+stacks[i]['name']+' data-placement="bottom">'+stacks[i]['name']+'<br>'+(stacks[i]['height']-stacks[i]['saving']).toFixed(0)+' '+units+'</a>').css({
	      position: "absolute",
        width: bwidth-16,
	      top: height,
	      left: x,
	      padding: "2px",
        "text-align":'center',
        "font-size":textscale+"px",
        "line-height":(textscale*1.5)+'px'
     	}).appendTo("#can_bound");

      if (stacks[i].context) {  // Complete hack!
        var stackid = parseInt(stacks[i]['name']);
        var context = stacks[i].context;
        /*
        $("a[stackid="+stackid+"]").popover({
          // trigger:'hover',
          title:"House "+stackid,
          html:true,
          content:
            "<p><b>Floor area:</b> "+context.floorarea+"m2</p>" +
            "<p><b>Occupancy:</b> "+context.occupancy+"</p>" +
            "<p><b>Electric:</b><br>"+context.electric+"</p>" +
            "<p><b>Heating and building fabric:</b><br>"+context.heating+"</p>" + 
            "<p><b>Living area temperature:</b> "+context.temperature+"C</p>" + 
            "<p><b>Transport:</b><br>"+context.transport+"</p>"
        });
        */
      }
      
      var stack = stacks[i]['stack'];
      for (var b in stack)
      {
        var block = stack[b];
        mov = draw_block(ctx,x,mov,block['kwhd'],block['name'],block['color'],scale," "+units,bwidth-10,textscale);
      }
      x += bwidth;
    }
  }

//--------------------------------------------------------------------------------------------------
// Draw text label
//--------------------------------------------------------------------------------------------------
function draw_text(ctx,x,mov,text)
{
  ctx.fillStyle    = "rgba(0, 0, 0, 0.9)";
  ctx.textAlign    = "center";
  ctx.font         = "bold 10px arial";
  ctx.fillText(text, x,mov+20);  
}

//--------------------------------------------------------------------------------------------------
// Draw stack block
//--------------------------------------------------------------------------------------------------
function draw_block(ctx,x,mov,kwh,text,c,scale,unit,width,textscale)
{
  var fill,border;
  var dp = 1;
  if (unit=="TWh/yr") dp = 0;

  if (kwh!=0)
  {
    seg = kwh*scale;
    mov -=seg;

    // Set color
    if (c==0) { fill = "#ffd4d4"; border = "#ff7373"; }				// fossil red
    if (c==1) { fill = "#baf8ba"; border = "#78bf78"; }				// sustainable green
    if (c==2) { fill = "#fff7f7"; border = "#ffd3d3"; }				// fossil loss
    if (c==3) { fill = "#fdfffd"; border = "#c3e8c3"; }				// sustainable loss
    if (c==4) { fill = "#ffdbbd"; border = "#ffb172"; }				// orange
    if (c==5) { fill = "#ffeebc"; border = "#ffd44f"; }				// yellow
    if (c==6) { fill = "#ede8c2"; border = "#bdb570"; }				// red
    if (c==7) { fill = "rgb(245,245,245)"; border = "rgb(220,220,220)"; }
 
    ctx.fillStyle = fill; ctx.strokeStyle = border;

    // Draw block
    if (seg>=4) {
        ctx.fillRect (x, mov, width, seg-4);
        ctx.strokeRect(x, mov, width, seg-4);
    } else {
        ctx.fillRect (x, mov, width, seg-1);
        ctx.strokeRect(x, mov, width, seg-1);
    }

    ctx.fillStyle    = "rgba(0, 0, 0, 0.9)";
    ctx.textAlign    = "center";

    // Draw text if block height is more than 30 pixels
    if (seg>30.0)
    {
      ctx.font = "bold "+textscale+"px arial";
      var textwidth = text.length*4.0;
      if (textwidth<width) ctx.fillText(text, x+(width/2),mov+(seg/2)-8+2);

      ctx.font = "normal "+textscale+"px arial"; 
      var textwidth = (""+(kwh).toFixed(dp)+unit).length*6.0;
      if (textwidth<width) {
        ctx.fillText((kwh).toFixed(dp)+unit, x+(width/2),mov+(seg/2)+8+2);   
      } else {
         ctx.fillText((kwh).toFixed(dp), x+(width/2),mov+(seg/2)+8+2);   
      }
    }
  }

  return mov;
}

