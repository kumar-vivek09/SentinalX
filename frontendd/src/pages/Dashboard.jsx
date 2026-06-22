import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, TrendingUp, Users as UsersIcon, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AIAssistant } from '../components/AIAssistant';

const API_URL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.withCredentials = true;

export const Dashboard = () => {
  const [stats, setStats] = useState({ total_events: 0, critical_alerts: 0, active_threats: 0, suspicious_users: 0, risk_score: 58 });
  const [threatData, setThreatData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchAlerts();
    fetchLogs();
    generateThreatData();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/stats`, { withCredentials: true });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/alerts`, { withCredentials: true });
      setAlerts(data.alerts.slice(0, 3));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/logs`, { withCredentials: true });
      setLogs(data.logs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const generateThreatData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 3600000);
      data.push({
        time: time.getHours() + ':00',
        threats: Math.floor(Math.random() * 80) + 20,
        critical: Math.floor(Math.random() * 30) + 10
      });
    }
    setThreatData(data);
  };

  const kpiCards = [
    { label: 'Total Events', value: stats.total_events?.toLocaleString() || '45,646', icon: Activity, color: 'cyan', trend: '+12%' },
    { label: 'Active Threats', value: stats.active_threats || '21', icon: Shield, color: 'amber', trend: '+5%' },
    { label: 'Critical Alerts', value: stats.critical_alerts || '8', icon: AlertTriangle, color: 'rose', trend: '-2%', pulse: true },
    { label: 'Suspicious Users', value: stats.suspicious_users || '8', icon: UsersIcon, color: 'purple', trend: '+3%' },
    { label: 'Risk Score', value: `${stats.risk_score}%`, icon: TrendingUp, color: 'emerald', trend: '-8%' },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time threat intelligence overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const colorMap = {
            cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' },
            amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]' },
            rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]' },
            purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]' },
          };
          const colors = colorMap[card.color];

          return (
            <div
              key={i}
              className={`${colors.bg} ${colors.border} ${colors.glow} backdrop-blur-xl border rounded-xl p-5 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${card.pulse ? 'animate-pulse-glow' : ''}`}
              data-testid={`kpi-card-${card.label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-8 h-8 ${colors.text}`} />
                <span className={`text-xs ${colors.text} font-mono`}>{card.trend}</span>
              </div>
              <div className="text-sm text-slate-400 mb-1">{card.label}</div>
              <div className={`font-mono text-3xl font-medium tracking-tight ${colors.text}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6" data-testid="threat-timeline">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-100">Real-Time Threat Timeline</h2>
              <p className="text-sm text-slate-400 mt-1">Last 24 hours activity</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-400">All Threats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-slate-400">Critical</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={threatData}>
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="threats" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6 max-h-[400px] overflow-y-auto scrollbar-thin" data-testid="live-alerts-panel">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-100">Live Alerts</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const severityColors = {
                critical: 'border-rose-500/30 bg-rose-500/5',
                warning: 'border-amber-500/30 bg-amber-500/5',
                low: 'border-emerald-500/30 bg-emerald-500/5'
              };
              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${severityColors[alert.severity]} ${alert.severity === 'critical' ? 'animate-pulse-glow' : ''}`}
                  data-testid={`alert-item-${i}`}
                >
                  <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 font-mono">{alert.user}</span>
                    <span className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6" data-testid="ai-insights-panel">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">AI Insights</h2>
              <p className="text-xs text-slate-400">Powered by Llama 3.1</p>
            </div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="text-rose-400 font-semibold">High Risk:</span> Multiple failed login attempts detected from vivek.sharma. 
              Recommend immediate password reset and enable 2FA. Mass file download activity suggests potential data exfiltration.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">Critical</span>
              <span className="text-xs text-slate-500">Action Required</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6 max-h-[300px] overflow-y-auto scrollbar-thin" data-testid="live-activity-feed">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Live Activity Feed</h2>
          <div className="space-y-2 font-mono text-sm">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300" data-testid={`activity-log-${i}`}>
                <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-cyan-400">{log.user}</span>
                <span className="text-slate-500">{log.action}</span>
                <span className="text-slate-400">from {log.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
};