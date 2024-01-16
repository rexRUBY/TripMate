const plan_name = document.getElementById("plan_name");
const plan_location = document.getElementById("Location");
const plan_date = document.getElementById("plan_date");
const plan_people = document.getElementById("plan_people");
const card_view = document.getElementById("step3_card");

let data_array = [];

let transitDirectionServiceArray = [];
let markerMap = new Map();
let polyline;
let map;

let directionsService = new google.maps.DirectionsService();
let directionsDisplay = new google.maps.DirectionsRenderer();
// load data from DB
fetch('/view/load', {
    method: 'POST',
})
    .then((res) => res.json())
    .then((res) => {
        addList(res.data_array);
    })
    .catch((err) => {
        console.error('실패:', err);
    });


function addList(data_array) {
    $('#plan_name').val(data_array.plan_name);
    $('#Location').val(data_array.location);
    $('#plan_date').val(data_array.date);
    $('#plan_people').val(data_array.people);

    $(`#plan_name_check`).text(plan_name.value);
    $(`#Location_check`).val(plan_location.value);
    $(`#plan_date_check`).val(plan_date.value);
    $(`#plan_people_check`).val(plan_people.value);

    let data = JSON.parse(data_array.data);
    let plan_data_array = data.plan_data_array;

    let loc_array = plan_data_array[0].loc;
    let st_time_array = plan_data_array[1].st_time;
    let en_time_array = plan_data_array[2].en_time;
    let des_array = plan_data_array[3].description;
    let points = plan_data_array[4].location;

    initMap(points[0].location);

    for (i = 1; i <= loc_array.length; i++) {
        $(`#a${i}`).text(loc_array[i - 1]);
        $(`#loc${i}`).val(loc_array[i - 1]);
        $(`#st${i}`).val(st_time_array[i - 1]);
        $(`#en${i}`).val(en_time_array[i - 1]);
        if (des_array[i - 1].length > 0) {
            $(`#des${i}`).val(des_array[i - 1]);
        }

        let marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29),
        });
        marker.setPosition(points[i - 1].location);
        markerMap.set(`marker${i}`, marker);

        if (i == loc_array.length)
            break;
        else
            addPanel();
    }

    drawPolyline();
}

// plan name 중복 확인
plan_name.addEventListener('change', () => {
    fetch('/edit/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_name: plan_name.value }),
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.duplication) {
                alert('이미 존재하는 여행 계획 이름입니다!');
                $('#plan_name').val(res.now_plan);
                return;
            }
        })
        .catch((err) => {
            console.error('실패:', err);
            return;
        });
    $(`#plan_name_check`).text(plan_name.value);
});

plan_date.addEventListener('change', () => {
    $(`#plan_date_check`).val(plan_date.value);
});

plan_people.addEventListener('change', () => {
    if (isNaN(plan_people.value) || plan_people.value.length < 1) {
        alert('여행 인원은 숫자로 입력해주세요!');
        return;
    }
    $(`#plan_people_check`).val(plan_people.value);
});

// step3 card-view
function set_card_view() {
    let loc_array = document.querySelectorAll("#sortable [id^='loc']");
    let st_array = document.querySelectorAll("#sortable [id^='st']");
    let en_array = document.querySelectorAll("#sortable [id^='en']");
    let des_array = document.querySelectorAll("#sortable [id^='des']");

    $("#step3_card").text('');

    let size = loc_array.length;
    if (size < 1) return;

    for (i = 0; i < size; i++) {
        // xss 대책 필요
        let html = `<!-- Card body START -->
        <div class="card-body">
            <div>
                <h5 class="card-title mb-1">${loc_array[i].value}</h5>
                <h6>Time Info (${st_array[i].value} - ${en_array[i].value})</h6>
                <span>${des_array[i].value}</span>
            </div>
        </div>
        <!-- Card body END -->`;

        $("#step3_card").append(html);
    }
}

const steppertrigger3 = document.getElementById("steppertrigger3");
const go_step3 = document.getElementById("go_step3");

steppertrigger3.addEventListener('click', set_card_view);
go_step3.addEventListener('click', set_card_view);


