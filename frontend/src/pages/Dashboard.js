import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { ChartsSection } from '../components/ChartsSection';
import { AIInsightsModal } from '../components/AIInsightsModal';
import { SignOut, Sparkle, Gear, Target, ArrowsClockwise, DownloadSimple } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, balance: 0, transaction_count: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, transactionsRes, budgetsRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/summary`, { withCredentials: true }),
        axios.get(`${API_URL}/api/transactions`, { withCredentials: true }),
        axios.get(`${API_URL}/api/budgets`, { withCredentials: true }),
      ]);
      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
      
      // Check for budget alerts
      const alerts = budgetsRes.data.filter(b => b.status === 'warning' || b.status === 'exceeded');
      setBudgetAlerts(alerts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (transactions.length === 0) {
      alert('Please add some transactions first!');
      return;
    }

    setAiAnalyzing(true);
    setShowAIModal(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/analyze`,
        {},
        { withCredentials: true }
      );
      setAiInsights(data);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert(error.response?.data?.detail || 'Failed to analyze finances');
      setShowAIModal(false);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API_URL}/api/export/${format}`, {
        withCredentials: true,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="dashboard-page">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#E4E4E7]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#09090B] font-['Outfit']">
              Finance Dashboard
            </h1>
            <p className="text-sm text-[#52525B] font-['Manrope'] mt-1">Welcome back, {user?.name || 'User'}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/categories')}
              className="bg-transparent text-[#09090B] border border-[#E4E4E7] rounded-lg px-4 py-3 font-medium transition-all hover:border-[#09090B] flex items-center gap-2 font-['Manrope']"
              data-testid="categories-button"
              title="Manage Categories"
            >
              <Gear size={20} />
              <span className="hidden lg:inline">Categories</span>
            </button>
            <button
              onClick={() => navigate('/budgets')}
              className="bg-transparent text-[#09090B] border border-[#E4E4E7] rounded-lg px-4 py-3 font-medium transition-all hover:border-[#09090B] flex items-center gap-2 font-['Manrope']"
              data-testid="budgets-button"
              title="Budget Settings"
            >
              <Target size={20} />
              <span className="hidden lg:inline">Budgets</span>
            </button>
            <button
              onClick={() => navigate('/recurring')}
              className="bg-transparent text-[#09090B] border border-[#E4E4E7] rounded-lg px-4 py-3 font-medium transition-all hover:border-[#09090B] flex items-center gap-2 font-['Manrope']"
              data-testid="recurring-button"
              title="Recurring Transactions"
            >
              <ArrowsClockwise size={20} />
              <span className="hidden lg:inline">Recurring</span>
            </button>
            <div className="relative group">
              <button
                className="bg-transparent text-[#09090B] border border-[#E4E4E7] rounded-lg px-4 py-3 font-medium transition-all hover:border-[#09090B] flex items-center gap-2 font-['Manrope']"
                data-testid="export-button"
                title="Export Data"
              >
                <DownloadSimple size={20} />
                <span className="hidden lg:inline">Export</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-[#E4E4E7] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-[#F4F4F5] transition-colors text-[#09090B] font-['Manrope'] text-sm rounded-t-lg"
                  data-testid="export-csv-button"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-[#F4F4F5] transition-colors text-[#09090B] font-['Manrope'] text-sm rounded-b-lg"
                  data-testid="export-pdf-button"
                >
                  Export as PDF
                </button>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={aiAnalyzing || transactions.length === 0}
              className="bg-[#1D4ED8] text-white rounded-lg px-6 py-3 font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(29,78,216,0.3)] hover:shadow-[0_0_30px_rgba(29,78,216,0.5)] hover:bg-[#1E3A8A] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-['Manrope']"
              data-testid="analyze-finances-button"
            >
              <Sparkle size={20} weight="fill" />
              {aiAnalyzing ? 'Analyzing...' : 'Analyze My Finances'}
            </button>
            <button
              onClick={logout}
              className="bg-transparent text-[#09090B] border border-[#E4E4E7] rounded-lg px-4 py-3 font-medium transition-all hover:border-[#09090B] flex items-center gap-2 font-['Manrope']"
              data-testid="logout-button"
            >
              <SignOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6 lg:p-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#09090B] border-r-transparent"></div>
              <p className="mt-4 text-[#52525B] font-['Manrope']">Loading your data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <SummaryCards summary={summary} />

            {/* Budget Alerts */}
            {budgetAlerts.length > 0 && (
              <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-xl p-6" data-testid="budget-alerts">
                <h3 className="text-lg font-semibold text-[#92400E] font-['Outfit'] mb-4 flex items-center gap-2">
                  <Target size={24} weight="fill" />
                  Budget Alerts
                </h3>
                <div className="space-y-2">
                  {budgetAlerts.map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between text-sm font-['Manrope']">
                      <span className="text-[#92400E]">
                        <strong>{budget.category}</strong>: {budget.status === 'exceeded' ? 'Exceeded' : 'Warning'} - {budget.percentage}% used
                      </span>
                      <span className="font-semibold text-[#92400E]">
                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/budgets')}
                  className="mt-4 text-sm text-[#92400E] underline hover:text-[#78350F] font-['Manrope']"
                >
                  Manage Budgets →
                </button>
              </div>
            )}

            {/* Transaction Form */}
            <TransactionForm onTransactionAdded={fetchData} />

            {/* Charts Section */}
            <ChartsSection transactions={transactions} />

            {/* Transaction List */}
            <TransactionList transactions={transactions} onTransactionDeleted={fetchData} />
          </div>
        )}
      </main>

      {/* AI Insights Modal */}
      {showAIModal && (
        <AIInsightsModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          insights={aiInsights}
          loading={aiAnalyzing}
        />
      )}
    </div>
  );
};
