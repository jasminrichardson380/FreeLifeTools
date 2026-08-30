function calculatePay() {
  const wage = Number(document.getElementById("wage").value);
  const hours = Number(document.getElementById("hours").value);
  const frequency = Number(document.getElementById("frequency").value);

  const result = document.getElementById("payResult");

  if (wage <= 0 || hours <= 0) {
    result.textContent = "Please enter your wage and hours.";
    return;
  }

  const weeklyPay = wage * hours;
  const paycheck = weeklyPay * 52 / frequency;
  const annualPay = weeklyPay * 52;

  result.innerHTML =
    "<strong>Estimated paycheck:</strong> $" + paycheck.toFixed(2) +
    "<br><strong>Estimated weekly pay:</strong> $" + weeklyPay.toFixed(2) +
    "<br><strong>Estimated annual pay:</strong> $" + annualPay.toFixed(2);
}function calculateBudget() {
  const income = Number(document.getElementById("income").value) || 0;
  const rent = Number(document.getElementById("rent").value) || 0;
  const utilities = Number(document.getElementById("utilities").value) || 0;
  const food = Number(document.getElementById("food").value) || 0;
  const transport = Number(document.getElementById("transport").value) || 0;
  const other = Number(document.getElementById("other").value) || 0;

  const expenses = rent + utilities + food + transport + other;
  const remaining = income - expenses;

  const result = document.getElementById("budgetResult");

  result.innerHTML =
    "<strong>Total expenses:</strong> $" + expenses.toFixed(2) +
    "<br><strong>Money left:</strong> $" + remaining.toFixed(2);
}function calculateRent() {
  const income = Number(document.getElementById("monthlyIncome").value) || 0;
  const debt = Number(document.getElementById("monthlyDebt").value) || 0;

  const result = document.getElementById("rentResult");

  if (income <= 0) {
    result.textContent = "Please enter your monthly income.";
    return;
  }

  const recommendedRent = income * 0.30;
  const incomeAfterDebt = income - debt;
  const debtAdjustedRent = incomeAfterDebt * 0.30;

  result.innerHTML =
    "<strong>30% income estimate:</strong> $" +
    recommendedRent.toFixed(2) +
    "<br><strong>After debt estimate:</strong> $" +
    Math.max(0, debtAdjustedRent).toFixed(2);
}
