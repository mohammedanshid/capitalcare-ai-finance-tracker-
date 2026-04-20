"""Phase 2/3/4 feature tests: investments, real estate, net worth, zero-budget,
lend-borrow, debt payoff, jars, sip-rd, fds, deductions, tax calendar, itr summary,
form 26as, unusual alerts."""
import os
import io
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://finance-ai-coach-1.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "admin@capitalcare.ai"
ADMIN_PW = "Admin@123"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # login
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    if r.status_code != 200:
        # try register
        s.post(f"{BASE_URL}/api/auth/register", json={"name": "Admin", "email": ADMIN_EMAIL, "password": ADMIN_PW})
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return s


# ============ INVESTMENTS ============
class TestInvestments:
    def test_list_investments(self, client):
        r = client.get(f"{BASE_URL}/api/investments")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert "total_invested" in data
        assert "total_current" in data
        assert "total_gain" in data
        assert "gain_pct" in data
        assert "allocation" in data
        assert isinstance(data["allocation"], list)

    def test_create_and_crud(self, client):
        # stock
        r = client.post(f"{BASE_URL}/api/investments", json={
            "asset_type": "stock", "name": "TEST_RELIANCE", "quantity": 10,
            "buy_price": 2500, "current_price": 2800, "purchase_date": "2024-06-01"
        })
        assert r.status_code == 200, r.text
        iid = r.json()["id"]
        # mutual fund
        r2 = client.post(f"{BASE_URL}/api/investments", json={
            "asset_type": "mutual_fund", "name": "TEST_AXIS_BLUECHIP", "quantity": 100,
            "buy_price": 50, "current_price": 65, "purchase_date": "2024-01-15"
        })
        assert r2.status_code == 200
        # gold
        r3 = client.post(f"{BASE_URL}/api/investments", json={
            "asset_type": "gold", "name": "TEST_GOLD_24K", "quantity": 10,
            "buy_price": 6000, "current_price": 7200, "purchase_date": "2023-10-01"
        })
        assert r3.status_code == 200

        # verify persistence
        r = client.get(f"{BASE_URL}/api/investments")
        d = r.json()
        names = [i["name"] for i in d["items"]]
        assert "TEST_RELIANCE" in names
        # Find reliance and verify gain calc: (2800-2500)*10 = 3000
        rel = [i for i in d["items"] if i["name"] == "TEST_RELIANCE"][0]
        assert rel["gain_loss"] == 3000.0
        assert rel["invested"] == 25000.0
        assert rel["current_value"] == 28000.0
        assert d["total_invested"] >= 25000
        assert len(d["allocation"]) >= 1

        # patch current price
        r = client.patch(f"{BASE_URL}/api/investments/{iid}", json={"current_price": 3000})
        assert r.status_code == 200

        # verify update
        r = client.get(f"{BASE_URL}/api/investments")
        rel = [i for i in r.json()["items"] if i["id"] == iid][0]
        assert rel["current_value"] == 30000.0

        # cleanup
        for item in r.json()["items"]:
            if item["name"].startswith("TEST_"):
                client.delete(f"{BASE_URL}/api/investments/{item['id']}")


# ============ REAL ESTATE ============
class TestRealEstate:
    def test_list_empty_and_crud(self, client):
        r = client.get(f"{BASE_URL}/api/real-estate")
        assert r.status_code == 200
        assert "items" in r.json()
        # create
        r = client.post(f"{BASE_URL}/api/real-estate", json={
            "name": "TEST_Whitefield_Apt", "property_type": "apartment",
            "purchase_price": 5000000, "current_value": 7500000,
            "purchase_date": "2020-03-01", "location": "Bangalore"
        })
        assert r.status_code == 200
        rid = r.json()["id"]
        # verify appreciation
        r = client.get(f"{BASE_URL}/api/real-estate")
        d = r.json()
        tp = [i for i in d["items"] if i["id"] == rid][0]
        assert tp["appreciation"] == 2500000.0
        assert tp["appreciation_pct"] == 50.0
        # delete
        r = client.delete(f"{BASE_URL}/api/real-estate/{rid}")
        assert r.status_code == 200


# ============ NET WORTH ============
class TestNetWorth:
    def test_net_worth(self, client):
        r = client.get(f"{BASE_URL}/api/net-worth")
        assert r.status_code == 200
        d = r.json()
        for k in ["cash", "savings_goals", "investments", "real_estate", "money_lent"]:
            assert k in d["assets"], f"missing {k}"
        for k in ["loans", "credit_cards", "money_borrowed"]:
            assert k in d["liabilities"]
        assert "total_assets" in d
        assert "total_liabilities" in d
        assert "net_worth" in d


