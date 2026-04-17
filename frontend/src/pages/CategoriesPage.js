import React, { useState, useEffect } from 'react';
import { Plus, Trash, ArrowLeft } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', type: 'expense', icon: '' });

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data } = await axios.get(`${API_URL}/api/categories`, { withCredentials: true }); setCategories(data); } catch { toast.error('Failed to load'); } finally { setLoading(false); } };
  const handleCreate = async (e) => { e.preventDefault(); if (!newCat.name.trim()) { toast.error('Name required'); return; } try { await axios.post(`${API_URL}/api/categories`, newCat, { withCredentials: true }); toast.success('Created!'); setNewCat({ name: '', type: 'expense', icon: '' }); setShowForm(false); fetch_(); } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await axios.delete(`${API_URL}/api/categories/${id}`, { withCredentials: true }); toast.success('Deleted'); fetch_(); } catch { toast.error('Failed'); } };

  const income = categories.filter(c => c.type === 'income');
  const expense = categories.filter(c => c.type === 'expense');

  return (
    <div className="min-h-screen bg-[var(--surface-0)] pb-20 md:pb-0" data-testid="categories-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-all text-[var(--text-secondary)]" data-testid="back-button"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Categories</h1>
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="h-9 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] text-sm font-semibold flex items-center gap-1.5 transition-all hover:opacity-90" data-testid="add-category-button"><Plus size={14} weight="bold" /> Add</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5 space-y-4" data-testid="category-form">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} placeholder="Category name" className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] outline-none" data-testid="category-name-input" />
              <select value={newCat.type} onChange={e => setNewCat({...newCat, type: e.target.value})} className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none" data-testid="category-type-select"><option value="income">Income</option><option value="expense">Expense</option></select>
              <input type="text" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})} placeholder="Icon emoji" className="h-10 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] outline-none" data-testid="category-icon-input" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="h-9 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] text-sm font-semibold" data-testid="save-category-button">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)]">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-[var(--accent-blue)] border-r-transparent"></div></div> : (
          <>
            {[{ title: 'Income Categories', data: income }, { title: 'Expense Categories', data: expense }].map(group => (
              <div key={group.title} className="bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{group.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.data.map(cat => (
                    <div key={cat.id || cat.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--surface-1)] transition-all group" data-testid={`category-${cat.name}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{cat.name}</p>
                          {cat.is_default && <p className="text-[10px] text-[var(--text-tertiary)]">Default</p>}
                        </div>
                      </div>
                      {!cat.is_default && <button onClick={() => handleDelete(cat.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--expense)]" data-testid={`delete-category-${cat.name}`}><Trash size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
};
