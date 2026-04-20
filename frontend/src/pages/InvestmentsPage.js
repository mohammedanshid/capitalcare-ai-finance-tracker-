import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, TrendUp, TrendDown } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const TYPES = [['stock','Stocks'],['mutual_fund','Mutual Fund'],['gold','Gold'],['fd','FD'],['rd','RD'],['crypto','Crypto']];
const COLORS = ['#F4845F','#4CAF85','#FFB74D','#90A4AE','#E0A96D','#7086FD'];
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

export const InvestmentsPage = () => {
  const nav = useNavigate();
  const [data, setData] = useState({ items: [], total_invested: 0, total_current: 0, total_gain: 0, gain_pct: 0, allocation: [] });
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ asset_type: 'stock', name: '', quantity: '', buy_price: '', current_price: '', purchase_date: new Date().toISOString().slice(0, 10), notes: '' });
  useEffect(() => { load(); }, []);
  const load = async () => { try { const { data } = await axios.get(`${API}/api/investments`, { withCredentials: true }); setData(data); } catch {} };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/investments`, { ...f, quantity: parseFloat(f.quantity), buy_price: parseFloat(f.buy_price), current_price: parseFloat(f.current_price || f.buy_price) }, { withCredentials: true }); toast.success('Investment added'); setShowForm(false); setF({ asset_type: 'stock', name: '', quantity: '', buy_price: '', current_price: '', purchase_date: new Date().toISOString().slice(0, 10), notes: '' }); load(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const del = async (id) => { await axios.delete(`${API}/api/investments/${id}`, { withCredentials: true }); load(); };
  const gainColor = (pct) => pct >= 0 ? 'var(--green)' : 'var(--red)';

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="investments-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Investment Portfolio</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-investment-btn"><Plus size={14} /> Add Investment</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Invested</p><p className="text-xl font-bold text-[var(--dark)] mt-1" data-testid="total-invested">{formatINR(data.total_invested)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Current Value</p><p className="text-xl font-bold text-[var(--dark)] mt-1" data-testid="total-current">{formatINR(data.total_current)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Total Gain/Loss</p><p className="text-xl font-bold mt-1 flex items-center gap-1" style={{ color: gainColor(data.total_gain) }}>{data.total_gain >= 0 ? <TrendUp size={18} /> : <TrendDown size={18} />}{formatINR(Math.abs(data.total_gain))}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Return</p><p className="text-xl font-bold mt-1" style={{ color: gainColor(data.gain_pct) }}>{data.gain_pct >= 0 ? '+' : ''}{data.gain_pct}%</p></div>
        </div>

        {data.allocation.length > 0 && (
          <div className="cashly-card p-5">
            <p className="text-sm font-bold text-[var(--dark)] mb-3">Asset Allocation</p>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-48 h-48"><ResponsiveContainer><PieChart><Pie data={data.allocation} dataKey="value" nameKey="asset_type" innerRadius={50} outerRadius={80}>{data.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer></div>
              <div className="flex-1 space-y-2 w-full">
                {data.allocation.map((a, i) => (
                  <div key={a.asset_type} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="capitalize text-[var(--dark)]">{a.asset_type.replace('_',' ')}</span></span>
                    <span className="text-[var(--text-secondary)]">{formatINR(a.value)} · {a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="investment-form">
            <div className="grid grid-cols-2 gap-3">
              <select value={f.asset_type} onChange={e => setF({ ...f, asset_type: e.target.value })} className={input} data-testid="investment-type">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Name / Ticker" required className={input} data-testid="investment-name" />
              <input type="number" step="0.0001" value={f.quantity} onChange={e => setF({ ...f, quantity: e.target.value })} placeholder="Quantity / Units" required className={input} data-testid="investment-qty" />
              <input type="number" step="0.01" value={f.buy_price} onChange={e => setF({ ...f, buy_price: e.target.value })} placeholder="Buy Price (₹)" required className={input} data-testid="investment-buy-price" />
              <input type="number" step="0.01" value={f.current_price} onChange={e => setF({ ...f, current_price: e.target.value })} placeholder="Current Price (₹)" className={input} data-testid="investment-current-price" />
              <input type="date" value={f.purchase_date} onChange={e => setF({ ...f, purchase_date: e.target.value })} required className={input} data-testid="investment-date" />
            </div>
            <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-investment-btn">Save Investment</button>
          </form>
        )}

        {data.items.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No investments yet. Start tracking your portfolio above.</p></div> :
          data.items.map(it => (
            <div key={it.id} className="cashly-card p-5" data-testid={`investment-${it.name}`}>
              <div className="flex items-start justify-between mb-3">
                <div><p className="text-sm font-bold text-[var(--dark)]">{it.name}</p><p className="text-[11px] text-[var(--muted)] capitalize">{it.asset_type.replace('_',' ')} · {it.quantity} units</p></div>
                <button onClick={() => del(it.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div><p className="text-[var(--muted)] text-[10px]">Invested</p><p className="font-semibold text-[var(--dark)]">{formatINR(it.invested)}</p></div>
                <div><p className="text-[var(--muted)] text-[10px]">Current</p><p className="font-semibold text-[var(--dark)]">{formatINR(it.current_value)}</p></div>
                <div><p className="text-[var(--muted)] text-[10px]">Gain/Loss</p><p className="font-semibold" style={{ color: gainColor(it.gain_loss) }}>{formatINR(it.gain_loss)}</p></div>
                <div><p className="text-[var(--muted)] text-[10px]">Return</p><p className="font-semibold" style={{ color: gainColor(it.gain_pct) }}>{it.gain_pct >= 0 ? '+' : ''}{it.gain_pct}%</p></div>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
};
