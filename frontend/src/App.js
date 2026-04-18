import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { GoalsPage } from './pages/GoalsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { LoansPage } from './pages/LoansPage';
import { CreditCardsPage } from './pages/CreditCardsPage';
import { PricingPage } from './pages/PricingPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { Toaster } from 'sonner';
import './App.css';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--cream-light)]"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--coral)] border-r-transparent"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment-success" element={<Protected><PaymentSuccessPage /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/transactions" element={<Protected><TransactionsPage /></Protected>} />
          <Route path="/goals" element={<Protected><GoalsPage /></Protected>} />
          <Route path="/budgets" element={<Protected><BudgetsPage /></Protected>} />
          <Route path="/loans" element={<Protected><LoansPage /></Protected>} />
          <Route path="/credit-cards" element={<Protected><CreditCardsPage /></Protected>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
export default App;
