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
  const [newRecurring, setNewRecurring] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recurringRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/recurring-transactions`, { withCredentials: true }),
        axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
      ]);
      setRecurring(recurringRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRecurring.category || !newRecurring.amount || parseFloat(newRecurring.amount) <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/recurring-transactions`, {
        ...newRecurring,
        amount: parseFloat(newRecurring.amount)
      }, { withCredentials: true });
      toast.success('Recurring transaction created!');
      setNewRecurring({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create recurring transaction');
    }
  };

  const handleDelete = async (recurringId) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      await axios.delete(`${API_URL}/api/recurring-transactions/${recurringId}`, { withCredentials: true });
      toast.success('Recurring transaction deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete recurring transaction');
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/recurring-transactions/process`, {}, { withCredentials: true });
      toast.success(data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to process recurring transactions');
    } finally {
      setProcessing(false);
    }
  };

  const categoryOptions = categories.filter(c => c.type === newRecurring.type);

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="recurring-page">
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#09090B] font-['Outfit']">Recurring Transactions</h1>
              <p className="text-sm text-[#52525B] font-['Manrope'] mt-1">Automate your regular income and expenses</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleProcess}
              disabled={processing}
              className="bg-[#1D4ED8] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#1E3A8A] flex items-center gap-2 font-['Manrope'] disabled:opacity-50"
              data-testid="process-recurring-button"
            >
              <ArrowsClockwise size={20} weight="bold" />
              {processing ? 'Processing...' : 'Process Now'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] flex items-center gap-2 font-['Manrope']"
              data-testid="add-recurring-button"
            >
              <Plus size={20} weight="bold" />
              Add Recurring
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#09090B] border-r-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Form */}
            {showForm && (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8" data-testid="recurring-form">
                <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">New Recurring Transaction</h2>
                <form onSubmit={handleCreate} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Type</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setNewRecurring({ ...newRecurring, type: 'income', category: '' })}
                          className={`flex-1 py-3 rounded-lg font-medium transition-all font-['Manrope'] ${
                            newRecurring.type === 'income'
                              ? 'bg-[#09090B] text-white'
                              : 'bg-transparent text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B]'
                          }`}
                        >
                          Income
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRecurring({ ...newRecurring, type: 'expense', category: '' })}
                          className={`flex-1 py-3 rounded-lg font-medium transition-all font-['Manrope'] ${
                            newRecurring.type === 'expense'
                              ? 'bg-[#09090B] text-white'
                              : 'bg-transparent text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B]'
                          }`}
                        >
                          Expense
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newRecurring.amount}
                        onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        placeholder="0.00"
                        required
                        data-testid="recurring-amount-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Category</label>
                      <select
                        value={newRecurring.category}
                        onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        required
                        data-testid="recurring-category-select"
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id || cat.name} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Frequency</label>
                      <select
                        value={newRecurring.frequency}
                        onChange={(e) => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        data-testid="recurring-frequency-select"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Start Date</label>
                      <input
                        type="date"
                        value={newRecurring.start_date}
                        onChange={(e) => setNewRecurring({ ...newRecurring, start_date: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        required
                        data-testid="recurring-start-date-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">End Date (Optional)</label>
                      <input
                        type="date"
                        value={newRecurring.end_date}
                        onChange={(e) => setNewRecurring({ ...newRecurring, end_date: e.target.value })}
                        className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                        data-testid="recurring-end-date-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Description (Optional)</label>
                    <input
                      type="text"
                      value={newRecurring.description}
                      onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                      className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
                      placeholder="Monthly salary, Weekly groceries, etc."
                      data-testid="recurring-description-input"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] font-['Manrope']"
                      data-testid="save-recurring-button"
                    >
                      Save Recurring Transaction
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

            {/* Recurring List */}
            {recurring.length === 0 ? (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-8 text-center">
                <p className="text-[#52525B] font-['Manrope']">No recurring transactions. Create one above!</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">Active Recurring Transactions</h2>
                <div className="space-y-3">
                  {recurring.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-4 border border-[#E4E4E7] rounded-lg hover:border-[#A1A1AA] transition-all"
                      data-testid={`recurring-${rec.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-['Manrope'] ${
                              rec.type === 'income'
                                ? 'bg-[#D1FAE5] text-[#065F46]'
                                : 'bg-[#FEE2E2] text-[#991B1B]'
                            }`}
                          >
                            {rec.type}
                          </span>
                          <span className="text-sm font-semibold text-[#09090B] font-['Manrope']">{rec.category}</span>
                          <span className="text-xs text-[#A1A1AA] font-['Manrope'] uppercase">{rec.frequency}</span>
                        </div>
                        {rec.description && (
                          <p className="text-sm text-[#52525B] font-['Manrope'] mt-1">{rec.description}</p>
                        )}
                        <p className="text-xs text-[#A1A1AA] font-['Manrope'] mt-1">
                          Next: {rec.next_occurrence} • Starts: {rec.start_date}
                          {rec.end_date && ` • Ends: ${rec.end_date}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`text-2xl font-medium tracking-tight font-['JetBrains_Mono'] ${
                          rec.type === 'income' ? 'text-[#059669]' : 'text-[#E11D48]'
                        }`}>
                          {rec.type === 'income' ? '+' : '-'}${rec.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="text-[#A1A1AA] hover:text-[#E11D48] transition-colors p-2"
                          data-testid={`delete-recurring-${rec.id}`}
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
