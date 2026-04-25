import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from "../api";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      console.log("📊 Fetching dashboard data...");

      const res = await api.get("/api/dashboard");

      console.log("📊 Dashboard:", res.data);

      setD(res.data);
    } catch (err) {
      console.log("❌ Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD TRANSACTION (TEST BUTTON)
  const addTestTransaction = async () => {
    try {
      await api.post("/api/transactions", {
        title: "Test",
        amount: 100,
        type: "expense",
        category: "general"
      });

      alert("Transaction added ✅");
      fetchAll();
    } catch (err) {
      console.log("❌ Add error:", err);
      alert("Failed ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>Welcome: {user?.name}</h3>

          <h4>Balance: {d?.balance}</h4>
          <h4>Income: {d?.income}</h4>
          <h4>Expenses: {d?.expenses}</h4>

          <button onClick={addTestTransaction}>
            Add Test Transaction
          </button>

          <br /><br />

          <button onClick={logout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};
