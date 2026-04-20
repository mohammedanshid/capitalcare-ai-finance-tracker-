import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, ArrowUp, ArrowDown, Check } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

export const LendBorrowPage = () => {
  const nav = useNavigate();
  const [data, setData] = useState({ items: [], total_lent: 0, total_borrowed: 0, net: 0 });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [f, setF] = useState({ direction: 'lent', person: '', amount: '', date: new Date().toISOString().slice(0, 10), due_date: '', interest_rate: '0', notes: '' });
  useEffect(() => { load(); }, []);
  const load = async () => { try { const { data } = await axios.get(`${API}/api/lend-borrow`, { withCredentials: true }); setData(data); } catch {} };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/lend-borrow`, { ...f, amount: parseFloat(f.amount), interest_rate: parseFloat(f.interest_rate) || 0 }, { withCredentials: true }); toast.success('Entry added'); setShowForm(false); load(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const settle = async (id) => { await axios.patch(`${API}/api/lend-borrow/${id}`, { status: 'settled' }, { withCredentials: true }); toast.success('Marked settled'); load(); };
  const del = async (id) => { await axios.delete(`${API}/api/lend-borrow/${id}`, { withCredentials: true }); load(); };
  const items = filter === 'all' ? data.items : data.items.filter(i => i.direction === filter);

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="lend-borrow-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Lend & Borrow Log</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-entry-btn"><Plus size={14} /> Add Entry</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase flex items-center gap-1"><ArrowUp size={12} className="text-[var(--green)]" /> Lent Out</p><p className="text-xl font-bold text-[var(--green)] mt-1" data-testid="total-lent">{formatINR(data.total_lent)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase flex items-center gap-1"><ArrowDown size={12} className="text-[var(--red)]" /> Borrowed</p><p className="text-xl font-bold text-[var(--red)] mt-1" data-testid="total-borrowed">{formatINR(data.total_borrowed)}</p></div>
          <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Net Position</p><p className="text-xl font-bold mt-1" style={{ color: data.net >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatINR(data.net)}</p></div>
        </div>

        {showForm && (
          <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="entry-form">
            <div className="flex gap-2">
              <button type="button" onClick={() => setF({ ...f, direction: 'lent' })} className={`flex-1 h-10 rounded-xl text-xs font-semibold ${f.direction === 'lent' ? 'bg-[var(--dark)] text-white' : 'bg-[var(--cream-light)] text-[var(--muted)]'}`} data-testid="direction-lent">I Lent Money</button>
              <button type="button" onClick={() => setF({ ...f, direction: 'borrowed' })} className={`flex-1 h-10 rounded-xl text-xs font-semibold ${f.direction === 'borrowed' ? 'bg-[var(--dark)] text-white' : 'bg-[var(--cream-light)] text-[var(--muted)]'}`} data-testid="direction-borrowed">I Borrowed Money</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={f.person} onChange={e => setF({ ...f, person: e.target.value })} placeholder="Person name" required className={input} data-testid="person-input" />
              <input type="number" step="0.01" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} placeholder="Amount (₹)" required className={input} data-testid="amount-input" />
              <input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} required className={input} />
              <input type="date" value={f.due_date} onChange={e => setF({ ...f, due_date: e.target.value })} placeholder="Due date" className={input} />
              <input type="number" step="0.1" value={f.interest_rate} onChange={e => setF({ ...f, interest_rate: e.target.value })} placeholder="Interest rate %" className={input} />
              <input value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} placeholder="Notes" className={input} />
            </div>
            <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-entry-btn">Save Entry</button>
          </form>
        )}

        <div className="flex gap-2">
          {[['all', 'All'], ['lent', 'Lent'], ['borrowed', 'Borrowed']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-4 h-8 rounded-full text-xs font-semibold ${filter === v ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)]'}`} data-testid={`filter-${v}`}>{l}</button>
          ))}
        </div>

        {items.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No entries yet. Track who owes you and whom you owe.</p></div> :
          items.map(it => (
            <div key={it.id} className="cashly-card p-4" data-testid={`entry-${it.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${it.direction === 'lent' ? 'bg-[#E8F5EE]' : 'bg-[#FEEBEA]'}`}>
                    {it.direction === 'lent' ? <ArrowUp size={18} className="text-[var(--green)]" /> : <ArrowDown size={18} className="text-[var(--red)]" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--dark)]">{it.person}</p>
                    <p className="text-[11px] text-[var(--muted)]">{it.direction === 'lent' ? 'You lent' : 'You borrowed'} · {it.date}{it.due_date ? ` · due ${it.due_date}` : ''}{it.interest_rate > 0 ? ` · ${it.interest_rate}%` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right"><p className="text-sm font-bold text-[var(--dark)]">{formatINR(it.amount)}</p>{it.status === 'settled' && <span className="text-[10px] text-[var(--green)] font-semibold">SETTLED</span>}</div>
                  {it.status !== 'settled' && <button onClick={() => settle(it.id)} className="p-2 text-[var(--green)] hover:bg-[#E8F5EE] rounded-lg" title="Mark settled" data-testid={`settle-${it.id}`}><Check size={14} /></button>}
                  <button onClick={() => del(it.id)} className="p-2 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
                </div>
              </div>
              {it.notes && <p className="text-[11px] text-[var(--text-secondary)] mt-2 pl-13">{it.notes}</p>}
            </div>
          ))}
      </main>
    </div>
  );
};
