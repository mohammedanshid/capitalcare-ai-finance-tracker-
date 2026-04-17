import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

const PIE_COLORS_LIGHT = ['#0F172A', '#334155', '#64748B', '#94A3B8', '#CBD5E1'];
const PIE_COLORS_DARK = ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'];

export const ChartsSection = ({ transactions }) => {
  const { theme } = useTheme();
  const [mobileChart, setMobileChart] = useState(0); // 0=bar, 1=pie
  const pieColors = theme === 'dark' ? PIE_COLORS_DARK : PIE_COLORS_LIGHT;

  const monthlyData = useMemo(() => {
    const m = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!m[month]) m[month] = { month, income: 0, expenses: 0 };
      if (t.type === 'income') m[month].income += t.amount; else m[month].expenses += t.amount;
    });
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const expenseData = useMemo(() => {
    const c = {};
    transactions.forEach(t => { if (t.type === 'expense') c[t.category] = (c[t.category] || 0) + t.amount; });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (transactions.length === 0) return null;

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
    borderRadius: '8px', fontSize: '12px',
    color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
  };
  const axisColor = theme === 'dark' ? '#64748B' : '#94A3B8';

  const BarChartCard = () => (
    <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5" data-testid="bar-chart-container">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={monthlyData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
          <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="income" fill={theme === 'dark' ? '#34D399' : '#10B981'} name="Income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill={theme === 'dark' ? '#F87171' : '#EF4444'} name="Expenses" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const PieChartCard = () => (
    <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5" data-testid="pie-chart-container">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Expense Breakdown</h3>
      {expenseData.length > 0 ? (
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} dataKey="value">
                {expenseData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={v => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {expenseData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="text-[var(--text-secondary)]">{entry.name}</span>
                </div>
                <span className="font-medium text-[var(--text-primary)] tabular-nums">${entry.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-sm text-[var(--text-tertiary)]">No expense data</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop: side-by-side ── */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-4">
        <div className="col-span-8"><BarChartCard /></div>
        <div className="col-span-4"><PieChartCard /></div>
      </div>

      {/* ── Mobile: swipeable cards ── */}
      <div className="sm:hidden" data-testid="charts-mobile">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Charts</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileChart(0)} className={`p-1.5 rounded-md transition-all ${mobileChart === 0 ? 'bg-[var(--surface-2)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
              <CaretLeft size={16} />
            </button>
            <span className="text-xs text-[var(--text-tertiary)]">{mobileChart === 0 ? 'Trends' : 'Breakdown'}</span>
            <button onClick={() => setMobileChart(1)} className={`p-1.5 rounded-md transition-all ${mobileChart === 1 ? 'bg-[var(--surface-2)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
              <CaretRight size={16} />
            </button>
          </div>
        </div>
        {mobileChart === 0 ? <BarChartCard /> : <PieChartCard />}
        <div className="flex justify-center gap-1.5 mt-3">
          <span className={`w-1.5 h-1.5 rounded-full transition-all ${mobileChart === 0 ? 'bg-[var(--accent-blue)]' : 'bg-[var(--surface-3)]'}`} />
          <span className={`w-1.5 h-1.5 rounded-full transition-all ${mobileChart === 1 ? 'bg-[var(--accent-blue)]' : 'bg-[var(--surface-3)]'}`} />
        </div>
      </div>
    </>
  );
};
