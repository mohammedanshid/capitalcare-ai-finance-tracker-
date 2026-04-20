import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, House } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const TYPES = [['apartment','Apartment'],['house','House'],['plot','Plot'],['commercial','Commercial']];
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

export const RealEstatePage = () => {
  const nav = useNavigate();
  const [data, setData] = useState({ items: [], total_value: 0, total_cost: 0, total_appreciation: 0, appreciation_pct: 0 });
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ name: '', property_type: 'apartment', purchase_price: '', current_value: '', purchase_date: new Date().toISOString().slice(0, 10), location: '' });
  useEffect(() => { load(); }, []);
  const load = async () => { try { const { data } = await axios.get(`${API}/api/real-estate`, { withCredentials: true }); setData(data); } catch {} };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/real-estate`, { ...f, purchase_price: parseFloat(f.purchase_price), current_value: parseFloat(f.current_value) }, { withCredentials: true }); toast.success('Property added'); setShowForm(false); load(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const del = async (id) => { await axios.delete(`${API}/api/real-estate/${id}`, { withCredentials: true }); load(); };

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="real-estate-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Real Estate</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-property-btn"><Plus size={14} /> Add Property</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Current Value</p><p className="text-xl font-bold text-[var(--dark)] mt-1" data-testid="re-total-value">{formatINR(data.total_value)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Total Cost</p><p className="text-xl font-bold text-[var(--dark)] mt-1">{formatINR(data.total_cost)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Appreciation</p><p className="text-xl font-bold mt-1" style={{ color: data.total_appreciation >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatINR(data.total_appreciation)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Return</p><p className="text-xl font-bold mt-1" style={{ color: data.appreciation_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>{data.appreciation_pct >= 0 ? '+' : ''}{data.appreciation_pct}%</p></div>
        </div>

        {showForm && (
          <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="property-form">
            <div className="grid grid-cols-2 gap-3">
              <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Property name" required className={input} data-testid="property-name" />
              <select value={f.property_type} onChange={e => setF({ ...f, property_type: e.target.value })} className={input} data-testid="property-type">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <input type="number" step="1" value={f.purchase_price} onChange={e => setF({ ...f, purchase_price: e.target.value })} placeholder="Purchase price (₹)" required className={input} data-testid="property-cost" />
              <input type="number" step="1" value={f.current_value} onChange={e => setF({ ...f, current_value: e.target.value })} placeholder="Current value (₹)" required className={input} data-testid="property-value" />
              <input type="date" value={f.purchase_date} onChange={e => setF({ ...f, purchase_date: e.target.value })} required className={input} />
              <input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} placeholder="Location" className={input} />
            </div>
            <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-property-btn">Save Property</button>
          </form>
        )}

        {data.items.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No properties yet. Add one to track real estate wealth.</p></div> :
          data.items.map(p => (
            <div key={p.id} className="cashly-card p-5" data-testid={`property-${p.name}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[var(--cream-light)] flex items-center justify-center"><House size={20} className="text-[var(--coral)]" /></div><div><p className="text-sm font-bold text-[var(--dark)]">{p.name}</p><p className="text-[11px] text-[var(--muted)] capitalize">{p.property_type} · {p.location || 'No location'}</p></div></div>
                <button onClick={() => del(p.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div><p className="text-[var(--muted)] text-[10px]">Cost</p><p className="font-semibold text-[var(--dark)]">{formatINR(p.purchase_price)}</p></div>
                <div><p className="text-[var(--muted)] text-[10px]">Value</p><p className="font-semibold text-[var(--dark)]">{formatINR(p.current_value)}</p></div>
                <div><p className="text-[var(--muted)] text-[10px]">Gain</p><p className="font-semibold" style={{ color: p.appreciation >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatINR(p.appreciation)}</p></div>
                <div><p className="text-[var(--muted)] text-[10px]">Return</p><p className="font-semibold" style={{ color: p.appreciation_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>{p.appreciation_pct}%</p></div>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
};
