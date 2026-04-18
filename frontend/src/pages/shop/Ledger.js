import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash } from '@phosphor-icons/react';
import { formatINR } from '../../utils/inr';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

export const ShopLedger = () => {
  const nav = useNavigate();
  const [entries, setEntries] = useState([]);
  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data } = await axios.get(`${API}/api/shop/ledger`, { withCredentials: true }); setEntries(data); } catch {} };
  const del = async (id) => { try { await axios.delete(`${API}/api/shop/entry/${id}`, { withCredentials: true }); fetch_(); } catch {} };

  // Group by date
  const grouped = {};
  entries.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });

  return (
    <div className="min-h-screen bg-[var(--p-bg)] pb-6" data-persona="shop_owner" data-testid="shop-ledger">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b-2 border-[var(--p-border)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={()=>nav('/shop')} className="p-2 rounded-md hover:bg-[var(--p-border-subtle)]" data-testid="back-button"><ArrowLeft size={18}/></button>
          <h1 className="text-lg font-extrabold text-[var(--p-text)] font-['Outfit']">Cash Ledger</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {Object.keys(grouped).length === 0 ? <p className="text-center text-xs text-[var(--p-text-muted)] py-10">No ledger entries yet.</p> :
          Object.entries(grouped).sort((a,b)=>b[0].localeCompare(a[0])).map(([date, items]) => {
            const dayCredit = items.filter(e=>e.entry_type==='credit').reduce((s,e)=>s+e.amount,0);
            const dayDebit = items.filter(e=>e.entry_type==='debit').reduce((s,e)=>s+e.amount,0);
            return (
              <div key={date} className="bg-[var(--p-surface)] border-2 border-[var(--p-border)] rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[var(--p-text)]">{date}</p>
                  <p className="text-xs font-bold tabular-nums" style={{color:dayCredit-dayDebit>=0?'#1D9E75':'#EF4444'}}>Net: {formatINR(dayCredit-dayDebit)}</p>
                </div>
                <div className="space-y-2">
                  {items.map(e=>(
                    <div key={e.id} className="flex items-center gap-3 py-1.5 border-b border-[var(--p-border-subtle)] last:border-0">
                      <span className="text-[10px] text-[var(--p-text-muted)] w-10">{e.time}</span>
                      <div className="flex-1"><p className="text-xs font-medium text-[var(--p-text)]">{e.category}{e.note?` — ${e.note}`:''}</p></div>
                      <p className={`text-xs font-bold tabular-nums ${e.entry_type==='credit'?'text-[#1D9E75]':'text-[#EF4444]'}`}>{e.entry_type==='credit'?'+':'-'}{formatINR(e.amount)}</p>
                      <button onClick={()=>del(e.id)} className="p-1 text-[var(--p-text-muted)] hover:text-[#EF4444]"><Trash size={12}/></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        }
      </main>
    </div>
  );
};
