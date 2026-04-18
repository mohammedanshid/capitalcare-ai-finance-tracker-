import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Warning } from '@phosphor-icons/react';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

export const PaymentSuccessPage = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (sessionId) pollStatus();
  }, [sessionId]);

  const pollStatus = async () => {
    if (attempts >= 5) { setStatus('timeout'); return; }
    try {
      const { data } = await axios.get(`${API}/api/payments/status/${sessionId}`, { withCredentials: true });
      if (data.payment_status === 'paid') { setStatus('success'); return; }
      if (data.status === 'expired') { setStatus('failed'); return; }
      setAttempts(a => a + 1);
      setTimeout(pollStatus, 2000);
    } catch { setStatus('error'); }
  };

  return (
    <div className="min-h-screen bg-[var(--cream-light)] flex items-center justify-center p-4" data-testid="payment-success-page">
      <div className="cashly-card p-8 text-center max-w-md w-full">
        {status === 'checking' && (<><div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[var(--coral)] border-r-transparent mx-auto mb-4" /><p className="text-sm text-[var(--muted)]">Verifying payment...</p></>)}
        {status === 'success' && (<><CheckCircle size={56} weight="fill" className="text-[var(--green)] mx-auto mb-4" /><h2 className="text-2xl font-extrabold text-[var(--dark)] mb-2">Payment Successful!</h2><p className="text-sm text-[var(--muted)] mb-6">Your plan has been upgraded. Enjoy all premium features!</p><button onClick={() => nav('/dashboard')} className="btn-coral px-8" data-testid="go-dashboard">Go to Dashboard</button></>)}
        {(status === 'failed' || status === 'error' || status === 'timeout') && (<><Warning size={56} weight="fill" className="text-[var(--coral)] mx-auto mb-4" /><h2 className="text-2xl font-extrabold text-[var(--dark)] mb-2">Payment Issue</h2><p className="text-sm text-[var(--muted)] mb-6">Something went wrong. Please try again or contact support.</p><button onClick={() => nav('/pricing')} className="btn-coral px-8">Try Again</button></>)}
      </div>
    </div>
  );
};
