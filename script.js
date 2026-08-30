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
}function calculateDebt() {
  const balance = Number(document.getElementById("debtBalance").value) || 0;
  const annualRate = Number(document.getElementById("interestRate").value) || 0;
  const payment = Number(document.getElementById("monthlyPayment").value) || 0;

  const result = document.getElementById("debtResult");

  if (balance <= 0 || payment <= 0) {
    result.textContent = "Please enter your debt balance and monthly payment.";
    return;
  }

  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate > 0 && payment <= balance * monthlyRate) {
    result.innerHTML =
      "<strong>Your payment may not be enough to cover the monthly interest.</strong>" +
      "<br>Try increasing your monthly payment.";
    return;
  }

  let remaining = balance;
  let months = 0;
  let totalPaid = 0;

  while (remaining > 0 && months < 1200) {
    const interest = remaining * monthlyRate;
    const principal = Math.min(payment - interest, remaining);

    remaining -= principal;
    totalPaid += interest + principal;
    months++;
  }

  if (months >= 1200) {
    result.textContent = "Please check your numbers and try again.";
    return;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let timeText = "";

  if (years > 0) {
    timeText += years + (years === 1 ? " year" : " years");
  }

  if (remainingMonths > 0) {
    if (timeText) timeText += " and ";
    timeText += remainingMonths + (remainingMonths === 1 ? " month" : " months");
  }

  result.innerHTML =
    "<strong>Estimated payoff time:</strong> " + timeText +
    "<br><strong>Estimated total paid:</strong> $" + totalPaid.toFixed(2);
}function generatePrompt() {
  const topic = document.getElementById("aiTopic").value.trim();
  const style = document.getElementById("aiStyle").value;
  const result = document.getElementById("aiResult");

  if (!topic) {
    result.textContent = "Please enter what you need help with.";
    return;
  }

  const prompt =
    "Act as an expert assistant. Help me with: " + topic +
    ". Use a " + style +
    " tone. Give me clear, practical, step-by-step information " +
    "and include useful examples when appropriate.";

  result.innerHTML =
    "<strong>Your AI prompt:</strong><br><br>" +
    prompt +
    "<br><br><button class='button' onclick='copyPrompt()'>Copy Prompt</button>";

  window.generatedPrompt = prompt;
}

function copyPrompt() {
  if (window.generatedPrompt) {
    navigator.clipboard.writeText(window.generatedPrompt);
    alert("Prompt copied!");
  }function createResume() {
  const jobTitle = document.getElementById("jobTitle").value.trim();
  const skills = document.getElementById("skills").value.trim();
  const experience = document.getElementById("experience").value.trim();

  const result = document.getElementById("resumeResult");

  if (!jobTitle || !skills || !experience) {
    result.textContent = "Please complete all three fields.";
    return;
  }

  const skillList = skills
    .split(",")
    .map(skill => skill.trim())
    .filter(Boolean);

  const skillText = skillList.join(", ");

  const summary =
    "Reliable and motivated " + jobTitle +
    " with experience in " + skillText +
    ". Demonstrates strong communication, teamwork, organization, " +
    "and problem-solving skills. Experienced in handling responsibilities " +
    "efficiently while providing a positive experience for customers and coworkers.";

  const bullets = [
    "Performed daily responsibilities related to " + jobTitle + " while maintaining accuracy and professionalism.",
    "Used skills in " + skillText + " to complete tasks efficiently and support team goals.",
    "Demonstrated strong communication and problem-solving abilities when handling workplace situations.",
    "Maintained a dependable and organized approach to daily duties and responsibilities."
  ];

  result.innerHTML =
    "<h3>Professional Summary</h3>" +
    "<p>" + summary + "</p>" +
    "<h3>Resume Bullet Points</h3>" +
    "<ul>" +
    bullets.map(bullet => "<li>" + bullet + "</li>").join("") +
    "</ul>" +
    "<p><strong>Your experience:</strong> " +
    experience.replace(/\n/g, "<br>") +
    "</p>";
}function generateInterviewQuestions() {
  const job = document.getElementById("interviewJob").value.trim();
  const type = document.getElementById("interviewType").value;
  const result = document.getElementById("interviewResult");

  if (!job) {
    result.textContent = "Please enter a job title.";
    return;
  }

  const questions = {
    general: [
      "Tell me about yourself.",
      "Why do you want this position?",
      "What are your greatest strengths?",
      "What is one area you are working to improve?",
      "Tell me about a time you solved a difficult problem.",
      "How do you handle stressful situations?",
      "Why should we hire you?",
      "Where do you see yourself in the next few years?"
    ],

    customer: [
      "How would you handle an upset customer?",
      "Tell me about a time you provided excellent customer service.",
      "How would you handle several customers needing help at once?",
      "What does good customer service mean to you?",
      "How would you respond if you didn't know the answer to a customer's question?"
    ],

    retail: [
      "How would you help a customer find a product?",
      "How would you handle a long line of customers?",
      "What would you do if you noticed a pricing error?",
      "How would you handle an unhappy customer?",
      "How do you stay organized during a busy shift?"
    ],

    office: [
      "How do you prioritize multiple tasks?",
      "How comfortable are you with computers and office software?",
      "Tell me about a time you had to meet a deadline.",
      "How do you stay organized?",
      "How do you handle confidential information?"
    ],

    management: [
      "How would you handle an employee who is struggling?",
      "How do you motivate a team?",
      "Tell me about a difficult leadership decision you made.",
      "How do you handle workplace conflict?",
      "How do you measure success for your team?"
    ]
  };

  const selectedQuestions = questions[type] || questions.general;

  result.innerHTML =
    "<h3>Practice Questions for " + job + "</h3>" +
    "<ol>" +
    selectedQuestions.map(q => "<li>" + q + "</li>").join("") +
    "</ol>" +
    "<p><strong>Tip:</strong> Practice answering each question out loud and use specific examples from your experience.</p>";
}
}
