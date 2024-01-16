//---------------------------params-------------------------
//collect directionService in transit travel mode(to control its display).
var transitDirectionServiceArray = [];

var points = [{"location":{"lat":42.3600825,"lng":-71.0588801}},{"location":{"lat":42.37865559999999,"lng":-71.0615977}},{"location":{"lat":42.3930156,"lng":-71.0809757}},{"location":{"lat":42.3972071,"lng":-71.10443289999999}},{"location":{"lat":42.4011175,"lng":-71.1285122 }}];

// var coord = { lat: 47.541, lng: 126.986 };


function initMap() {
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  map = new google.maps.Map(document.getElementById("map"), {
    // center's location is origin
    center: points[0].location,
    zoom: 11,
  });
  // 일정이상 zoom 상태여야만 주변마커 표시
  map.addListener('zoom_changed', () => {
    // Customize map styling to show/hide default POI pins or text based on zoom level.
    var hideDefaultPoiPins = map.getZoom() < 17;
    map.setOptions({
      styles: [{
        featureType: 'poi',
        elementType: hideDefaultPoiPins ? 'labels' : 'labels.text',
        stylers: [{visibility: 'off'}],
      }],
    });
  });
  var infoWindow = new google.maps.InfoWindow();
  // Try HTML5 geolocation.
  // if (navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(
  //     function (position) {
  //       var pos = {
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude,
  //       };
  //       map.setCenter(pos);
  //       map.setZoom(17);
  //       var marker = new google.maps.Marker({position: pos, map: map});
  //     },
  //     function () {
  //       handleLocationError(true, infoWindow, map.getCenter());
  //     }
  //   );
  // } else {
  //   // Browser doesn't support Geolocation
  //   handleLocationError(false, infoWindow, map.getCenter());
  // }
  directionService('driving');
}

//set user position as map center
// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//   infoWindow.setPosition(pos);
//   infoWindow.setContent(
//     browserHasGeolocation
//       ? "Error: The Geolocation service failed."
//       : "Error: Your browser doesn't support geolocation."
//   );
// }

// function initPlace() {
//   var infoWindow = new google.maps.InfoWindow();
//   var input = document.getElementById(`loc${seq}`);
//   var autocomplete = new google.maps.places.Autocomplete(input);
//   // 사용자가 입력한 장소를 google map API로 자동적으로 장소 정보 받아오기
//   autocomplete.bindTo("bounds", map);  

//   // google map API를 활용해 호출한 장소를 기준으로 마커 생성
//   var marker = new google.maps.Marker({
//     map: map,
//     anchorPoint: new google.maps.Point(0, -29),
//   });

//   //change place.
//   autocomplete.addListener("place_changed", function () {
//     infoWindow.close();
//     marker.setVisible(false);
//     var place = autocomplete.getPlace(); // 자동적으로 호출한 장소의 정보를 place 변수에 저장
//     if (!place.geometry) {
//       $(document).keypress(function (e) {
//         if (!e.which == 13) {
//           // User entered the name of a Place that was not suggested and
//           // pressed the Enter key, or the Place Details request failed.
//           window.alert("No details available for input: '" + place.name + "'");
//           return;
//         }
//       });
//     }
//     // place에 저장된 정보를 바탕으로 지도에 표현
//     // If the place has a geometry, then present it on a map.
//     if (place.geometry.viewport) {
//       map.fitBounds(place.geometry.viewport);
//     } else {
//       map.setCenter(place.geometry.location);
//       map.setZoom(17);
//     }
//     marker.setPosition(place.geometry.location);
//     marker.setVisible(true);
//     //setPanelMarker to markerMap, "marker" + seq as key, marker as value.
//     //마커가 여러개이므로 marker+seq를 키로 marker를 값으로 셋팅
//     markerMap.set(`marker${seq}`, marker);
//     //set location
//     var address = "";
//     if (place.address_components) {
//       address = [
//         (place.address_components[0] &&
//           place.address_components[0].short_name) ||
//           "",
//         (place.address_components[1] &&
//           place.address_components[1].short_name) ||
//           "",
//         (place.address_components[2] &&
//           place.address_components[2].short_name) ||
//           "",
//       ].join(" ");
//     }

//     infoWindow.setContent(
//       "<div><strong>" + place.name + "</strong><br>" + address
//     );
//     infoWindow.open(map, marker);
//     //set location data to panel.
//     var location = $(`#loc${seq}`).val();
//     //--panel title---
//     $(`#a${seq}`).text(location);
//     //--coordinate---
//     $(`#lat${seq}`).val(marker.position.lat);
//     $(`#lng${seq}`).val(marker.position.lng);
//     //marker에 저장된 위도 경도 정보를 미니 윈도우 창에 표현
//     //draw polyline. 일직선으로 경로 그리기
//    drawPolyline();
//   });

//   marker.addListener("click", function () {
//     infoWindow.open(map, marker);
//   });
// }

//change location but not throw autocomplete.
// function changeLocation(seq) {
//   var location = $(`#loc${seq}`).val();
//   //--panel title---
//   $(`#a${seq}`).text(location);
// }
// marker에 저장된 위도 경도값만 따로 저장
// change coordinate and update on the map not throw autocomplete.
// function changeCoordinate(seq) {
//   var marker = markerMap.get(`marker${seq}`);
//   var lat = Number($(`#lat${seq}`).val());
//   var lng = Number($(`#lng${seq}`).val());
//   marker.setPosition({ lat: lat, lng: lng });
//   map.setCenter({ lat: lat, lng: lng });
// }

