const currencyOne = document.getElementById("currency-one");
const currencyTwo = document.getElementById("currency-two");
const amountOne = document.getElementById("amount-one");
const amountTwo = document.getElementById("amount-two");
const rateEl = document.getElementById("rate");
const plus = document.getElementById("plus");
const money = document.getElementById("money");
const description = document.getElementById("description");
const output = document.getElementById('output');

// 통화 가치 비율
let rate;

// 환전 계산 함수
function calculate() {
    const currency_one = currencyOne.value;
    const currency_two = currencyTwo.value;

    if (amountOne.value < 0){
        alert("금액이 0보다 작을 순 없어요!");
        amountOne.value = 1;
        return;
    }

    fetch(
        `https://v6.exchangerate-api.com/v6/db9dd06ef07d2112693c914d/latest/${currency_one}`
    )
        .then((res) => res.json())
        .then((data) => {
            rate = data.conversion_rates[currency_two];

            rateEl.innerText = `1 ${currency_one} = ${rate} ${currency_two}`;
            amountTwo.value = (amountOne.value * rate).toFixed(2);
        });
}

function calculate2(total) {
    let money_exchange = (parseFloat(money.value) * rate).toFixed(2);
    let total_exchange = (parseFloat(total) * rate).toFixed(2);
    return [money_exchange, total_exchange];
}

// 환전 금액 변경시 작동 이벤트
currencyOne.addEventListener("change", calculate);
amountOne.addEventListener("input", calculate);
currencyTwo.addEventListener("change", calculate);
amountTwo.addEventListener("input", calculate);
calculate();

// 가계부 기록 코드
let index = 1;

// 기록되는 데이터를 배열로 관리
let money_value_array = [];
let money_exchange_array = [];
let total_array = [];
let total_exchange_array = [];
let currencyOne_value_array = [];
let currencyTwo_value_array = [];
let color_array = [];
let des_array = [];

function load_data() {
    let money_data_array = [];
    fetch('/money/load', {
        method: 'POST',
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.money_data == null)
                return;
            else {
                money_data_array = res.money_data;
                load_list(money_data_array);
            }
        })
        .catch((err) => {
            console.error('실패:', err);
        });


}
// inital load
load_data();

function load_list(money_data_array) {
    let money_data = JSON.parse(money_data_array).money_data;

    money_value_array = money_data[0].money_value_array;
    money_exchange_array = money_data[1].money_exchange_array;
    total_array = money_data[2].total_array;
    total_exchange_array = money_data[3].total_exchange_array;
    currencyOne_value_array = money_data[4].currencyOne_value_array;
    currencyTwo_value_array = money_data[5].currencyTwo_value_array;
    color_array = money_data[6].color_array;
    des_array = money_data[7].des_array;

    for (i = 0; i < money_value_array.length; i++) {
        let html = `
        <div class="col-12" style="display: flex; justify-content: center;">
            <div>
                <input type="checkbox" class="checkbox form-check-input" data-seq="${i}">
            </div>
            <p class="col-4" style="flex-basis: 33%; color: ${color_array[i]}; text-align: center;">${money_value_array[i]} ${currencyOne_value_array[i]}<span id="money_exchange${index}" style="font-size: 9px; color: #c5c5c7;">&nbsp;${money_exchange_array[i]}  ${currencyTwo_value_array[i]}</span></p>
            <p class="col-4" style="flex-basis: 33%; text-align: center;" id="total${index}">${total_array[i]} ${currencyOne_value_array[i]}<span id="total_exchange${index}" style="font-size: 9px; color: #c5c5c7;">&nbsp;${total_exchange_array[i]}  ${currencyTwo_value_array[i]}</span></p>
            <p class="col-4" style="flex-basis: 33%; text-align: center;">${des_array[i]}</p>
        </div>
        `;

        $("#output").append(html);
        index++;
    }
}

