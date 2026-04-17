import React from 'react';
import { Trash } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const TransactionList = ({ transactions, onTransactionDeleted }) => {
  const handleDelete = async (transactionId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`${API_URL}/api/transactions/${transactionId}`, { withCredentials: true });
      toast.success('Deleted'); onTransactionDeleted();
    } catch { toast.error('Failed to delete'); }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-8 text-center" data-testid="transactions-empty-state">
        <p className="text-sm text-[var(--text-tertiary)]">No transactions yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5" data-testid="transactions-list">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Recent Transactions</h2>

      {/* ── Desktop: Table view ── */}
      <div className="hidden sm:block">
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-1)] transition-all group" data-testid={`transaction-item-${t.id}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-[var(--income)]' : 'bg-[var(--expense)]'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{t.category}{t.description ? ` — ${t.description}` : ''}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{t.date}</p>
              </div>
              <p className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </p>
              <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--expense)] hover:bg-[var(--expense-bg)] transition-all" data-testid={`delete-transaction-${t.id}`}>
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: Stacked cards ── */}
      <div className="sm:hidden space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="border border-[var(--border-default)] rounded-xl p-4" data-testid={`transaction-card-${t.id}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-[var(--income)]' : 'bg-[var(--expense)]'}`} />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.category}</span>
                </div>
                {t.description && <p className="text-xs text-[var(--text-tertiary)] ml-4">{t.description}</p>}
              </div>
              <p className={`text-base font-bold tabular-nums ${t.type === 'income' ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-tertiary)]">{t.date}</span>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md text-[var(--text-tertiary)] active:text-[var(--expense)] active:bg-[var(--expense-bg)] transition-all" data-testid={`delete-transaction-mobile-${t.id}`}>
                <Trash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
