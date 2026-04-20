import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, PiggyBank, Buildings, ChartLineUp, CreditCard, HandCoins } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

const ASSET_META = {
  cash: { label: 'Cash (Net Income)', icon: Wallet, color: '#4CAF85' },
  savings_goals: { label: 'Savings Goals', icon: PiggyBank, color: '#F4845F' },
  investments: { label: 'Investments', icon: ChartLineUp, color: '#7086FD' },
  real_estate: { label: 'Real Estate', icon: Buildings, color: '#E0A96D' },
  money_lent: { label: 'Money Lent', icon: HandCoins, color: '#FFB74D' },
};
const LIAB_META = {
  loans: { label: 'Loans Outstanding', color: '#EF4444' },
  credit_cards: { label: 'Credit Card Dues', color: '#F97316' },
  money_borrowed: { label: 'Money Borrowed', color: '#EA5C4E' },
};

export const NetWorthPage = () => {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  useEffect(() => { (async () => { try { const { data } = await axios.get(`${API}/api/net-worth`, { withCredentials: true }); setData(data); } catch {} })(); }, []);
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-[var(--cream-light)]"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--coral)] border-r-transparent" /></div>;

  const assetData = Object.entries(data.assets).filter(([, v]) => v > 0).map(([k, v]) => ({ name: ASSET_META[k]?.label || k, value: v, color: ASSET_META[k]?.color || '#999' }));
  const liabData = Object.entries(data.liabilities).filter(([, v]) => v > 0).map(([k, v]) => ({ name: LIAB_META[k]?.label || k, value: v, color: LIAB_META[k]?.color || '#999' }));

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-6" data-testid="net-worth-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--dark)]">Net Worth Tracker</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="cashly-card p-6 bg-gradient-to-br from-[var(--dark)] to-[#1a2332] text-white">
          <p className="text-xs uppercase tracking-wider text-white/60">Your Net Worth</p>
          <p className="text-4xl font-bold mt-1" data-testid="net-worth-value" style={{ color: data.net_worth >= 0 ? '#4CAF85' : '#EF4444' }}>{formatINR(data.net_worth)}</p>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div><p className="text-[11px] text-white/60 uppercase">Total Assets</p><p className="text-lg font-semibold text-[#4CAF85]">{formatINR(data.total_assets)}</p></div>
            <div><p className="text-[11px] text-white/60 uppercase">Total Liabilities</p><p className="text-lg font-semibold text-[#FF9B8F]">{formatINR(data.total_liabilities)}</p></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Assets */}
          <div className="cashly-card p-5">
            <p className="text-sm font-bold text-[var(--dark)] mb-3">Assets Breakdown</p>
            {assetData.length > 0 ? <>
              <div className="w-full h-48"><ResponsiveContainer><PieChart><Pie data={assetData} dataKey="value" innerRadius={45} outerRadius={75}>{assetData.map((a, i) => <Cell key={i} fill={a.color} />)}</Pie></PieChart></ResponsiveContainer></div>
              <div className="space-y-2 mt-3">
                {Object.entries(data.assets).map(([k, v]) => {
                  const M = ASSET_META[k]; if (!M) return null;
                  return <div key={k} className="flex items-center justify-between text-sm" data-testid={`asset-${k}`}><span className="flex items-center gap-2"><M.icon size={16} style={{ color: M.color }} /><span className="text-[var(--dark)]">{M.label}</span></span><span className="font-semibold text-[var(--dark)]">{formatINR(v)}</span></div>;
                })}
              </div>
            </> : <p className="text-xs text-[var(--muted)] py-6 text-center">Add transactions, investments, or properties to see your assets.</p>}
          </div>
          {/* Liabilities */}
          <div className="cashly-card p-5">
            <p className="text-sm font-bold text-[var(--dark)] mb-3">Liabilities Breakdown</p>
            {liabData.length > 0 ? <>
              <div className="w-full h-48"><ResponsiveContainer><PieChart><Pie data={liabData} dataKey="value" innerRadius={45} outerRadius={75}>{liabData.map((a, i) => <Cell key={i} fill={a.color} />)}</Pie></PieChart></ResponsiveContainer></div>
              <div className="space-y-2 mt-3">
                {Object.entries(data.liabilities).map(([k, v]) => {
                  const M = LIAB_META[k]; if (!M) return null;
                  return <div key={k} className="flex items-center justify-between text-sm" data-testid={`liability-${k}`}><span className="flex items-center gap-2"><CreditCard size={16} style={{ color: M.color }} /><span className="text-[var(--dark)]">{M.label}</span></span><span className="font-semibold text-[var(--dark)]">{formatINR(v)}</span></div>;
                })}
              </div>
            </> : <p className="text-xs text-[var(--muted)] py-6 text-center">No liabilities. Great job!</p>}
          </div>
        </div>

        <div className="cashly-card p-5">
          <p className="text-sm font-bold text-[var(--dark)] mb-3">Quick Insights</p>
          <div className="space-y-2 text-xs text-[var(--text-secondary)]">
            {data.total_assets > 0 && <p>Your debt-to-asset ratio is <span className="font-semibold text-[var(--dark)]">{((data.total_liabilities / data.total_assets) * 100).toFixed(1)}%</span>. {(data.total_liabilities / data.total_assets) < 0.4 ? 'Healthy.' : 'Consider reducing liabilities.'}</p>}
            {data.net_worth > 0 && <p>You're on the positive side of the net worth equation — keep it up!</p>}
            {data.net_worth < 0 && <p>Your liabilities exceed your assets. Focus on debt reduction and saving.</p>}
          </div>
        </div>
      </main>
    </div>
  );
};
