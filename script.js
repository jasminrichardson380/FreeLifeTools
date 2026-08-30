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
}
