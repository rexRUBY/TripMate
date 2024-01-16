var transitDirectionServiceArray = [];
var map;
var polyline;
var directionsService;
var directionsDisplay;
//marker collector.
var markerMap = new Map();

window.addEventListener('DOMContentLoaded', () => {
    let place;

    map = new google.maps.Map(document.getElementById("map_area"), {
        center: { lat: 37.541, lng: 126.986 },
        zoom: 10,
    });

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

    // google maps api autocomplete
    let autocomplete = new google.maps.places.Autocomplete(document.getElementById('Location'));
    autocomplete.addListener('place_changed', function () {
        place = autocomplete.getPlace();
        if (!place.geometry) {
            $(document).keypress(function (e) {
                if (!e.which == 13) {
                    alert("No tetails available for input: '" + place.name + "'");
                }
            });
        }
        // step2 map center 설정
        map.setCenter(place.geometry.location);

        // step3 여행지 정보에 반영
        const plan_location = document.getElementById("Location");
        $(`#Location_check`).val(plan_location.value);
    })
    //리턴값으로 위도 경도 받으려면 place.geometry.location
    initPlace(1);
});

function initPlace(seq) {
    var infoWindow = new google.maps.InfoWindow();
    var input = document.getElementById(`loc${seq}`);
    var autocomplete = new google.maps.places.Autocomplete(input);
    // 사용자가 입력한 장소를 google map API로 자동적으로 장소 정보 받아오기
    autocomplete.bindTo("bounds", map);

    // google map API를 활용해 호출한 장소를 기준으로 마커 생성
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    //change place.
    autocomplete.addListener("place_changed", function () {
        infoWindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace(); // 자동적으로 호출한 장소의 정보를 place 변수에 저장
        if (!place.geometry) {
            $(document).keypress(function (e) {
                if (!e.which == 13) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }
            });
        }
        // place에 저장된 정보를 바탕으로 지도에 표현
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        //setPanelMarker to markerMap, "marker" + seq as key, marker as value.
        //마커가 여러개이므로 marker+seq를 키로 marker를 값으로 셋팅
        markerMap.set(`marker${seq}`, marker);
        //set location
        var address = "";
        if (place.address_components) {
            address = [
                (place.address_components[0] &&
                    place.address_components[0].short_name) ||
                "",
                (place.address_components[1] &&
                    place.address_components[1].short_name) ||
                "",
                (place.address_components[2] &&
                    place.address_components[2].short_name) ||
                "",
            ].join(" ");
        }

        infoWindow.setContent(
            "<div><strong>" + place.name + "</strong><br>" + address
        );
        infoWindow.open(map, marker);
        //set location data to panel.
        var location = $(`#loc${seq}`).val();
        //--panel title---
        $(`#a${seq}`).text(location);
        //--coordinate---
        // $(`#lat${seq}`).val(marker.position.lat);
        // $(`#lng${seq}`).val(marker.position.lng);
        //marker에 저장된 위도 경도 정보를 미니 윈도우 창에 표현
        //draw polyline. 일직선으로 경로 그리기
        drawPolyline();
    });

    marker.addListener("click", function () {
        infoWindow.open(map, marker);
    });
}

function changeLocation(seq) {
    var location = $(`#loc${seq}`).val();
    //--panel title---
    $(`#a${seq}`).text(location);
}
// marker에 저장된 위도 경도값만 따로 저장
// change coordinate and update on the map not throw autocomplete.
function changeCoordinate(seq) {
    var marker = markerMap.get(`marker${seq}`);
    var lat = Number($(`#lat${seq}`).val());
    var lng = Number($(`#lng${seq}`).val());
    marker.setPosition({ lat: lat, lng: lng });
    map.setCenter({ lat: lat, lng: lng });
}
//if the clicked panel is open, pan to the according marker position.
function clickPanel(seq) {
    var collapseId = `#collapse${seq}`;
    var active = !$(collapseId).hasClass("in");
    if (active) {
        var latlng = markerMap.get(`marker${seq}`).getPosition();
        map.panTo(latlng);
    }
}
//get order of locations.
function getOrder() {
    let array = Array.from($("[data-seq]"), (x) => $(x).attr("data-seq"));
    for (let i = array.length; i >= 0; i--) {
        if ($(`#loc${array[i]}`).val() == '') {
            if (i > -1) array.splice(i, 1)
        }
    }
    return array;
}

//draw polyline on the map.
function drawPolyline() {
    if (polyline) {
        polyline.setMap(null);
    }
    var array = getOrder();
    var markers = [];
    $.each(array, function (index, value) {
        var marker = markerMap.get(`marker${value}`).getPosition();
        markers.push({ lat: marker.lat(), lng: marker.lng() });
    });
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

    //get locations order in travel arrangement.
    var array = getOrder();

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

        //resize direction service panel.
        // resizeDsPanel();
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


function send_data() {
    let array = getOrder();

    let plan_data = [];
    let loc = [];
    let st_time = [];
    let en_time = [];
    let description = [];

    let plan_name = $('#plan_name_check').text();
    let plan_location = $(`#Location_check`).val();
    let plan_date = $('#plan_date_check').val();
    let plan_people = $('#plan_people_check').val();

    if (plan_name.length < 1) {
        alert('계획의 이름을 정해주세요!');
        return;
    }

    if (plan_location.length < 1) {
        alert('여행할 장소를 정해주세요!');
        return;
    }

    if (plan_date.length < 1) {
        alert('여행할 날짜를 장해주세요!');
        return;
    }

    if (plan_people.length < 1) {
        alert('여행할 인원을 정해주세요!');
        return;
    }

    if (markerMap.size < 2) {
        alert('여행할 장소를 두 군데 이상 정해주세요!');
        return;
    }

    plan_data.push({ plan_name: plan_name });
    plan_data.push({ plan_location: plan_location });
    plan_data.push({ plan_date: plan_date });
    plan_data.push({ plan_people: plan_people });

    let loc_array = document.querySelectorAll("#sortable [id^='loc']");
    let st_array = document.querySelectorAll("#sortable [id^='st']");
    let en_array = document.querySelectorAll("#sortable [id^='en']");
    let des_array = document.querySelectorAll("#sortable [id^='des']");

    for (i = 0; i < loc_array.length; i++) {
        loc.push(loc_array[i].value);
        st_time.push(st_array[i].value);
        en_time.push(en_array[i].value);
        description.push(des_array[i].value);
    }

    plan_data.push({ loc: loc });
    plan_data.push({ st_time: st_time });
    plan_data.push({ en_time: en_time });
    plan_data.push({ description: description });

    let path_points = [];

    // origin
    let oriSeq = array[0];
    let origin = markerMap.get(`marker${oriSeq}`).getPosition();
    path_points.push({ location: origin });

    // waypoints
    for (let i = 1; i < array.length - 1; i++) {
        let seq = array[i];
        let point = markerMap.get(`marker${seq}`).getPosition();
        path_points.push({ location: point });
    }

    // destination
    let desSeq = array[array.length - 1];
    let destination = markerMap.get(`marker${desSeq}`).getPosition();
    path_points.push({ location: destination });

    plan_data.push({ location: path_points })

    console.log('before send: ' + JSON.stringify(plan_data));

    fetch('/plan/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_data: plan_data }),
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.is_saved) {
                console.log('성공');
                location.href = '/confirm';
                return;
            } else {
                alert('something is wrong');
                return;
            }
        })
        .catch((err) => {
            console.error('실패:', err);
        });
}

const add_listing = document.getElementById('add_listing');
add_listing.addEventListener('click', send_data);