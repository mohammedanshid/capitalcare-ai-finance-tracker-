import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { House, Receipt, Target, ChartLine, UserCircle, Moon, Sun, SignOut, Sparkle, Robot, DownloadSimple } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { formatINR } from '../../utils/inr';
import { AlertsPanel } from '../../components/AlertsPanel';
import { ForecastWidget } from '../../components/ForecastWidget';
import { AIChatDrawer } from '../../components/AIChatDrawer';
import api from '../../api'; // ✅ FIXED

const PIE_COLORS = ['#1D9E75','#34D399','#6EE7B7','#A7F3D0','#D1FAE5'];

export const IndividualDashboard = () => {
  const { user, logout, setPersona } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();

  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => { fetch_(); }, []);

  // ✅ FIXED API CALL
  const fetch_ = async () => {
    try {
      const { data } = await api.get("/api/dashboard");
      setD(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = d ? [
    { label: 'Income', value: d.income, spark: d.sparkline_income || [], color: '#1D9E75' },
    { label: 'Expenses', value: d.expenses, spark: d.sparkline_expenses || [], color: '#EF4444' },
    { label: 'Savings Rate', value: d.savings_rate || 0, spark: [], color: '#3B82F6', suffix: '%' },
    { label: 'Net Worth', value: d.net_worth || 0, spark: [], color: '#8B5CF6' },
  ] : [];

  const MiniSpark = ({ data: sd, color }) => {
    if (!sd || sd.length < 2) return null;
    return (
      <ResponsiveContainer width="100%" height={32}>
        <AreaChart data={sd.map((v,i)=>({v,i}))}>
          <Area type="monotone" dataKey="v" stroke={color} fillOpacity={0.1}/>
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--p-bg)] pb-20">

      {/* HEADER */}
      <header className="sticky top-0 bg-white border-b p-4 flex justify-between">
        <h1 className="font-bold">CapitalCare AI</h1>

        <div className="flex gap-2">
          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          <button onClick={()=>{logout(); nav('/login');}}>
            <SignOut size={16}/>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-5">

        {loading ? (
          <p>Loading...</p>
        ) : d ? (
          <>
            <h2 className="text-xl font-bold">
              Welcome {user?.name}
            </h2>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
              {kpis.map(k => (
                <div key={k.label} className="p-3 border rounded">
                  <p>{k.label}</p>
                  <p className="font-bold">
                    {k.suffix ? `${k.value}%` : formatINR(k.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* PIE CHART */}
            {d.category_breakdown?.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={d.category_breakdown} dataKey="value">
                    {d.category_breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}

          </>
        ) : (
          <p>No data</p>
        )}

      </main>

      <AIChatDrawer isOpen={chatOpen} onClose={()=>setChatOpen(false)} />

    </div>
  );
};
