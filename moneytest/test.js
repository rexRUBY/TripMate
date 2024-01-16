const currencyOne = document.getElementById("currency-one");
const currencyTwo = document.getElementById("currency-two");
const amountOne = document.getElementById("amount-one");
const amountTwo = document.getElementById("amount-two");
const rateEl = document.getElementById("rate");
const swap = document.getElementById("swap");
const plus = document.getElementById("plus");
const money = document.getElementById("money");
const description = document.getElementById("description");

let rate;

// 환전 계산 함수
function calculate() {
  const currency_one = currencyOne.value;
  const currency_two = currencyTwo.value;

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

// option 전환
swap.addEventListener("click", () => {
  const temp = currencyOne.value;
  currencyOne.value = currencyTwo.value;
  currencyTwo.value = temp;
  calculate();
});
calculate();

// 가계부 기록 코드
index = 1;
function addList() {
  event.preventDefault();

  if (money.value.length < 1 || isNaN(money.value)) {
    alert("금액은 숫자로 입력해주세요!");
    return;
  } else if (index == 1 && money.value < 0) {
    alert("최초금액은 마이너스를 입력하거나 출금할 수 없습니다!");
    return;
  }

  let type = "";
  let total = 0;
  let result = [];
  let money_exchange;
  let total_exchange;

  if (index == 1) {
    total = money.value;
    type = "입금";
    result = calculate2(total);
    money_exchange = result[0];
    total_exchange = result[1];
  } else {
    if (plus.checked == true) {
      type = "입금";
      let before = $(`#total${index - 1}`).text();
      total = parseInt(before) + parseInt(money.value);
      result = calculate2(total);
      money_exchange = result[0];
      total_exchange = result[1];
    } else {
      type = "출금";
      let before = $(`#total${index - 1}`).text();
      total = parseInt(before) - parseInt(money.value);
      result = calculate2(total);
      money_exchange = result[0];
      total_exchange = result[1];

      if (total < 0) {
        alert("잔액 부족으로 작성 불가입니다!");
        return;
      }
    }
  }

  console.log("2",money_exchange,total_exchange);

  // 가계부 입력값으로 list 추가
  let html = `
        <div class="text_center">
            <div class="input_list"><span class="header">${type}</span></div>
            <div class="input_list"><span class="header">${money.value} ${currencyOne.value}</span><span class="hintfont" id="money_exchange${index}">${money_exchange}  ${currencyTwo.value}</span></div>
            <div class="input_list"><span class="header">${description.value}</span></div>
            <div class="input_list"><span class="header" id="total${index}">${total} ${currencyOne.value}</span><span class="hintfont" id="total_exchange${index}">${total_exchange}  ${currencyTwo.value}</span></div>
        </div>
        `;

  $("#list").append(html);
  index++;
}
// 새로고침 없이 자동 환전을 위한 호출
