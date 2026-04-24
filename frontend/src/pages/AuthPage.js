import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeSlash, ArrowLeft } from '@phosphor-icons/react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const nav = useNavigate();

  // ✅ FIXED SUBMIT FUNCTION + DEBUG
  const submit = async (e) => {
    e.preventDefault();

    console.log("🔥 FORM SUBMITTED"); // ✅ DEBUG

    setError('');
    setLoading(true);

    try {
      let res;

      if (isLogin) {
        console.log("➡️ Trying login...");
        res = await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name required');
          setLoading(false);
          return;
        }
        console.log("➡️ Trying register...");
        res = await register(name, email, password);
      }

      console.log("✅ RESPONSE:", res);

      if (res.success) {
        window.location.href = "/dashboard";
      } else {
        setError(res.error || "Something went wrong");
      }

    } catch (err) {
      console.log("❌ ERROR:", err);
      setError("Login failed");
    }

    setLoading(false);
  };

  const inputClass =
    "w-full h-12 bg-white border border-[var(--border)] rounded-2xl px-4 text-sm text-[var(--dark)] placeholder-[var(--muted)] focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[var(--cream-light)] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">

        <button
          onClick={() => nav('/')}
          className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--dark)] mb-8"
        >
          <ArrowLeft size={16}/> Back
        </button>

        <div className="cashly-card p-8">

          <h1 className="text-2xl font-extrabold mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>

          <form onSubmit={submit} className="space-y-3.5">

            {!isLogin && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Full name"
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Email"
              required
            />

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPw ? <EyeSlash size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            {error && (
              <p style={{ color: "red", fontSize: 13 }}>
                {error}
              </p>
            )}

            {/* ✅ DEBUG BUTTON CLICK */}
            <button
              type="submit"
              disabled={loading}
              onClick={() => console.log("🟢 BUTTON CLICKED")}
              className="w-full btn-coral h-12 text-sm"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>

          </form>

          <p className="mt-4 text-center text-xs">
            {isLogin ? "Don't have account? " : "Already have account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[var(--coral)]"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};
