import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, CreditCard, Warning } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

export const LoansPage = () => {
  const nav = useNavigate();
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAmort, setShowAmort] = useState(null);
  const [amortData, setAmortData] = useState([]);
  const [prepayAmt, setPrepayAmt] = useState('');
  const [prepayResult, setPrepayResult] = useState(null);
  const [form, setForm] = useState({ loan_type: 'Personal', principal: '', interest_rate: '', tenure_months: '', emi_amount: '', start_date: '', bank_name: '' });
  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data } = await axios.get(`${API}/api/loans`, { withCredentials: true }); setLoans(data); } catch {} };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/loans`, { ...form, principal: parseFloat(form.principal), interest_rate: parseFloat(form.interest_rate), tenure_months: parseInt(form.tenure_months), emi_amount: parseFloat(form.emi_amount) }, { withCredentials: true }); toast.success('Loan added!'); setShowForm(false); fetch_(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const del = async (id) => { try { await axios.delete(`${API}/api/loans/${id}`, { withCredentials: true }); fetch_(); } catch {} };
  const viewAmort = async (id) => { try { const { data } = await axios.get(`${API}/api/loans/${id}/amortization`, { withCredentials: true }); setAmortData(data); setShowAmort(id); } catch {} };
  const simulate = async (id) => { if (!prepayAmt) return; try { const { data } = await axios.post(`${API}/api/loans/${id}/prepay-simulate`, { amount: parseFloat(prepayAmt) }, { withCredentials: true }); setPrepayResult(data); } catch {} };
  const inputClass = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="loans-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Loans & EMI</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-loan-btn"><Plus size={14} /> Add Loan</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="loan-form">
            <div className="grid grid-cols-2 gap-3">
              <select value={form.loan_type} onChange={e => setForm(f => ({ ...f, loan_type: e.target.value }))} className={inputClass}>{['Home','Car','Personal','Education','Gold'].map(t => <option key={t} value={t}>{t}</option>)}</select>
              <input type="text" value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="Bank name" className={inputClass} />
              <input type="number" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} placeholder="Principal (₹)" required className={inputClass} data-testid="loan-principal" />
              <input type="number" step="0.01" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} placeholder="Interest rate %" required className={inputClass} />
              <input type="number" value={form.tenure_months} onChange={e => setForm(f => ({ ...f, tenure_months: e.target.value }))} placeholder="Tenure (months)" required className={inputClass} />
              <input type="number" value={form.emi_amount} onChange={e => setForm(f => ({ ...f, emi_amount: e.target.value }))} placeholder="EMI amount (₹)" required className={inputClass} />
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required className={`${inputClass} col-span-2`} />
            </div>
            <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-loan-btn">Add Loan</button>
          </form>
        )}
        {loans.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No loans tracked. Add your first loan above.</p></div> :
          loans.map(l => (
            <div key={l.id} className="cashly-card p-5" data-testid={`loan-${l.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2"><CreditCard size={18} className="text-[var(--coral)]" /><div><p className="text-sm font-bold text-[var(--dark)]">{l.loan_type} Loan{l.bank_name ? ` — ${l.bank_name}` : ''}</p><p className="text-[10px] text-[var(--muted)]">{l.interest_rate}% p.a. · {l.tenure_months} months</p></div></div>
                <button onClick={() => del(l.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {[{ l: 'Principal', v: formatINR(l.principal) }, { l: 'EMI', v: formatINR(l.emi_amount) }, { l: 'Remaining', v: formatINR(l.principal_remaining) }, { l: 'Interest Paid', v: formatINR(l.total_interest_paid) }].map(k => (
                  <div key={k.l} className="bg-[var(--cream-light)] rounded-xl p-2.5"><p className="text-[9px] text-[var(--muted)]">{k.l}</p><p className="text-xs font-bold text-[var(--dark)] tabular-nums">{k.v}</p></div>
                ))}
              </div>
              <div className="flex justify-between text-xs mb-1.5"><span className="text-[var(--text-secondary)]">EMIs paid: {l.emis_paid}/{l.emis_total}</span>{l.next_emi_date && <span className="text-[var(--coral)]">Next: {l.next_emi_date}</span>}</div>
              <div className="w-full h-2 bg-[var(--cream-light)] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[var(--coral)]" style={{ width: `${(l.emis_paid / l.emis_total) * 100}%` }} /></div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => viewAmort(l.id)} className="flex-1 h-8 rounded-full border border-[var(--border)] text-xs font-medium text-[var(--dark)] hover:border-[var(--coral)]" data-testid={`amort-${l.id}`}>Amortization</button>
                <div className="flex-1 flex gap-1">
                  <input type="number" value={showAmort === l.id ? prepayAmt : ''} onChange={e => { setPrepayAmt(e.target.value); setShowAmort(l.id); }} placeholder="Prepay ₹" className="flex-1 h-8 bg-[var(--cream-light)] border border-[var(--border)] rounded-full px-3 text-xs focus:border-[var(--coral)] outline-none" />
                  <button onClick={() => simulate(l.id)} className="h-8 px-3 rounded-full bg-[var(--green)] text-white text-xs font-medium">Simulate</button>
                </div>
              </div>
              {prepayResult && showAmort === l.id && (
                <div className="mt-2 bg-[var(--green-light)] rounded-xl p-3 text-xs text-[var(--green)]">
                  Prepaying {formatINR(parseFloat(prepayAmt))} saves <strong>{prepayResult.months_saved} months</strong> and <strong>{formatINR(prepayResult.interest_saved)}</strong> in interest!
                </div>
              )}
              {showAmort === l.id && amortData.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto border border-[var(--border)] rounded-xl">
                  <table className="w-full text-[10px]"><thead className="bg-[var(--cream-light)] sticky top-0"><tr><th className="p-2 text-left">Month</th><th className="p-2 text-right">EMI</th><th className="p-2 text-right">Principal</th><th className="p-2 text-right">Interest</th><th className="p-2 text-right">Balance</th></tr></thead>
                    <tbody>{amortData.slice(0, 24).map(r => <tr key={r.month} className="border-t border-[var(--border)]"><td className="p-2">{r.month}</td><td className="p-2 text-right tabular-nums">{formatINR(r.emi)}</td><td className="p-2 text-right tabular-nums">{formatINR(r.principal)}</td><td className="p-2 text-right tabular-nums">{formatINR(r.interest)}</td><td className="p-2 text-right tabular-nums">{formatINR(r.balance)}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        }
      </main>
    </div>
  );
};
