import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      console.log("📊 Loading dashboard...");
      const res = await api.get("/api/dashboard");

      console.log("📊 Data:", res.data);
      setData(res.data);
    } catch (err) {
      console.log("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async () => {
    try {
      await api.post("/api/transactions", {
        title: "Food",
        amount: 200,
        type: "expense",
        category: "food",
      });

      alert("Transaction added ✅");
      fetchDashboard();
    } catch (err) {
      console.log("❌ Error:", err);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={card}>
          <h4>Balance</h4>
          <p>₹ {data?.balance || 0}</p>
        </div>

        <div style={card}>
          <h4>Income</h4>
          <p>₹ {data?.income || 0}</p>
        </div>

        <div style={card}>
          <h4>Expenses</h4>
          <p>₹ {data?.expenses || 0}</p>
        </div>
      </div>

      {/* ACTION */}
      <div style={{ marginTop: 20 }}>
        <button onClick={addTransaction}>Add Transaction</button>
      </div>

      {/* TRANSACTIONS LIST */}
      <div style={{ marginTop: 30 }}>
        <h3>Recent Transactions</h3>

        {data?.transactions?.length === 0 && <p>No transactions</p>}

        {data?.transactions?.map((t, i) => (
          <div key={i} style={txn}>
            <span>{t.title}</span>
            <span>₹ {t.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// styles
const card = {
  padding: 15,
  border: "1px solid #ddd",
  borderRadius: 10,
  width: 150,
};

const txn = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "1px solid #eee",
  padding: 10,
};
