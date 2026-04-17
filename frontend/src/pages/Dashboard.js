import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { ChartsSection } from '../components/ChartsSection';
import { AIInsightsModal } from '../components/AIInsightsModal';
import { BottomNav } from '../components/BottomNav';
import { SignOut, Sparkle, Moon, Sun, DownloadSimple, Target } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, balance: 0, transaction_count: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  useEffect(() => { fetchData(); }, []);

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
      setBudgetAlerts(budgetsRes.data.filter(b => b.status === 'warning' || b.status === 'exceeded'));
    } catch (error) { console.error('Failed to fetch data:', error); }
    finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (transactions.length === 0) { alert('Add some transactions first!'); return; }
    setAiAnalyzing(true); setShowAIModal(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/analyze`, {}, { withCredentials: true });
      setAiInsights(data);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to analyze');
      setShowAIModal(false);
    } finally { setAiAnalyzing(false); }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API_URL}/api/export/${format}`, { withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `financial_report.${format}`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { alert('Failed to export data'); }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-0)] pb-20 md:pb-0" data-testid="dashboard-page">
      {/* ── Desktop Top Bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Finance<span className="text-[var(--accent-blue)]">.</span>
          </h1>
          <div className="flex items-center gap-2">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 mr-2">
              {[
                { label: 'Categories', path: '/categories' },
                { label: 'Budgets', path: '/budgets' },
                { label: 'Recurring', path: '/recurring' },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all"
                  data-testid={`nav-${item.label.toLowerCase()}`}>
                  {item.label}
                </button>
              ))}
            </nav>
            {/* Export dropdown */}
            <div className="relative group hidden md:block">
              <button className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all" data-testid="export-button" title="Export">
                <DownloadSimple size={18} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--surface-0)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-lg)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors" data-testid="export-csv-button">Export CSV</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors" data-testid="export-pdf-button">Export PDF</button>
              </div>
            </div>
            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all" data-testid="theme-toggle">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* Analyze CTA */}
            <button onClick={handleAnalyze} disabled={aiAnalyzing || transactions.length === 0}
              className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-semibold transition-all hover:bg-[var(--accent-blue-hover)] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(59,130,246,0.25)]"
              data-testid="analyze-finances-button">
              <Sparkle size={16} weight="fill" />
              <span className="hidden md:inline">{aiAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
            </button>
            {/* Avatar / Logout */}
            <button onClick={logout} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all" data-testid="logout-button" title="Sign out">
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-[var(--accent-blue)] border-r-transparent"></div>
          </div>
        ) : (
          <>
            {/* Greeting on mobile */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Welcome back,</p>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">{user?.name || 'User'}</h2>
              </div>
              {/* Mobile-only Analyze button */}
              <button onClick={handleAnalyze} disabled={aiAnalyzing || transactions.length === 0}
                className="flex sm:hidden items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-semibold shadow-[0_0_16px_rgba(59,130,246,0.25)] disabled:opacity-40"
                data-testid="analyze-finances-button-mobile">
                <Sparkle size={16} weight="fill" />
                Analyze
              </button>
            </div>

            {/* Budget Alerts */}
            {budgetAlerts.length > 0 && (
              <div className="bg-[#FEF3C7] dark:bg-yellow-900/20 border border-[#FCD34D] dark:border-yellow-700/40 rounded-xl p-4" data-testid="budget-alerts">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} weight="fill" className="text-[#D97706]" />
                  <p className="text-sm font-semibold text-[#92400E] dark:text-yellow-400">Budget Alerts</p>
                </div>
                {budgetAlerts.map(b => (
                  <p key={b.id} className="text-sm text-[#92400E] dark:text-yellow-300 ml-6">
                    <strong>{b.category}</strong>: {b.percentage}% used (${b.spent.toFixed(2)} / ${b.limit.toFixed(2)})
                  </p>
                ))}
              </div>
            )}

            <SummaryCards summary={summary} />
            <TransactionForm onTransactionAdded={fetchData} />
            <ChartsSection transactions={transactions} />
            <TransactionList transactions={transactions} onTransactionDeleted={fetchData} />
          </>
        )}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav onExport={handleExport} />

      {/* AI Modal */}
      {showAIModal && (
        <AIInsightsModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} insights={aiInsights} loading={aiAnalyzing} />
      )}
    </div>
  );
};
