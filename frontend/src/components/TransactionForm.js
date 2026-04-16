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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset category when type changes
    const typeCategories = categories.filter(c => c.type === type);
    if (typeCategories.length > 0 && !typeCategories.find(c => c.name === category)) {
      setCategory(typeCategories[0].name);
    }
  }, [type, categories]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`, { withCredentials: true });
      setCategories(data);
      const expenseCategories = data.filter(c => c.type === 'expense');
      if (expenseCategories.length > 0) {
        setCategory(expenseCategories[0].name);
      }
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/transactions`,
        {
          type,
          amount: parseFloat(amount),
          category,
          description,
          date,
        },
        { withCredentials: true }
      );
      toast.success('Transaction added successfully!');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onTransactionAdded();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 lg:p-8" data-testid="transaction-form">
      <h2 className="text-xl font-semibold tracking-tight text-[#09090B] font-['Outfit'] mb-6">
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Type */}
          <div>
            <label className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  const incomeCategories = categories.filter(c => c.type === 'income');
                  if (incomeCategories.length > 0) {
                    setCategory(incomeCategories[0].name);
                  }
                }}
                className={`flex-1 py-3 rounded-lg font-medium transition-all font-['Manrope'] ${
                  type === 'income'
                    ? 'bg-[#09090B] text-white'
                    : 'bg-transparent text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B]'
                }`}
                data-testid="type-income-button"
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  const expenseCategories = categories.filter(c => c.type === 'expense');
                  if (expenseCategories.length > 0) {
                    setCategory(expenseCategories[0].name);
                  }
                }}
                className={`flex-1 py-3 rounded-lg font-medium transition-all font-['Manrope'] ${
                  type === 'expense'
                    ? 'bg-[#09090B] text-white'
                    : 'bg-transparent text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B]'
                }`}
                data-testid="type-expense-button"
              >
                Expense
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
              placeholder="0.00"
              required
              data-testid="amount-input"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
              data-testid="category-select"
            >
              {categories.filter(c => c.type === type).map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
              required
              data-testid="date-input"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-semibold text-[#09090B] mb-2 block font-['Manrope']">
            Description (Optional)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#FDFDFD] border border-[#E4E4E7] rounded-lg px-4 py-3 text-base focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] outline-none transition-all font-['Manrope']"
            placeholder="Add a note..."
            data-testid="description-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#09090B] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all hover:bg-[#27272A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-['Manrope']"
          data-testid="add-transaction-button"
        >
          <Plus size={20} weight="bold" />
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};
