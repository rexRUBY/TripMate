// load data from DB
function loadData() {
    fetch('/starting/load', {
        method: 'POST',
    })
        .then((res) => res.json())
        .then((res) => {
            let plan_info_array = res.plan_info_array;
            addList(plan_info_array);
        })
        .catch((err) => {
            console.error('실패:', err);
        });
}
// inital load
loadData();


// plan list 생성
function addList(plan_info_array) {
    for (i = 0; i < plan_info_array.length; i++) {
        let html = `<div class="row row-cols-xl-7 align-items-lg-center border-bottom g-4 px-2 py-4">
                        <!-- Data item -->
                        <div class="col-2">
                            <div class="d-flex align-items-center">
                                <div>
                                    <input type="checkbox" class="checkbox form-check-input">
                                </div>
                                <!-- Plan Name -->
                                <div class="ms-2">
                                    <h6 class="mb-0 fw-light" id="plan_name${i + 1}">${plan_info_array[i].plan_name}</h6>
                                </div>
                            </div>
                        </div>
    
                        <!-- Location -->
                        <div class="col-2">
                            <h6 class="mb-0 fw-normal" id="plan_location${i + 1}">${plan_info_array[i].location}</h6>
                        </div>
    
                        <!-- Date Start to End -->
                        <div class="col-2">
                            <h6 class="mb-0 fw-normal" id="plan_date${i + 1}">${plan_info_array[i].date}</h6>
                        </div>
    
                        <!-- Data item -->
                        <div class="col">
                        <div class="col"><a id="plan_view${i + 1}" class="btn btn-sm btn-light mb-0">보기</a></div>
                        </div>
    
                        <!-- Data item -->
                        <div class="col">
                            <div class="col"><a id="plan_edit${i + 1}" class="btn btn-sm btn-light mb-0">편집</a></div>
                        </div>
    
                        <!-- Data item -->
                        <div class="col"><a id="plan_money${i + 1}" class="btn btn-sm btn-light mb-0">가계부</a></div>

                        <!-- Data item -->
					    <div class="col"><a id="plan_image${i + 1}" class="btn btn-sm btn-light mb-0" style="margin-left: 10px;"><i class="bi bi-download"></i></a></div>
                    </div>`;

        $("#card").append(html);

        const plan_name = plan_info_array[i].plan_name;
        document.getElementById(`plan_view${i + 1}`).addEventListener('click', () => {
            // save plan_name in session
            fetch('/starting/change_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan_name: plan_name })
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.result)
                        location.href = '/view';
                    else
                        alert('error!');
                })
                .catch((err) => {
                    console.error('실패:', err);
                });
        });

        document.getElementById(`plan_edit${i + 1}`).addEventListener('click', () => {
            // save plan_name in session        
            fetch('/starting/change_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan_name: plan_name })
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.result)
                        location.href = '/edit';
                    else
                        alert('error!');
                })
                .catch((err) => {
                    console.error('실패:', err);
                });

        });

        document.getElementById(`plan_money${i + 1}`).addEventListener('click', () => {
            // save plan_name in session
            fetch('/starting/change_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan_name: plan_name })
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.result)
                        location.href = '/money';
                    else
                        alert('error!');
                })
                .catch((err) => {
                    console.error('실패:', err);
                });

        });

        document.getElementById(`plan_image${i + 1}`).addEventListener('click', () => {
            // save plan_name in session
            fetch('/starting/change_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan_name: plan_name })
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.result)
                        location.href = '/image';
                    else
                        alert('error!');
                })
                .catch((err) => {
                    console.error('실패:', err);
                });

        });
    }

    let buttons = `
        <button id="go_mypage" class="btn btn-secondary" style="float: left; margin-top: 20px;">My Page</button>
        <button id="delete_plan" class="btn btn-primary" style="float: right; margin-top: 20px;">삭제</button>
        `;
    $("#card").append(buttons);

    document.getElementById('go_mypage').addEventListener('click', () => {
        location.href = '/mypage';
    });

    document.getElementById('delete_plan').addEventListener('click', deletePlan);
}


// // 일정 정렬 -> 보류
// function handleSort(value) {
//     if (value === "fastest") {
//         sortTableByDateFastest();
//     } else if (value === "latest") {
//         sortTableByDateLatest();
//     }
// }

// function sortTableByDateFastest() {
//     const tableData = document.querySelectorAll('.row-cols-xl-7');
//     const dataArray = Array.from(tableData);
//     dataArray.sort(compareDatesFastest);
//     const cardBody = document.getElementById('card');
//     dataArray.forEach(data => cardBody.appendChild(data));
//     console.log(dataArray);
// }

// function sortTableByDateLatest() {
//     const tableData = document.querySelectorAll('.row-cols-xl-7');
//     const dataArray = Array.from(tableData);
//     dataArray.sort(compareDatesLatest);
//     const cardBody = document.getElementById('card');
//     dataArray.forEach(data => cardBody.appendChild(data));
//     console.log(dataArray);
// }

// function compareDatesFastest(a, b) {
//     const dateA = new Date(a.querySelector('.col:nth-child(3) h6').textContent);
//     const dateB = new Date(b.querySelector('.col:nth-child(3) h6').textContent);
//     return dateA - dateB;
// }

// function compareDatesLatest(a, b) {
//     const dateA = new Date(a.querySelector('.col:nth-child(3) h6').textContent);
//     const dateB = new Date(b.querySelector('.col:nth-child(3) h6').textContent);
//     return dateB - dateA;
// }


//일정명 검색
function searchPlans() {
    var searchKeyword = document.querySelector('input[type="search"]').value.toLowerCase();
    var plans = document.querySelectorAll('.card-body .row-cols-xl-7');
    plans.forEach(function (plan) {
        var planName = plan.querySelector('.ms-2 h6').textContent.toLowerCase();
        if (planName.includes(searchKeyword)) {
            plan.style.display = 'flex';
        } else {
            plan.style.display = 'none';
        }
    });
}

document.querySelector('.card-body form').addEventListener('submit', function (e) {
    e.preventDefault();
    searchPlans();
});

// delete plan
function deletePlan() {
    let checkboxes = document.getElementsByClassName("checkbox");
    let plan_name_array = []

    for (let i = checkboxes.length - 1; i >= 0; i--) {
        if (checkboxes[i].checked) {
            plan_name_array.push(checkboxes[i].closest(".row-cols-xl-7").querySelector('h6').innerText);
        }
    }

    if (plan_name_array.length < 1) {
        alert('삭제할 계획을 1개 이상 선택해주세요!')
        return;
    } 

    let result = window.confirm('계획을 삭제하시겠습니까?');
    if (!result) return;


    fetch('/starting/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_name_array: plan_name_array }),
    })
        .then((res) => res.json())
        .then((res) => {
            let result = res.result;
            if (result) {
                alert('삭제되었습니다!');
                location.reload();
            }
        })
        .catch((err) => {
            console.error('실패:', err);
        });
}