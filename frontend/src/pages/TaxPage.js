import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, Calendar, UploadSimple, ReceiptX, Info } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";
const SECTIONS = [
  { code: '80C', name: '80C — Investments & Savings', desc: 'PPF, ELSS, EPF, Life Insurance, Home Loan Principal', limit: 150000 },
  { code: '80D', name: '80D — Health Insurance', desc: 'Medical insurance premium (self + parents)', limit: 75000 },
  { code: '80CCD(1B)', name: '80CCD(1B) — NPS', desc: 'Additional NPS contribution over 80C', limit: 50000 },
  { code: '80E', name: '80E — Education Loan', desc: 'Interest on education loan (no limit)', limit: 0 },
  { code: '80G', name: '80G — Donations', desc: 'Donations to approved charities', limit: 0 },
  { code: '80TTA', name: '80TTA — Savings Interest', desc: 'Interest from savings accounts', limit: 10000 },
  { code: '24(b)', name: '24(b) — Home Loan Interest', desc: 'Interest on self-occupied home loan', limit: 200000 },
];

const currentFy = () => { const d = new Date(); const y = d.getFullYear(); return d.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`; };

export const TaxPage = () => {
  const nav = useNavigate();
  const [tab, setTab] = useState('deductions');
  const [fy, setFy] = useState(currentFy());
  const [deductions, setDeductions] = useState({ sections: {}, total_claimed: 0, estimated_tax_saved: 0 });
  const [calendar, setCalendar] = useState([]);
  const [itr, setItr] = useState({ buckets: {}, total_income: 0 });
  const [form26as, setForm26as] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ section: '80C', name: '', amount: '', financial_year: currentFy(), notes: '' });
  const fileRef = useRef();

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [fy]);
  const load = async () => {
    try {
      const [d, c, i, f26] = await Promise.all([
        axios.get(`${API}/api/deductions/${fy}`, { withCredentials: true }),
        axios.get(`${API}/api/tax-calendar/${fy}`, { withCredentials: true }),
        axios.get(`${API}/api/itr-summary/${fy}`, { withCredentials: true }),
        axios.get(`${API}/api/tax/form26as`, { withCredentials: true }),
      ]);
      setDeductions(d.data); setCalendar(c.data.events); setItr(i.data); setForm26as(f26.data);
    } catch {}
  };
  const submit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/api/deductions`, { ...f, amount: parseFloat(f.amount), financial_year: fy }, { withCredentials: true }); toast.success('Deduction added'); setShowForm(false); setF({ section: '80C', name: '', amount: '', financial_year: fy, notes: '' }); load(); } catch { toast.error('Failed'); } };
  const del = async (id) => { await axios.delete(`${API}/api/deductions/${id}`, { withCredentials: true }); load(); };
  const upload26AS = async (e) => { const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); try { toast.info('Parsing PDF…'); await axios.post(`${API}/api/tax/form26as/upload`, fd, { withCredentials: true }); toast.success('Form 26AS parsed'); load(); } catch { toast.error('Upload failed'); } };

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="tax-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Tax & Compliance</h1>
          <div className="flex-1" />
          <select value={fy} onChange={e => setFy(e.target.value)} className="h-9 px-3 border border-[var(--border)] rounded-xl text-xs bg-white" data-testid="fy-select">
            {['2023-24', '2024-25', '2025-26', '2026-27'].map(y => <option key={y} value={y}>FY {y}</option>)}
          </select>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {[['deductions', '80C / 80D'], ['calendar', 'Tax Calendar'], ['itr', 'ITR Summary'], ['form26as', 'Form 26AS']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 h-9 rounded-full text-xs font-semibold whitespace-nowrap ${tab === v ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)]'}`} data-testid={`tab-${v}`}>{l}</button>
          ))}
        </div>

        {tab === 'deductions' && <>
          <div className="grid grid-cols-2 gap-3">
            <div className="cashly-card p-4"><p className="text-[11px] text-[var(--muted)] uppercase">Total Claimed</p><p className="text-xl font-bold text-[var(--dark)] mt-1" data-testid="total-claimed">{formatINR(deductions.total_claimed)}</p></div>
            <div className="cashly-card p-4 bg-[#E8F5EE]"><p className="text-[11px] text-[#2D7A5B] uppercase">Est. Tax Saved (30%)</p><p className="text-xl font-bold text-[var(--green)] mt-1">{formatINR(deductions.estimated_tax_saved)}</p></div>
          </div>

          <button onClick={() => setShowForm(!showForm)} className="btn-coral text-xs py-2.5 px-5" data-testid="add-deduction-btn"><Plus size={14} /> Add Deduction</button>

          {showForm && (
            <form onSubmit={submit} className="cashly-card p-5 space-y-3" data-testid="deduction-form">
              <div className="grid grid-cols-2 gap-3">
                <select value={f.section} onChange={e => setF({ ...f, section: e.target.value })} className={input}>{SECTIONS.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}</select>
                <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. LIC Premium" required className={input} />
                <input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} placeholder="Amount (₹)" required className={input} data-testid="deduction-amount" />
                <input value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} placeholder="Notes" className={input} />
              </div>
              <button type="submit" className="w-full btn-coral h-10 text-xs" data-testid="save-deduction-btn">Save Deduction</button>
            </form>
          )}

          {SECTIONS.map(s => {
            const d = deductions.sections[s.code] || { total: 0, items: [], limit: s.limit, remaining: s.limit, utilization_pct: 0 };
            const pct = s.limit > 0 ? Math.min((d.total / s.limit) * 100, 100) : 0;
            return (
              <div key={s.code} className="cashly-card p-5" data-testid={`section-${s.code}`}>
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-sm font-bold text-[var(--dark)]">{s.name}</p><p className="text-[11px] text-[var(--muted)]">{s.desc}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-[var(--dark)]">{formatINR(d.total)}</p>{s.limit > 0 && <p className="text-[10px] text-[var(--muted)]">of {formatINR(s.limit)} limit</p>}</div>
                </div>
                {s.limit > 0 && <><div className="w-full h-2 bg-[var(--cream-light)] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'var(--coral)' }} /></div><p className="text-[10px] text-[var(--muted)] mt-1">{d.utilization_pct || 0}% utilized · {formatINR(d.remaining || 0)} remaining</p></>}
                {d.items && d.items.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3">
                    {d.items.map(it => (
                      <div key={it.id} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">{it.name}{it.notes ? ` · ${it.notes}` : ''}</span>
                        <div className="flex items-center gap-2"><span className="font-semibold text-[var(--dark)]">{formatINR(it.amount)}</span><button onClick={() => del(it.id)} className="p-0.5 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={12} /></button></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>}

        {tab === 'calendar' && (
          <div className="space-y-3">
            <div className="cashly-card p-4 bg-[#FFF4E8] border border-[var(--coral)]/30 text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <Info size={16} className="text-[var(--coral)] mt-0.5 flex-shrink-0" />
              <p>Stay on top of every tax deadline for FY {fy}. Set reminders for events approaching.</p>
            </div>
            {calendar.map((e, i) => {
              const color = e.status === 'past' ? '#90A4AE' : e.status === 'due_soon' ? 'var(--red)' : 'var(--coral)';
              return (
                <div key={i} className={`cashly-card p-4 border-l-4 ${e.status === 'past' ? 'opacity-60' : ''}`} style={{ borderLeftColor: color }} data-testid={`event-${i}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--cream-light)] flex items-center justify-center flex-shrink-0"><Calendar size={18} style={{ color }} /></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between"><p className="text-sm font-bold text-[var(--dark)]">{e.title}</p><span className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: color }}>{e.status === 'past' ? 'PAST' : e.status === 'due_soon' ? 'DUE SOON' : 'UPCOMING'}</span></div>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">{e.description}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold">{e.date}{e.days_until >= 0 ? ` · in ${e.days_until} days` : ` · ${Math.abs(e.days_until)} days ago`}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'itr' && (
          <div className="space-y-3">
            <div className="cashly-card p-5">
              <p className="text-[11px] text-[var(--muted)] uppercase">Total Taxable Income (FY {fy})</p>
              <p className="text-3xl font-bold text-[var(--dark)] mt-1" data-testid="itr-total">{formatINR(itr.total_income)}</p>
              <p className="text-[11px] text-[var(--muted)] mt-1">Auto-categorized from your transactions</p>
            </div>
            {Object.keys(itr.buckets).length === 0 ? <div className="cashly-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No transactions found for this financial year. Add income entries in the Transactions page to auto-populate.</p></div> :
              Object.entries(itr.buckets).map(([bucket, v]) => (
                <div key={bucket} className="cashly-card p-4" data-testid={`bucket-${bucket}`}>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-bold text-[var(--dark)] capitalize">{bucket.replace(/_/g, ' ')}</p><p className="text-[11px] text-[var(--muted)]">{v.count} transactions</p></div>
                    <p className="text-base font-bold text-[var(--dark)]">{formatINR(v.amount)}</p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === 'form26as' && (
          <div className="space-y-3">
            <div className="cashly-card p-5 text-center border-2 border-dashed border-[var(--border)] hover:border-[var(--coral)] transition-colors" data-testid="26as-upload-box">
              <ReceiptX size={36} className="mx-auto text-[var(--coral)] mb-2" />
              <p className="text-sm font-bold text-[var(--dark)]">Upload Form 26AS</p>
              <p className="text-xs text-[var(--muted)] mt-1 mb-3">We extract TDS entries automatically</p>
              <input type="file" accept="application/pdf" ref={fileRef} onChange={upload26AS} className="hidden" />
              <button onClick={() => fileRef.current.click()} className="btn-coral text-xs py-2 px-5" data-testid="upload-26as-btn"><UploadSimple size={14} /> Choose PDF</button>
            </div>
            {form26as.length === 0 ? <div className="cashly-card p-6 text-center"><p className="text-xs text-[var(--muted)]">No 26AS uploads yet. Upload to parse your TDS entries.</p></div> :
              form26as.map(doc => (
                <div key={doc.id} className="cashly-card p-5" data-testid={`26as-${doc.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div><p className="text-sm font-bold text-[var(--dark)]">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p><p className="text-[11px] text-[var(--muted)]">{doc.entries?.length || 0} TDS entries parsed</p></div>
                    <div className="text-right"><p className="text-[10px] text-[var(--muted)] uppercase">Total TDS</p><p className="text-base font-bold text-[var(--coral)]">{formatINR(doc.total_tds)}</p></div>
                  </div>
                  {doc.entries && doc.entries.length > 0 && (
                    <div className="space-y-1 border-t border-[var(--border)] pt-3 max-h-64 overflow-y-auto">
                      {doc.entries.slice(0, 20).map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1">
                          <span className="text-[var(--text-secondary)] truncate pr-2">{e.description}</span>
                          <span className="font-semibold text-[var(--dark)] flex-shrink-0">{formatINR(e.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
};
