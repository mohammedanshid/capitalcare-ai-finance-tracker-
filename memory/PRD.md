# Capital Care AI — Personal Finance App PRD

## Problem Statement
AI-powered personal finance management app with Cashly-inspired premium design.

## Architecture
- Backend: FastAPI + MongoDB + emergentintegrations (OpenAI GPT-5.2)
- Frontend: React + Recharts + Phosphor Icons + Tailwind CSS
- Auth: JWT httpOnly cookies + bcrypt
- Design: Cashly system (cream #F7F5F2, coral #F4845F, white cards, pill buttons, Plus Jakarta Sans)

## Implemented (April 18, 2026)
- [x] Full landing page (hero, features, why us, workflow, testimonials, CTA, footer)
- [x] Auth (login/register) with Cashly-styled cards
- [x] Dashboard: 4 KPIs (Balance, Income, Expenses, Savings Growth) with sparklines
- [x] Income vs Expenses line chart + Spending Breakdown donut chart
- [x] 3-Month Savings Forecast widget
- [x] Smart Insights / Proactive Alerts (spending spikes, goal progress)
- [x] AI Chat Assistant (GPT-5.2, persona-aware)
- [x] Transactions: CRUD, search, bank SMS parser
- [x] Goals: create, progress bars, quick-add savings, what-if planner
- [x] Export PDF + CSV reports
- [x] Pricing page (Free/₹99 Pro/₹299 Premium)
- [x] INR formatting (Indian number system, ₹ symbol, lakhs/crores)
- [x] Mobile-first responsive with bottom navigation
- [x] Plus Jakarta Sans typography, coral pill buttons, cream backgrounds

## Test Results: Backend 15/15 (100%) | Frontend 100%
