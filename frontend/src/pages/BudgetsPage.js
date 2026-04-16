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
  const [newBudget, setNewBudget] = useState({ category: '', limit: '', period: 'monthly' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/budgets`, { withCredentials: true }),
        axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data.filter(c => c.type === 'expense'));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit || parseFloat(newBudget.limit) <= 0) {
      toast.error('Please fill all fields with valid values');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/budgets`, {
        category: newBudget.category,
        limit: parseFloat(newBudget.limit),
        period: newBudget.period
      }, { withCredentials: true });
      toast.success('Budget created!');
      setNewBudget({ category: '', limit: '', period: 'monthly' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create budget');
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await axios.delete(`${API_URL}/api/budgets/${budgetId}`, { withCredentials: true });
      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'exceeded') return <Warning size={24} weight="fill" className="text-[#E11D48]" />;
    if (status === 'warning') return <Warning size={24} weight="fill" className="text-[#F59E0B]" />;
    return <CheckCircle size={24} weight="fill" className="text-[#059669]" />;
  };

  const getStatusColor = (status) => {
    if (status === 'exceeded') return 'border-[#E11D48] bg-[#FEE2E2]';
    if (status === 'warning') return 'border-[#F59E0B] bg-[#FEF3C7]';
    return 'border-[#059669] bg-[#D1FAE5]';
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="budgets-page">
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#09090B] font-['Outfit']">Budgets</h1>
              <p className="text-sm text-[#52525B] font-['Manrope'] mt-1">Set spending limits for categories</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] flex items-center gap-2 font-['Manrope']"
            data-testid="add-budget-button"
          >
            <Plus size={20} weight="bold" />
            Add Budget
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
            {/* Add Budget Form */}
            {showForm && (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8" data-testid="budget-form">
                <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">New Budget</h2>
                <form onSubmit={handleCreate} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Category</label>
                      <select
                        value={newBudget.category}
                        onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        data-testid="budget-category-select"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id || cat.name} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Monthly Limit</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newBudget.limit}
                        onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        placeholder="0.00"
                        data-testid="budget-limit-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Period</label>
                      <select
                        value={newBudget.period}
                        onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        data-testid="budget-period-select"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] font-['Manrope']"
                      data-testid="save-budget-button"
                    >
                      Save Budget
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

            {/* Budgets List */}
            {budgets.length === 0 ? (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-8 text-center">
                <p className="text-[#52525B] font-['Manrope']">No budgets set. Create your first budget above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className={`bg-white border-2 rounded-xl p-6 ${getStatusColor(budget.status)}`}
                    data-testid={`budget-${budget.category}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(budget.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-[#09090B] font-['Outfit']">{budget.category}</h3>
                          <p className="text-sm text-[#52525B] font-['Manrope'] capitalize">{budget.period}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-[#A1A1AA] hover:text-[#E11D48] transition-colors"
                        data-testid={`delete-budget-${budget.category}`}
                      >
                        <Trash size={20} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-['Manrope']">
                        <span className="text-[#52525B]">Spent</span>
                        <span className="font-semibold text-[#09090B]">
                          ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-[#E4E4E7] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            budget.status === 'exceeded' ? 'bg-[#E11D48]' :
                            budget.status === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#059669]'
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#52525B] font-['Manrope'] text-right">
                        {budget.percentage}% used
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
