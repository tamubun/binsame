var NX, // NX,NY must be odd number.
    NY,
    EMPTY_COL = [],
    rightEdge,
    binMatrix,
    binMatrixSave,
    elemMatrix;

for ( var y = 0; y < NY; ++y )
  EMPTY_COL.push(-1);

function binAt(x,y,val)
{
  if ( x >= rightEdge || x < 0 || y && y >= NY || y && y < 0 )
    return -1;
  if ( y != null ) {
    if ( val == null )
      return binMatrix[x][y];
    else
      binMatrix[x][y] = val;
  } else {
    if ( val == null )
      return binMatrix[x];
    else
      binMatrix[x] = val;
  }
}

function emptyCol(x)
{
  if ( x >= rightEdge || binMatrix[x] == EMPTY_COL )
    return true;
  if ( binMatrix[x][NY-1] != -1 )
    return false;
  binMatrix[x] = EMPTY_COL;
  return true;
}

function elemAt(x,y,val)
{
  if ( x >= rightEdge || x < 0 || y && y >= NY || y && y < 0 )
    return null;
  var td = (y != null) ? elemMatrix[x].slice(y,y+1) : elemMatrix[x];
  if ( val == null ) {
    return td;
  } else {
    if ( val != -1 )
      td.attr("bin", val );
    else
      td.removeAttr("bin");
  }
}

function neighbor(x, y, dir)
{
  switch ( dir ) {
  case "left":
    return elemAt(x-1,y);
    break;
  case "right":
    return elemAt(x+1,y);
    break;
  case "up":
    return elemAt(x,y-1);
    break;
  case "down":
    return elemAt(x,y+1);
    break;
  }
}

function getSeq()
{
  var diffEvenOdd,
      sign,
      ans,
      col,bit,x,y;

  sign = +1;
  ans = [];
  diffEvenOdd = 0;
  for ( x = 0; x < NX; ++x ) {
    col = [];
    for ( y = 0; y < NY; ++y ) {
      bit = (Math.random() < 0.5) ? 1 : 0;
      col.push(bit);
      diffEvenOdd += sign * bit;
      sign = -sign;
    }
    ans.push(col);
  }

  /* Unsolvable when the numbers of 1's in even and odd positions differ. */
  while ( diffEvenOdd != 0 ) {
    var pos = Math.floor(Math.random() * NX * NY);
    while ( true ) {
      x = pos%NX;
      y = Math.floor(pos/NX);
      bit = ans[x][y];
      if ( diffEvenOdd > 0 ) {
        if ( pos % 2 == 0 && bit == 1 || pos % 2 == 1 && bit == 0 ) {
          ans[x][y] = 1 - bit;
          --diffEvenOdd;
          break;
        }
      } else {
        if ( pos % 2 == 0 && bit == 0 || pos % 2 == 1 && bit == 1 ) {
          ans[x][y] = 1 - bit;
          ++diffEvenOdd;
          break;
        }
      }
      if (++pos >= NX*NY)
        pos = 0;
    }
  }

  return ans;
}

function shrinkBin(from, to)
{
  var d = to - from + 1;
  binMatrix.splice(from,d);
}

function shrinkElem(from, to)
{
  var x1, y1, d = to - from + 1;
  for ( x1 = from; x1 < rightEdge-d; ++x1 ) {
    for ( y1 = 0; y1 < NY; ++y1 ) {
      elemAt(x1,y1,binAt(x1,y1));
    }
  }
  for ( ; x1 < rightEdge; ++x1 ) {
    elemAt(x1, null, -1);
  }
}

function checkComplete()
{
  if ( rightEdge > 1 )
    return false;
  for ( var y = 0; y < NY-1; ++y ) {
    if ( binAt(0,y) != -1 )
      return false;
  }
  if ( binAt(0,y) != 0 )
    return false;

  var x,y,bin="";
  for ( y = 0; y < NY; ++y ) {
    for ( x = 0; x < NX; ++x )
      bin+=binMatrixSave[x][y];
  }
  $("blockquote#bin").text(bigInt2str(str2bigInt(bin,2),10));
  $("div#congraturations").fadeIn("slow");
  return true;
}

