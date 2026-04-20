import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, FloppyDisk } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const CATS = ['Rent','Groceries','Utilities','Transport','EMI','Subscriptions','Savings','Investments','Insurance','Entertainment','Dining','Healthcare','Education','Misc'];
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

export const ZeroBudgetPage = () => {
  const nav = useNavigate();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState({ monthly_income: 0, allocations: [], total_allocated: 0, unallocated: 0 });
  const [income, setIncome] = useState('');
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [month]);
  const load = async () => { try { const { data } = await axios.get(`${API}/api/zero-budget/${month}`, { withCredentials: true }); setData(data); setIncome(data.monthly_income?.toString() || ''); } catch {} };

  const updateAlloc = (i, key, val) => { const a = [...data.allocations]; a[i] = { ...a[i], [key]: key === 'amount' ? parseFloat(val) || 0 : val }; setData({ ...data, allocations: a, total_allocated: a.reduce((s, x) => s + (x.amount || 0), 0), unallocated: (parseFloat(income) || 0) - a.reduce((s, x) => s + (x.amount || 0), 0) }); };
  const addAlloc = () => setData({ ...data, allocations: [...data.allocations, { category: 'Rent', amount: 0 }] });
  const removeAlloc = (i) => { const a = data.allocations.filter((_, idx) => idx !== i); setData({ ...data, allocations: a, total_allocated: a.reduce((s, x) => s + (x.amount || 0), 0) }); };
  const save = async () => { try { await axios.post(`${API}/api/zero-budget`, { month, monthly_income: parseFloat(income) || 0, allocations: data.allocations.map(a => ({ category: a.category, amount: a.amount })) }, { withCredentials: true }); toast.success('Budget plan saved'); load(); } catch { toast.error('Failed to save'); } };

  const unalloc = (parseFloat(income) || 0) - data.total_allocated;
  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="zero-budget-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Zero-Based Budget Planner</h1>
          <div className="flex-1" />
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="h-9 px-3 border border-[var(--border)] rounded-xl text-xs bg-white" data-testid="month-picker" />
          <button onClick={save} className="btn-coral text-xs py-2 px-4" data-testid="save-budget-btn"><FloppyDisk size={14} /> Save</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="cashly-card p-5">
          <p className="text-[11px] text-[var(--muted)] uppercase mb-2">Expected Monthly Income</p>
          <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 80000" className="w-full h-12 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-4 text-2xl font-bold text-[var(--dark)] focus:border-[var(--coral)] outline-none" data-testid="income-input" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div><p className="text-[10px] text-[var(--muted)] uppercase">Income</p><p className="text-lg font-bold text-[var(--dark)]" data-testid="plan-income">{formatINR(parseFloat(income) || 0)}</p></div>
            <div><p className="text-[10px] text-[var(--muted)] uppercase">Allocated</p><p className="text-lg font-bold text-[var(--dark)]" data-testid="plan-allocated">{formatINR(data.total_allocated)}</p></div>
            <div><p className="text-[10px] text-[var(--muted)] uppercase">{unalloc >= 0 ? 'Left to Allocate' : 'Over-allocated'}</p><p className="text-lg font-bold" style={{ color: Math.abs(unalloc) < 0.01 ? 'var(--green)' : unalloc > 0 ? '#F59E0B' : 'var(--red)' }} data-testid="plan-unallocated">{formatINR(Math.abs(unalloc))}</p></div>
          </div>
          {Math.abs(unalloc) < 0.01 && parseFloat(income) > 0 && <div className="mt-3 p-3 rounded-xl bg-[#E8F5EE] border border-[#4CAF85]/30 text-xs text-[#2D7A5B]">Perfect zero-based budget! Every rupee has a job.</div>}
        </div>

        <div className="cashly-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--dark)]">Allocations</p>
            <button onClick={addAlloc} className="text-xs text-[var(--coral)] font-semibold flex items-center gap-1" data-testid="add-allocation-btn"><Plus size={14} /> Add</button>
          </div>
          {data.allocations.length === 0 ? <p className="text-xs text-[var(--muted)] py-6 text-center">No allocations. Click Add to start.</p> :
            data.allocations.map((a, i) => (
              <div key={i} className="space-y-2" data-testid={`allocation-${i}`}>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <select value={a.category} onChange={e => updateAlloc(i, 'category', e.target.value)} className={input}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <input type="number" value={a.amount} onChange={e => updateAlloc(i, 'amount', e.target.value)} placeholder="Amount" className={input} />
                  <button onClick={() => removeAlloc(i)} className="p-2 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
                </div>
                {a.spent !== undefined && (
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--muted)] mb-0.5"><span>{formatINR(a.spent || 0)} spent</span><span>{a.percentage || 0}% of {formatINR(a.amount)}</span></div>
                    <div className="w-full h-1.5 bg-[var(--cream-light)] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(a.percentage || 0, 100)}%`, background: (a.percentage || 0) >= 100 ? 'var(--red)' : (a.percentage || 0) >= 80 ? '#F59E0B' : 'var(--green)' }} /></div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};
