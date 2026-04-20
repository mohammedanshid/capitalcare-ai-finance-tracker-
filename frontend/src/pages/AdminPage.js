import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MagnifyingGlass, Users, ChartLine, ClockClockwise, Crown, Sparkle, Trash, PencilSimple, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { formatINR } from '../utils/inr';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

const PLAN_COLORS = { free: '#90A4AE', pro: '#F4845F', elite: '#FFB74D' };

export const AdminPage = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('revenue');

  useEffect(() => {
    if (user && !user.is_admin) nav('/dashboard');
  }, [user, nav]);

  if (!user) return null;
  if (!user.is_admin) {
    return (
      <div className="min-h-screen bg-[var(--cream-light)] flex items-center justify-center px-4">
        <div className="cashly-card p-8 text-center max-w-md">
          <WarningCircle size={40} className="mx-auto text-[var(--red)] mb-3" />
          <p className="text-lg font-bold text-[var(--dark)]">Admin access required</p>
          <p className="text-sm text-[var(--muted)] mt-1">You do not have permission to view this page.</p>
          <button onClick={() => nav('/dashboard')} className="btn-coral mt-4 px-5 py-2 text-xs">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pb-10" data-testid="admin-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--cream-light)]/80 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="p-2 rounded-xl hover:bg-white" data-testid="back-button"><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[var(--dark)] flex items-center justify-center"><Crown size={14} weight="fill" className="text-amber-400" /></div>
            <h1 className="text-lg font-bold text-[var(--dark)]">Admin Panel</h1>
          </div>
          <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--dark)] text-white font-semibold uppercase tracking-wider">Restricted</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {[['revenue', 'Revenue', ChartLine], ['users', 'Users', Users], ['audit', 'Audit Log', ClockClockwise]].map(([v, l, Icon]) => (
            <button key={v} onClick={() => setTab(v)} className={`flex items-center gap-2 px-5 h-10 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${tab === v ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)] hover:text-[var(--dark)]'}`} data-testid={`tab-${v}`}>
              <Icon size={14} weight={tab === v ? 'fill' : 'regular'} />{l}
            </button>
          ))}
        </div>

        {tab === 'revenue' && <RevenueTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'audit' && <AuditTab />}
      </main>
    </div>
  );
};

