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
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', icon: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`, { withCredentials: true });
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/categories`, newCategory, { withCredentials: true });
      toast.success('Category created!');
      setNewCategory({ name: '', type: 'expense', icon: '' });
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API_URL}/api/categories/${categoryId}`, { withCredentials: true });
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="categories-page">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#E4E4E7]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-[#F4F4F5] rounded-lg transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#09090B] font-['Outfit']">Categories</h1>
              <p className="text-sm text-[#52525B] font-['Manrope'] mt-1">Manage your transaction categories</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] flex items-center gap-2 font-['Manrope']"
            data-testid="add-category-button"
          >
            <Plus size={20} weight="bold" />
            Add Category
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#09090B] border-r-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Category Form */}
            {showForm && (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8" data-testid="category-form">
                <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">New Category</h2>
                <form onSubmit={handleCreate} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Name</label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        placeholder="Category name"
                        data-testid="category-name-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Type</label>
                      <select
                        value={newCategory.type}
                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        data-testid="category-type-select"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Icon (optional)</label>
                      <input
                        type="text"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        placeholder="🏷️"
                        data-testid="category-icon-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] font-['Manrope']"
                      data-testid="save-category-button"
                    >
                      Save Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-transparent text-[#09090B] border border-[#E4E4E7] rounded-lg px-6 py-3 font-medium transition-all hover:border-[#09090B] font-['Manrope']"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Income Categories */}
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">Income Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    className="flex items-center justify-between p-4 border border-[#E4E4E7] rounded-lg hover:border-[#A1A1AA] transition-all"
                    data-testid={`category-${cat.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-semibold text-[#09090B] font-['Manrope']">{cat.name}</p>
                        {cat.is_default && <p className="text-xs text-[#A1A1AA] font-['Manrope']">Default</p>}
                      </div>
                    </div>
                    {!cat.is_default && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-[#A1A1AA] hover:text-[#E11D48] transition-colors"
                        data-testid={`delete-category-${cat.name}`}
                      >
                        <Trash size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">Expense Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    className="flex items-center justify-between p-4 border border-[#E4E4E7] rounded-lg hover:border-[#A1A1AA] transition-all"
                    data-testid={`category-${cat.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-semibold text-[#09090B] font-['Manrope']">{cat.name}</p>
                        {cat.is_default && <p className="text-xs text-[#A1A1AA] font-['Manrope']">Default</p>}
                      </div>
                    </div>
                    {!cat.is_default && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-[#A1A1AA] hover:text-[#E11D48] transition-colors"
                        data-testid={`delete-category-${cat.name}`}
                      >
                        <Trash size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
