import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, Warning } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

export const CreditCardsPage = () => {
  const nav = useNavigate();
  const [data, setData] = useState({ cards: [], total_utilization: 0, total_limit: 0, total_outstanding: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bank: '', card_name: '', credit_limit: '', statement_date: 1, due_date: 15, outstanding: '', reward_points: 0 });
  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data: d } = await axios.get(`${API}/api/credit-cards`, { withCredentials: true }); setData(d); } catch {} };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/credit-cards`, { ...form, credit_limit: parseFloat(form.credit_limit), outstanding: parseFloat(form.outstanding || '0'), statement_date: parseInt(form.statement_date), due_date: parseInt(form.due_date) }, { withCredentials: true }); toast.success('Card added!'); setShowForm(false); fetch_(); } catch (err) { toast.error('Failed'); } };
  const del = async (id) => { try { await axios.delete(`${API}/api/credit-cards/${id}`, { withCredentials: true }); fetch_(); } catch {} };
  const inputClass = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="credit-cards-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Credit Cards</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-card-btn"><Plus size={14} /> Add Card</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Utilization summary */}
        <div className="cashly-card p-5" data-testid="utilization-summary">
          <p className="text-xs text-[var(--muted)] mb-1">Total Credit Utilization</p>
          <div className="flex items-baseline gap-2"><p className="text-2xl font-bold tabular-nums" style={{ color: data.total_utilization > 30 ? 'var(--red)' : 'var(--green)' }}>{data.total_utilization}%</p>{data.total_utilization > 30 && <span className="text-[10px] text-[var(--red)] flex items-center gap-1"><Warning size={12} /> Keep below 30%</span>}</div>
          <div className="w-full h-2 bg-[var(--cream-light)] rounded-full mt-2 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(data.total_utilization, 100)}%`, background: data.total_utilization > 30 ? 'var(--red)' : 'var(--green)' }} /></div>
          <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1"><span>Outstanding: {formatINR(data.total_outstanding)}</span><span>Limit: {formatINR(data.total_limit)}</span></div>
        </div>
        {showForm && (
          <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="card-form">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} placeholder="Bank (e.g. HDFC)" required className={inputClass} data-testid="card-bank" />
              <input type="text" value={form.card_name} onChange={e => setForm(f => ({ ...f, card_name: e.target.value }))} placeholder="Card name" required className={inputClass} />
              <input type="number" value={form.credit_limit} onChange={e => setForm(f => ({ ...f, credit_limit: e.target.value }))} placeholder="Credit limit (₹)" required className={inputClass} data-testid="card-limit" />
              <input type="number" value={form.outstanding} onChange={e => setForm(f => ({ ...f, outstanding: e.target.value }))} placeholder="Outstanding (₹)" className={inputClass} />
              <input type="number" min="1" max="31" value={form.statement_date} onChange={e => setForm(f => ({ ...f, statement_date: e.target.value }))} placeholder="Statement date" className={inputClass} />
              <input type="number" min="1" max="31" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} placeholder="Due date" className={inputClass} />
            </div>
            <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-card-btn">Add Card</button>
          </form>
        )}
        {data.cards.map(c => (
          <div key={c.id} className="cashly-card p-5" data-testid={`card-${c.id}`}>
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-sm font-bold text-[var(--dark)]">{c.bank} — {c.card_name}</p><p className="text-[10px] text-[var(--muted)]">Statement: {c.statement_date}th · Due: {c.due_date}th</p></div>
              <button onClick={() => del(c.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--cream-light)] rounded-xl p-2.5"><p className="text-[9px] text-[var(--muted)]">Available</p><p className="text-xs font-bold text-[var(--green)] tabular-nums">{formatINR(c.available)}</p></div>
              <div className="bg-[var(--cream-light)] rounded-xl p-2.5"><p className="text-[9px] text-[var(--muted)]">Outstanding</p><p className="text-xs font-bold text-[var(--coral)] tabular-nums">{formatINR(c.outstanding)}</p></div>
              <div className="bg-[var(--cream-light)] rounded-xl p-2.5"><p className="text-[9px] text-[var(--muted)]">Utilization</p><p className="text-xs font-bold tabular-nums" style={{ color: c.utilization > 30 ? 'var(--red)' : 'var(--green)' }}>{c.utilization}%</p></div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};
