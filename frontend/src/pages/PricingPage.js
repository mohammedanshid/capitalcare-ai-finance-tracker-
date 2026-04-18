import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from '@phosphor-icons/react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from '@phosphor-icons/react';

const tiers = [
  { id: 'individual', name: 'Individual', price: '₹99', period: '/month', color: '#1D9E75', features: ['Expense tracking','Savings goals','AI insights','Monthly reports','Bank SMS parsing'], cta: 'Start Free Trial' },
  { id: 'shop_owner', name: 'Shop Owner', price: '₹299', period: '/month', color: '#EF9F27', features: ['Cash ledger','Sales tracking','P&L reports','GST summary','UPI auto-detect','Inventory basics'], cta: 'Start Free Trial', popular: true },
  { id: 'ca', name: 'Accountant (CA)', price: '₹999', period: '/month', color: '#185FA5', features: ['Unlimited clients','Full financial statements','GST/TDS/ITR prep','Client portal','Bulk export','Multi-currency'], cta: 'Start Free Trial' },
];

export const PricingPage = () => {
  const nav = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--p-bg)] py-6 px-4" data-testid="pricing-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={()=>nav(-1)} className="p-2 rounded-lg hover:bg-[var(--p-border-subtle)]" data-testid="back-button"><ArrowLeft size={18}/></button>
          <button onClick={toggleTheme} className="p-2 rounded-lg text-[var(--p-text-muted)] hover:bg-[var(--p-border-subtle)]">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
        </div>
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-[var(--p-text-muted)] uppercase tracking-widest mb-2">Pricing</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--p-text)] font-['Outfit'] mb-2">Simple, transparent pricing</h1>
          <p className="text-sm text-[var(--p-text-secondary)]">Choose the plan that fits your needs</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {tiers.map(t => (
            <div key={t.id} className={`relative bg-[var(--p-surface)] border-2 ${t.popular?'border-[var(--p-primary)]':'border-[var(--p-border)]'} rounded-xl p-6 flex flex-col`} data-testid={`tier-${t.id}`}>
              {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--p-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</span>}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{background:`${t.color}15`}}>
                <span className="text-lg" style={{color:t.color}}>₹</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--p-text)] font-['Outfit']">{t.name}</h3>
              <div className="flex items-baseline gap-0.5 my-3">
                <span className="text-3xl font-extrabold text-[var(--p-text)] tabular-nums">{t.price}</span>
                <span className="text-xs text-[var(--p-text-muted)]">{t.period}</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {t.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[var(--p-text-secondary)]">
                    <Check size={14} weight="bold" style={{color:t.color}}/> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full h-10 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90" style={{background:t.color}} data-testid={`cta-${t.id}`}>{t.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
