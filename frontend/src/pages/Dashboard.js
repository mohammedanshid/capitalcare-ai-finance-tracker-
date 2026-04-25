import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { House, Receipt, Target, ChartLine, UserCircle, SignOut, Robot, DownloadSimple, Sparkle, Lock, Crown } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { formatINR } from '../utils/inr';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { UpgradeModal } from '../components/UpgradeModal';
import { hasAccess, requiredPlanFor } from '../utils/plan';

// ✅ IMPORT GLOBAL API
import api from "../api";

const PIE_COLORS = ['#F4845F','#4CAF85','#FFB74D','#90A4AE','#E0E0E0'];

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(null);
  const [digest, setDigest] = useState(null);
  const [gateFeature, setGateFeature] = useState(null);
  const plan = user?.plan || 'free';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      console.log("📊 Fetching dashboard data...");

      const [dash, alertsRes, forecastRes, healthRes, dailyRes, digestRes] = await Promise.all([
        api.get("/api/individual/dashboard"),
        api.get("/api/alerts/individual").catch(() => ({ data: [] })),
        api.get("/api/forecast/individual").catch(() => ({ data: null })),
        api.get("/api/health-score").catch(() => ({ data: null })),
        api.get("/api/daily-limit").catch(() => ({ data: null })),
        api.get("/api/weekly-digest").catch(() => ({ data: null })),
      ]);

      console.log("📊 Dashboard:", dash.data);

      setD(dash.data);
      setAlerts(alertsRes.data);
      setForecast(forecastRes.data);
      setHealthScore(healthRes.data);
      setDailyLimit(dailyRes.data);
      setDigest(digestRes.data);

    } catch (err) {
      console.log("❌ Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (fmt) => {
    try {
      const r = await api.get(`/api/export/individual/${fmt}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${fmt}`;
      a.click();
    } catch (err) {
      console.log("❌ Export error:", err);
    }
  };