# ============ ZERO BUDGET ============
class TestZeroBudget:
    def test_empty_and_populate(self, client):
        r = client.get(f"{BASE_URL}/api/zero-budget/2026-02")
        assert r.status_code == 200
        d = r.json()
        assert d["month"] == "2026-02"
        # save
        r = client.post(f"{BASE_URL}/api/zero-budget", json={
            "month": "2026-02", "monthly_income": 100000,
            "allocations": [
                {"category": "Rent", "amount": 30000},
                {"category": "Food", "amount": 15000},
                {"category": "Savings", "amount": 25000}
            ]
        })
        assert r.status_code == 200
        r = client.get(f"{BASE_URL}/api/zero-budget/2026-02")
        d = r.json()
        assert d["monthly_income"] == 100000
        assert d["total_allocated"] == 70000
        assert d["unallocated"] == 30000
        # allocation fields
        for a in d["allocations"]:
            assert "spent" in a and "remaining" in a and "percentage" in a


# ============ LEND BORROW ============
class TestLendBorrow:
    def test_crud(self, client):
        r = client.get(f"{BASE_URL}/api/lend-borrow")
        assert r.status_code == 200
        r = client.post(f"{BASE_URL}/api/lend-borrow", json={
            "direction": "lent", "person": "TEST_Raj", "amount": 5000, "date": "2025-12-01"
        })
        assert r.status_code == 200
        lent_id = r.json()["id"]
        r = client.post(f"{BASE_URL}/api/lend-borrow", json={
            "direction": "borrowed", "person": "TEST_Mom", "amount": 2000, "date": "2025-11-15"
        })
        borrowed_id = r.json()["id"]
        r = client.get(f"{BASE_URL}/api/lend-borrow")
        d = r.json()
        assert d["total_lent"] >= 5000
        assert d["total_borrowed"] >= 2000
        assert "net" in d
        # mark settled
        r = client.patch(f"{BASE_URL}/api/lend-borrow/{lent_id}", json={"status": "settled"})
        assert r.status_code == 200
        # delete
        client.delete(f"{BASE_URL}/api/lend-borrow/{lent_id}")
        client.delete(f"{BASE_URL}/api/lend-borrow/{borrowed_id}")


