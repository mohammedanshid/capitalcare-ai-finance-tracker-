import React, { useState, useEffect } from 'react';
import { Plus } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const TransactionForm = ({ onTransactionAdded }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const cats = categories.filter(c => c.type === type);
    if (cats.length > 0 && !cats.find(c => c.name === category)) setCategory(cats[0].name);
  }, [type, categories]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`, { withCredentials: true });
      setCategories(data);
      const exp = data.filter(c => c.type === 'expense');
      if (exp.length > 0) setCategory(exp[0].name);
    } catch (e) { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/transactions`, { type, amount: parseFloat(amount), category, description, date }, { withCredentials: true });
      toast.success('Transaction added');
      setAmount(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]);
      onTransactionAdded();
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to add'); }
    finally { setLoading(false); }
  };

  const typeCats = categories.filter(c => c.type === type);

  return (
    <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5" data-testid="transaction-form">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-[var(--surface-2)] rounded-lg">
          {['income', 'expense'].map(t => (
            <button key={t} type="button"
              onClick={() => { setType(t); const cats = categories.filter(c => c.type === t); if (cats.length) setCategory(cats[0].name); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === t ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-tertiary)]'}`}
              data-testid={`type-${t}-button`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Amount</label>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all"
              placeholder="0.00" required data-testid="amount-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all appearance-none"
              data-testid="category-select">
              {typeCats.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all"
              required data-testid="date-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Note</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all"
              placeholder="Optional description" data-testid="description-input" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full h-10 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="add-transaction-button">
          <Plus size={16} weight="bold" />
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};
