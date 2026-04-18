"""
Phase 1 Feature Expansion Tests for Capital Care AI
Tests: Budgets, Loans & EMI, Credit Cards, Health Score, Daily Limit, Weekly Digest, Subscriptions, Stripe Payments
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://finance-ai-coach-1.preview.emergentagent.com"

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@capitalcare.ai"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="module")
def session():
    """Create a requests session with auth cookies"""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # Login to get auth cookies
    resp = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return s


class TestAuth:
    """Authentication tests"""
    
    def test_login_success(self, session):
        """Test login with valid credentials"""
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Login successful for {ADMIN_EMAIL}")
    
    def test_me_endpoint(self, session):
        """Test /api/auth/me returns current user"""
        resp = session.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ /api/auth/me returns user: {data['email']}")


class TestBudgets:
    """Budget Manager tests - category caps with progress bars"""
    
    def test_get_budgets_empty_or_list(self, session):
        """Test GET /api/budgets returns list"""
        resp = session.get(f"{BASE_URL}/api/budgets")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/budgets returns {len(data)} budgets")
    
    def test_create_budget_groceries(self, session):
        """Test creating a budget for Groceries category"""
        payload = {"category": "Groceries", "limit": 15000.0, "rollover": False}
        resp = session.post(f"{BASE_URL}/api/budgets", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        # Could be new or updated
        assert "ok" in data or "id" in data
        print(f"✓ Budget created/updated for Groceries: {data}")
    
    def test_budget_has_progress_fields(self, session):
        """Test budget response includes spent, remaining, percentage, status"""
        resp = session.get(f"{BASE_URL}/api/budgets")
        assert resp.status_code == 200
        budgets = resp.json()
        if budgets:
            b = budgets[0]
            assert "spent" in b, "Budget missing 'spent' field"
            assert "remaining" in b, "Budget missing 'remaining' field"
            assert "percentage" in b, "Budget missing 'percentage' field"
            assert "status" in b, "Budget missing 'status' field"
            assert b["status"] in ["safe", "warning", "exceeded"]
            print(f"✓ Budget has progress fields: spent={b['spent']}, remaining={b['remaining']}, percentage={b['percentage']}%, status={b['status']}")
        else:
            print("⚠ No budgets to verify progress fields")
    
    def test_delete_budget(self, session):
        """Test deleting a budget"""
        # First create one
        payload = {"category": "TEST_DeleteBudget", "limit": 1000.0, "rollover": False}
        resp = session.post(f"{BASE_URL}/api/budgets", json=payload)
        assert resp.status_code == 200
        
        # Get budgets to find the ID
        resp = session.get(f"{BASE_URL}/api/budgets")
        budgets = resp.json()
        test_budget = next((b for b in budgets if b.get("category") == "TEST_DeleteBudget"), None)
        if test_budget:
            resp = session.delete(f"{BASE_URL}/api/budgets/{test_budget['id']}")
            assert resp.status_code == 200
            print(f"✓ Budget deleted: {test_budget['id']}")


class TestLoans:
    """Loan & EMI Tracker tests"""
    
    def test_get_loans(self, session):
        """Test GET /api/loans returns list"""
        resp = session.get(f"{BASE_URL}/api/loans")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/loans returns {len(data)} loans")
    
    def test_add_personal_loan(self, session):
        """Test adding a personal loan"""
        payload = {
            "loan_type": "Personal",
            "principal": 500000.0,
            "interest_rate": 12.0,
            "tenure_months": 36,
            "emi_amount": 16607.0,
            "start_date": "2024-01-01",
            "bank_name": "TEST_Bank"
        }
        resp = session.post(f"{BASE_URL}/api/loans", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["loan_type"] == "Personal"
        print(f"✓ Personal loan added: {data['id']}")
        return data["id"]
    
    def test_loan_has_calculated_fields(self, session):
        """Test loan response includes EMI details, remaining principal, next EMI date"""
        resp = session.get(f"{BASE_URL}/api/loans")
        loans = resp.json()
        if loans:
            l = loans[0]
            assert "emis_paid" in l, "Loan missing 'emis_paid'"
            assert "emis_total" in l, "Loan missing 'emis_total'"
            assert "principal_remaining" in l, "Loan missing 'principal_remaining'"
            assert "total_interest_paid" in l, "Loan missing 'total_interest_paid'"
            print(f"✓ Loan has calculated fields: EMIs {l['emis_paid']}/{l['emis_total']}, remaining={l['principal_remaining']}, next_emi={l.get('next_emi_date')}")
        else:
            print("⚠ No loans to verify calculated fields")
    
    def test_loan_amortization_table(self, session):
        """Test GET /api/loans/{id}/amortization returns schedule"""
        resp = session.get(f"{BASE_URL}/api/loans")
        loans = resp.json()
        if loans:
            loan_id = loans[0]["id"]
            resp = session.get(f"{BASE_URL}/api/loans/{loan_id}/amortization")
            assert resp.status_code == 200
            schedule = resp.json()
            assert isinstance(schedule, list)
            assert len(schedule) > 0
            # Check first row has required fields
            row = schedule[0]
            assert "month" in row
            assert "emi" in row
            assert "principal" in row
            assert "interest" in row
            assert "balance" in row
            print(f"✓ Amortization table has {len(schedule)} rows. First row: month={row['month']}, emi={row['emi']}, principal={row['principal']}, interest={row['interest']}, balance={row['balance']}")
        else:
            print("⚠ No loans to test amortization")
    
    def test_prepayment_simulator(self, session):
        """Test POST /api/loans/{id}/prepay-simulate"""
        resp = session.get(f"{BASE_URL}/api/loans")
        loans = resp.json()
        if loans:
            loan_id = loans[0]["id"]
            resp = session.post(f"{BASE_URL}/api/loans/{loan_id}/prepay-simulate", json={"amount": 50000})
            assert resp.status_code == 200
            data = resp.json()
            assert "months_saved" in data
            assert "interest_saved" in data
            assert "new_tenure" in data
            print(f"✓ Prepayment simulator: {data['months_saved']} months saved, ₹{data['interest_saved']} interest saved, new tenure={data['new_tenure']} months")
        else:
            print("⚠ No loans to test prepayment simulator")
    
    def test_delete_loan(self, session):
        """Test deleting a loan"""
        resp = session.get(f"{BASE_URL}/api/loans")
        loans = resp.json()
        test_loan = next((l for l in loans if l.get("bank_name") == "TEST_Bank"), None)
        if test_loan:
            resp = session.delete(f"{BASE_URL}/api/loans/{test_loan['id']}")
            assert resp.status_code == 200
            print(f"✓ Loan deleted: {test_loan['id']}")


class TestCreditCards:
    """Credit Card Manager tests"""
    
    def test_get_credit_cards(self, session):
        """Test GET /api/credit-cards returns cards with utilization"""
        resp = session.get(f"{BASE_URL}/api/credit-cards")
        assert resp.status_code == 200
        data = resp.json()
        assert "cards" in data
        assert "total_utilization" in data
        assert "total_limit" in data
        assert "total_outstanding" in data
        print(f"✓ GET /api/credit-cards: {len(data['cards'])} cards, total utilization={data['total_utilization']}%")
    
    def test_add_credit_card(self, session):
        """Test adding a credit card"""
        payload = {
            "bank": "TEST_HDFC",
            "card_name": "Regalia",
            "credit_limit": 200000.0,
            "statement_date": 15,
            "due_date": 5,
            "outstanding": 45000.0,
            "reward_points": 5000
        }
        resp = session.post(f"{BASE_URL}/api/credit-cards", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        print(f"✓ Credit card added: {data['id']}")
    
    def test_card_utilization_calculated(self, session):
        """Test card response includes utilization and available credit"""
        resp = session.get(f"{BASE_URL}/api/credit-cards")
        data = resp.json()
        if data["cards"]:
            card = data["cards"][0]
            assert "utilization" in card
            assert "available" in card
            print(f"✓ Card has utilization={card['utilization']}%, available=₹{card['available']}")
        else:
            print("⚠ No cards to verify utilization")
    
    def test_delete_credit_card(self, session):
        """Test deleting a credit card"""
        resp = session.get(f"{BASE_URL}/api/credit-cards")
        cards = resp.json()["cards"]
        test_card = next((c for c in cards if c.get("bank") == "TEST_HDFC"), None)
        if test_card:
            resp = session.delete(f"{BASE_URL}/api/credit-cards/{test_card['id']}")
            assert resp.status_code == 200
            print(f"✓ Credit card deleted: {test_card['id']}")


class TestHealthScore:
    """Financial Health Score tests (0-100 ring)"""
    
    def test_health_score_endpoint(self, session):
        """Test GET /api/health-score returns score 0-100 with breakdown"""
        resp = session.get(f"{BASE_URL}/api/health-score")
        assert resp.status_code == 200
        data = resp.json()
        assert "score" in data
        assert 0 <= data["score"] <= 100, f"Score {data['score']} not in 0-100 range"
        assert "breakdown" in data
        assert "tips" in data
        breakdown = data["breakdown"]
        assert "savings_rate" in breakdown
        assert "debt_to_income" in breakdown
        assert "emergency_fund" in breakdown
        assert "budget_adherence" in breakdown
        assert "investment_consistency" in breakdown
        print(f"✓ Health Score: {data['score']}/100")
        print(f"  Breakdown: savings_rate={breakdown['savings_rate']}, debt_to_income={breakdown['debt_to_income']}, emergency_fund={breakdown['emergency_fund']}, budget_adherence={breakdown['budget_adherence']}, investment_consistency={breakdown['investment_consistency']}")
        print(f"  Tips: {data['tips'][:2] if len(data['tips']) > 1 else data['tips']}")


class TestDailyLimit:
    """Daily Spend Limit tests"""
    
    def test_get_daily_limit(self, session):
        """Test GET /api/daily-limit returns limit and spent today"""
        resp = session.get(f"{BASE_URL}/api/daily-limit")
        assert resp.status_code == 200
        data = resp.json()
        assert "limit" in data
        assert "spent_today" in data
        assert "remaining" in data
        assert "percentage" in data
        print(f"✓ Daily limit: ₹{data['limit']}, spent today=₹{data['spent_today']}, remaining=₹{data['remaining']}, {data['percentage']}% used")
    
    def test_set_daily_limit(self, session):
        """Test POST /api/daily-limit to set limit"""
        resp = session.post(f"{BASE_URL}/api/daily-limit", json={"limit": 2000})
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("ok") == True
        print(f"✓ Daily limit set to ₹2000")
        
        # Verify it was set
        resp = session.get(f"{BASE_URL}/api/daily-limit")
        data = resp.json()
        assert data["limit"] == 2000
        print(f"✓ Daily limit verified: ₹{data['limit']}")


class TestWeeklyDigest:
    """Weekly Digest tests"""
    
    def test_weekly_digest_endpoint(self, session):
        """Test GET /api/weekly-digest returns spending summary"""
        resp = session.get(f"{BASE_URL}/api/weekly-digest")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_spent" in data
        assert "total_saved" in data
        assert "top_categories" in data
        assert "vs_last_week" in data
        assert "comparison" in data
        assert data["comparison"] in ["better", "worse", "same"]
        print(f"✓ Weekly digest: spent=₹{data['total_spent']}, saved=₹{data['total_saved']}, vs_last_week={data['vs_last_week']}% ({data['comparison']})")
        if data["top_categories"]:
            print(f"  Top categories: {data['top_categories'][:3]}")


class TestSubscriptions:
    """Subscription Detector tests"""
    
    def test_subscriptions_endpoint(self, session):
        """Test GET /api/subscriptions detects recurring charges"""
        resp = session.get(f"{BASE_URL}/api/subscriptions")
        assert resp.status_code == 200
        data = resp.json()
        assert "subscriptions" in data
        assert "total_monthly" in data
        assert "total_annual" in data
        print(f"✓ Subscriptions: {len(data['subscriptions'])} detected, total monthly=₹{data['total_monthly']}, annual=₹{data['total_annual']}")
        if data["subscriptions"]:
            sub = data["subscriptions"][0]
            assert "name" in sub
            assert "amount" in sub
            assert "frequency" in sub
            assert "annual_cost" in sub
            print(f"  First subscription: {sub['name']} - ₹{sub['amount']}/{sub['frequency']}")


class TestStripePayments:
    """Stripe Payment Integration tests"""
    
    def test_checkout_invalid_plan(self, session):
        """Test checkout with invalid plan returns 400"""
        resp = session.post(f"{BASE_URL}/api/payments/checkout", json={"plan_id": "invalid_plan", "origin_url": "https://example.com"})
        assert resp.status_code == 400
        print(f"✓ Invalid plan returns 400")
    
    def test_checkout_pro_monthly(self, session):
        """Test creating checkout session for Pro monthly plan"""
        resp = session.post(f"{BASE_URL}/api/payments/checkout", json={"plan_id": "pro_monthly", "origin_url": "https://finance-ai-coach-1.preview.emergentagent.com"})
        assert resp.status_code == 200
        data = resp.json()
        assert "url" in data
        assert "session_id" in data
        assert "stripe.com" in data["url"] or "checkout" in data["url"].lower()
        print(f"✓ Checkout session created for pro_monthly: session_id={data['session_id'][:20]}...")
    
    def test_checkout_elite_yearly(self, session):
        """Test creating checkout session for Elite yearly plan"""
        resp = session.post(f"{BASE_URL}/api/payments/checkout", json={"plan_id": "elite_yearly", "origin_url": "https://finance-ai-coach-1.preview.emergentagent.com"})
        assert resp.status_code == 200
        data = resp.json()
        assert "url" in data
        assert "session_id" in data
        print(f"✓ Checkout session created for elite_yearly: session_id={data['session_id'][:20]}...")
    
    def test_user_plan_endpoint(self, session):
        """Test GET /api/user/plan returns current plan"""
        resp = session.get(f"{BASE_URL}/api/user/plan")
        assert resp.status_code == 200
        data = resp.json()
        assert "plan" in data
        assert data["plan"] in ["free", "pro", "elite"]
        print(f"✓ User plan: {data['plan']}")


class TestAutoSaveRules:
    """Auto-save rules tests"""
    
    def test_get_autosave_rules(self, session):
        """Test GET /api/autosave-rules returns list"""
        resp = session.get(f"{BASE_URL}/api/autosave-rules")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/autosave-rules returns {len(data)} rules")
    
    def test_create_autosave_rule(self, session):
        """Test creating an auto-save rule"""
        payload = {"rule_type": "roundup", "value": 10, "target_goal_id": "", "active": True}
        resp = session.post(f"{BASE_URL}/api/autosave-rules", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        print(f"✓ Auto-save rule created: {data['id']}")
        
        # Cleanup
        resp = session.delete(f"{BASE_URL}/api/autosave-rules/{data['id']}")
        assert resp.status_code == 200


class TestDashboardIntegration:
    """Test dashboard loads with all new widgets"""
    
    def test_dashboard_loads(self, session):
        """Test individual dashboard loads with all data"""
        resp = session.get(f"{BASE_URL}/api/individual/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert "income" in data
        assert "expenses" in data
        assert "savings_rate" in data
        assert "net_worth" in data
        assert "category_breakdown" in data
        assert "monthly_series" in data
        assert "goals" in data
        print(f"✓ Dashboard loads: income=₹{data['income']}, expenses=₹{data['expenses']}, savings_rate={data['savings_rate']}%")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
