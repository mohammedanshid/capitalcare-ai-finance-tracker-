import React, { useState, useEffect } from 'react';
import { Plus, Trash, ArrowLeft, Warning, CheckCircle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const BudgetsPage = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nb, setNb] = useState({ category: '', limit: '', period: 'monthly' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const [b, c] = await Promise.all([axios.get(`${API_URL}/api/budgets`, { withCredentials: true }), axios.get(`${API_URL}/api/categories`, { withCredentials: true })]); setBudgets(b.data); setCategories(c.data.filter(c => c.type === 'expense')); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const handleCreate = async (e) => { e.preventDefault(); if (!nb.category || !nb.limit) { toast.error('Fill all fields'); return; } try { await axios.post(`${API_URL}/api/budgets`, { category: nb.category, limit: parseFloat(nb.limit), period: nb.period }, { withCredentials: true }); toast.success('Created!'); setNb({ category: '', limit: '', period: 'monthly' }); setShowForm(false); fetchData(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await axios.delete(`${API_URL}/api/budgets/${id}`, { withCredentials: true }); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };

  const statusColor = (s) => s === 'exceeded' ? 'var(--expense)' : s === 'warning' ? '#F59E0B' : 'var(--income)';

  return (
    <div className="min-h-screen bg-[var(--surface-0)] pb-20 md:pb-0" data-testid="budgets-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-all text-[var(--text-secondary)]" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Budgets</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="h-9 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] text-sm font-semibold flex items-center gap-1.5 transition-all hover:opacity-90" data-testid="add-budget-button"><Plus size={14} weight="bold" /> Add</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5 space-y-4" data-testid="budget-form">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={nb.category} onChange={e => setNb({...nb, category: e.target.value})} className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none" data-testid="budget-category-select">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>
              <input type="number" step="0.01" min="0.01" value={nb.limit} onChange={e => setNb({...nb, limit: e.target.value})} placeholder="Monthly limit" className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] outline-none" data-testid="budget-limit-input" />
              <select value={nb.period} onChange={e => setNb({...nb, period: e.target.value})} className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none" data-testid="budget-period-select"><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option></select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="h-9 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] text-sm font-semibold" data-testid="save-budget-button">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)]">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-[var(--accent-blue)] border-r-transparent"></div></div> : budgets.length === 0 ? (
          <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No budgets set. Create your first one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map(b => (
              <div key={b.id} className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5 transition-all hover:shadow-[var(--shadow-md)]" data-testid={`budget-${b.category}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {b.status === 'exceeded' ? <Warning size={16} weight="fill" style={{ color: statusColor(b.status) }} /> : b.status === 'warning' ? <Warning size={16} weight="fill" style={{ color: statusColor(b.status) }} /> : <CheckCircle size={16} weight="fill" style={{ color: statusColor(b.status) }} />}
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{b.category}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] capitalize">{b.period}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--expense)]" data-testid={`delete-budget-${b.category}`}><Trash size={14} /></button>
                </div>
                <div className="flex items-baseline justify-between text-xs text-[var(--text-secondary)] mb-2">
                  <span>Spent</span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(b.percentage, 100)}%`, backgroundColor: statusColor(b.status) }} />
                </div>
                <p className="text-[10px] text-right mt-1" style={{ color: statusColor(b.status) }}>{b.percentage}%</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