function newGame(redo)
{
  var x,y;

  if ( redo ) {
    binMatrix = [];
    for ( x = 0; x < NX; ++x )
      binMatrix.push($.makeArray(binMatrixSave[x]));
  } else {
    switch ( $("select#size").val() ) {
    case "mini":
      NX = 5;
      NY = 3;
      break;
    case "small":
      NX = NY = 7;
      break;
    case "middle":
      NX = 15;
      NY = 9;
      break;
    case "large":
      NX = 29;
      NY = 15;
      break;
    case "huge":
      NX = 35;
      NY = 23;
      break;
    }

    binMatrix = getSeq();
  }

  rightEdge = NX;
  elemMatrix = [];
  $("table#area").children().remove();
  binMatrixSave = [];
  for ( x = 0; x < NX; ++x )
    binMatrixSave.push($.makeArray(binMatrix[x]));

  for ( x = 0; x < NX; ++x )
    elemMatrix.push(jQuery());
  for ( y = 0; y < NY; ++y ) {
    var tr = $("<tr />").appendTo($("#area"));
    for ( x = 0; x < NX; ++x ) {
      var td = $("<td />");
      td.appendTo(tr)
        .attr("x", x).attr("y",y)
        .attr("bin", binAt(x,y))
      elemMatrix[x] = elemMatrix[x].add(td);
    }
  }

  var posX, posY;
  $("table#area td")
    .mouseenter(function(ev) {
       var dir, nei, x, y;
       posX = ev.pageX;
       posY = ev.pageY;
       x = parseInt($(this).attr("x"));
       y = parseInt($(this).attr("y"));
       for ( var d = 0; d < 4; ++d ) {
         dir = ["left","up","right","down"][d];
         nei = neighbor(x,y,dir);
         if ( nei && nei.attr("bin") && nei.attr("bin") == $(this).attr("bin") ) {
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
       if ( nei && nei.attr("bin") && nei.attr("bin") == $(this).attr("bin") ) {
         $(".sel").removeClass("sel");
         $(this).addClass("sel");
         nei.addClass("sel");
       }
     })
    .mouseleave(function() {
       $(".sel").removeClass("sel");
     })
    .click(function() {
       var sel = $(".sel"), x, y, y1, val, count;
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
             val = binAt(x,y1-3);
             binAt(x,y1-1,val);
             elemAt(x,y1-1,val);
             val = binAt(x,y1-2);
             binAt(x,y1,val);
             elemAt(x,y1,val);
             if ( val == null  )
               break;
           }
         } else {
           for ( y1 = y; y1 >=0; --y1 ) {
             val = binAt(x+1,y1-1);
             binAt(x,y1,val);
             elemAt(x,y1,val);
             val = binAt(x, y1-1);
             binAt(x+1,y1,val);
             elemAt(x+1,y1,val);
           }
         }
         if ( checkComplete() )
           return;

         if ( !emptyCol(x) ) {
           ++x;
           if ( x >= rightEdge || !emptyCol(x) )
             return;
         }

         var left, right;
         for ( left = x; left > 0 && emptyCol(left-1); --left )
           ; // empty
         for ( right = x; right < rightEdge-1 && emptyCol(right+1); ++right )
           ; // empty
         if ( (right - left) % 2 == 0 )
           --right;
         if ( right >= left ) {
           shrinkBin(left, right);
           shrinkElem(left, right);
           rightEdge -= (right - left + 1);
         }
         checkComplete();
       });
     });
}

$(function() {
  $("button#new").click(function() { newGame(false); return false; });
  $("button#redo").click(function() { newGame(true); return false; });
  $("button#close").click(function() { $("#congraturations").hide(); });

  newGame($("select#new").val());
});
