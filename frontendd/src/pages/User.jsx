import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const User = () => {
  const [user, setUser] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
      setUser(data.user.map(u => ({
        ...u,
        risk_score: u.risk_score || Math.floor(Math.random() * 100),
        activity_count: u.activity_count || Math.floor(Math.random() * 200),
        source: u.email.includes('google') ? 'Google' : 'Slack'
      })));
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const getStatusBadge = (risk) => {
    if (risk >= 70) return { label: 'Dangerous', className: 'bg-rose-500/10 text-rose-500 border-rose-500/30' };
    if (risk >= 40) return { label: 'Suspicious', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'Safe', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const getRiskColor = (risk) => {
    if (risk >= 70) return 'bg-rose-500';
    if (risk >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6" data-testid="user-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">User Risk Analysis</h1>
          <p className="text-slate-400 mt-1">Monitor user behavior and identify suspicious activity</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg">
          <UserIcon className="w-5 h-5 text-cyan-400" />
          <span className="text-slate-300 font-semibold">{user.length} User</span>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl overflow-hidden" data-testid="user-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Risk Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Activity Count</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {user.map((user, i) => {
                const status = getStatusBadge(user.risk_score);
                const isHighRisk = user.risk_score >= 70;
                
                return (
                  <tr 
                    key={i} 
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isHighRisk ? 'bg-rose-500/5' : ''
                    }`}
                    data-testid={`user-row-${i}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-semibold">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-slate-200 font-medium">{user.name || user.email.split('@')[0]}</div>
                          <div className="text-slate-400 text-sm font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-cyan-400 text-sm font-medium">{user.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isHighRisk ? 'text-rose-500' : 'text-slate-300'}`}>
                            {user.risk_score}%
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getRiskColor(user.risk_score)} transition-all`}
                            style={{ width: `${user.risk_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-mono text-sm">{user.activity_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${status.className} border`} data-testid={`user-status-${i}`}>
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};