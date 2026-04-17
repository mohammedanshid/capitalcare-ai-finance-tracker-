import React, { useState, useEffect } from 'react';
import { Plus, Trash, ArrowLeft, ArrowsClockwise } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const RecurringPage = () => {
  const navigate = useNavigate();
  const [recurring, setRecurring] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [nr, setNr] = useState({ type: 'expense', amount: '', category: '', description: '', frequency: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const [r, c] = await Promise.all([axios.get(`${API_URL}/api/recurring-transactions`, { withCredentials: true }), axios.get(`${API_URL}/api/categories`, { withCredentials: true })]); setRecurring(r.data); setCategories(c.data); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const handleCreate = async (e) => { e.preventDefault(); if (!nr.category || !nr.amount) { toast.error('Fill required fields'); return; } try { await axios.post(`${API_URL}/api/recurring-transactions`, { ...nr, amount: parseFloat(nr.amount) }, { withCredentials: true }); toast.success('Created!'); setNr({ type: 'expense', amount: '', category: '', description: '', frequency: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' }); setShowForm(false); fetchData(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await axios.delete(`${API_URL}/api/recurring-transactions/${id}`, { withCredentials: true }); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };
  const handleProcess = async () => { setProcessing(true); try { const { data } = await axios.post(`${API_URL}/api/recurring-transactions/process`, {}, { withCredentials: true }); toast.success(data.message); fetchData(); } catch { toast.error('Failed'); } finally { setProcessing(false); } };

  const catOpts = categories.filter(c => c.type === nr.type);

  return (
    <div className="min-h-screen bg-[var(--surface-0)] pb-20 md:pb-0" data-testid="recurring-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-all text-[var(--text-secondary)]" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Recurring</h1>
          <div className="flex-1" />
          <button onClick={handleProcess} disabled={processing} className="h-9 px-4 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40" data-testid="process-recurring-button"><ArrowsClockwise size={14} weight="bold" /> {processing ? '...' : 'Process'}</button>
          <button onClick={() => setShowForm(!showForm)} className="h-9 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] text-sm font-semibold flex items-center gap-1.5" data-testid="add-recurring-button"><Plus size={14} weight="bold" /> Add</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5 space-y-4" data-testid="recurring-form">
            <div className="flex gap-2 p-1 bg-[var(--surface-2)] rounded-lg">
              {['income', 'expense'].map(t => (
                <button key={t} type="button" onClick={() => setNr({...nr, type: t, category: ''})}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${nr.type === t ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-tertiary)]'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="number" step="0.01" min="0.01" value={nr.amount} onChange={e => setNr({...nr, amount: e.target.value})} placeholder="Amount" required className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] outline-none" data-testid="recurring-amount-input" />
              <select value={nr.category} onChange={e => setNr({...nr, category: e.target.value})} required className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none" data-testid="recurring-category-select"><option value="">Select category</option>{catOpts.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}</select>
              <select value={nr.frequency} onChange={e => setNr({...nr, frequency: e.target.value})} className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none" data-testid="recurring-frequency-select"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
              <input type="date" value={nr.start_date} onChange={e => setNr({...nr, start_date: e.target.value})} required className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none" data-testid="recurring-start-date-input" />
            </div>
            <input type="text" value={nr.description} onChange={e => setNr({...nr, description: e.target.value})} placeholder="Description (optional)" className="w-full h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] outline-none" data-testid="recurring-description-input" />
            <div className="flex gap-2">
              <button type="submit" className="h-9 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] text-sm font-semibold" data-testid="save-recurring-button">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)]">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-[var(--accent-blue)] border-r-transparent"></div></div> : recurring.length === 0 ? (
          <div className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-8 text-center"><p className="text-sm text-[var(--text-tertiary)]">No recurring transactions. Create one above.</p></div>
        ) : (
          <div className="space-y-3">
            {recurring.map(r => (
              <div key={r.id} className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-4 transition-all hover:shadow-[var(--shadow-md)]" data-testid={`recurring-${r.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${r.type === 'income' ? 'bg-[var(--income)]' : 'bg-[var(--expense)]'}`} />
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{r.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-tertiary)] uppercase font-medium">{r.frequency}</span>
                    </div>
                    {r.description && <p className="text-xs text-[var(--text-tertiary)] ml-4">{r.description}</p>}
                    <p className="text-xs text-[var(--text-tertiary)] ml-4 mt-1">Next: {r.next_occurrence}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-base font-bold tabular-nums ${r.type === 'income' ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>
                      {r.type === 'income' ? '+' : '-'}${r.amount.toFixed(2)}
                    </p>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--expense)]" data-testid={`delete-recurring-${r.id}`}><Trash size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
