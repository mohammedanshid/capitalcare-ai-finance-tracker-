import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, Calculator } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;
const input = "w-full h-10 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] outline-none";

export const DebtPayoffPage = () => {
  const nav = useNavigate();
  const [debts, setDebts] = useState([{ name: 'Credit Card', balance: 50000, interest_rate: 36, min_payment: 2500 }]);
  const [extra, setExtra] = useState(5000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (i, k, v) => { const d = [...debts]; d[i] = { ...d[i], [k]: k === 'name' ? v : (parseFloat(v) || 0) }; setDebts(d); };
  const add = () => setDebts([...debts, { name: '', balance: 0, interest_rate: 0, min_payment: 0 }]);
  const remove = (i) => setDebts(debts.filter((_, idx) => idx !== i));

  const simulate = async () => {
    if (debts.some(d => !d.name || d.balance <= 0 || d.min_payment <= 0)) { toast.error('Fill in all debt details'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/debt-payoff/simulate`, { debts, extra_monthly: extra, strategy: 'both' }, { withCredentials: true });
      setResult(data);
    } catch (e) { toast.error('Simulation failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="debt-payoff-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Debt Payoff Calculator</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="cashly-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--dark)]">Your Debts</p>
            <button onClick={add} className="text-xs text-[var(--coral)] font-semibold flex items-center gap-1" data-testid="add-debt-btn"><Plus size={14} /> Add Debt</button>
          </div>
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 text-[10px] uppercase text-[var(--muted)] font-semibold pl-1">
            <span>Name</span><span>Balance</span><span>Rate %</span><span>Min Pay</span><span></span>
          </div>
          {debts.map((d, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2" data-testid={`debt-row-${i}`}>
              <input value={d.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Debt name" className={input} />
              <input type="number" value={d.balance} onChange={e => update(i, 'balance', e.target.value)} className={input} />
              <input type="number" step="0.1" value={d.interest_rate} onChange={e => update(i, 'interest_rate', e.target.value)} className={input} />
              <input type="number" value={d.min_payment} onChange={e => update(i, 'min_payment', e.target.value)} className={input} />
              <button onClick={() => remove(i)} className="p-2 text-[var(--muted)] hover:text-[var(--red)]"><Trash size={14} /></button>
            </div>
          ))}
          <div className="border-t border-[var(--border)] pt-3">
            <label className="text-xs font-semibold text-[var(--dark)]">Extra Monthly Payment (₹)</label>
            <input type="number" value={extra} onChange={e => setExtra(parseFloat(e.target.value) || 0)} className={`${input} mt-1.5`} data-testid="extra-input" />
          </div>
          <button onClick={simulate} disabled={loading} className="w-full btn-coral h-11" data-testid="simulate-btn"><Calculator size={16} /> {loading ? 'Simulating…' : 'Compare Strategies'}</button>
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-4" data-testid="payoff-results">
            <StrategyCard title="Avalanche" subtitle="Highest interest rate first" data={result.avalanche} badge="Saves most interest" badgeColor="var(--green)" />
            <StrategyCard title="Snowball" subtitle="Smallest balance first" data={result.snowball} badge="Quick wins" badgeColor="#F59E0B" />
            <div className="cashly-card p-5 md:col-span-2 bg-[#FFF4E8] border border-[var(--coral)]/30">
              <p className="text-sm font-bold text-[var(--dark)] mb-2">Our Recommendation</p>
              {result.interest_saved_by_avalanche > 0 ?
                <p className="text-xs text-[var(--text-secondary)]">The <span className="font-semibold text-[var(--dark)]">Avalanche</span> method saves you <span className="font-semibold text-[var(--green)]">{formatINR(result.interest_saved_by_avalanche)}</span> in interest {result.months_saved_by_avalanche > 0 ? `and ${result.months_saved_by_avalanche} months of payments` : ''}. Mathematically optimal — but Snowball has psychological wins if you need motivation.</p> :
                <p className="text-xs text-[var(--text-secondary)]">Both strategies give similar results for your debts. Pick Snowball for motivation or Avalanche for math optimality.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StrategyCard = ({ title, subtitle, data, badge, badgeColor }) => (
  <div className="cashly-card p-5" data-testid={`strategy-${title.toLowerCase()}`}>
    <div className="flex items-start justify-between mb-3">
      <div><p className="text-base font-bold text-[var(--dark)]">{title} Method</p><p className="text-[11px] text-[var(--muted)]">{subtitle}</p></div>
      <span className="text-[10px] px-2 py-1 rounded-full font-semibold text-white" style={{ background: badgeColor }}>{badge}</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><span className="text-[var(--text-secondary)]">Time to freedom</span><span className="font-bold text-[var(--dark)]">{data.months_to_payoff} months</span></div>
      <div className="flex justify-between text-sm"><span className="text-[var(--text-secondary)]">Total interest</span><span className="font-bold text-[var(--red)]">{formatINR(data.total_interest)}</span></div>
      <div className="flex justify-between text-sm"><span className="text-[var(--text-secondary)]">Total paid</span><span className="font-bold text-[var(--dark)]">{formatINR(data.total_paid)}</span></div>
    </div>
    <div className="border-t border-[var(--border)] mt-3 pt-3">
      <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Payoff Order</p>
      <div className="flex flex-wrap gap-1.5">{data.payoff_order.map((n, i) => <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-[var(--cream-light)] text-[var(--dark)]">{i + 1}. {n}</span>)}</div>
    </div>
  </div>
);
