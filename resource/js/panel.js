
/* Destination Text */
function locaPrint(num) {
    var idNum = "card" + num;
    document.getElementById('Location').value = document.getElementById(idNum).textContent;
    document.getElementById('Location').focus();
}

//탭 이동
$(document).ready(function () {
    $('.nav-tabs a').click(function () {
        $(this).tab('show');
    });
});

//탭 이동 시 스크롤 방지
$(document).ready(function () {
    $('.nav-tabs a').click(function (event) {
        event.preventDefault(); // 기본 동작인 링크 이동을 막음

        var target = $(this).attr('href'); // 클릭한 탭의 대상 섹션 ID를 가져옴
        var offset = $(target).offset().top; // 대상 섹션의 상단 위치를 가져옴
    });
});

// # 버튼 토글
function toggleCollapse(event, panelId) {
    event.preventDefault();
    const panel = document.getElementById(`collapse${panelId}`);
    const header = document.getElementById(`heading${panelId}`);
    const isExpanded = panel.classList.contains('show');
    if (isExpanded) {

        panel.classList.remove('show');
        header.setAttribute('aria-expanded', 'false');
    } else {
        panel.classList.add('show');
        header.setAttribute('aria-expanded', 'true');
    }
}

/* # Location change */
function changeLocation(num) {
    var locdata = document.getElementById(`loc${num}`).value
    if (locdata != "") {
        $(`#a${num}`).html(document.getElementById(`loc${num}`).value);
    }
}

// 패널 추가
let index = 1;
function addPanel() {
    $(".collapse").collapse('hide');
    index++;
    var html = ``;
    html += `<!-- Card START -->
                        <li class="ui-state-default">
                            <div class="card shadow">
                                <!-- Card  Header START -->
                                <div class="card">
                                    <div class="card-header border-bottom" id="heading${index}" data-seq=${index}>
                                        <div style="display: inline-block;">
                                            <h5 class="mb-0 panel-title">
                                                <a id="a${index}" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse${index}" aria-expanded="true" aria-controls="collapseOne"onclick="toggleCollapse(event, ${index})">
                                                                                    #</a>
                                                                            </h5>
                                                                        </div>
                                                                    </div>
                                                                    <!-- Card body START -->
                                                                    <div class="card-body">
                                                                        <div class="row g-4">
                                                                            <div id="collapse${index}" role="tabpanel"
                                                                                aria-labelledby="heading${index}"
                                                                                class="panel-collapse collapse"
                                                                                style="background-color:rgba(0, 0, 0, 0);">
                                                                                <div class="panel-body">
                                                                                    <form>
                                                                                        <div
                                                                                            style="padding-bottom: 15px;">
                                                                                            <label for="loc${index}">Location
                                                                                                :</label>
                                                                                            <input type="search"
                                                                                                class="form-control"
                                                                                                id="loc${index}"
                                                                                                placeholder="여행지를 입력하세요"
                                                                                                onchange="changeLocation(${index})">
                                                                                        </div>
                                                                                        <div
                                                                                            style="padding-bottom: 15px;">
                                                                                            <label for="st${index}">Start time
                                                                                                :</label>
                                                                                            <input type="text"
                                                                                                class="form-control flatpickr flatpickr-input"
                                                                                                data-date-format="d M Y"
                                                                                                placeholder="시작 시간을 선택하세요"
                                                                                                id="st${index}">
                                                                                        </div>
                                                                                        <div
                                                                                            style="padding-bottom: 15px;">
                                                                                            <label for="en${index}">End time
                                                                                                :</label>
                                                                                            <input type="text"
                                                                                                class="form-control flatpickr"
                                                                                                data-date-format="d M Y"
                                                                                                placeholder="종료시간을 선택하세요"
                                                                                                id="en${index}">
                                                                                        </div>
                                                                                        <div
                                                                                            style="padding-bottom: 8px;">
                                                                                            <label
                                                                                                for="des${index}">Description :
                                                                                            </label>
                                                                                            <textarea type="text"
                                                                                                class="form-control"
                                                                                                id="des${index}"
                                                                                                placeholder="추가 정보를 입력하세요"></textarea>
                                                                                        </div>
                                                                                        <div class="btn btn-primary mb-5"
                                                                                            role="button"
                                                                                            style="height: 45px; width: 45px; align-items: center; margin-top: 20px; margin-right: 10px;"
                                                                                            onclick="addPanel()">+</div>
                                                                                        <div class="btn btn-primary mb-5"
                                                                                            role="button"
                                                                                            style="height: 45px; width: 45px; align-items: center; margin-top: 20px;"
                                                                                            onclick="removePanel(${index})">-
                                                                                        </div>
                                                                                    </form>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>`;

    $("#sortable").append(html);
    //새 패널은 연다
    $(`a${index}`).click();

    // flatpickr 초기화
    flatpickr(`#st${index}`, {
        dateFormat: "d M Y"
    });
    flatpickr(`#en${index}`, {
        dateFormat: "d M Y"
    });

    initPlace(index);
}

//remove panel and 
function removePanel(seq) {
    var headingId = `#heading${seq}`;
    $(headingId).parent().remove();
    if (markerMap.size > 0) {
        //delete the panel marker from the map and also the markerMap.
        markerMap.get(`marker${seq}`).setMap(null);
        markerMap.delete(`marker${seq}`);
        drawPolyline();
    }
}