const RevenueTab = () => {
  const [data, setData] = useState(null);
  useEffect(() => { (async () => { try { const { data } = await axios.get(`${API}/api/admin/revenue`, { withCredentials: true }); setData(data); } catch {} })(); }, []);
  if (!data) return <div className="cashly-card p-8 text-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--coral)] border-r-transparent mx-auto" /></div>;
  const pieData = [
    { name: 'Free', value: data.plan_distribution.free, color: PLAN_COLORS.free },
    { name: 'Pro', value: data.plan_distribution.pro, color: PLAN_COLORS.pro },
    { name: 'Elite', value: data.plan_distribution.elite, color: PLAN_COLORS.elite },
  ].filter(d => d.value > 0);
  return (
    <>
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="cashly-card p-5 bg-gradient-to-br from-[var(--dark)] to-[#1a2332] text-white">
          <p className="text-[10px] uppercase tracking-wider text-white/60">MRR</p>
          <p className="text-2xl font-extrabold mt-1" data-testid="kpi-mrr">${data.mrr.toFixed(2)}</p>
          <p className="text-[10px] text-white/60 mt-1">ARR · ${data.arr.toFixed(2)}</p>
        </div>
        <div className="cashly-card p-5"><p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Active Subscribers</p><p className="text-2xl font-extrabold text-[var(--dark)] mt-1" data-testid="kpi-active">{data.active_subscribers}</p><p className="text-[10px] text-[var(--muted)] mt-1">of {data.plan_distribution.total} total</p></div>
        <div className="cashly-card p-5"><p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Conversion Rate</p><p className="text-2xl font-extrabold text-[var(--coral)] mt-1">{data.conversion_rate}%</p><p className="text-[10px] text-[var(--muted)] mt-1">paid / total users</p></div>
        <div className="cashly-card p-5"><p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Signups (30d)</p><p className="text-2xl font-extrabold text-[var(--green)] mt-1">+{data.recent_signups_30d}</p><p className="text-[10px] text-[var(--muted)] mt-1">{data.payment_failed_count} payment failed</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Plan distribution */}
        <div className="cashly-card p-5">
          <p className="text-sm font-bold text-[var(--dark)] mb-3">Plan Distribution</p>
          {pieData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="w-44 h-44"><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
              <div className="flex-1 space-y-2 w-full">
                {['free', 'pro', 'elite'].map(p => (
                  <div key={p} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: PLAN_COLORS[p] }} /><span className="capitalize text-[var(--dark)]">{p}</span></span>
                    <span className="font-semibold text-[var(--dark)]">{data.plan_distribution[p]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-xs text-[var(--muted)] py-6 text-center">No users yet.</p>}
        </div>

        {/* Monthly upgrades */}
        <div className="cashly-card p-5">
          <p className="text-sm font-bold text-[var(--dark)] mb-3">Revenue by Month (last 6)</p>
          {data.monthly_history.length === 0 ? <p className="text-xs text-[var(--muted)] py-6 text-center">No revenue history yet. Upgrades will appear here.</p> :
            <div className="w-full h-44"><ResponsiveContainer><BarChart data={data.monthly_history}><XAxis dataKey="month" fontSize={10} stroke="#90A4AE" /><YAxis fontSize={10} stroke="#90A4AE" /><Tooltip /><Bar dataKey="revenue" fill="#F4845F" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>}
        </div>
      </div>

      {/* Recent payments */}
      <div className="cashly-card p-5">
        <p className="text-sm font-bold text-[var(--dark)] mb-3">Recent Payments</p>
        {data.recent_payments.length === 0 ? <p className="text-xs text-[var(--muted)] py-4 text-center">No paid transactions yet.</p> :
          <div className="space-y-2">
            {data.recent_payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="font-semibold text-[var(--dark)]">{p.plan_id || '—'}</p>
                  <p className="text-[10px] text-[var(--muted)]">{p.created_at?.slice(0, 19) || ''}</p>
                </div>
                <span className="font-bold text-[var(--green)]">${p.amount?.toFixed(2) || '0.00'}</span>
              </div>
            ))}
          </div>}
      </div>
    </>
  );
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/users`, { withCredentials: true, params: { q, plan: planFilter, limit: 100 } });
      setUsers(data.users); setTotal(data.total);
    } catch { toast.error('Failed to load users'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, planFilter]);

  const changePlan = async (uid, newPlan) => {
    try {
      await axios.patch(`${API}/api/admin/users/${uid}/plan`, { plan: newPlan, reason: 'manual admin override' }, { withCredentials: true });
      toast.success(`Plan updated to ${newPlan}`);
      setEditing(null); load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const delUser = async (uid, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try { await axios.delete(`${API}/api/admin/users/${uid}`, { withCredentials: true }); toast.success('User deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <>
      <div className="cashly-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email or name…" className="w-full h-10 pl-9 pr-3 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl text-sm focus:border-[var(--coral)] outline-none" data-testid="user-search" />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-10 px-3 bg-[var(--cream-light)] border border-[var(--border)] rounded-xl text-sm focus:border-[var(--coral)] outline-none" data-testid="plan-filter">
          <option value="">All plans ({total})</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
      </div>

      <div className="cashly-card overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] gap-2 px-4 py-3 bg-[var(--cream-light)] text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold border-b border-[var(--border)]">
          <span>Email / Name</span><span>Plan</span><span>Status</span><span>Created</span><span>Actions</span>
        </div>
        {loading ? <div className="p-8 text-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--coral)] border-r-transparent mx-auto" /></div> :
          users.length === 0 ? <p className="p-6 text-xs text-[var(--muted)] text-center">No users match your filter.</p> :
            users.map(u => (
              <div key={u.id} className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] gap-2 px-4 py-3 text-xs items-center border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream-light)]" data-testid={`user-row-${u.email}`}>
                <div><p className="font-semibold text-[var(--dark)] truncate flex items-center gap-1">{u.email}{u.is_admin && <Crown size={11} weight="fill" className="text-amber-500 flex-shrink-0" />}</p><p className="text-[10px] text-[var(--muted)] truncate">{u.name}</p></div>
                <div>
                  {editing === u.id ?
                    <select autoFocus onChange={e => changePlan(u.id, e.target.value)} onBlur={() => setEditing(null)} defaultValue={u.plan} className="h-7 text-xs px-2 rounded-lg bg-white border border-[var(--coral)] outline-none">
                      <option value="free">Free</option><option value="pro">Pro</option><option value="elite">Elite</option>
                    </select> :
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${u.plan === 'elite' ? 'bg-amber-100 text-amber-700' : u.plan === 'pro' ? 'bg-[var(--coral)]/10 text-[var(--coral)]' : 'bg-gray-100 text-[var(--muted)]'}`}>{u.plan}</span>
                  }
                </div>
                <div>{u.subscription_status === 'active' ? <span className="flex items-center gap-1 text-[var(--green)]"><CheckCircle size={11} weight="fill" /> Active</span> : <span className="text-[var(--muted)]">{u.subscription_status}</span>}</div>
                <div className="text-[10px] text-[var(--muted)]">{u.created_at?.slice(0, 10) || '—'}</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(u.id)} className="p-1.5 text-[var(--muted)] hover:text-[var(--coral)]" title="Change plan" data-testid={`edit-${u.email}`}><PencilSimple size={12} /></button>
                  {!u.is_admin && <button onClick={() => delUser(u.id, u.email)} className="p-1.5 text-[var(--muted)] hover:text-[var(--red)]" title="Delete user" data-testid={`delete-${u.email}`}><Trash size={12} /></button>}
                </div>
              </div>
            ))}
      </div>
      <p className="text-[10px] text-[var(--muted)] text-center">{users.length} of {total} users</p>
    </>
  );
};

