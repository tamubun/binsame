var NX, // NX,NY must be odd number.
    NY,
    EMPTY_COL = [],
    rightEdge,
    binMatrix,
    binMatrixSave,
    undoData = null,
    elemMatrix;

function copyMatrix(matrix)
{
  var copy = [];
  $.each(matrix, function() {
    if ( this == EMPTY_COL )
      copy.push(EMPTY_COL);
    else
      copy.push($.makeArray(this));
  });
  return copy;
}

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

function setElemVal(elem, val)
{
  elem.removeClass("bin0 bin1");
  elem.attr("bin", val );
  if ( val != -1 )
    elem.addClass("bin"+val);
}

function elemAt(x,y,val)
{
  if ( x >= NX || x < 0 || y && y >= NY || y && y < 0 )
    return null;
  var td = (y != null) ? elemMatrix[x].slice(y,y+1) : elemMatrix[x];
  if ( val == null ) {
    return td;
  } else {
    setElemVal(td, val);
  }
}

function neighbor(x, y, dir)
{
  switch ( dir ) {
  case 0:
    return elemAt(x-1,y);
    break;
  case 1:
    return elemAt(x,y-1);
    break;
  case 2:
    return elemAt(x+1,y);
    break;
  case 3:
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

  return true;
}

function newGame(redo)
{
  var x,y;

  if ( redo ) {
    binMatrix = copyMatrix(binMatrixSave);
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

    for ( var y = 0; y < NY; ++y )
      EMPTY_COL.push(-1);

    binMatrix = getSeq();
  }

  undoData = null;
  $("#undo").attr("disabled",true);
  rightEdge = NX;
  elemMatrix = [];
  $("table#area").children().remove();
  binMatrixSave = copyMatrix(binMatrix);

  for ( x = 0; x < NX; ++x ) {
    elemMatrix.push(jQuery());
    $("#area").append("<col />");
  }
  for ( y = 0; y < NY; ++y ) {
    var tr = $("<tr />").appendTo($("#area"));
    for ( x = 0; x < NX; ++x ) {
      var td = $("<td><div></div></td>");
      td.appendTo(tr)
        .attr("x", x).attr("y",y)
        .attr("bin", binAt(x,y))
        .addClass("bin"+binAt(x,y));
      elemMatrix[x] = elemMatrix[x].add(td);
    }
  }

  var posX, posY, lastDir = 0, mouseMoved = false;
  $("table#area td")
    .mouseenter(function(ev) {
       var dir, nei, x, y;
       posX = ev.pageX;
       posY = ev.pageY;
       x = parseInt($(this).attr("x"));
       y = parseInt($(this).attr("y"));
       for ( var d = lastDir; d < lastDir+4; ++d ) {
         dir = d%4;
         nei = neighbor(x,y,dir);
         if ( nei && nei.attr("bin") != -1 && nei.attr("bin") == $(this).attr("bin") ) {
             $(this).addClass("sel");
             nei.addClass("sel");
             break;
         }
       }
       lastDir = dir;
     })
    .mousemove(function(ev) {
       var nei, dir, x, y,
           dx = ev.pageX - posX,
           dy = ev.pageY - posY;
       if ( Math.abs(dx) < 3 && Math.abs(dy) < 3 )
         return;
       if ( Math.abs(dx) > Math.abs(dy) ) {
         dir = (dx>0) ? 2 : 0;
       } else {
         dir = (dy>0) ? 3 : 1;
       }
       posX=ev.pageX;
       posY=ev.pageY;
       mouseMoved = true;

       x = parseInt($(this).attr("x"));
       y = parseInt($(this).attr("y"));
       nei = neighbor(x,y, dir);
       if ( nei && nei.attr("bin") != -1 && nei.attr("bin") == $(this).attr("bin") ) {
         $(".sel").removeClass("sel");
         $(this).addClass("sel");
         nei.addClass("sel");
         lastDir = dir;
       }
     })
    .mouseleave(function() {
       $(".sel").removeClass("sel");
     })
    .click(function() {
       var sel = $(".sel"), x, y, x1, y1, swap, complete, refresh = [], enter = this;
       if ( sel.length != 2 )
         return;
       undoData = [copyMatrix(binMatrix), rightEdge];
       $("#undo").removeAttr("disabled");
       x = parseInt(sel.first().attr("x"));
       y = parseInt(sel.first().attr("y"));

       swap = null;
       if ( y != parseInt(sel.last().attr("y")) ) {
         for ( y1 = y+1; y1 >= 0; y1-=2 ) {
           binAt(x,y1-1,binAt(x,y1-3));
           binAt(x,y1,binAt(x,y1-2));
         }
         refresh = refresh.concat($.makeArray(elemAt(x).slice(0,y+2)));
       } else {
         swap = [];
         for ( y1 = y; y1 >=0; --y1 ) {
           binAt(x,y1,binAt(x+1,y1-1));
           binAt(x+1,y1,binAt(x, y1-1));
         }
         refresh = refresh.concat($.makeArray(elemAt(x)  .slice(0,y+1)))
                          .concat($.makeArray(elemAt(x+1).slice(0,y+1)));
       }

       x1 = -1;
       if ( emptyCol(x) ) {
         x1 = x;
       } else if ( (x+1 < rightEdge) && emptyCol(x+1) ) {
         x1 = x+1;
       } else {
         x1 = -1;
       }
       if ( x1 >= 0 ) {
         var left, right;
         for ( left = x1; left > 0 && emptyCol(left-1); --left )
           ; // empty
         for ( right = x1; right < rightEdge-1 && emptyCol(right+1); ++right )
           ; // empty
         if ( (right - left) % 2 == 0 )
           --right;
         if ( right > left ) {
           shrinkBin(left, right);
           for ( x1 = left; x1 < rightEdge; x1++ )
             refresh = refresh.concat($.makeArray(elemAt(x1)));
           rightEdge -= (right - left + 1);
         }
       }

       sel.removeClass("sel");
       complete = checkComplete();
       mouseMoved = false;

       var erasePhase = function() {
         var count = 2;

         $("div",sel).animate({opacity: 0}, "fast", function() {
           if ( --count <= 0 ) {
             $("#area").dequeue();
           }
         });

         if ( swap != null ) {
           if ( y > 0 ) {
             var col1 = changeToVisualCol(x,y),
                 col2 = changeToVisualCol(x+1,y);
             count += 2;
             swap = [col1, col2];

             col1.animate({left:"+=35px"},"fast", function(){
               if ( --count <= 0 ) {
                 $("#area").dequeue();
               }
             });
             col2.animate({left:"-=35px"},"fast", function(){
               if ( --count <= 0 ) {
                 $("#area").dequeue();
               }
             });
           }
         }
       };

       var dropPhase = function() {
         if ( swap == null ) {
           if ( y > 0 ) {
             var col = changeToVisualCol(x,y);
             col.animate({top:"+=62px"},"fast", function(){
               $(this).remove();
               $("#area").dequeue();
             });
           } else {
             $("#area").dequeue();
           }
         } else {
           if ( y > 0 ) {
             var col1 = swap[0],
                 col2 = swap[1],
                 count = 2;
             col1.animate({top:"+=31px"},"fast", function(){
               $(this).remove();
               if ( --count <= 0 )
                 $("#area").dequeue();
             });
             col2.animate({top:"+=31px"},"fast", function(){
               $(this).remove();
               if ( --count <= 0 )
                 $("#area").dequeue();
             });
           } else {
             $("#area").dequeue();
           }
         }

         if ( right > left ) {
           var colElems = $("col");
           for ( x1 = left; x1 <= right; ++x1 ) {
             $(colElems[x1]).css({background:"#ffbb00"});
           }
         }
       };

       var shrinkPhase = function() {
         if ( right > left ) {
           var colElems = $("col");
           for ( x1 = left; x1 <= right; ++x1 ) {
             $(colElems[x1]).css({background:""});
           }
         }
         $("#area").dequeue();
       };

       var endPhase = function() {
         var i, td, len = refresh.length;
         for ( i = 0; i < len; ++i ) {
           td = $(refresh[i]);
           setElemVal(td, binAt(td.attr("x"), td.attr("y")));
         }
         $(".emp").removeClass("emp");
         $("div",sel).css({opacity: 1});

         if ( complete ) {
           approve();
         } else if (!mouseMoved) {
           $(enter).mouseenter();
         }
         $("#area").dequeue();
       };

       $("#area")
         .queue(erasePhase)
         .queue(dropPhase)
         .queue(shrinkPhase)
         .queue(endPhase);
     });
}

function approve()
{
  var x,y,bin="",str;
  for ( y = 0; y < NY; ++y ) {
    for ( x = 0; x < NX; ++x )
      bin+=binMatrixSave[x][y];
  }
  str = bigInt2str(str2bigInt(bin,2),10);
  for ( x = str.length - str.length % 80; x > 0; x-=80 )
    str = str.slice(0, x) + "\n" + str.slice(x);
  $("blockquote#bin").text(str);
  $("div#congraturations").fadeIn("slow", function(){
    $("#shita").css("visibility", "hidden");
  });
}

function undo()
{
  var x,y,bin;
  binMatrix = undoData[0];
  rightEdge = undoData[1];
  undoData = null;
  $("#undo").attr("disabled","true");
  for ( y = 0; y < NY; ++y ){
    for ( x = 0; x < NX; ++x )
      elemAt(x,y,binAt(x,y));
  }
}

function changeToVisualCol(x, y)
{
  var table = $("<table></table>"),
      td = elemAt(x,0),
      pos = td.offset(),
      borderL = parseInt(td.css("border-left-width").replace("px","")),
      borderT = parseInt(td.css("border-top-width").replace("px","")),
      y1;
  table
    .attr("x", x)
    .appendTo("#board")
    .css({position:"absolute", left:pos.left - borderL, top:pos.top - borderT});
  for ( y1 = 0; y1 < y; ++y1 ) {
    td = elemAt(x,y1);
    $("<tr></tr>")
      .appendTo(table)
      .append(td.clone().addClass("anim"));
    td.addClass("emp");
  }
  return table;
}

$(function() {
  $("button#new").click(function() { newGame(false); return false; });
  $("button#undo").click(function() { undo(); return false; });
  $("button#redo").click(function() { newGame(true); return false; });
  $("button#close").click(function() {
    $("#shita").css("visibility", "visible");
    $("#congraturations").hide();
  });

  newGame($("select#new").val());
});
