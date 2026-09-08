from pathlib import Path
import re

BASE = "https://elaborate-maamoul-1fad9f.netlify.app"

pages = {
    "index.html": (
        "FreeLifeTools | Free Money, Job & Everyday Calculators",
        "Free calculators and practical tools for paychecks, budgeting, debt, rent, jobs, credit and everyday life."
    ),
    "credit-builder.html": (
        "Credit Utilization Calculator & Credit Builder | FreeLifeTools",
        "Use this free credit utilization calculator to estimate your credit card utilization and create a simple credit-building payment plan."
    ),
    "Paycheck.html": (
        "Free Paycheck Calculator | FreeLifeTools",
        "Estimate your paycheck with this free calculator. Enter your pay rate and work details to better understand your earnings."
    ),
    "biweekly-paycheck-calculator.html": (
        "Biweekly Paycheck Calculator | FreeLifeTools",
        "Calculate your estimated biweekly paycheck for free using your hourly pay, hours worked and other earnings information."
    ),
    "budget.html": (
        "Free Monthly Budget Calculator | FreeLifeTools",
        "Build a simple monthly budget, compare income and expenses, and see how much money you may have left each month."
    ),
    "budget-calculator.html": (
        "Budget Calculator | Plan Monthly Income & Expenses",
        "Use this free budget calculator to organize monthly income, bills, spending and savings in one simple place."
    ),
    "Debt.html": (
        "Debt Payoff Calculator | FreeLifeTools",
        "Estimate how to pay down debt faster with a free debt payoff calculator and simple repayment planning tools."
    ),
    "rent-calculator.html": (
        "Rent Calculator | Estimate Affordable Rent",
        "Use this free rent calculator to estimate an affordable monthly rent amount based on your income and budget."
    ),
    "rent.html": (
        "Free Rent Tools & Calculators | FreeLifeTools",
        "Explore free rent and housing calculators to help estimate affordability and plan your monthly housing budget."
    ),
    "money.html": (
        "Free Money Calculators & Budget Tools | FreeLifeTools",
        "Explore free money tools for budgeting, paychecks, debt, savings, rent and everyday financial planning."
    ),
    "Jobs.html": (
        "Free Job Search & Career Tools | FreeLifeTools",
        "Use free job and career tools for resumes, interviews, job searches and practical career planning."
    ),
    "Interview.html": (
        "Free Interview Preparation Tool | FreeLifeTools",
        "Prepare for job interviews with practical interview questions, tips and tools designed to help you feel more prepared."
    ),
    "Resume.html": (
        "Free Resume Tools & Help | FreeLifeTools",
        "Create and improve your resume with free tools and practical guidance for job applications."
    ),
    "Grocery.html": (
        "Free Grocery Budget Calculator | FreeLifeTools",
        "Plan grocery spending and manage your food budget with a simple free grocery budgeting tool."
    ),
    "Life.html": (
        "Free Everyday Life Tools | FreeLifeTools",
        "Explore simple free tools designed to make everyday planning, money management and daily tasks easier."
    ),
    "ai-tools.html": (
        "Free AI Tools & Resources | FreeLifeTools",
        "Explore practical AI tools and resources to help with productivity, planning, writing and everyday tasks."
    ),
    "ai-store-builder.html": (
        "AI Store Builder | FreeLifeTools",
        "Use the FreeLifeTools AI Store Builder to plan and create ideas for an online store more easily."
    ),
    "store-builder.html": (
        "Free Online Store Builder Tool | FreeLifeTools",
        "Plan your online store with a free store-building tool for products, ideas and basic business setup."
    ),
}

def replace_or_add(head, pattern, replacement):
    if re.search(pattern, head, flags=re.I | re.S):
        return re.sub(pattern, replacement, head, count=1, flags=re.I | re.S)
    return head + "\n    " + replacement

for filename, (title, description) in pages.items():
    path = Path(filename)

    if not path.exists():
        print(f"SKIPPED: {filename} not found")
        continue

    html = path.read_text(encoding="utf-8")

    head_match = re.search(r"<head\b[^>]*>(.*?)</head>", html, flags=re.I | re.S)

    if not head_match:
        print(f"SKIPPED: {filename} has no <head>")
        continue

    head = head_match.group(1)
    url = f"{BASE}/{filename}"

    if filename == "index.html":
        url = BASE + "/"

    head = replace_or_add(
        head,
        r"<title\b[^>]*>.*?</title>",
        f"<title>{title}</title>"
    )

    head = replace_or_add(
        head,
        r'<meta\b[^>]*name=["\']description["\'][^>]*>',
        f'<meta name="description" content="{description}">'
    )

    head = replace_or_add(
        head,
        r'<link\b[^>]*rel=["\']canonical["\'][^>]*>',
        f'<link rel="canonical" href="{url}">'
    )

    head = replace_or_add(
        head,
        r'<meta\b[^>]*property=["\']og:title["\'][^>]*>',
        f'<meta property="og:title" content="{title}">'
    )

    head = replace_or_add(
        head,
        r'<meta\b[^>]*property=["\']og:description["\'][^>]*>',
        f'<meta property="og:description" content="{description}">'
    )

    head = replace_or_add(
        head,
        r'<meta\b[^>]*property=["\']og:url["\'][^>]*>',
        f'<meta property="og:url" content="{url}">'
    )

    new_html = (
        html[:head_match.start(1)]
        + head
        + html[head_match.end(1):]
    )

    path.write_text(new_html, encoding="utf-8")
    print(f"UPDATED: {filename}")

print("SEO batch update complete.")