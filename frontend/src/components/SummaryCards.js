import React from 'react';
import { TrendUp, TrendDown, Wallet } from '@phosphor-icons/react';

export const SummaryCards = ({ summary }) => {
  const cards = [
    { title: 'Total Income', value: summary.total_income, icon: TrendUp, color: 'var(--income)', bg: 'var(--income-bg)', testId: 'total-income-card' },
    { title: 'Total Expenses', value: summary.total_expenses, icon: TrendDown, color: 'var(--expense)', bg: 'var(--expense-bg)', testId: 'total-expenses-card' },
    { title: 'Balance', value: summary.balance, icon: Wallet, color: summary.balance >= 0 ? 'var(--income)' : 'var(--expense)', bg: summary.balance >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)', testId: 'balance-card' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div key={card.title}
          className={`animate-fade-up stagger-${i + 1} bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5 transition-all hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)]`}
          data-testid={card.testId}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{card.title}</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
              <card.icon size={16} weight="bold" style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: card.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ${Math.abs(card.value).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};
