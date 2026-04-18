import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthPage } from './pages/AuthPage';
import { PersonaPicker } from './pages/PersonaPicker';
import { IndividualDashboard } from './pages/individual/Dashboard';
import { IndividualTransactions } from './pages/individual/Transactions';
import { IndividualGoals } from './pages/individual/Goals';
import { ShopDashboard } from './pages/shop/Dashboard';
import { ShopLedger } from './pages/shop/Ledger';
import { CADashboard } from './pages/ca/Dashboard';
import { CATasks } from './pages/ca/Tasks';
import { PricingPage } from './pages/PricingPage';
import { Toaster } from 'sonner';
import './App.css';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--p-bg)]"><div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--p-primary)] border-r-transparent"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PersonaGuard = ({ persona, children }) => {
  const { user } = useAuth();
  if (user && user.persona !== persona) return <Navigate to="/persona" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/persona" element={<Protected><PersonaPicker /></Protected>} />
            {/* Individual */}
            <Route path="/individual" element={<Protected><PersonaGuard persona="individual"><IndividualDashboard /></PersonaGuard></Protected>} />
            <Route path="/individual/transactions" element={<Protected><PersonaGuard persona="individual"><IndividualTransactions /></PersonaGuard></Protected>} />
            <Route path="/individual/goals" element={<Protected><PersonaGuard persona="individual"><IndividualGoals /></PersonaGuard></Protected>} />
            {/* Shop */}
            <Route path="/shop" element={<Protected><PersonaGuard persona="shop_owner"><ShopDashboard /></PersonaGuard></Protected>} />
            <Route path="/shop/ledger" element={<Protected><PersonaGuard persona="shop_owner"><ShopLedger /></PersonaGuard></Protected>} />
            {/* CA */}
            <Route path="/ca" element={<Protected><PersonaGuard persona="ca"><CADashboard /></PersonaGuard></Protected>} />
            <Route path="/ca/tasks" element={<Protected><PersonaGuard persona="ca"><CATasks /></PersonaGuard></Protected>} />
            <Route path="/" element={<Navigate to="/persona" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