const AuditTab = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [eventFilter, setEventFilter] = useState('');
  useEffect(() => { (async () => {
    try { const { data } = await axios.get(`${API}/api/admin/audit-log`, { withCredentials: true, params: { event: eventFilter, limit: 200 } }); setLogs(data.logs); setTotal(data.total); } catch {}
  })(); }, [eventFilter]);

  const badge = (event) => {
    const safe = event || 'unknown';
    const colors = { plan_change: 'bg-[var(--coral)]/10 text-[var(--coral)]', plan_change_manual: 'bg-amber-100 text-amber-700', user_deleted: 'bg-red-100 text-red-700' };
    return <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${colors[safe] || 'bg-gray-100 text-[var(--muted)]'}`}>{safe.replace(/_/g, ' ')}</span>;
  };

  return (
    <>
      <div className="cashly-card p-4 flex flex-wrap gap-2">
        {['', 'plan_change', 'plan_change_manual', 'user_deleted'].map(e => (
          <button key={e || 'all'} onClick={() => setEventFilter(e)} className={`px-3 h-8 rounded-full text-xs font-semibold ${eventFilter === e ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)]'}`} data-testid={`filter-${e || 'all'}`}>
            {e ? e.replace(/_/g, ' ') : 'All events'}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[var(--muted)] self-center">{total} events logged</span>
      </div>
      <div className="cashly-card overflow-hidden">
        {logs.length === 0 ? <p className="p-8 text-xs text-[var(--muted)] text-center">No audit events yet. Plan changes and admin actions will appear here.</p> :
          logs.map((l, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream-light)]" data-testid={`audit-${i}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">{badge(l.event)}<span className="text-xs font-semibold text-[var(--dark)] truncate">{l.user_email || 'unknown'}</span></div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  {l.old_plan && l.new_plan && <span><span className="text-[var(--muted)] capitalize">{l.old_plan}</span> → <span className="font-semibold capitalize">{l.new_plan}</span></span>}
                  {l.actor_email && <span className="ml-2">by <span className="text-[var(--dark)]">{l.actor_email}</span></span>}
                  {l.amount && <span className="ml-2 text-[var(--green)]">${(l.amount / 100).toFixed(2)}</span>}
                  {l.reason && <span className="text-[var(--muted)]"> · {l.reason}</span>}
                </p>
              </div>
              <span className="text-[10px] text-[var(--muted)] flex-shrink-0 whitespace-nowrap">{(l.created_at || '').replace('T', ' ').slice(0, 19)}</span>
            </div>
          ))}
      </div>
    </>
  );
};
