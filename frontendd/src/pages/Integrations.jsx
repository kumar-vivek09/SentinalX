import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, CheckCircle, XCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/integrations/status`, { withCredentials: true });
      setIntegrations(data.integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const integrationIcons = {
    google: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
    slack: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z" />
        <path d="M9 6a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5z" />
        <path d="M18 9a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2V9zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5z" />
        <path d="M15 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z" />
      </svg>
    ),
    zoho: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    )
  };

  return (
    <div className="space-y-6" data-testid="integrations-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Integrations</h1>
        <p className="text-slate-400 mt-1">Manage security monitoring integrations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {integrations.map((integration, i) => {
          const isConnected = integration.status === 'connected';
          const Icon = integrationIcons[integration.icon];
          
          return (
            <div
              key={i}
              className={`backdrop-blur-2xl border rounded-xl p-6 transition-all hover:-translate-y-1 ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-900/40 border-white/5 opacity-60'
              }`}
              data-testid={`integration-card-${integration.name.toLowerCase()}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 text-slate-500'
                }`}>
                  {Icon}
                </div>
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" data-testid={`status-icon-connected`} />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600" data-testid={`status-icon-disabled`} />
                )}
              </div>

              <h3 className="text-xl font-semibold text-slate-100 mb-2">{integration.name}</h3>
              <p className={`text-sm font-medium mb-4 ${
                isConnected ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {integration.status === 'connected' ? 'Connected' : 'Disabled'}
              </p>

              <p className="text-slate-400 text-sm">
                {isConnected 
                  ? `Monitoring ${integration.name} activity and security events.`
                  : `${integration.name} integration is currently disabled.`
                }
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-slate-100">Integration Information</h2>
        </div>
        <div className="space-y-4 text-slate-300">
          <p className="text-sm leading-relaxed">
            SentinelX integrates with Google Workspace and Slack to monitor user activities, detect suspicious behavior, 
            and provide real-time threat intelligence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
              <h4 className="text-cyan-400 font-semibold mb-2">Google Integration</h4>
              <p className="text-sm text-slate-400">
                Monitors login attempts, file downloads, and access patterns across Google Workspace.
              </p>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
              <h4 className="text-cyan-400 font-semibold mb-2">Slack Integration</h4>
              <p className="text-sm text-slate-400">
                Tracks message volumes, channel activities, and identifies suspicious bulk messaging patterns.
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-sm">
              <strong>Note:</strong> To enable integrations, configure API credentials in the backend environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};