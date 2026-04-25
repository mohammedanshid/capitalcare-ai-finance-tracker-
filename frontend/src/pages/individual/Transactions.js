import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import { formatINR } from '../../utils/inr';
import { toast } from 'sonner';
import api from '../../api'; // ✅ USE GLOBAL API

const CATS_INC = ['Salary','Freelance','Investment','Gift','Other'];
const CATS_EXP = ['Groceries','Dining','Rent','EMI','Subscriptions','Transport','Shopping','Entertainment','Healthcare','Other'];

export const IndividualTransactions = () => {
  const nav = useNavigate();
  const [txns, setTxns] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:'expense', amount:'', category:'Groceries', description:'', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch_(); }, []);

  // ✅ FIXED GET
  const fetch_ = async () => {
    try {
      const { data } = await api.get("/api/transactions");
      setTxns(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ FIXED POST
  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;

    setLoading(true);
    try {
      await api.post("/api/transactions", {
        title: form.category,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
      });

      toast.success('Added!');
      setShowForm(false);

      setForm({
        type:'expense',
        amount:'',
        category:'Groceries',
        description:'',
        date: new Date().toISOString().split('T')[0]
      });

      fetch_();
    } catch (err) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  // ❌ DELETE DISABLED (backend not ready)
  const del = async (id) => {
    toast.error("Delete not supported yet");
  };

  const filtered = txns.filter(t =>
    !search ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const cats = form.type === 'income' ? CATS_INC : CATS_EXP;

  return (
    <div className="min-h-screen bg-[var(--p-bg)] pb-6">

      <header className="sticky top-0 bg-white border-b p-4 flex items-center gap-3">
        <button onClick={()=>nav('/individual')}>
          <ArrowLeft size={18}/>
        </button>
        <h1 className="text-lg font-bold">Transactions</h1>
        <div className="flex-1"/>
        <button onClick={()=>setShowForm(!showForm)}>
          <Plus size={16}/> Add
        </button>
      </header>

      <main className="p-4 space-y-4">

        {/* SEARCH */}
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search..."
        />

        {/* FORM */}
        {showForm && (
          <form onSubmit={submit} className="space-y-2">

            <select
              value={form.type}
              onChange={e=>setForm(f=>({...f,type:e.target.value}))}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              type="number"
              value={form.amount}
              onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
              placeholder="Amount"
            />

            <select
              value={form.category}
              onChange={e=>setForm(f=>({...f,category:e.target.value}))}
            >
              {cats.map(c=><option key={c}>{c}</option>)}
            </select>

            <button type="submit">
              {loading ? "Saving..." : "Save"}
            </button>

          </form>
        )}

        {/* LIST */}
        {filtered.map((t,i)=>(
          <div key={i} className="flex justify-between border-b p-2">
            <span>{t.category}</span>
            <span>{formatINR(t.amount)}</span>
          </div>
        ))}

      </main>
    </div>
  );
};
