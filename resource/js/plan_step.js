/* Image List */
$(document).ready(function () {
    var pageCount = 1, itemCount = 1;
    var imgLink = "/public/images/cities/";
    var extension = "";
    var ranNum = 0;
    var locList = ["방콕", "파리", "런던", "두바이", "싱가포르", "쿠알라룸푸르", "뉴욕", "이스탄불", "도쿄", "안탈리아", "서울", "오사카", "메카", "푸켓", "파타야", "밀라노", "바르셀로나", "팔마",
        "발리", "홍콩", "로마", "마드리드", "암스테르담", "프라하", "로스앤젤레스", "시카고", "샌프란시스코", "베를린", "워싱턴", "베이징", "더블린", "라스베이거스", "부다페스트", "토론토", "시드니", "도하",
        "아부다비", "빈", "샌디에고", "상파울로", "멜버른", "취리히", "보스턴", "리스본", "바르샤바", "시애틀", "올랜도", "뮌헨", "휴스턴", "오스틴", "부에노스아이레스", "나폴리", "코펜하겐", "댈러스",
        "헬싱키", "프랑크푸르트", "애틀랜타", "스톡흘름", "마이애미", "아테네", "리우데자네이루", "함부르크", "덴버", "몬트리올", "브뤼셀", "텔아비브", "오슬로", "타이베이", "발렌시아", "미니애폴리스", "필라델피아", "캘거리",
        "포틀랜드", "내슈빌", "오클랜드", "벤쿠버", "산티아고", "멕시코시티", "뭄바이", "상하이", "산호세", "리옹", "빌바오", "리버풀", "뉴올리언스", "브리즈번", "멘체스터", "후쿠오카", "세비야", "리야드",
        "예루살렘", "난징", "민스크", "솔트레이크시티", "피닉스", "자카르타", "예테보리", "퍼스", "글래스고", "나고야", "볼티모어", "슈투르가르트", "오타와", "하노이", "센다이", "쾰른", "마르세유"];
    var locImgList = ["bangkok", "paris", "london", "dubai", "singapore", "kuala lumpur", "new york", "istanbul", "tokyo", "antalya", "seoul", "osaka", "mecca", "phuket", "pattaya", "milan", "barcelona", "palma",
        "bali", "hongkong", "rome", "madrid", "amsterdam", "prague", "los angeles", "chicago", "sanfrancisco", "berlin", "washington", "beijing", "dublin", "las-vegas", "budapest", "toronto", "sydney", "doha",
        "abu-dhabi", "vienna", "san-diego", "sao-paulo", "melbourne", "zurich", "boston", "lisbon", "warsaw", "seattle", "orlando", "munich", "houston", "austin", "buenos-aires", "naples", "copenhagen", "dallas",
        "helsinki", "frankfurt", "atlanta", "stockholm", "miami", "athens", "riodejaneiro", "hamburg", "denver", "montreal", "brussels", "telaviv", "oslo", "taipei", "valencia", "minneapolis", "philadelphia", "calgary",
        "portland", "nashville", "auckland", "vancouver", "santiago", "mexicocity", "mumbai", "shanghai", "sanjose", "lyon", "bilbao", "liverpool", "new_orleans", "brisbane", "manchester", "fukuoka", "seville", "riyadh",
        "jerusalem", "nanjing", "minsk", "salt_lake_city", "phoenix", "jakarta", "gothenburg", "perth", "glasgow", "nagoya", "baltimore", "stuttgart", "ottawa", "hanoi", "sendai", "cologne", "marseille"];
    for (pageCount; pageCount <= 6; pageCount++) {
        ranNum = Math.floor(Math.random() * 3 + 1);
        if (pageCount == 1) {
            $(".col-12 .tab-content").append(`<div id="page${pageCount}" class="tab-pane fade show active">`)
        } else { $(".col-12 .tab-content").append(`<div id="page${pageCount}" class="tab-pane fade">`) }
        $(`#page${pageCount}`).append(`<div class="row" style="margin:0 30px">`)
        for (itemCount; itemCount <= (18 * pageCount); itemCount++) {
            if (itemCount <= locImgList.length) {
                if (itemCount <= 27) {
                    if (itemCount == 2) {
                        if (ranNum == 1) { extension = ".jpg"; }
                    }
                    else if (itemCount == 3) { if (ranNum == 1) { extension = ".png"; } }
                    else { extension = ".jpeg"; }
                } else { extension = ".jpg"; }
            }
            $(`#page${pageCount} .row`).append(`<div class="col-sm-5 col-xl-2">
                <div class="card card-img-scale overflow-hidden bg-transparent">
                    <div class="card-img-scale-wrapper rounded-3">
                        <img src="${imgLink}${locImgList[itemCount - 1]}${ranNum}${extension}" class="card-img" alt="">
                    </div>  
                    <div class="card-body px-2 text-center">
                        <h6 class="card-title">
                            <a class="stretched-link" id="card${itemCount}" onclick="locaPrint(${itemCount})">${locList[itemCount - 1]}</a>
                        </h6>
                    </div>
                </div>
            </div>`)
            if (itemCount == 107) { break; }
        }
    }
});

const plan_name = document.getElementById("plan_name");
const plan_date = document.getElementById("plan_date");
const plan_people = document.getElementById("plan_people");
const card_view = document.getElementById("step3_card");

// plan name 중복 확인
plan_name.addEventListener('change', () => {
    fetch('/plan/check', {
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
                $('#plan_name').val('');
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


document.getElementById('go_mypage').addEventListener('click', () => {
    location.href = '/mypage';
});

function saveAsImage() {
    var element = document.getElementById('capture');
    var options = {
        scrollY: -window.scrollY,
        backgroundColor: 'white',
        scale: 0.5
    };

    html2canvas(element, options).then(function (canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'plan_image.png';
        link.click();
    });
}