$( function() {
  $( "#sortable" ).sortable({
    revert: true,
    stop : function() {
      if(markerMap.size > 0) {
        //update polyline.
        drawPolyline();
      }
    }
  });
  $( "ul, li" ).disableSelection();
} );