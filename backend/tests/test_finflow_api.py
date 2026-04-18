"""
FinFlow Multi-Persona Fintech App - Backend API Tests
Tests for: Auth, Persona Selection, Individual, Shop Owner, CA endpoints, SMS Parser, Pricing
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@finflow.com"
ADMIN_PASSWORD = "Admin@123"
TEST_EMAIL = f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@finflow.com"
TEST_PASSWORD = "Test@123"


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert "name" in data
        print(f"Login success: {data['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")
    
    def test_register_new_user(self):
        """Test user registration"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert data["email"] == TEST_EMAIL.lower()
        assert data["name"] == "Test User"
        print(f"Registration success: {data['email']}")
    
    def test_register_duplicate_email(self):
        """Test registration with existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Duplicate",
            "email": ADMIN_EMAIL,
            "password": "Test@123"
        })
        assert response.status_code == 400
        print("Duplicate email correctly rejected")
    
    def test_me_endpoint_with_auth(self):
        """Test /auth/me with valid session"""
        session = requests.Session()
        login_resp = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_resp.status_code == 200
        
        me_resp = session.get(f"{BASE_URL}/api/auth/me")
        assert me_resp.status_code == 200
        data = me_resp.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"Me endpoint returned: {data['email']}")
    
    def test_logout(self):
        """Test logout endpoint"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        logout_resp = session.post(f"{BASE_URL}/api/auth/logout")
        assert logout_resp.status_code == 200
        assert logout_resp.json().get("ok") == True
        print("Logout successful")


