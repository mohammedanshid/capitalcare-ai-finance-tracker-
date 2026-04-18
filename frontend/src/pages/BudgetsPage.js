import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const CATS = ['Groceries','Dining','Transport','Rent','EMI','Subscriptions','Entertainment','Healthcare','Shopping','Misc'];

export const BudgetsPage = () => {
  const nav = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Groceries', limit: '', rollover: false });
  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data } = await axios.get(`${API}/api/budgets`, { withCredentials: true }); setBudgets(data); } catch {} };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/budgets`, { ...form, limit: parseFloat(form.limit) }, { withCredentials: true }); toast.success('Budget set!'); setShowForm(false); fetch_(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const del = async (id) => { try { await axios.delete(`${API}/api/budgets/${id}`, { withCredentials: true }); fetch_(); } catch {} };
  const barColor = (pct) => pct >= 100 ? 'var(--red)' : pct >= 80 ? '#F59E0B' : 'var(--green)';
  const inputClass = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="budgets-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Budget Manager</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-budget-btn"><Plus size={14} /> Set Budget</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="budget-form">
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass} data-testid="budget-category">{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <input type="number" step="0.01" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} placeholder="Monthly limit (₹)" required className={inputClass} data-testid="budget-limit" />
            </div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={form.rollover} onChange={e => setForm(f => ({ ...f, rollover: e.target.checked }))} className="accent-[var(--coral)]" /> Roll over unspent budget next month</label>
            <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-budget-btn">Save Budget</button>
          </form>
        )}
        {budgets.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No budgets set. Start by adding category limits above.</p></div> :
          budgets.map(b => (
            <div key={b.id} className="cashly-card p-5" data-testid={`budget-${b.category}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[var(--dark)]">{b.category}</p>
                <button onClick={() => del(b.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-secondary)]">{formatINR(b.spent)} spent</span>
                <span className="font-semibold" style={{ color: barColor(b.percentage) }}>{formatINR(b.remaining)} left of {formatINR(b.limit)}</span>
              </div>
              <div className="w-full h-2.5 bg-[var(--cream-light)] rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(b.percentage, 100)}%`, background: barColor(b.percentage) }} />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>{b.percentage}% used</span>
                {b.rollover && <span className="text-[var(--green)]">Rollover enabled</span>}
              </div>
              {b.status === 'warning' && <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">You've used 80% of your {b.category} budget</div>}
              {b.status === 'exceeded' && <div className="mt-2 bg-[var(--red-light)] border border-red-200 rounded-xl px-3 py-2 text-xs text-[var(--red)]">{b.category} budget exceeded by {formatINR(Math.abs(b.remaining))}</div>}
            </div>
          ))
        }
      </main>
    </div>
  );
};
