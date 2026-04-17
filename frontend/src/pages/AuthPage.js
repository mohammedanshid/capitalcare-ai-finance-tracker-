import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeSlash, Moon, Sun } from '@phosphor-icons/react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
      result = await register(name, email, password);
    }
    setLoading(false);
    if (result.success) { navigate('/dashboard'); } else { setError(result.error); }
  };

  return (
    <div className="min-h-screen flex" data-testid="auth-page">
      {/* Left panel — visual */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0F172A]">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/04c5176c-a459-4d76-8697-f64bc179b7af/images/e3ee49d1216bd2430b9130014eeaa9d9cebbec9c4055e038364806e1b75e95f6.png"
          alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">Take control of<br/>your finances.</h2>
          <p className="text-white/60 text-base max-w-sm leading-relaxed">AI-powered insights that help you spend smarter, save more, and build lasting wealth.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 bg-[var(--surface-0)]">
        <div className="w-full max-w-[400px]">
          {/* Theme toggle */}
          <div className="flex justify-end mb-8">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all" data-testid="theme-toggle-auth">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-[var(--accent-blue)] tracking-wide uppercase mb-2">Finance Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Start tracking your money in seconds'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid={isLogin ? 'login-form' : 'register-form'}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full h-11 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all"
                  placeholder="Jane Doe" required={!isLogin} data-testid="name-input" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-11 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all"
                placeholder="you@company.com" required data-testid="email-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg px-3.5 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 outline-none transition-all"
                  placeholder="••••••••" required data-testid="password-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" data-testid="toggle-password-visibility">
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[var(--expense-bg)] border border-[var(--expense)]/30 rounded-lg px-3.5 py-2.5" data-testid="auth-error-message">
                <p className="text-sm text-[var(--expense)]">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-11 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="auth-submit-button">
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[var(--accent-blue)] font-medium hover:underline" data-testid="toggle-auth-mode-button">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