# ============ DEBT PAYOFF ============
class TestDebtPayoff:
    def test_simulate_both(self, client):
        r = client.post(f"{BASE_URL}/api/debt-payoff/simulate", json={
            "debts": [
                {"name": "CC1", "balance": 50000, "interest_rate": 36, "min_payment": 2000},
                {"name": "Loan", "balance": 100000, "interest_rate": 12, "min_payment": 3000}
            ],
            "extra_monthly": 5000,
            "strategy": "both"
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert "avalanche" in d and "snowball" in d
        assert "interest_saved_by_avalanche" in d
        assert "months_saved_by_avalanche" in d
        for strat in ["avalanche", "snowball"]:
            s = d[strat]
            assert "months_to_payoff" in s
            assert "total_interest" in s
            assert "total_paid" in s
            assert "payoff_order" in s

    def test_simulate_single(self, client):
        for strat in ["avalanche", "snowball"]:
            r = client.post(f"{BASE_URL}/api/debt-payoff/simulate", json={
                "debts": [{"name": "X", "balance": 10000, "interest_rate": 18, "min_payment": 500}],
                "extra_monthly": 1000, "strategy": strat
            })
            assert r.status_code == 200
            assert r.json()["strategy"] == strat


# ============ JARS ============
class TestJars:
    def test_jar_lifecycle(self, client):
        r = client.get(f"{BASE_URL}/api/jars")
        assert r.status_code == 200
        r = client.post(f"{BASE_URL}/api/jars", json={"name": "TEST_Vacation", "target": 50000, "color": "#F4845F"})
        assert r.status_code == 200
        jid = r.json()["id"]
        # deposit
        r = client.post(f"{BASE_URL}/api/jars/{jid}/deposit", json={"amount": 10000})
        assert r.status_code == 200
        # withdraw
        r = client.post(f"{BASE_URL}/api/jars/{jid}/withdraw", json={"amount": 2000})
        assert r.status_code == 200
        r = client.get(f"{BASE_URL}/api/jars")
        jars = r.json() if isinstance(r.json(), list) else r.json().get("items", r.json().get("jars", []))
        jar = None
        if isinstance(jars, list):
            jar = next((j for j in jars if j["id"] == jid), None)
        assert jar is not None, f"jar not found in response: {r.json()}"
        assert jar.get("balance") == 8000, f"balance={jar.get('balance')}"
        client.delete(f"{BASE_URL}/api/jars/{jid}")


# ============ SIP RD ============
class TestSipRd:
    def test_sip(self, client):
        r = client.get(f"{BASE_URL}/api/sip-rd")
        assert r.status_code == 200
        r = client.post(f"{BASE_URL}/api/sip-rd", json={
            "plan_type": "SIP", "name": "TEST_Axis_SIP", "monthly_amount": 5000,
            "start_date": "2024-01-01", "tenure_months": 60, "expected_return": 12
        })
        assert r.status_code == 200, r.text
        sid = r.json()["id"]
        r = client.get(f"{BASE_URL}/api/sip-rd")
        items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
        it = next((i for i in items if i["id"] == sid), None)
        assert it is not None
        for f in ["installments_paid", "invested_so_far", "current_value", "projected_maturity"]:
            assert f in it, f"missing {f}"
        client.delete(f"{BASE_URL}/api/sip-rd/{sid}")


# ============ FDs ============
class TestFDs:
    def test_fd(self, client):
        r = client.get(f"{BASE_URL}/api/fds")
        assert r.status_code == 200
        r = client.post(f"{BASE_URL}/api/fds", json={
            "bank": "TEST_HDFC", "principal": 100000, "interest_rate": 7.5,
            "start_date": "2024-06-01", "tenure_months": 24
        })
        assert r.status_code == 200, r.text
        fid = r.json()["id"]
        r = client.get(f"{BASE_URL}/api/fds")
        items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
        it = next((i for i in items if i["id"] == fid), None)
        assert it is not None
        for f in ["maturity_amount", "interest_earned", "maturity_date", "days_to_maturity", "matured"]:
            assert f in it, f"missing {f}"
        client.delete(f"{BASE_URL}/api/fds/{fid}")


# ============ DEDUCTIONS ============
class TestDeductions:
    def test_deductions(self, client):
        r = client.get(f"{BASE_URL}/api/deductions/2025-26")
        assert r.status_code == 200
        r = client.post(f"{BASE_URL}/api/deductions", json={
            "financial_year": "2025-26", "section": "80C", "name": "TEST_PPF", "amount": 50000
        })
        assert r.status_code == 200, r.text
        did = r.json()["id"]
        r = client.get(f"{BASE_URL}/api/deductions/2025-26")
        d = r.json()
        assert "sections" in d or isinstance(d, dict)
        # should have limit/remaining/utilization_pct somewhere
        body = str(d)
        assert "80C" in body or "limit" in body
        assert "estimated_tax_saved" in body or "tax_saved" in body
        client.delete(f"{BASE_URL}/api/deductions/{did}")


# ============ TAX CALENDAR ============
class TestTaxCalendar:
    def test_calendar(self, client):
        r = client.get(f"{BASE_URL}/api/tax-calendar/2025-26")
        assert r.status_code == 200
        data = r.json()
        events = data if isinstance(data, list) else data.get("events", [])
        assert len(events) > 0
        e = events[0]
        for f in ["date", "title", "description", "days_until", "status"]:
            assert f in e, f"missing {f} in event"


# ============ ITR SUMMARY ============
class TestITR:
    def test_itr(self, client):
        r = client.get(f"{BASE_URL}/api/itr-summary/2025-26")
        assert r.status_code == 200
        d = r.json()
        assert "buckets" in d
        assert "total_income" in d
        assert "financial_year" in d


# ============ FORM 26AS ============
class TestForm26AS:
    def test_upload_and_list(self, client):
        # create tiny fake PDF with TDS line
        pdf_bytes = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]/Contents 4 0 R/Resources<<>>>>endobj\n4 0 obj<</Length 50>>stream\nBT /F1 12 Tf 50 150 Td (TDS Rs. 12345.00) Tj ET\nendstream endobj\nxref\n0 5\ntrailer<</Root 1 0 R/Size 5>>\n%%EOF"
        files = {"file": ("test26as.pdf", pdf_bytes, "application/pdf")}
        # remove json content type for multipart
        s = requests.Session()
        s.cookies = client.cookies
        r = s.post(f"{BASE_URL}/api/tax/form26as/upload", files=files, data={"fy": "2025-26"})
        assert r.status_code in [200, 201], f"Upload failed: {r.status_code} {r.text[:200]}"
        d = r.json()
        assert "total_tds" in d or "entries" in d, f"missing fields: {d}"
        # list
        r = client.get(f"{BASE_URL}/api/tax/form26as")
        assert r.status_code == 200


# ============ UNUSUAL ALERTS ============
class TestUnusualAlerts:
    def test_unusual_alerts(self, client):
        r = client.get(f"{BASE_URL}/api/unusual-alerts")
        assert r.status_code == 200
        d = r.json()
        assert "alerts" in d or isinstance(d, list)


# ============ PHASE 1 REGRESSION ============
class TestPhase1Regression:
    def test_budgets(self, client):
        assert client.get(f"{BASE_URL}/api/budgets").status_code == 200

    def test_loans(self, client):
        assert client.get(f"{BASE_URL}/api/loans").status_code == 200

    def test_credit_cards(self, client):
        assert client.get(f"{BASE_URL}/api/credit-cards").status_code == 200

    def test_health_score(self, client):
        assert client.get(f"{BASE_URL}/api/health-score").status_code == 200

    def test_daily_limit(self, client):
        assert client.get(f"{BASE_URL}/api/daily-limit").status_code == 200

    def test_weekly_digest(self, client):
        assert client.get(f"{BASE_URL}/api/weekly-digest").status_code == 200

    def test_subscriptions(self, client):
        assert client.get(f"{BASE_URL}/api/subscriptions").status_code == 200

    def test_autosave(self, client):
        assert client.get(f"{BASE_URL}/api/autosave-rules").status_code == 200
