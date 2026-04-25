import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { House, Receipt, Target, ChartLine, UserCircle, SignOut, Robot, DownloadSimple, Sparkle, Lock, Crown } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { formatINR } from '../utils/inr';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { UpgradeModal } from '../components/UpgradeModal';
import { hasAccess, requiredPlanFor } from '../utils/plan';

// ✅ IMPORT GLOBAL API (replaces axios)
import api from '../api';

const PIE_COLORS = ['#F4845F','#4CAF85','#FFB74D','#90A4AE','#E0E0E0'];

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState(null);
  const plan = user?.plan || 'free';

  useEffect(() => { fetchAll(); }, []);

  // ✅ SIMPLIFIED: only the 2 endpoints your backend actually has
  const fetchAll = async () => {
    try {
      console.log("📊 Fetching all dashboard data...");

      const [dash, tx] = await Promise.all([
        api.get("/api/dashboard"),
        api.get("/api/transactions"),
      ]);

      console.log("📊 Dashboard data:", dash.data);
      console.log("💳 Transactions:", tx.data);

      // ✅ merge transactions into dashboard object so UI can use both
      setD({ ...dash.data, transactions: tx.data });

    } catch (err) {
      console.log("❌ Dashboard fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (fmt) => {
    try {
      console.log(`📤 Exporting as ${fmt}...`);
      const r = await api.get(`/api/export/individual/${fmt}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${fmt}`;
      a.click();
      console.log(`✅ Export ${fmt} success`);
    } catch (err) {
      console.log("❌ Export error:", err);
    }
  };

  const MiniSpark = ({ data: sd, color }) => {
    if (!sd || sd.length < 2) return null;
    return (
      <AreaChart data={sd.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gs${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#gs${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    );
  };

  // ✅ Uses balance/income/expenses — the fields your /api/dashboard actually returns
  const kpis = d ? [
    { label: 'Total Balance',    value: d.balance,  spark: [], color: 'var(--dark)' },
    { label: 'Monthly Income',   value: d.income,   spark: [], color: 'var(--green)' },
    { label: 'Monthly Expenses', value: d.expenses, spark: [], color: 'var(--coral)' },
    { label: 'Savings Growth',   value: d.balance,  spark: [], color: 'var(--green)',
      suffix: d.savings_rate > 0 ? ` (${d.savings_rate}%)` : '' },
  ] : [];

  return (
    <div className="pb-20">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="flex items-center justify-between h-14 max-w-5xl mx-auto px-4">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--coral)] flex items-center justify-center text-white text-xs font-black">CC</div>
            <span className="font-extrabold text-[var(--dark)] text-sm">Capital Care AI</span>
          </div>

          <div className="flex items-center gap-2">

            {user?.is_admin && (
              <button
                onClick={() => nav('/admin')}
                className="flex items-center gap-1 h-7 px-2 rounded-full bg-[var(--dark)] text-white text-[10px] font-bold uppercase tracking-wider hover"
                data-testid="admin-link"
                title="Admin Panel"
              >
                Admin
              </button>
            )}

            {/* Plan Badge */}
            <button
              onClick={() => plan === 'free' ? nav('/pricing') : null}
              className={`hidden sm:flex items-center gap-1 h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${plan === 'elite' ? 'text-white' :
                  plan === 'pro'   ? 'bg-[var(--coral)] text-white' :
                  'bg-[var(--cream-light)] text-[var(--muted)] border border-[var(--border)] hover:bg-white'}`}
              style={plan === 'elite' ? { background: 'linear-gradient(135deg,#FFD700,#FFA500)' } : {}}
              data-testid="plan-badge"
            >
              {plan === 'elite' && <Crown size={10} weight="fill" />} {plan}
            </button>

            {/* AI Chat */}
            <button
              onClick={() => {
                if (!hasAccess(plan, 'ai_chat')) { setGateFeature('ai_chat'); return; }
                setChatOpen(true);
              }}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--coral)] hover transition-all relative"
              data-testid="open-chat"
              title="AI Assistant"
            >
              <Robot size={20} />
              {!hasAccess(plan, 'ai_chat') && (
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#FFD700,#FFA500)' }}>
                  <Lock size={6} weight="fill" className="text-white" />
                </span>
              )}
            </button>

            {/* Export */}
            <div className="relative group">
              <button
                onClick={() => { if (!hasAccess(plan, 'export_pdf_csv')) setGateFeature('export_pdf_csv'); }}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--dark)] hover transition-all relative"
                data-testid="export-button"
              >
                <DownloadSimple size={20} />
                {!hasAccess(plan, 'export_pdf_csv') && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#FFD700,#FFA500)' }}>
                    <Lock size={6} weight="fill" className="text-white" />
                  </span>
                )}
              </button>
              {hasAccess(plan, 'export_pdf_csv') && (
                <div className="absolute right-0 top-10 bg-white border border-[var(--border)] rounded-2xl shadow-lg py-1 w-36 hidden group-hover:block z-50">
                  <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--cream-light)]" data-testid="export-csv">Export CSV</button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--cream-light)]" data-testid="export-pdf">Export PDF</button>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); nav('/login'); }}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--dark)] hover transition-all"
              data-testid="logout-button"
            >
              <SignOut size={20} />
            </button>

          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--coral)] border-r-transparent" />
          </div>

        ) : d ? (
          <>
            {/* Greeting */}
            <div>
              <p className="text-xs text-[var(--muted)]">Good morning,</p>
              <h2 className="text-xl font-extrabold text-[var(--dark)]">{user?.name || 'User'}</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {kpis.map((k, i) => (
                <div key={k.label} className={`cashly-card animate-fade-up stagger-${i + 1} p-4`}
                  data-testid={`kpi-${k.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <p className="text-[10px] text-[var(--muted)] font-medium mb-1">{k.label}</p>
                  <p className="text-lg sm:text-xl font-bold tabular-nums" style={{ color: k.color }}>
                    {k.suffix ? `${formatINR(k.value)}${k.suffix}` : formatINR(k.value)}
                  </p>
                  {k.spark && k.spark.length > 0 && (
                    <div className="mt-2">
                      <MiniSpark
                        data={k.spark}
                        color={
                          k.color === 'var(--dark)'  ? '#1A1A1A' :
                          k.color === 'var(--green)' ? '#4CAF85' : '#F4845F'
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Charts Row — only renders when backend sends this data */}
            {(d.monthly_series?.length > 0 || d.category_breakdown?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {d.monthly_series?.length > 0 && (
                  <div className="lg:col-span-2 cashly-card p-5" data-testid="line-chart">
                    <h3 className="text-sm font-bold text-[var(--dark)] mb-4">Income vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={d.monthly_series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#999', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#999', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          formatter={v => [formatINR(v)]}
                        />
                        <Line type="monotone" dataKey="income"   stroke="#4CAF85" strokeWidth={2.5} dot={{ r: 4, fill: '#4CAF85' }} />
                        <Line type="monotone" dataKey="expenses" stroke="#F4845F" strokeWidth={2.5} dot={{ r: 4, fill: '#F4845F' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {d.category_breakdown?.length > 0 && (
                  <div className="cashly-card p-5" data-testid="donut-chart">
                    <h3 className="text-sm font-bold text-[var(--dark)] mb-4">Spending Breakdown</h3>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={d.category_breakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                          {d.category_breakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                      {d.category_breakdown.slice(0, 5).map((c, i) => (
                        <div key={c.name} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-[var(--text-secondary)]">{c.name}</span>
                          </div>
                          <span className="font-semibold text-[var(--dark)] tabular-nums">{formatINR(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Transactions */}
            {d.transactions?.length > 0 && (
              <div className="cashly-card p-5" data-testid="transactions-list">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[var(--dark)]">Recent Transactions</h3>
                  <button onClick={() => nav('/transactions')} className="text-xs text-[var(--coral)] font-semibold">View all</button>
                </div>
                {d.transactions.slice(0, 5).map((t, i) => (
                  <div key={t._id || i} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm
                        ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {t.type === 'income' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--dark)]">{t.title}</p>
                        <p className="text-[10px] text-[var(--muted)]">{t.category}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums
                      ${t.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--coral)]'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Goals Preview — only if backend returns goals */}
            {d.goals?.length > 0 && (
              <div className="cashly-card p-5" data-testid="goals-preview">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[var(--dark)]">Savings Goals</h3>
                  <button onClick={() => nav('/goals')} className="text-xs text-[var(--coral)] font-semibold">View all</button>
                </div>
                {d.goals.slice(0, 2).map(g => {
                  const pct = g.target > 0 ? Math.min((g.saved / g.target) * 100, 100) : 0;
                  return (
                    <div key={g.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--dark)] font-medium">{g.name}</span>
                        <span className="text-[var(--muted)] tabular-nums">{formatINR(g.saved)} / {formatINR(g.target)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-[var(--cream-light)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--coral)] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Plan / Subscription Card */}
            <div className="cashly-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" data-testid="plan-card">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: plan === 'elite' ? 'linear-gradient(135deg,#FFD700,#FFA500)' :
                                plan === 'pro'   ? 'var(--coral)' : 'var(--cream-light)',
                    border: plan === 'free' ? '1px solid var(--border)' : 'none'
                  }}>
                  {plan === 'elite'
                    ? <Crown size={22} weight="fill" className="text-white" />
                    : <Sparkle size={22} weight={plan === 'pro' ? 'fill' : 'regular'}
                        className={plan === 'pro' ? 'text-white' : 'text-[var(--muted)]'} />
                  }
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Your Plan</p>
                  <p className="text-lg font-bold text-[var(--dark)] capitalize">
                    {plan}{plan === 'elite' && ' · Priority Support'}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {plan === 'free'
                      ? 'Upgrade to unlock Pro and Elite features.'
                      : plan === 'pro'
                      ? 'Upgrade to Elite for Investments, Net Worth and AI Chat.'
                      : 'All features unlocked. Thank you for being Elite!'}
                  </p>
                </div>
              </div>
              {plan !== 'elite' && (
                <button
                  onClick={() => nav('/pricing')}
                  className="btn-coral text-xs py-2.5 px-5 whitespace-nowrap"
                  data-testid="upgrade-cta-card"
                >
                  {plan === 'free' ? 'Upgrade your plan' : 'Upgrade to Elite'}
                </button>
              )}
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3" data-testid="quick-access-grid">
              {[
                { label: 'Budgets',       path: '/budgets',      emoji: '📊', feature: 'budgets' },
                { label: 'Zero Budget',   path: '/zero-budget',  emoji: '🎯', feature: 'zero_budget' },
                { label: 'Loans & EMI',   path: '/loans',        emoji: '🏦', feature: 'loans' },
                { label: 'Credit Cards',  path: '/credit-cards', emoji: '💳', feature: 'credit_cards' },
                { label: 'Debt Payoff',   path: '/debt-payoff',  emoji: '⚡', feature: 'debt_payoff' },
                { label: 'Investments',   path: '/investments',  emoji: '📈', feature: 'investments' },
                { label: 'Real Estate',   path: '/real-estate',  emoji: '🏠', feature: 'real_estate' },
                { label: 'Net Worth',     path: '/net-worth',    emoji: '💎', feature: 'net_worth' },
                { label: 'SIP · RD · FD',path: '/sip-rd',       emoji: '🌱', feature: 'sip_rd' },
                { label: 'Savings Jars',  path: '/jars',         emoji: '🫙', feature: 'jars_unlimited' },
                { label: 'Lend & Borrow', path: '/lend-borrow',  emoji: '🤝', feature: 'lend_borrow' },
                { label: 'Tax & 80C',     path: '/tax',          emoji: '🧾', feature: 'tax_basic' },
              ].map(item => {
                const unlocked = item.feature === 'jars_unlimited' ? true : hasAccess(plan, item.feature);
                const isLocked = !unlocked;
                const required = requiredPlanFor(item.feature);
                const gold = required === 'elite';
                const handle = () => {
                  if (isLocked) { setGateFeature(item.feature); }
                  else { nav(item.path); }
                };
                return (
                  <button
                    key={item.label}
                    onClick={handle}
                    className={`cashly-card p-4 text-center relative transition-all border
                      ${isLocked ? 'border-transparent opacity-70 hover:opacity-95' : 'border-transparent hover:border-[var(--coral)]'}`}
                    data-testid={`quick-${item.label.toLowerCase().replace(/\s/g, '-').replace(/·/g, '')}`}
                  >
                    {isLocked && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: gold ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 'var(--muted)' }}
                        data-testid={`lock-${item.feature}`}>
                        <Lock size={10} weight="fill" className="text-white" />
                      </span>
                    )}
                    <span className="text-2xl block mb-1">{item.emoji}</span>
                    <p className="text-xs font-semibold text-[var(--dark)]">{item.label}</p>
                  </button>
                );
              })}
            </div>

          </>
        ) : (
          <p className="text-center text-[var(--muted)] py-10">
            Welcome! Add your first transaction to get started.
          </p>
        )}
      </main>

      {/* AI Chat Drawer */}
      <AIChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} persona="individual" />

      {/* Upgrade Gate Modal */}
      <UpgradeModal
        open={!!gateFeature}
        onClose={() => setGateFeature(null)}
        feature={gateFeature}
        requiredPlan={gateFeature ? requiredPlanFor(gateFeature) : 'pro'}
      />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[var(--border)]"
        data-testid="bottom-nav">
        <div className="flex items-center justify-around h-16 max-w-5xl mx-auto">
          {[
            { icon: House,      label: 'Home',         path: '/dashboard' },
            { icon: Receipt,    label: 'Transactions', path: '/transactions' },
            { icon: Target,     label: 'Goals',        path: '/goals' },
            { icon: ChartLine,  label: 'Reports',      path: '/dashboard' },
            { icon: UserCircle, label: 'Profile',      path: '/dashboard' },
          ].map(i => (
            <button
              key={i.label}
              onClick={() => nav(i.path)}
              className={`flex flex-col items-center gap-0.5 w-16 py-1 transition-all
                ${window.location.pathname === i.path ? 'text-[var(--coral)]' : 'text-[var(--muted)]'}`}
              data-testid={`nav-${i.label.toLowerCase()}`}
            >
              <i.icon size={22} weight={window.location.pathname === i.path ? 'fill' : 'regular'} />
              <span className="text-[10px] font-medium">{i.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
};
