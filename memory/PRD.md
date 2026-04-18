# Capital Care AI — Personal Finance App PRD

## Architecture
- Backend: FastAPI + MongoDB + emergentintegrations (GPT-5.2 + Stripe)
- Frontend: React + Recharts + Phosphor Icons + Tailwind CSS
- Design: Cashly system (cream #F7F5F2, coral #F4845F, white cards, pill buttons)

## Implemented (April 18, 2026)

### Landing & Auth
- Full landing page (hero, features, workflow, testimonials, CTA, footer)
- Auth (login/register) with Cashly-styled cards

### Dashboard (Individual)
- 4 KPI cards (Balance, Income, Expenses, Savings Growth) with sparklines
- Income vs Expenses line chart + Spending Breakdown donut
- 3-Month Savings Forecast
- Financial Health Score (0-100 animated ring)
- Smart Insights / Proactive Alerts
- Weekly Money Digest (spent, saved, top category, vs last week)
- Daily Spend Limit tracker
- Quick Access Grid (Budgets, Loans, Credit Cards, Pricing)
- AI Chat Assistant (GPT-5.2)

### Smart Budgeting
- Category budget caps with progress bars (green→amber→red)
- 80% warning banners, 100% exceeded alerts
- Rollover budget toggle

### Savings & Goals
- Multiple savings goals with progress bars + what-if planner
- Quick-add savings buttons (₹1K, ₹5K, ₹10K)
- Auto-save rules engine (round-up, percentage, fixed)

### Loans & EMI
- Add loans (Home/Car/Personal/Education/Gold)
- EMI tracking with paid/total progress
- Full amortization table
- Prepayment simulator (months saved + interest saved)

### Credit Cards
- Add cards with bank, limit, outstanding
- Total utilization percentage with 30% threshold warning
- Per-card available/outstanding/utilization

### Transactions
- CRUD with search + bank SMS parser
- PDF + CSV export

### Subscription Detector
- Auto-detect recurring charges from transaction history

### Stripe Payment System
- 3 tiers: Free / Pro $9.99 / Elite $19.99
- Monthly/Yearly toggle (20% yearly savings)
- Stripe Checkout integration
- Payment success/failure handling
- Feature gating by plan
- FAQ accordion + trust strip

## Test Results: Backend 28/28 (100%) | Frontend 100%

## P2 Backlog
- SIP/RD/FD trackers, Investment portfolio, Gold tracker, Real estate log, Net worth tracker
- Zero-based budget planner, Paycheck planner
- Debt payoff calculator (Avalanche vs Snowball), Lend & borrow log
- Tax section (ITR tagging, 80C/80D, Tax calendar, Form 26AS)
- Unusual spend alerts, Bill subscription cancel flow
