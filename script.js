const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
const initBarSize = .4;
const maxBarSize = 9;

var amountBalance = document.getElementById("amount-balance");

var chartBars = {};
for (var i = 0; i < DAYS.length; i++){
  chartBars["bar-" + DAYS[i]] = document.getElementById("bar-" + DAYS[i]);
}

var chartBubbles = {};
for (var i = 0; i < DAYS.length; i++){
  chartBubbles["amount-" + DAYS[i]] = document.getElementById("amount-" + DAYS[i]);
}

var amountTotal = document.getElementById("amount-total");
var percentDiff = document.getElementById("percent-diff");

var errorMsg = document.getElementById("error-msg");

var httpReq = new XMLHttpRequest();

function checkValue(value, result){
  return value in result && isFinite(result[value]);
}

function formatValue(value){
  return +(+value).toFixed(2);
}



httpReq.addEventListener("error", function(e){
  errorMsg.classList.add("show");
});

httpReq.addEventListener("load", function(e){
  const result = JSON.parse(httpReq.responseText);
  const N_A = "---";
  var amounts = new Array(7);
  
  if (amountBalance){
    if (checkValue("currentBalance", result)){
      amountBalance.innerText = "$" + formatValue(result.currentBalance);
    } else {
      amountBalance.innerText = N_A;
    }
  }
  
  if (amountTotal){
    if (checkValue("currentMonthTotal", result)){
      amountTotal.innerText = "$" + formatValue(result.currentMonthTotal);
      
      if (percentDiff){
        if (checkValue("lastMonthTotal", result)){
          var x = +result.lastMonthTotal;
          var y = +result.currentMonthTotal;
          var j = (y - x) / x * 100;
          percentDiff.innerText = "++-".at(Math.sign(j)) + formatValue(j) + "%";
          
        } else {
          percentDiff.innerText = N_A;
        }
      }
      
    } else {
      amountTotal.innerText = N_A;
      if (percentDiff){
        percentDiff.innerText = N_A;
      }
    }
  }
  
  if ("currentWeek" in result){
    for (var i = 0; i < DAYS.length; i++){
      if (checkValue(DAYS[i], result.currentWeek)){
        amounts[i] = +result.currentWeek[DAYS[i]];
      } else {
        amounts[i] = null;
      }
    }
  } else {
    amounts.fill(null);
  }
  
  for (var i = 0; i < DAYS.length; i++){
    if (chartBubbles["amount-" + DAYS[i]]){
      if (amounts[i] != null){
        chartBubbles["amount-" + DAYS[i]].innerText = "$" + formatValue(amounts[i]);
      } else {
        chartBubbles["amount-" + DAYS[i]].innerText = N_A;
      }
    }
  }
  
  const m = Math.max(...amounts);
  
  for (var i = 0; i < DAYS.length; i++){
    if (chartBars["bar-" + DAYS[i]]){
      const g = (amounts[i] / m * maxBarSize) + initBarSize
      chartBars["bar-" + DAYS[i]].style.height = g + "rem";
    }
  }
  
  const d = new Date().getDay();
  
  if (chartBars["bar-" + DAYS.at(d-1)]){
    chartBars["bar-" + DAYS.at(d-1)].classList.add("today");
  }
});

httpReq.open("GET", "data.json");
httpReq.send()