//if the clicked panel is open, pan to the according marker position.
function clickPanel(seq) {
  var collapseId = `#collapse${seq}`;
  var active = !$(collapseId).hasClass("in");
  if (active) {
    var latlng = markerMap.get(`marker${seq}`).getPosition();
    map.panTo(latlng);
  }
}

// get order of locations.
// function getOrder() {
//   // var array = Array.from($("[data-seq]"), (x) => $(x).attr("data-seq"));
//   var array = [1,2,3,4,5];
//   return array;
// }



//draw polyline on the map.
function drawPolyline() {
  if (polyline) {
    polyline.setMap(null);
  }
  // var array = getOrder();
  var markers = [];
  // $.each(array, function (index, value) {
  //   var marker = markerMap.get(`marker${value}`).getPosition();
  //   markers.push({ lat: marker.lat(), lng: marker.lng() });
  // });
  for(i=0; i<points.length-1; i++){
    markers.push(points[i].location);
  };

  polyline = new google.maps.Polyline({
    path: markers,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });
  polyline.setMap(map);
}

//travel Arrangements tab
// function travelArrangements() {
//   transitDirectionServiceArray.forEach(function (service, index) {
//     service.setMap(null);
//   });
//   transitDirectionServiceArray = [];
//   //clear last direction service.
//   if (directionsService && directionsDisplay) {
//     $("#dsPanelBody").html("");
//     directionsDisplay.setMap(null);
//   }

//   if (markerMap.size > 0) {
//     for (var value of markerMap) {
//       var marker = value[1];
//       marker.setMap(map);
//     }
//   }

//   if (polyline) {
//     polyline.setMap(map);
//   }
// }

// 경로 이동 수단 선택함수
//click Direction Service tab to start direction service, default travel mode: driving.
function directionService(travelMode) {
  transitDirectionServiceArray.forEach(function (service, index) {
    service.setMap(null);
  });
  transitDirectionServiceArray = [];
  //clear last direction service and remove all markers and polyline.
  if (directionsService && directionsDisplay) {
    $("#dsPanelBody").html("");
    directionsDisplay.setMap(null);
  }

  if (markerMap.size > 0) {
    for (var value of markerMap) {
      var marker = value[1];
      marker.setMap(null);
    }
  }

  if (polyline) {
    polyline.setMap(null);
  }
  //panel title
  $("#dsA").text(travelMode);
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map,
    panel: document.getElementById("dsPanelBody"),
  });

  //get locations order in travel arrangement.
  // var array = getOrder();

  // origin + waypoints + destination => points array
  // points array's value will load from DB
  // var points = [{"location":{"lat":42.3600825,"lng":-71.0588801}},{"location":{"lat":42.37865559999999,"lng":-71.0615977}},{"location":{"lat":42.3930156,"lng":-71.0809757}},{"location":{"lat":42.3972071,"lng":-71.10443289999999}},{"location":{"lat":42.4011175,"lng":-71.1285122 }}];

  if (points.length != 1) {
    if (travelMode == "transit" && points.length > 2) {
      for (var i = 0; i < points.length-1; i++) {
        //origin
        var origin = points[i];

        //destination seq
        var destination = points[i+1];

        travelMode = travelMode.toUpperCase();
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          panel: document.getElementById("dsPanelBody"),
        });
        displayRoute(
          origin,
          null,
          destination,
          travelMode,
          directionsService,
          directionsDisplay
        );
        transitDirectionServiceArray.push(directionsDisplay);
      }
    } else {
      //origin
      // var oriSeq = array[0];
      // var origin = markerMap.get(`marker${oriSeq}`).getPosition();
      var origin = points[0];

      //waypoints 경유지 배열로 관리
      var waypoints = [];
      // var waypoints = [{"location":{"lat":42.3930156,"lng":-71.0809757}}];

      for (var i = 1; i < points.length-1; i++) {
        waypoints.push(points[i]);
      }
      // for (var i = 1; i < array.length - 1; i++) {
      //   var seq = array[i];
      //   var point = markerMap.get(`marker${seq}`).getPosition();
      //   waypoints.push({ location: point });
      // }

      //destination
      // var desSeq = array[array.length - 1];
      // var destination = markerMap.get(`marker${desSeq}`).getPosition();
      var destination = points[points.length-1];

      //default travel mode: driving.
      travelMode = travelMode.toUpperCase();
      displayRoute(
        origin,
        waypoints,
        destination,
        travelMode,
        directionsService,
        directionsDisplay
      );
    }

    //resize direction service panel.
    resizeDsPanel();
    //force to show direction service panel.
    $("#dsCollapse").collapse("show");
  }
}

function displayRoute(
  origin,
  waypoints,
  destination,
  travelMode,
  service,
  display
) {
  service.route(
    {
      origin: origin,
      waypoints: waypoints,
      destination: destination,
      travelMode: travelMode,
      avoidTolls: true,
    },
    function (response, status) {
      console.log("origin:"+JSON.stringify(origin));
      console.log("waypoints:"+JSON.stringify(waypoints));
      console.log("destination:"+JSON.stringify(destination));
      console.log("travelMode:"+JSON.stringify(travelMode));
      console.log("service:"+JSON.stringify(service));

      if (status === "OK") {
        display.setDirections(response);
      } else {
        $("#dsPanelBody").html("Sorry, there is no route provided.");
      }
    }
  );
}
