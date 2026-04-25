import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash } from '@phosphor-icons/react';
import { formatINR } from '../../utils/inr';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

export const IndividualGoals = () => {
  const nav = useNavigate();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', target:'', saved:'0', deadline:'' });
  const [planner, setPlanner] = useState({ monthly:'', goal: null });

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data } = await axios.get(`${API}/api/goals`, { withCredentials: true }); setGoals(data); } catch {} };

  const submit = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/api/goals`, { ...form, target: parseFloat(form.target), saved: parseFloat(form.saved||'0') }, { withCredentials: true }); toast.success('Goal created!'); setShowForm(false); setForm({ name:'', target:'', saved:'0', deadline:'' }); fetch_(); }
    catch { toast.error('Failed'); }
  };

  const del = async (id) => { try { await axios.delete(`${API}/api/goals/${id}`, { withCredentials: true }); toast.success('Deleted'); fetch_(); } catch {} };

  const addSavings = async (g, amt) => {
    try { await axios.put(`${API}/api/goals/${g.id}`, { ...g, saved: g.saved + amt }, { withCredentials: true }); toast.success(`Added ${formatINR(amt)}`); fetch_(); }
    catch { toast.error('Failed'); }
  };

  // What-if planner
  const plannerResult = () => {
    if (!planner.goal || !planner.monthly) return null;
    const remaining = planner.goal.target - planner.goal.saved;
    const months = Math.ceil(remaining / parseFloat(planner.monthly));
    const date = new Date(); date.setMonth(date.getMonth() + months);
    return { months, date: date.toLocaleDateString('en-IN', { month:'long', year:'numeric' }) };
  };

  return (
    <div className="min-h-screen bg-[var(--p-bg)] pb-6" data-persona="individual" data-testid="individual-goals">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-[var(--p-border)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={()=>nav('/individual')} className="p-2 rounded-lg hover:bg-[var(--p-border-subtle)]" data-testid="back-button"><ArrowLeft size={18}/></button>
          <h1 className="text-lg font-bold text-[var(--p-text)] font-['Outfit']">Savings Goals</h1>
          <div className="flex-1"/>
          <button onClick={()=>setShowForm(!showForm)} className="h-8 px-3 rounded-lg bg-[#1D9E75] text-white text-xs font-semibold flex items-center gap-1" data-testid="add-goal-button"><Plus size={14}/> New Goal</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={submit} className="bg-[var(--p-surface)] border border-[var(--p-border)] rounded-2xl p-4 space-y-3" data-testid="goal-form">
            <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Goal name (e.g., Emergency Fund)" required className="w-full h-9 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-lg px-3 text-xs text-[var(--p-text)] placeholder-[var(--p-text-muted)] focus:border-[#1D9E75] outline-none" data-testid="goal-name-input"/>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="Target (₹)" required className="h-9 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-lg px-3 text-xs text-[var(--p-text)] focus:border-[#1D9E75] outline-none" data-testid="goal-target-input"/>
              <input type="number" value={form.saved} onChange={e=>setForm(f=>({...f,saved:e.target.value}))} placeholder="Already saved" className="h-9 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-lg px-3 text-xs text-[var(--p-text)] focus:border-[#1D9E75] outline-none" data-testid="goal-saved-input"/>
              <input type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} className="h-9 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-lg px-3 text-xs text-[var(--p-text)] focus:border-[#1D9E75] outline-none" data-testid="goal-deadline-input"/>
            </div>
            <button type="submit" className="w-full h-9 rounded-lg bg-[var(--p-text)] text-[var(--p-bg)] text-xs font-semibold" data-testid="save-goal-button">Create Goal</button>
          </form>
        )}

        {/* Goals list */}
        {goals.length === 0 ? <p className="text-center text-xs text-[var(--p-text-muted)] py-10">No goals yet. Create your first savings goal!</p> :
          goals.map(g => {
            const pct = g.target > 0 ? Math.min((g.saved/g.target)*100,100) : 0;
            return (
              <div key={g.id} className="bg-[var(--p-surface)] border border-[var(--p-border)] rounded-2xl p-4" data-testid={`goal-${g.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-sm font-semibold text-[var(--p-text)]">{g.name}</p>{g.deadline&&<p className="text-[10px] text-[var(--p-text-muted)]">Deadline: {g.deadline}</p>}</div>
                  <button onClick={()=>del(g.id)} className="p-1 text-[var(--p-text-muted)] hover:text-[#EF4444]"><Trash size={14}/></button>
                </div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-[var(--p-text-secondary)]">{formatINR(g.saved)} saved</span><span className="font-medium text-[var(--p-text)]">{formatINR(g.target)} target</span></div>
                <div className="w-full h-3 bg-[var(--p-border-subtle)] rounded-full overflow-hidden mb-2"><div className="h-full rounded-full bg-[#1D9E75] transition-all" style={{width:`${pct}%`}}/></div>
                <div className="flex gap-2">
                  {[1000,5000,10000].map(a=><button key={a} onClick={()=>addSavings(g,a)} className="flex-1 h-8 rounded-lg border border-[var(--p-border)] text-xs font-medium text-[var(--p-text)] hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all" data-testid={`add-${a}-to-${g.id}`}>+{formatINR(a)}</button>)}
                </div>
                {/* What-if planner */}
                <div className="mt-3 pt-3 border-t border-[var(--p-border-subtle)]">
                  <p className="text-[10px] font-semibold text-[var(--p-text-muted)] mb-1">What-if planner</p>
                  <div className="flex gap-2 items-center">
                    <input type="number" placeholder="Monthly savings (₹)" value={planner.goal?.id===g.id?planner.monthly:''} onChange={e=>setPlanner({monthly:e.target.value,goal:g})} className="flex-1 h-8 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-lg px-2 text-xs text-[var(--p-text)] focus:border-[#1D9E75] outline-none" data-testid={`planner-input-${g.id}`}/>
                    {planner.goal?.id===g.id && plannerResult() && <p className="text-[10px] text-[#1D9E75] font-medium">~{plannerResult().months} months ({plannerResult().date})</p>}
                  </div>
                </div>
              </div>
            );
          })
        }
      </main>
    </div>
  );
};
