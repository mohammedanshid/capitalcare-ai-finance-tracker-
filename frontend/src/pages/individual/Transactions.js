import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import { formatINR } from '../../utils/inr';
import { toast } from 'sonner';
import api from '../../api'; // ✅ GLOBAL API — token sent automatically

const CATS_INC = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const CATS_EXP = ['Groceries', 'Dining', 'Rent', 'EMI', 'Subscriptions', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Other'];

export const IndividualTransactions = () => {
  const nav = useNavigate();
  const [txns, setTxns] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Groceries',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTxns(); }, []);

  // ✅ GET transactions
  const fetchTxns = async () => {
    try {
      console.log("💳 Fetching transactions...");
      const { data } = await api.get("/api/transactions");
      console.log("💳 Transactions:", data);
      setTxns(data);
    } catch (err) {
      console.log("❌ Fetch transactions error:", err);
    }
  };

  // ✅ POST new transaction
  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    setLoading(true);
    try {
      console.log("📤 Adding transaction:", form);
      await api.post("/api/transactions", {
        title: form.category,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
      });
      console.log("✅ Transaction added");
      toast.success('Transaction added!');
      setShowForm(false);
      setForm({
        type: 'expense',
        amount: '',
        category: 'Groceries',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchTxns();
    } catch (err) {
      console.log("❌ Add transaction error:", err);
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  // ❌ DELETE — disabled until backend supports it
  const del = async (id) => {
    toast.error("Delete not supported yet");
  };

  const filtered = txns.filter(t =>
    !search ||
    t.category?.toLowerCase().includes(search.toLowerCase()) ||
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  const cats = form.type === 'income' ? CATS_INC : CATS_EXP;

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="flex items-center gap-3 h-14 px-4 max-w-2xl mx-auto">
          <button
            onClick={() => nav('/dashboard')}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--dark)] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-extrabold text-[var(--dark)] flex-1">Transactions</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 btn-coral text-xs py-2 px-4"
          >
            <Plus size={14} weight="bold" />
            Add
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[var(--border)] rounded-2xl text-sm text-[var(--dark)] placeholder-[var(--muted)] outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20 transition-all"
          />
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <div className="cashly-card p-5">
            <h2 className="text-sm font-bold text-[var(--dark)] mb-4">New Transaction</h2>
            <form onSubmit={submit} className="space-y-3">

              {/* Type toggle */}
              <div className="flex gap-2">
                {['expense', 'income'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      type: t,
                      category: t === 'income' ? 'Salary' : 'Groceries',
                    }))}
                    className={`flex-1 h-9 rounded-xl text-xs font-bold capitalize transition-all
                      ${form.type === t
                        ? t === 'income'
                          ? 'bg-[var(--green)] text-white'
                          : 'bg-[var(--coral)] text-white'
                        : 'bg-[var(--cream-light)] text-[var(--muted)]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="Amount (₹)"
                required
                className="w-full h-11 bg-white border border-[var(--border)] rounded-2xl px-4 text-sm text-[var(--dark)] placeholder-[var(--muted)] outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20 transition-all"
              />

              {/* Category */}
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-11 bg-white border border-[var(--border)] rounded-2xl px-4 text-sm text-[var(--dark)] outline-none focus:border-[var(--coral)] transition-all"
              >
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-10 rounded-2xl border border-[var(--border)] text-xs text-[var(--muted)] font-semibold hover:bg-[var(--cream-light)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 btn-coral text-xs"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Transactions List */}
        <div className="cashly-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                {search ? 'No results found.' : 'No transactions yet. Add one above!'}
              </p>
            </div>
          ) : (
            filtered.map((t, i) => (
              <div
                key={t._id || i}
                className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream-light)] transition-all"
              >
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                    ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {t.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--dark)]">{t.title || t.category}</p>
                    <p className="text-[10px] text-[var(--muted)]">{t.category}</p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold tabular-nums
                    ${t.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--coral)]'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </span>
                  <button
                    onClick={() => del(t._id)}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};