function removeList() {
    let result = confirm('항목을 삭제하시겠습니까?');
    if (!result) return;

    const checkboxes = document.getElementsByClassName("checkbox");

    // 삭제 이후 첫 번째 요소가 출금안 경우 삭제할 수 없음
    let minus_check_first = true;
    for (i = 0; i < checkboxes.length; i++) {
        if (minus_check_first && !checkboxes[i].checked) {
            if (color_array[i] === "#d6293e") {
                alert('최초 항목에는 입금내역이 존재해야 합니다!');
                return;
            }
            else
                minus_check_first = false;
        }
    }

    for (i = checkboxes.length - 1; i >= 0; i--) {
        if (checkboxes[i].checked) {
            money_value_array.splice(i, 1);
            money_exchange_array.splice(i, 1);
            total_array.splice(i, 1);
            total_exchange_array.splice(i, 1);
            currencyOne_value_array.splice(i, 1);
            currencyTwo_value_array.splice(i, 1);
            color_array.splice(i, 1);
            des_array.splice(i, 1);
        }
    }

    // 삭제된 배열로 잔액 계산
    total_array[0] = parseInt(money_value_array[0]);
    total_exchange_array[0] = (parseFloat(total_array[0]) * rate).toFixed(2);

    for (i = 1; i < total_array.length; i++) {
        if (color_array[i] === "#0cbc87")
            total_array[i] = total_array[i - 1] + parseInt(money_value_array[i]);
        else
            total_array[i] = total_array[i - 1] - parseInt(money_value_array[i]);

        total_exchange_array[i] = (parseFloat(total_array[i]) * rate).toFixed(2);
    }


    // list reload
    output.innerHTML = `<div class="row g-4" style="margin: 0px; margin-bottom: 15px;">
                            <!-- header -->
                            <div style="display: flex; justify-content: center;">
                                <h6 class="mb-0" style="flex-basis: 33%; text-align: center;">금액</h6>
                                <h6 class="mb-0" style="flex-basis: 33%; text-align: center;">잔액</h6>
                                <h6 id="memo" class="mb-0" style="flex-basis: 33%; text-align: center;">메모</h6>
                            </div>
                            <!-- Contents -->
                        </div>`;

    index = 1;
    for (i = 0; i < money_value_array.length; i++) {
        let html = `
        <div class="col-12" style="display: flex; justify-content: center;">
            <div>
                <input type="checkbox" class="checkbox form-check-input" data-seq="${i}">
            </div>
            <p class="col-4" style="flex-basis: 33%; color: ${color_array[i]}; text-align: center;">${money_value_array[i]} ${currencyOne_value_array[i]}<span id="money_exchange${index}" style="font-size: 9px; color: #c5c5c7;">&nbsp;${money_exchange_array[i]}  ${currencyTwo_value_array[i]}</span></p>
            <p class="col-4" style="flex-basis: 33%; text-align: center;" id="total${index}">${total_array[i]} ${currencyOne_value_array[i]}<span id="total_exchange${index}" style="font-size: 9px; color: #c5c5c7;">&nbsp;${total_exchange_array[i]}  ${currencyTwo_value_array[i]}</span></p>
            <p class="col-4" style="flex-basis: 33%; text-align: center;">${des_array[i]}</p>
        </div>
        `;

        $("#output").append(html);
        index++;
    }
}

function addList() {
    event.preventDefault();

    if (money.value.length < 1 || isNaN(money.value)) {
        alert("금액은 숫자로 입력해주세요!");
        return;
    } 

    if( parseInt(money.value) < 0 ){
        alert("금액이 0보다 작을 순 없어요!");
        return;
    }

    if (index == 1 && minus.checked) {
        alert("최초 항목은 입금이어야 합니다!");
        return;
    }

    let type = "";
    let total = 0;
    let result = [];
    let money_exchange;
    let total_exchange;
    let color = "";

    if (index == 1) {
        total = parseInt(money.value);
        type = "입금";
        result = calculate2(total);
        money_exchange = result[0];
        total_exchange = result[1];
        color = "#0cbc87";
    } else {
        if (plus.checked == true) {
            type = "입금";
            let before = $(`#total${index - 1}`).text();
            total = parseInt(before) + parseInt(money.value);
            result = calculate2(total);
            money_exchange = result[0];
            total_exchange = result[1];
            color = "#0cbc87";
        } else {
            type = "출금";
            let before = $(`#total${index - 1}`).text();
            total = parseInt(before) - parseInt(money.value);
            result = calculate2(total);
            money_exchange = result[0];
            total_exchange = result[1];
            color = "#d6293e";

            if (total < 0) {
                alert("잔액 부족으로 작성 불가입니다!");
                return;
            }
        }
    }

    // DB로 보낼 데이터 저장
    money_value_array.push(money.value);
    money_exchange_array.push(money_exchange);
    total_array.push(total);
    total_exchange_array.push(total_exchange);
    currencyOne_value_array.push(currencyOne.value);
    currencyTwo_value_array.push(currencyTwo.value);
    color_array.push(color);
    des_array.push(description.value);

    // 가계부 입력값으로 list 추가
    let html = `
        <div class="col-12" style="display: flex; justify-content: center;">
            <div>
                <input type="checkbox" class="checkbox form-check-input" data-seq="${index - 1}">
            </div>
            <p class="col-4" style="flex-basis: 33%; color: ${color}; text-align: center;">${money.value} ${currencyOne.value}<span id="money_exchange${index}" style="font-size: 9px; color: #c5c5c7;">&nbsp;${money_exchange}  ${currencyTwo.value}</span></p>
            <p class="col-4" style="flex-basis: 33%; text-align: center;" id="total${index}">${total} ${currencyOne.value}<span id="total_exchange${index}" style="font-size: 9px; color: #c5c5c7;">&nbsp;${total_exchange}  ${currencyTwo.value}</span></p>
            <p class="col-4" style="flex-basis: 33%; text-align: center;">${description.value}</p>
        </div>
        `;

    $("#output").append(html);
    index++;

    // 초기화
    money.value = '';
    description.value = '';
}

function save_data() {
    let money_data = [];

    money_data.push({ money_value_array: money_value_array });
    money_data.push({ money_exchange_array: money_exchange_array });
    money_data.push({ total_array: total_array });
    money_data.push({ total_exchange_array: total_exchange_array });
    money_data.push({ currencyOne_value_array: currencyOne_value_array });
    money_data.push({ currencyTwo_value_array: currencyTwo_value_array });
    money_data.push({ color_array: color_array });
    money_data.push({ des_array: des_array });

    fetch('/money/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ money_data: money_data }),
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.is_saved) {
                alert('저장되었습니다!');
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
document.getElementById('saveBtn').addEventListener('click', save_data);


document.getElementById('go_plan_list').addEventListener('click', () => {
    location.href = '/starting';
});