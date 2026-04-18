import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, CheckCircle, Clock, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import axios from 'axios';
const API = process.env.REACT_APP_BACKEND_URL;

export const CATasks = () => {
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', client_name:'', deadline:'', status:'pending' });

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => { try { const { data } = await axios.get(`${API}/api/ca/tasks`, { withCredentials: true }); setTasks(data); } catch {} };

  const add = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/api/ca/tasks`, form, { withCredentials: true }); toast.success('Task added'); setShowForm(false); setForm({ title:'', client_name:'', deadline:'', status:'pending' }); fetch_(); }
    catch { toast.error('Failed'); }
  };

  const toggle = async (t) => {
    const newStatus = t.status === 'completed' ? 'pending' : 'completed';
    try { await axios.put(`${API}/api/ca/tasks/${t.id}`, { ...t, status: newStatus }, { withCredentials: true }); fetch_(); } catch {}
  };

  const del = async (id) => { try { await axios.delete(`${API}/api/ca/tasks/${id}`, { withCredentials: true }); fetch_(); } catch {} };

  const statusIcon = (s) => {
    if (s === 'completed') return <CheckCircle size={14} weight="fill" className="text-[#1D9E75]"/>;
    if (s === 'overdue') return <Warning size={14} weight="fill" className="text-[#EF4444]"/>;
    return <Clock size={14} weight="fill" className="text-[#EF9F27]"/>;
  };

  // Group by status
  const pending = tasks.filter(t=>t.status==='pending');
  const overdue = tasks.filter(t=>t.status==='overdue');
  const completed = tasks.filter(t=>t.status==='completed');

  return (
    <div className="min-h-screen bg-[var(--p-bg)] pb-6" data-persona="ca" data-testid="ca-tasks">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-[var(--p-border)]">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-3">
          <button onClick={()=>nav('/ca')} className="p-1.5 rounded hover:bg-[var(--p-border-subtle)]" data-testid="back-button"><ArrowLeft size={16}/></button>
          <h1 className="text-base font-bold text-[var(--p-text)] font-['Outfit']">Tasks</h1>
          <div className="flex-1"/>
          <button onClick={()=>setShowForm(!showForm)} className="h-7 px-3 rounded-sm bg-[#185FA5] text-white text-[10px] font-semibold flex items-center gap-1" data-testid="add-task-button"><Plus size={10}/> Task</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={add} className="bg-[var(--p-surface)] border border-[var(--p-border)] rounded-sm p-3 grid grid-cols-2 gap-2" data-testid="task-form">
            <input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task title" required className="h-8 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-sm px-2 text-xs text-[var(--p-text)] focus:border-[#185FA5] outline-none col-span-2" data-testid="task-title-input"/>
            <input type="text" value={form.client_name} onChange={e=>setForm(f=>({...f,client_name:e.target.value}))} placeholder="Client name" className="h-8 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-sm px-2 text-xs text-[var(--p-text)] focus:border-[#185FA5] outline-none" data-testid="task-client-input"/>
            <input type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} className="h-8 bg-[var(--p-bg)] border border-[var(--p-border)] rounded-sm px-2 text-xs text-[var(--p-text)] focus:border-[#185FA5] outline-none" data-testid="task-deadline-input"/>
            <button type="submit" className="h-8 rounded-sm bg-[var(--p-text)] text-[var(--p-bg)] text-xs font-semibold col-span-2" data-testid="save-task-button">Add Task</button>
          </form>
        )}

        {[{title:'Overdue',items:overdue,color:'#EF4444'},{title:'Pending',items:pending,color:'#EF9F27'},{title:'Completed',items:completed,color:'#1D9E75'}].map(group=>(
          group.items.length > 0 && (
            <div key={group.title}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{color:group.color}}>{group.title} ({group.items.length})</p>
              <div className="space-y-1.5">
                {group.items.map(t=>(
                  <div key={t.id} className="flex items-center gap-2 bg-[var(--p-surface)] border border-[var(--p-border)] rounded-sm p-2.5" data-testid={`task-${t.id}`}>
                    <button onClick={()=>toggle(t)} className="p-0.5">{statusIcon(t.status)}</button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${t.status==='completed'?'line-through text-[var(--p-text-muted)]':'text-[var(--p-text)]'}`}>{t.title}</p>
                      <p className="text-[9px] text-[var(--p-text-muted)]">{t.client_name}{t.deadline?` · ${t.deadline}`:''}</p>
                    </div>
                    <button onClick={()=>del(t.id)} className="p-1 text-[var(--p-text-muted)] hover:text-[#EF4444]"><Trash size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
        {tasks.length===0 && <p className="text-center text-xs text-[var(--p-text-muted)] py-10">No tasks. Create one to get started.</p>}
      </main>
    </div>
  );
};
