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

      const res = await axios.get(`${API}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data);
    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>No data found</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user?.name || "User"} 👋</h2>

      <div style={{ marginTop: 20 }}>
        <h3>Total Balance: ₹{data.balance || 0}</h3>
        <h3>Income: ₹{data.income || 0}</h3>
        <h3>Expenses: ₹{data.expenses || 0}</h3>
      </div>

      <button
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "black",
          color: "white",
          border: "none",
        }}
      >
        Logout
      </button>
    </div>
  );
};
