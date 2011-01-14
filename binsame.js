var NX = 35,
    NY = 7,
    rightEdge = NX,
    matrix = [];

function TD(x,y,val)
{
  if ( x >= rightEdge || x < 0 || y && y >= NY || y && y < 0 )
    return null;
  var td = (y != null) ? matrix[y][x] : $("td[x="+x+"]");
  if ( val == null )
    return td;
  else
    td.text(val);
}

function neighbor(x, y, dir)
{
  switch ( dir ) {
  case "left":
    return TD(x-1,y);
    break;
  case "right":
    return TD(x+1,y);
    break;
  case "up":
    return TD(x,y-1);
    break;
  case "down":
    return TD(x,y+1);
    break;
  }
}

function getSeq()
{
  var nEvenOdd,
      sign,
      ans,
      seq,bit,x,y;

  do {
    sign = +1;
    ans = [];
    nEvenOdd = 0;
    for ( y = 0; y < NY; ++y ) {
      seq = "";
      for ( x = 0; x < NX; ++x ) {
        bit = (Math.random() < 0.5) ? 1 : 0;
        seq += bit;
        nEvenOdd += sign * bit;
        sign = -sign;
      }
      ans.push(seq);
    }
  } while ( nEvenOdd % 3 != 0 );

  return ans;
}

function shrink(from, to)
{
  if ( to <= from )
    return;
  var x1, y1, d = to - from + 1;
  for ( y1 = 0; y1 < NY; ++y1 ) {
    for ( x1 = from; x1 < rightEdge-d; ++x1 ) {
      TD(x1,y1, TD(x1+d,y1).text());
    }
    for ( ; x1 < rightEdge; ++x1 ) {
      TD(x1,y1, "");
    }
  }
  rightEdge -= d;
}

$(function() {
  var seq = getSeq(),
      x,y;

  for ( y = 0; y < NY; ++y ) {
    var tr = $("<tr />").appendTo($("#area")),
        row = [];
    matrix.push(row);
    for ( x = 0; x < NX; ++x ) {
      var td = $("<td />");
      td.appendTo(tr)
        .attr("x", x).attr("y",y)
        .text(seq[y].charAt(x));
      row.push(td);
    }
  }

  var posX, posY;

  $("td")
    .mouseenter(function(ev) {
       var dir, nei, x, y;
       posX = ev.pageX;
       posY = ev.pageY;
       x = parseInt($(this).attr("x"));
       y = parseInt($(this).attr("y"));
       for ( var d = 0; d < 4; ++d ) {
         dir = ["left","up","right","down"][d];
         nei = neighbor(x,y,dir);
         if ( nei && nei.text() == $(this).text() && nei.text() != "" ) {
             $(this).addClass("sel");
             nei.addClass("sel");
             break;
         }
       }
     })
    .mousemove(function(ev) {
       var nei, dir, x, y,
           dx = ev.pageX - posX,
           dy = ev.pageY - posY;
       if ( Math.abs(dx) < 3 && Math.abs(dy) < 3 )
         return;
       if ( Math.abs(dx) > Math.abs(dy) ) {
         dir = (dx>0) ? "right" : "left";
       } else {
         dir = (dy>0) ? "down" : "up";
       }
       posX=ev.pageX;
       posY=ev.pageY;

       x = parseInt($(this).attr("x"));
       y = parseInt($(this).attr("y"));
       nei = neighbor(x,y, dir);
       if ( nei && nei.text() == $(this).text() && nei.text() != "") {
         $(".sel").removeClass("sel");
         $(this).addClass("sel");
         nei.addClass("sel");
       }
     })
    .mouseleave(function() {
       $(".sel").removeClass("sel");
     })
    .click(function() {
       var sel = $(".sel"), x, y, y1, up, val, count;
       if ( sel.length < 2 )
         return;
       x = parseInt(sel.first().attr("x"));
       y = parseInt(sel.first().attr("y"));
       count = 0;
       sel.fadeOut("fast", function() {
         $(this).show();
         if ( count++ < 1 )
           return;
         sel.removeClass("sel");
         if ( y != sel.last().attr("y") ) {
           for ( y1 = y+1; y1 >= 0; y1-=2 ) {
             up = TD(x, y1-2);
             val = up ? up.text() : "";
             TD(x,y1,val);
             up = TD(x, y1-3);
             val = up ? up.text() : "";
             TD(x,y1-1,val);
           }
         } else {
           for ( y1 = y; y1 >=0; --y1 ) {
             up = TD(x+1, y1-1);
             val = up ? up.text() : "";
             TD(x,y1,val);
             up = TD(x, y1-1);
             val = up ? up.text() : "";
             TD(x+1,y1,val);
           }
         }

         if ( TD(x).text() != "" ) {
           ++x;
           if ( TD(x) == null || TD(x).text() != "" )
             x = null;
         }

         if ( x != null ) {
           var left, right;
           for ( left = x; left > 0 && TD(left-1).text() == ""; --left )
             ; // empty
           for ( right = x; right < rightEdge-1 && TD(right+1).text() == ""; ++right )
             ; // empty
           if ( (right - left) % 2 == 0 )
             --right;
           shrink(left, right);
         }
       });
     });
});
