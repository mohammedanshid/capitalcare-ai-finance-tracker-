import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Star, ShieldCheck } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

const TIERS = {
  monthly: [
    { id: 'free', planId: null, name: 'Free', price: '$0', period: '/forever', color: 'var(--dark)', features: ['Basic expense tracking', '50 transactions/month', '1 savings goal', 'Monthly PDF report'], cta: 'Current Plan', disabled: true },
    { id: 'pro', planId: 'pro_monthly', name: 'Pro', price: '$9.99', period: '/month', color: 'var(--coral)', popular: true, features: ['Unlimited transactions', 'All budget categories', '10 savings goals + auto-save', 'SIP / RD / FD tracker', 'Loan & EMI tracker', 'Credit card manager', 'Tax deduction tracker', 'AI health score', 'Weekly digest', 'Export PDF + CSV'], cta: 'Upgrade to Pro' },
    { id: 'elite', planId: 'elite_monthly', name: 'Elite', price: '$19.99', period: '/month', color: 'var(--dark)', dark: true, features: ['Everything in Pro', 'Investment portfolio', 'Net worth tracker', 'AI chat (unlimited)', 'Debt payoff calculator', 'Form 26AS upload', 'Priority support', 'Early access'], cta: 'Go Elite', badge: 'Best Value' },
  ],
  yearly: [
    { id: 'free', planId: null, name: 'Free', price: '$0', period: '/forever', color: 'var(--dark)', features: ['Basic expense tracking', '50 transactions/month', '1 savings goal', 'Monthly PDF report'], cta: 'Current Plan', disabled: true },
    { id: 'pro', planId: 'pro_yearly', name: 'Pro', price: '$95.99', period: '/year', color: 'var(--coral)', popular: true, save: '20%', features: ['Unlimited transactions', 'All budget categories', '10 savings goals + auto-save', 'SIP / RD / FD tracker', 'Loan & EMI tracker', 'Credit card manager', 'Tax deduction tracker', 'AI health score', 'Weekly digest', 'Export PDF + CSV'], cta: 'Upgrade to Pro' },
    { id: 'elite', planId: 'elite_yearly', name: 'Elite', price: '$191.99', period: '/year', color: 'var(--dark)', dark: true, save: '20%', features: ['Everything in Pro', 'Investment portfolio', 'Net worth tracker', 'AI chat (unlimited)', 'Debt payoff calculator', 'Form 26AS upload', 'Priority support', 'Early access'], cta: 'Go Elite', badge: 'Best Value' },
  ],
};

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription at any time. No questions asked.' },
  { q: 'Is my data safe?', a: 'Absolutely. All data is encrypted and we never share your information with third parties.' },
  { q: 'Do you offer refunds?', a: 'We offer a full refund within the first 7 days of any paid plan.' },
  { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately.' },
  { q: 'Is there a free trial?', a: 'The Free plan is available forever. Pro and Elite features can be tried with our 7-day money-back guarantee.' },
];

export const PricingPage = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => { fetchPlan(); }, []);
  const fetchPlan = async () => { try { const { data } = await axios.get(`${API}/api/user/plan`, { withCredentials: true }); setUserPlan(data.plan || 'free'); } catch {} };

  const handleUpgrade = async (planId) => {
    if (!planId || !user) { nav('/login'); return; }
    setLoading(planId);
    try {
      const origin = window.location.origin;
      const { data } = await axios.post(`${API}/api/payments/checkout`, { plan_id: planId, origin_url: origin }, { withCredentials: true });
      if (data.url) window.location.href = data.url;
    } catch (err) { alert(err.response?.data?.detail || 'Payment failed'); }
    finally { setLoading(null); }
  };

  const tiers = TIERS[billing];

  return (
    <div className="min-h-screen bg-[var(--cream-light)] py-6 px-4" data-testid="pricing-page">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--dark)] mb-8" data-testid="back-button"><ArrowLeft size={16} /> Back</button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 text-xs text-[var(--coral)] font-semibold mb-3">{[1,2,3,4,5].map(i => <Star key={i} size={12} weight="fill" className="text-amber-400" />)} Trusted by 200k+ users</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--dark)] tracking-tight mb-3">Simple, honest pricing</h1>
          <p className="text-base text-[var(--text-secondary)] mb-6">Start free. Upgrade when you're ready.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-white rounded-full shadow-sm border border-[var(--border)]" data-testid="billing-toggle">
            <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${billing === 'monthly' ? 'bg-[var(--dark)] text-white' : 'text-[var(--muted)]'}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-[var(--dark)] text-white' : 'text-[var(--muted)]'}`}>Yearly <span className="bg-[var(--green)] text-white text-[9px] px-1.5 py-0.5 rounded-full">Save 20%</span></button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {tiers.map(t => (
            <div key={t.id} className={`relative rounded-[20px] p-6 flex flex-col transition-all ${t.dark ? 'bg-[var(--dark)] text-white' : 'cashly-card'} ${t.popular ? 'ring-2 ring-[var(--coral)]' : ''}`} data-testid={`tier-${t.id}`}>
              {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--coral)] text-white text-[10px] font-bold px-4 py-1 rounded-full">Most Popular</span>}
              {t.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-4 py-1 rounded-full">{t.badge}</span>}
              <h3 className={`text-lg font-bold ${t.dark ? 'text-white' : 'text-[var(--dark)]'}`}>{t.name}</h3>
              <div className="flex items-baseline gap-0.5 my-3">
                <span className={`text-3xl font-extrabold tabular-nums ${t.dark ? 'text-white' : 'text-[var(--dark)]'}`}>{t.price}</span>
                <span className={`text-xs ${t.dark ? 'text-white/50' : 'text-[var(--muted)]'}`}>{t.period}</span>
                {t.save && <span className="ml-2 bg-[var(--green)] text-white text-[9px] px-2 py-0.5 rounded-full">-{t.save}</span>}
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {t.features.map(f => <li key={f} className={`flex items-center gap-2 text-xs ${t.dark ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}><Check size={14} weight="bold" className="text-[var(--green)]" /> {f}</li>)}
              </ul>
              <button onClick={() => t.planId && handleUpgrade(t.planId)} disabled={t.disabled || loading === t.planId || userPlan === t.id}
                className={`w-full h-11 rounded-full text-sm font-semibold transition-all ${t.disabled || userPlan === t.id ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : t.dark ? 'bg-white text-[var(--dark)] hover:bg-gray-100' : t.popular ? 'bg-[var(--coral)] text-white hover:bg-[var(--coral-hover)]' : 'bg-[var(--dark)] text-white hover:bg-[var(--dark-hover)]'} disabled:opacity-50`}
                data-testid={`cta-${t.id}`}>
                {loading === t.planId ? 'Processing...' : userPlan === t.id ? 'Current Plan' : t.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-xl font-extrabold text-[var(--dark)] text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQ.map((f, i) => (
              <div key={i} className="cashly-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-4 flex justify-between items-center" data-testid={`faq-${i}`}>
                  <span className="text-sm font-semibold text-[var(--dark)]">{f.q}</span>
                  <span className="text-[var(--muted)]">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-4"><p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.a}</p></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] pb-8">
          <ShieldCheck size={16} className="text-[var(--green)]" />
          Secured by Stripe · Cancel anytime · No hidden fees
        </div>
      </div>
    </div>
  );
};
