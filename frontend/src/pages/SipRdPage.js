import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, Bank, TrendUp } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

export const SipRdPage = () => {
  const nav = useNavigate();
  const [tab, setTab] = useState('sip_rd');
  const [sips, setSips] = useState({ items: [], total_monthly_commitment: 0, total_invested: 0, total_current_value: 0 });
  const [fds, setFds] = useState({ items: [], total_principal: 0, total_maturity: 0, total_interest: 0 });
  const [showForm, setShowForm] = useState(false);
  const [sf, setSf] = useState({ plan_type: 'SIP', name: '', monthly_amount: '', start_date: new Date().toISOString().slice(0, 10), tenure_months: '60', expected_return: '12', bank_or_amc: '' });
  const [ff, setFf] = useState({ bank: '', principal: '', interest_rate: '7.0', start_date: new Date().toISOString().slice(0, 10), tenure_months: '12', compounding: 'quarterly' });
  useEffect(() => { load(); }, []);
  const load = async () => { try { const [s, f] = await Promise.all([axios.get(`${API}/api/sip-rd`, { withCredentials: true }), axios.get(`${API}/api/fds`, { withCredentials: true })]); setSips(s.data); setFds(f.data); } catch {} };
  const saveSip = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/sip-rd`, { ...sf, monthly_amount: parseFloat(sf.monthly_amount), tenure_months: parseInt(sf.tenure_months), expected_return: parseFloat(sf.expected_return) }, { withCredentials: true }); toast.success('Plan added'); setShowForm(false); load(); } catch { toast.error('Failed'); } };
  const saveFd = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/fds`, { ...ff, principal: parseFloat(ff.principal), interest_rate: parseFloat(ff.interest_rate), tenure_months: parseInt(ff.tenure_months) }, { withCredentials: true }); toast.success('FD added'); setShowForm(false); load(); } catch { toast.error('Failed'); } };
  const delSip = async (id) => { await axios.delete(`${API}/api/sip-rd/${id}`, { withCredentials: true }); load(); };
  const delFd = async (id) => { await axios.delete(`${API}/api/fds/${id}`, { withCredentials: true }); load(); };

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="sip-rd-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">SIP · RD · FD Tracker</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2 px-4" data-testid="add-plan-btn"><Plus size={14} /> Add {tab === 'sip_rd' ? 'SIP/RD' : 'FD'}</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => { setTab('sip_rd'); setShowForm(false); }} className={`px-5 h-9 rounded-full text-xs font-semibold ${tab === 'sip_rd' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)]'}`} data-testid="tab-sip">SIP & RD</button>
          <button onClick={() => { setTab('fd'); setShowForm(false); }} className={`px-5 h-9 rounded-full text-xs font-semibold ${tab === 'fd' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)]'}`} data-testid="tab-fd">Fixed Deposits</button>
        </div>

        {tab === 'sip_rd' ? <>
          <div className="grid grid-cols-3 gap-3">
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Monthly Commitment</p><p className="text-xl font-bold text-[var(--dark)] mt-1" data-testid="sip-monthly">{formatINR(sips.total_monthly_commitment)}</p></div>
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Total Invested</p><p className="text-xl font-bold text-[var(--dark)] mt-1">{formatINR(sips.total_invested)}</p></div>
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Current Value</p><p className="text-xl font-bold text-[var(--green)] mt-1">{formatINR(sips.total_current_value)}</p></div>
          </div>
          {showForm && (
            <form onSubmit={saveSip} className="cashly-card p-5 space-y-3" data-testid="sip-form">
              <div className="flex gap-2">
                {['SIP', 'RD'].map(t => <button type="button" key={t} onClick={() => setSf({ ...sf, plan_type: t })} className={`flex-1 h-10 rounded-xl text-xs font-semibold ${sf.plan_type === t ? 'bg-[var(--dark)] text-white' : 'bg-[var(--cream-light)] text-[var(--muted)]'}`}>{t}</button>)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={sf.name} onChange={e => setSf({ ...sf, name: e.target.value })} placeholder={sf.plan_type === 'SIP' ? 'Fund name' : 'RD name'} required className={input} data-testid="sip-name" />
                <input value={sf.bank_or_amc} onChange={e => setSf({ ...sf, bank_or_amc: e.target.value })} placeholder={sf.plan_type === 'SIP' ? 'AMC' : 'Bank'} className={input} />
                <input type="number" value={sf.monthly_amount} onChange={e => setSf({ ...sf, monthly_amount: e.target.value })} placeholder="Monthly ₹" required className={input} data-testid="sip-amount" />
                <input type="number" value={sf.tenure_months} onChange={e => setSf({ ...sf, tenure_months: e.target.value })} placeholder="Tenure (months)" required className={input} />
                <input type="date" value={sf.start_date} onChange={e => setSf({ ...sf, start_date: e.target.value })} required className={input} />
                <input type="number" step="0.1" value={sf.expected_return} onChange={e => setSf({ ...sf, expected_return: e.target.value })} placeholder="Expected return %" className={input} />
              </div>
              <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-sip-btn">Save Plan</button>
            </form>
          )}
          {sips.items.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No SIPs or RDs tracked yet.</p></div> :
            sips.items.map(s => (
              <div key={s.id} className="cashly-card p-5" data-testid={`sip-${s.name}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><TrendUp size={18} className="text-[var(--green)]" /></div><div><p className="text-sm font-bold text-[var(--dark)]">{s.name}</p><p className="text-[11px] text-[var(--muted)]">{s.plan_type} · {s.bank_or_amc || '—'} · {formatINR(s.monthly_amount)}/mo</p></div></div>
                  <button onClick={() => delSip(s.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><p className="text-[var(--muted)] text-[10px]">Installments</p><p className="font-semibold text-[var(--dark)]">{s.installments_paid}/{s.tenure_months}</p></div>
                  <div><p className="text-[var(--muted)] text-[10px]">Invested</p><p className="font-semibold text-[var(--dark)]">{formatINR(s.invested_so_far)}</p></div>
                  <div><p className="text-[var(--muted)] text-[10px]">Current</p><p className="font-semibold text-[var(--green)]">{formatINR(s.current_value)}</p></div>
                  <div><p className="text-[var(--muted)] text-[10px]">Maturity Proj.</p><p className="font-semibold text-[var(--dark)]">{formatINR(s.projected_maturity)}</p></div>
                </div>
                <div className="w-full h-1.5 bg-[var(--cream-light)] rounded-full overflow-hidden mt-3"><div className="h-full bg-[var(--green)] rounded-full" style={{ width: `${(s.installments_paid / s.tenure_months) * 100}%` }} /></div>
              </div>
            ))}
        </> : <>
          <div className="grid grid-cols-3 gap-3">
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Total Principal</p><p className="text-xl font-bold text-[var(--dark)] mt-1" data-testid="fd-principal">{formatINR(fds.total_principal)}</p></div>
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Total Maturity</p><p className="text-xl font-bold text-[var(--green)] mt-1">{formatINR(fds.total_maturity)}</p></div>
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Interest Earned</p><p className="text-xl font-bold text-[var(--coral)] mt-1">{formatINR(fds.total_interest)}</p></div>
          </div>
          {showForm && (
            <form onSubmit={saveFd} className="cashly-card p-5 space-y-3" data-testid="fd-form">
              <div className="grid grid-cols-2 gap-3">
                <input value={ff.bank} onChange={e => setFf({ ...ff, bank: e.target.value })} placeholder="Bank name" required className={input} data-testid="fd-bank" />
                <input type="number" value={ff.principal} onChange={e => setFf({ ...ff, principal: e.target.value })} placeholder="Principal (₹)" required className={input} data-testid="fd-principal-input" />
                <input type="number" step="0.1" value={ff.interest_rate} onChange={e => setFf({ ...ff, interest_rate: e.target.value })} placeholder="Interest rate %" required className={input} />
                <input type="number" value={ff.tenure_months} onChange={e => setFf({ ...ff, tenure_months: e.target.value })} placeholder="Tenure (months)" required className={input} />
                <input type="date" value={ff.start_date} onChange={e => setFf({ ...ff, start_date: e.target.value })} required className={input} />
                <select value={ff.compounding} onChange={e => setFf({ ...ff, compounding: e.target.value })} className={input}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
              </div>
              <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-fd-btn">Save FD</button>
            </form>
          )}
          {fds.items.length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No FDs tracked yet.</p></div> :
            fds.items.map(fd => (
              <div key={fd.id} className="cashly-card p-5" data-testid={`fd-${fd.bank}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#FFF4E8] flex items-center justify-center"><Bank size={18} className="text-[var(--coral)]" /></div><div><p className="text-sm font-bold text-[var(--dark)]">{fd.bank}</p><p className="text-[11px] text-[var(--muted)]">{fd.interest_rate}% · {fd.compounding} compounding · {fd.tenure_months}mo</p></div></div>
                  <div className="flex items-center gap-2">{fd.matured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--green)] text-white font-semibold">MATURED</span>}<button onClick={() => delFd(fd.id)} className="p-1 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button></div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><p className="text-[var(--muted)] text-[10px]">Principal</p><p className="font-semibold text-[var(--dark)]">{formatINR(fd.principal)}</p></div>
                  <div><p className="text-[var(--muted)] text-[10px]">Maturity</p><p className="font-semibold text-[var(--green)]">{formatINR(fd.maturity_amount)}</p></div>
                  <div><p className="text-[var(--muted)] text-[10px]">Interest</p><p className="font-semibold text-[var(--coral)]">{formatINR(fd.interest_earned)}</p></div>
                  <div><p className="text-[var(--muted)] text-[10px]">{fd.matured ? 'Matured on' : 'Days left'}</p><p className="font-semibold text-[var(--dark)]">{fd.matured ? fd.maturity_date : `${fd.days_to_maturity}d`}</p></div>
                </div>
              </div>
            ))}
        </>}
      </main>
    </div>
  );
};