/* google maps api */
function initMap(center_point) {
    let place;

    // let center_lat = markerMap.get('marker1').position().lat();
    // let center_lng = markerMap.get('marker1').position().lng();
    map = new google.maps.Map(document.getElementById("map_area"), {
        // center: { lat: 37.541, lng: 126.986 },
        center: center_point,
        zoom: 10,
    });

    map.addListener('zoom_changed', () => {
        // Customize map styling to show/hide default POI pins or text based on zoom level.
        let hideDefaultPoiPins = map.getZoom() < 17;
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
        $(`#Location_check`).val(plan_location.value);
    })
    //리턴값으로 위도 경도 받으려면 place.geometry.location
    initPlace(1);
}

//set user position as map center
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
}

function initPlace(seq) {
    let infoWindow = new google.maps.InfoWindow();
    let input = document.getElementById(`loc${seq}`);
    let autocomplete = new google.maps.places.Autocomplete(input);
    // 사용자가 입력한 장소를 google map API로 자동적으로 장소 정보 받아오기
    // autocomplete.bindTo("bounds", map);

    // google map API를 활용해 호출한 장소를 기준으로 마커 생성
    let marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    //change place.
    autocomplete.addListener("place_changed", function () {
        infoWindow.close();
        marker.setVisible(false);
        let place = autocomplete.getPlace(); // 자동적으로 호출한 장소의 정보를 place 변수에 저장
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
        let address = "";
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
        let location = $(`#loc${seq}`).val();
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
    let location = $(`#loc${seq}`).val();
    //--panel title---
    $(`#a${seq}`).text(location);
}
// marker에 저장된 위도 경도값만 따로 저장
// change coordinate and update on the map not throw autocomplete.
function changeCoordinate(seq) {
    let marker = markerMap.get(`marker${seq}`);
    let lat = Number($(`#lat${seq}`).val());
    let lng = Number($(`#lng${seq}`).val());
    marker.setPosition({ lat: lat, lng: lng });
    map.setCenter({ lat: lat, lng: lng });
}
//if the clicked panel is open, pan to the according marker position.
function clickPanel(seq) {
    let collapseId = `#collapse${seq}`;
    let active = !$(collapseId).hasClass("in");
    if (active) {
        let latlng = markerMap.get(`marker${seq}`).getPosition();
        map.panTo(latlng);
    }
}
//get order of locations.
function getOrder() {
    let array = Array.from($("[data-seq]"), (x) => $(x).attr("data-seq"));
    for(let i=array.length; i>=0; i--){
        if($(`#loc${array[i]}`).val() == ''){
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
    let array = getOrder();
    let markers = [];
    // for (i = 1; i <= array.length; i++) {
    //     let marker = markerMap.get(`marker${i}`).getPosition();
    //     markers.push({ lat: marker.lat(), lng: marker.lng() });
    // }
    $.each(array, function (index, value) {
        let marker = markerMap.get(`marker${value}`).getPosition();
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
        for (let value of markerMap) {
            let marker = value[1];
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
        for (let value of markerMap) {
            let marker = value[1];
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
    let array = getOrder();

    if (array.length != 1) {
        if (travelMode == "transit" && array.length > 2) {
            //split into route without waypoints.(for travel mode : Transit)
            let transitRoute = [];
            for (let i = 0; i < array.length - 1; i++) {
                let seq = i;
                let route = [];
                route.push(array[seq]);
                route.push(array[seq + 1]);
                transitRoute.push(route);
            }
            for (let i = 0; i < transitRoute.length; i++) {
                let route = transitRoute[i];
                //origin
                let oriSeq = route[0];
                let origin = markerMap.get(`marker${oriSeq}`).getPosition();
                //destination seq
                let desSeq = route[1];
                let destination = markerMap.get(`marker${desSeq}`).getPosition();

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
            let oriSeq = array[0];
            let origin = markerMap.get(`marker${oriSeq}`).getPosition();

            //waypoints 경유지 배열로 관리
            let waypoints = [];
            for (let i = 1; i < array.length - 1; i++) {
                let seq = array[i];
                let point = markerMap.get(`marker${seq}`).getPosition();
                waypoints.push({ location: point });
            }

            //destination
            let desSeq = array[array.length - 1];
            let destination = markerMap.get(`marker${desSeq}`).getPosition();

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
/* google maps api */

// send data to DB
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

    fetch('/edit/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_data: plan_data }),
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.edit) {
                console.log('성공');
                location.href = '/starting';
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

const edit_plan = document.getElementById('edit_plan');
edit_plan.addEventListener('click', send_data);


document.getElementById('go_plan_list').addEventListener('click', () => {
    location.href = '/starting';
});