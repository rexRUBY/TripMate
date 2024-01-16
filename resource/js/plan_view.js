$(document).ready(function () {
    $('.nav-tabs a').click(function () {
        $(this).tab('show');
    });
});

let points = [];
let transitDirectionServiceArray = [];
let markers = [];
let markerMap = new Map();
let polyline;
let map;

// load data from DB
fetch('/view/load', {
    method: 'POST',
})
    .then((res) => res.json())
    .then((res) => {
        let data_array = res.data_array;
        points = addList(data_array);
        // load google map
        initMap();
    })
    .catch((err) => {
        console.error('실패:', err);
    });

function addList(data_array) {
    $('#plan_name').text(data_array.plan_name);
    $('#Location').val(data_array.location);
    $('#Date').val(data_array.date);
    $('#Travelers').val(data_array.people);

    let data = JSON.parse(data_array.data);
    let plan_data_array = data.plan_data_array;

    let loc_array = plan_data_array[0].loc;
    let st_time_array = plan_data_array[1].st_time;
    let en_time_array = plan_data_array[2].en_time;
    let des_array = plan_data_array[3].description;
    for (i = 0; i < loc_array.length; i++) {
        let html = `
            <div class="card-body">
                <div>
                    <h5 class="card-title mb-1" data-seq="${i + 1}">${loc_array[i]}</h5>
                    <h6>Time Info (${st_time_array[i]} - ${en_time_array[i]})</h6>
                    <span>${des_array[i]}</span>
                </div>
            </div>
            `;

        $('#card_list').append(html);
    }

    return plan_data_array[4].location;

}

let directionsService = new google.maps.DirectionsService();
let directionsDisplay = new google.maps.DirectionsRenderer();

function initMap() {
    map = new google.maps.Map(document.getElementById("map_area"), {
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
                stylers: [{ visibility: 'off' }],
            }],
        });
    });
    var infoWindow = new google.maps.InfoWindow();
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
                map.setZoom(17);

                const icon = {
                    url: "/public/images/marker.png", // url
                    scaledSize: new google.maps.Size(45, 45), // scaled size
                    origin: new google.maps.Point(0,0), // origin
                    anchor: new google.maps.Point(0, 0) // anchor
                };
                
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: icon
                });
            },
            function () {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    // markerMap에 마커들을 저장
    for (i = 0; i < points.length; i++) {
        markers.push(points[i].location);
        marker = new google.maps.Marker({ position: points[i].location });
        markerMap.set(`marker${i + 1}`, marker);
        marker.setMap(map);
    };

    drawPolyline();

}

// set user position as map center
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
}

//draw polyline on the map.
function drawPolyline() {
    if (polyline) {
        polyline.setMap(null);
    }

    for (i = 1; i < markerMap.length + 1; i++) {
        let marker = markerMap.get(`marker${i}`).getPosition();
        markers.push({ lat: marker.lat(), lng: marker.lng() });
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
function travelArrangements() {
    transitDirectionServiceArray.forEach(function (service, index) {
        service.setMap(null);
    });
    transitDirectionServiceArray = [];
    //clear last direction service.
    if (directionsService && directionsDisplay) {
        $("#dsPanelBody").html("");
        directionsDisplay.setMap(null);
    }

    if (markerMap.size > 0) {
        for (var value of markerMap) {
            var marker = value[1];
            marker.setMap(map);
        }
    }

    if (polyline) {
        polyline.setMap(map);
    }
}

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

    //get order of locations.
    function getOrder() {
        let array = Array.from($("[data-seq]"), (x) => $(x).attr("data-seq"));
        return array;
    }

    //get locations order in travel arrangement.
    let array = getOrder();

    if (array.length != 1) {
        if (travelMode == "transit" && array.length > 2) {
            //split into route without waypoints.(for travel mode : Transit)
            var transitRoute = [];
            for (var i = 0; i < array.length - 1; i++) {
                var seq = i;
                var route = [];
                route.push(array[seq]);
                route.push(array[seq + 1]);
                transitRoute.push(route);
            }
            for (var i = 0; i < transitRoute.length; i++) {
                var route = transitRoute[i];
                //origin
                var oriSeq = route[0];
                var origin = markerMap.get(`marker${oriSeq}`).getPosition();
                //destination seq
                var desSeq = route[1];
                var destination = markerMap.get(`marker${desSeq}`).getPosition();

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
            var oriSeq = array[0];
            var origin = markerMap.get(`marker${oriSeq}`).getPosition();

            //waypoints 경유지 배열로 관리
            var waypoints = [];
            for (var i = 1; i < array.length - 1; i++) {
                var seq = array[i];
                var point = markerMap.get(`marker${seq}`).getPosition();
                waypoints.push({ location: point });
            }

            //destination
            var desSeq = array[array.length - 1];
            var destination = markerMap.get(`marker${desSeq}`).getPosition();

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
            if (status === "OK") {
                display.setDirections(response);
            } else {
                $("#dsPanelBody").html("Sorry, there is no route provided.");
            }
        }
    );
}

document.getElementById('go_plan_list').addEventListener('click', () => {
    location.href = '/starting';
});