class TestPersona:
    """Persona selection tests"""
    
    @pytest.fixture
    def auth_session(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_select_individual_persona(self, auth_session):
        """Test selecting individual persona"""
        response = auth_session.post(f"{BASE_URL}/api/persona/select", json={
            "persona": "individual"
        })
        assert response.status_code == 200
        assert response.json()["persona"] == "individual"
        print("Individual persona selected")
    
    def test_select_shop_owner_persona(self, auth_session):
        """Test selecting shop_owner persona"""
        response = auth_session.post(f"{BASE_URL}/api/persona/select", json={
            "persona": "shop_owner"
        })
        assert response.status_code == 200
        assert response.json()["persona"] == "shop_owner"
        print("Shop owner persona selected")
    
    def test_select_ca_persona(self, auth_session):
        """Test selecting ca persona"""
        response = auth_session.post(f"{BASE_URL}/api/persona/select", json={
            "persona": "ca"
        })
        assert response.status_code == 200
        assert response.json()["persona"] == "ca"
        print("CA persona selected")
    
    def test_invalid_persona(self, auth_session):
        """Test selecting invalid persona"""
        response = auth_session.post(f"{BASE_URL}/api/persona/select", json={
            "persona": "invalid"
        })
        assert response.status_code == 400
        print("Invalid persona correctly rejected")


class TestIndividual:
    """Individual persona endpoint tests"""
    
    @pytest.fixture
    def auth_session(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        # Set persona to individual
        session.post(f"{BASE_URL}/api/persona/select", json={"persona": "individual"})
        return session
    
    def test_individual_dashboard(self, auth_session):
        """Test individual dashboard endpoint"""
        response = auth_session.get(f"{BASE_URL}/api/individual/dashboard")
        assert response.status_code == 200
        data = response.json()
        # Check required fields
        assert "income" in data
        assert "expenses" in data
        assert "savings_rate" in data
        assert "net_worth" in data
        assert "category_breakdown" in data
        assert "monthly_series" in data
        assert "goals" in data
        print(f"Dashboard: income={data['income']}, expenses={data['expenses']}")
    
    def test_add_income_transaction(self, auth_session):
        """Test adding income transaction"""
        response = auth_session.post(f"{BASE_URL}/api/individual/transactions", json={
            "amount": 50000,
            "category": "Salary",
            "type": "income",
            "description": "TEST_Monthly salary",
            "date": datetime.now().strftime("%Y-%m-%d")
        })
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 50000
        assert data["type"] == "income"
        assert data["category"] == "Salary"
        assert "id" in data
        print(f"Income transaction added: {data['id']}")
        return data["id"]
    
    def test_add_expense_transaction(self, auth_session):
        """Test adding expense transaction"""
        response = auth_session.post(f"{BASE_URL}/api/individual/transactions", json={
            "amount": 3000,
            "category": "Groceries",
            "type": "expense",
            "description": "TEST_Weekly groceries",
            "date": datetime.now().strftime("%Y-%m-%d")
        })
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 3000
        assert data["type"] == "expense"
        print(f"Expense transaction added: {data['id']}")
    
    def test_get_transactions(self, auth_session):
        """Test getting transactions list"""
        response = auth_session.get(f"{BASE_URL}/api/individual/transactions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Got {len(data)} transactions")
    
    def test_delete_transaction(self, auth_session):
        """Test deleting a transaction"""
        # First create a transaction
        create_resp = auth_session.post(f"{BASE_URL}/api/individual/transactions", json={
            "amount": 100,
            "category": "Other",
            "type": "expense",
            "description": "TEST_To delete",
            "date": datetime.now().strftime("%Y-%m-%d")
        })
        tid = create_resp.json()["id"]
        
        # Delete it
        del_resp = auth_session.delete(f"{BASE_URL}/api/individual/transactions/{tid}")
        assert del_resp.status_code == 200
        print(f"Transaction {tid} deleted")
    
    def test_create_goal(self, auth_session):
        """Test creating a savings goal"""
        response = auth_session.post(f"{BASE_URL}/api/individual/goals", json={
            "name": "TEST_Emergency Fund",
            "target": 100000,
            "saved": 10000,
            "deadline": "2026-12-31"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Emergency Fund"
        assert data["target"] == 100000
        assert data["saved"] == 10000
        assert "id" in data
        print(f"Goal created: {data['id']}")
        return data["id"]
    
    def test_get_goals(self, auth_session):
        """Test getting goals list"""
        response = auth_session.get(f"{BASE_URL}/api/individual/goals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Got {len(data)} goals")
    
    def test_update_goal(self, auth_session):
        """Test updating a goal"""
        # Create goal first
        create_resp = auth_session.post(f"{BASE_URL}/api/individual/goals", json={
            "name": "TEST_Update Goal",
            "target": 50000,
            "saved": 5000
        })
        gid = create_resp.json()["id"]
        
        # Update it
        update_resp = auth_session.put(f"{BASE_URL}/api/individual/goals/{gid}", json={
            "name": "TEST_Updated Goal",
            "target": 60000,
            "saved": 15000,
            "deadline": "2026-06-30"
        })
        assert update_resp.status_code == 200
        print(f"Goal {gid} updated")
    
    def test_delete_goal(self, auth_session):
        """Test deleting a goal"""
        # Create goal first
        create_resp = auth_session.post(f"{BASE_URL}/api/individual/goals", json={
            "name": "TEST_Delete Goal",
            "target": 10000
        })
        gid = create_resp.json()["id"]
        
        # Delete it
        del_resp = auth_session.delete(f"{BASE_URL}/api/individual/goals/{gid}")
        assert del_resp.status_code == 200
        print(f"Goal {gid} deleted")


class TestShopOwner:
    """Shop Owner persona endpoint tests"""
    
    @pytest.fixture
    def auth_session(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        session.post(f"{BASE_URL}/api/persona/select", json={"persona": "shop_owner"})
        return session
    
    def test_shop_dashboard(self, auth_session):
        """Test shop owner dashboard endpoint"""
        response = auth_session.get(f"{BASE_URL}/api/shop/dashboard")
        assert response.status_code == 200
        data = response.json()
        # Check required fields
        assert "today" in data
        assert "opening_balance" in data
        assert "today_credit" in data
        assert "today_debit" in data
        assert "closing_balance" in data
        assert "today_entries" in data
        assert "pending_payments" in data
        assert "weekly_series" in data
        print(f"Shop dashboard: credit={data['today_credit']}, debit={data['today_debit']}")
    
    def test_add_credit_entry(self, auth_session):
        """Test adding credit entry"""
        response = auth_session.post(f"{BASE_URL}/api/shop/entry", json={
            "amount": 5000,
            "category": "Sales",
            "note": "TEST_Cash sale",
            "entry_type": "credit"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 5000
        assert data["entry_type"] == "credit"
        assert "id" in data
        print(f"Credit entry added: {data['id']}")
    
    def test_add_debit_entry(self, auth_session):
        """Test adding debit entry"""
        response = auth_session.post(f"{BASE_URL}/api/shop/entry", json={
            "amount": 2000,
            "category": "Purchase",
            "note": "TEST_Stock purchase",
            "entry_type": "debit"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 2000
        assert data["entry_type"] == "debit"
        print(f"Debit entry added: {data['id']}")
    
    def test_invalid_entry_type(self, auth_session):
        """Test invalid entry type"""
        response = auth_session.post(f"{BASE_URL}/api/shop/entry", json={
            "amount": 1000,
            "category": "Other",
            "entry_type": "invalid"
        })
        assert response.status_code == 400
        print("Invalid entry type correctly rejected")
    
    def test_get_ledger(self, auth_session):
        """Test getting ledger entries"""
        response = auth_session.get(f"{BASE_URL}/api/shop/ledger")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Got {len(data)} ledger entries")
    
    def test_delete_entry(self, auth_session):
        """Test deleting a ledger entry"""
        # Create entry first
        create_resp = auth_session.post(f"{BASE_URL}/api/shop/entry", json={
            "amount": 100,
            "category": "Other",
            "entry_type": "credit"
        })
        eid = create_resp.json()["id"]
        
        # Delete it
        del_resp = auth_session.delete(f"{BASE_URL}/api/shop/entry/{eid}")
        assert del_resp.status_code == 200
        print(f"Entry {eid} deleted")
    
    def test_add_pending_payment(self, auth_session):
        """Test adding pending payment"""
        response = auth_session.post(f"{BASE_URL}/api/shop/pending", json={
            "name": "TEST_Customer A",
            "amount": 5000,
            "days_overdue": 10
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Customer A"
        assert data["amount"] == 5000
        print(f"Pending payment added: {data['id']}")
    
    def test_get_pending_payments(self, auth_session):
        """Test getting pending payments"""
        response = auth_session.get(f"{BASE_URL}/api/shop/pending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Got {len(data)} pending payments")
    
    def test_delete_pending_payment(self, auth_session):
        """Test deleting pending payment"""
        # Create first
        create_resp = auth_session.post(f"{BASE_URL}/api/shop/pending", json={
            "name": "TEST_Delete Customer",
            "amount": 1000
        })
        pid = create_resp.json()["id"]
        
        # Delete
        del_resp = auth_session.delete(f"{BASE_URL}/api/shop/pending/{pid}")
        assert del_resp.status_code == 200
        print(f"Pending payment {pid} deleted")


class TestCA:
    """CA (Chartered Accountant) persona endpoint tests"""
    
    @pytest.fixture
    def auth_session(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        session.post(f"{BASE_URL}/api/persona/select", json={"persona": "ca"})
        return session
    
    def test_ca_dashboard(self, auth_session):
        """Test CA dashboard endpoint"""
        response = auth_session.get(f"{BASE_URL}/api/ca/dashboard")
        assert response.status_code == 200
        data = response.json()
        # Check required fields
        assert "clients" in data
        assert "tasks" in data
        assert "active_clients" in data
        assert "overdue_tasks" in data
        assert "pending_tasks" in data
        print(f"CA dashboard: {data['active_clients']} clients, {data['pending_tasks']} pending tasks")
    
    def test_add_client(self, auth_session):
        """Test adding a client"""
        response = auth_session.post(f"{BASE_URL}/api/ca/clients", json={
            "name": "TEST_ABC Corp",
            "business_type": "Retail",
            "status": "on_track",
            "next_deadline": "2026-03-31"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_ABC Corp"
        assert data["status"] == "on_track"
        assert "id" in data
        print(f"Client added: {data['id']}")
    
    def test_add_client_overdue_status(self, auth_session):
        """Test adding client with overdue status"""
        response = auth_session.post(f"{BASE_URL}/api/ca/clients", json={
            "name": "TEST_XYZ Ltd",
            "business_type": "Manufacturing",
            "status": "overdue"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "overdue"
        print(f"Overdue client added: {data['id']}")
    
    def test_get_clients(self, auth_session):
        """Test getting clients list"""
        response = auth_session.get(f"{BASE_URL}/api/ca/clients")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Got {len(data)} clients")
    
    def test_delete_client(self, auth_session):
        """Test deleting a client"""
        # Create first
        create_resp = auth_session.post(f"{BASE_URL}/api/ca/clients", json={
            "name": "TEST_Delete Client",
            "business_type": "Services"
        })
        cid = create_resp.json()["id"]
        
        # Delete
        del_resp = auth_session.delete(f"{BASE_URL}/api/ca/clients/{cid}")
        assert del_resp.status_code == 200
        print(f"Client {cid} deleted")
    
    def test_add_task(self, auth_session):
        """Test adding a task"""
        response = auth_session.post(f"{BASE_URL}/api/ca/tasks", json={
            "title": "TEST_File GST returns",
            "client_name": "ABC Corp",
            "deadline": "2026-01-31",
            "status": "pending"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_File GST returns"
        assert data["status"] == "pending"
        print(f"Task added: {data['id']}")
    
    def test_get_tasks(self, auth_session):
        """Test getting tasks list"""
        response = auth_session.get(f"{BASE_URL}/api/ca/tasks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Got {len(data)} tasks")
    
    def test_update_task_status(self, auth_session):
        """Test updating task status (toggle)"""
        # Create task first
        create_resp = auth_session.post(f"{BASE_URL}/api/ca/tasks", json={
            "title": "TEST_Toggle Task",
            "status": "pending"
        })
        tid = create_resp.json()["id"]
        
        # Update to completed
        update_resp = auth_session.put(f"{BASE_URL}/api/ca/tasks/{tid}", json={
            "title": "TEST_Toggle Task",
            "client_name": "",
            "deadline": "",
            "status": "completed"
        })
        assert update_resp.status_code == 200
        print(f"Task {tid} status updated to completed")
    
    def test_delete_task(self, auth_session):
        """Test deleting a task"""
        # Create first
        create_resp = auth_session.post(f"{BASE_URL}/api/ca/tasks", json={
            "title": "TEST_Delete Task"
        })
        tid = create_resp.json()["id"]
        
        # Delete
        del_resp = auth_session.delete(f"{BASE_URL}/api/ca/tasks/{tid}")
        assert del_resp.status_code == 200
        print(f"Task {tid} deleted")


class TestSMSParser:
    """SMS Parser endpoint tests"""
    
    def test_parse_debit_sms(self):
        """Test parsing debit SMS"""
        response = requests.post(f"{BASE_URL}/api/sms/parse", json={
            "text": "Your A/c XX1234 debited Rs.5000.00 on 15-Jan-26 at AMAZON. Avl Bal Rs.25000.00"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["parsed"] == True
        assert data["amount"] == 5000.0
        assert data["type"] == "debit"
        print(f"Parsed debit SMS: amount={data['amount']}, type={data['type']}")
    
    def test_parse_credit_sms(self):
        """Test parsing credit SMS"""
        response = requests.post(f"{BASE_URL}/api/sms/parse", json={
            "text": "INR 50,000.00 credited to your A/c XX5678 on 01-Jan-26. Salary from ACME Corp."
        })
        assert response.status_code == 200
        data = response.json()
        assert data["parsed"] == True
        assert data["amount"] == 50000.0
        assert data["type"] == "credit"
        print(f"Parsed credit SMS: amount={data['amount']}, type={data['type']}")
    
    def test_parse_upi_sms(self):
        """Test parsing UPI SMS"""
        response = requests.post(f"{BASE_URL}/api/sms/parse", json={
            "text": "Rs.299 spent via UPI at SWIGGY on 18-Jan-26. UPI Ref: 123456789"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["parsed"] == True
        assert data["amount"] == 299.0
        assert data["type"] == "debit"
        print(f"Parsed UPI SMS: amount={data['amount']}")
    
    def test_parse_empty_sms(self):
        """Test parsing empty SMS"""
        response = requests.post(f"{BASE_URL}/api/sms/parse", json={
            "text": ""
        })
        assert response.status_code == 400
        print("Empty SMS correctly rejected")
    
    def test_parse_non_financial_sms(self):
        """Test parsing non-financial SMS"""
        response = requests.post(f"{BASE_URL}/api/sms/parse", json={
            "text": "Your OTP is 123456. Valid for 5 minutes."
        })
        assert response.status_code == 200
        data = response.json()
        assert data["parsed"] == False
        print("Non-financial SMS correctly identified as unparseable")


class TestPricing:
    """Pricing endpoint tests"""
    
    def test_get_pricing(self):
        """Test getting pricing tiers"""
        response = requests.get(f"{BASE_URL}/api/pricing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3  # Individual, Shop Owner, CA
        
        # Check Individual tier
        individual = next((t for t in data if t["tier"] == "individual"), None)
        assert individual is not None
        assert individual["price"] == 99
        assert "₹" not in str(individual["price"])  # Price is numeric
        
        # Check Shop Owner tier
        shop = next((t for t in data if t["tier"] == "shop_owner"), None)
        assert shop is not None
        assert shop["price"] == 299
        
        # Check CA tier
        ca = next((t for t in data if t["tier"] == "ca"), None)
        assert ca is not None
        assert ca["price"] == 999
        
        print(f"Pricing tiers: Individual=₹{individual['price']}, Shop=₹{shop['price']}, CA=₹{ca['price']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
