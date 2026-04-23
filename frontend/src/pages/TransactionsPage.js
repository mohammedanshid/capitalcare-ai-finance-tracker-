import React, { useState } from "react";
import axios from "axios";

const API = "https://capitalcare-ai-finance-tracker.onrender.com";

export const TransactionsPage = () => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API}/api/transactions`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Transaction added");

      setForm({
        title: "",
        amount: "",
        type: "expense",
        category: "",
      });

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("❌ Failed to add transaction");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Transaction</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        /><br /><br />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        /><br /><br />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select><br /><br />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        /><br /><br />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};
