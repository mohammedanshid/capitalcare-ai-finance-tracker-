import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "https://capitalcare-ai-finance-tracker.onrender.com";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/individual/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!data) {
    return <div style={{ padding: 40 }}>No data</div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Capital Care AI</h2>
        <button onClick={() => {
          logout();
          window.location.href = "/login";
        }}>
          Logout
        </button>
      </div>

      <h3>Welcome, {user?.name || "User"} 👋</h3>

      {/* KPI CARDS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Total Balance" value={data.net_worth} />
        <Card title="Income" value={data.income} />
        <Card title="Expenses" value={data.expenses} />
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div style={{ marginTop: 30 }}>
        <h3>Spending Breakdown</h3>

        {data.category_breakdown?.length === 0 && <p>No data yet</p>}

        {data.category_breakdown?.map((c, i) => (
          <div key={i} style={row}>
            <span>{c.name}</span>
            <strong>₹{c.value}</strong>
          </div>
        ))}
      </div>

      {/* QUICK FEATURES GRID (UI ONLY) */}
      <div style={{ marginTop: 40 }}>
        <h3>Features</h3>

        <div style={grid}>
          {[
            "Budgets",
            "Zero Budget",
            "Loans",
            "Credit Cards",
            "Debt Payoff",
            "Investments",
            "Real Estate",
            "Net Worth",
            "SIP / FD",
            "Savings Jars",
            "Lend & Borrow",
            "Tax",
          ].map((f, i) => (
            <div key={i} style={box}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* COMPONENTS */

const Card = ({ title, value }) => (
  <div style={card}>
    <p style={{ fontSize: 12 }}>{title}</p>
    <h2>₹{value || 0}</h2>
  </div>
);

const card = {
  padding: 20,
  borderRadius: 10,
  background: "#f3f3f3",
  minWidth: 150,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
  padding: 10,
  background: "#fafafa",
  borderRadius: 8,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
};

const box = {
  padding: 15,
  background: "#eee",
  borderRadius: 10,
  textAlign: "center",
};
