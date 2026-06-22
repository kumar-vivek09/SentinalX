import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock, User } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/alerts`, { withCredentials: true });
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filter);

  const severityConfig = {
    critical: { 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/30', 
      text: 'text-rose-500',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
      label: 'Critical'
    },
    warning: { 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30', 
      text: 'text-amber-400',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
      label: 'Medium'
    },
    low: { 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30', 
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      label: 'Low'
    }
  };

  return (
    <div className="space-y-6" data-testid="alerts-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Security Alerts</h1>
        <p className="text-slate-400 mt-1">Active threat alerts and security incidents</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm">Filter:</span>
        {['all', 'critical', 'warning', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:border-white/20'
            }`}
            data-testid={`filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          return (
            <div
              key={i}
              className={`${config.bg} ${config.border} ${config.glow} backdrop-blur-xl border rounded-xl p-6 transition-all hover:-translate-y-1 ${alert.severity === 'critical' ? 'animate-pulse-glow' : ''}`}
              data-testid={`alert-card-${i}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                  <AlertTriangle className={`w-5 h-5 ${config.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 leading-tight">
                    {alert.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-mono">{alert.user}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${config.text} uppercase tracking-wide`}>
                    {config.label}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-slate-950/50 text-slate-400">
                    {alert.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-12 text-center" data-testid="no-alerts">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No alerts found</h3>
          <p className="text-slate-500">No {filter !== 'all' ? filter : ''} alerts to display</p>
        </div>
      )}
    </div>
  );
};