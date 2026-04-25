import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#4CAF50", "#F44336"];

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const chartData = [
    { name: "Income", value: data?.income || 0 },
    { name: "Expenses", value: data?.expenses || 0 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-lg p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-8">💰 CapitalCare</h2>

          <nav className="space-y-4">
            <p className="text-gray-700 cursor-pointer">🏠 Dashboard</p>
            <p className="text-gray-700 cursor-pointer">📊 Analytics</p>
            <p className="text-gray-700 cursor-pointer">🎯 Goals</p>
            <p className="text-gray-700 cursor-pointer">💳 Transactions</p>
          </nav>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white p-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name}
          </h1>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card title="Balance" value={data?.balance} />
          <Card title="Income" value={data?.income} />
          <Card title="Expenses" value={data?.expenses} />
        </div>

        {/* CHART */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="mb-4 font-semibold">
            Income vs Expenses
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="mb-4 font-semibold">
            Recent Transactions
          </h2>

          {data?.transactions?.map((t, i) => (
            <div
              key={i}
              className="flex justify-between py-2 border-b"
            >
              <span>{t.title}</span>
              <span>₹ {t.amount}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <h3 className="text-gray-500">{title}</h3>
    <p className="text-xl font-bold">₹ {value || 0}</p>
  </div>
);
