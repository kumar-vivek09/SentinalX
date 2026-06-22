import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const LiveLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/logs`, { withCredentials: true });
      setLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRisk === 'all' || log.risk_level === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const getRiskBadge = (level) => {
    const styles = {
      LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      HIGH: 'bg-rose-500/10 text-rose-500 border-rose-500/30'
    };
    return <Badge className={`${styles[level]} border`} data-testid={`risk-badge-${level.toLowerCase()}`}>{level}</Badge>;
  };

  return (
    <div className="space-y-6" data-testid="live-logs-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Live Logs</h1>
        <p className="text-slate-400 mt-1">Real-time activity monitoring from all sources</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users, actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            data-testid="logs-search-input"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50"
            data-testid="risk-filter"
          >
            <option value="all">All Risks</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl overflow-hidden" data-testid="logs-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors" data-testid={`log-row-${i}`}>
                  <td className="px-6 py-4">
                    <span className="text-slate-200 font-mono text-sm">{log.user}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 text-sm">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-400 text-sm font-medium">{log.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-sm font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getRiskBadge(log.risk_level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};