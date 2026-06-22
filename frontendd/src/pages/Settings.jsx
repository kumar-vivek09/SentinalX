import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Power, Bell, Trash2 } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Settings = () => {
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/settings`, { withCredentials: true });
      setAiAnalysisEnabled(data.ai_analysis_enabled);
      setAlertsEnabled(data.alerts_enabled);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await axios.post(`${API_URL}/api/settings`, newSettings, { withCredentials: true });
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleAiToggle = (checked) => {
    setAiAnalysisEnabled(checked);
    updateSettings({ ai_analysis_enabled: checked });
  };

  const handleAlertsToggle = (checked) => {
    setAlertsEnabled(checked);
    updateSettings({ alerts_enabled: checked });
  };

  const handleResetLogs = async () => {
    if (!window.confirm('Are you sure you want to reset all logs and alerts? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/reset-logs`, {}, { withCredentials: true });
      toast.success('Logs reset successfully');
    } catch (error) {
      console.error('Error resetting logs:', error);
      toast.error(error.response?.data?.detail || 'Failed to reset logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure SentinelX system preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6" data-testid="general-settings">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">General Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <Power className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-slate-100 font-medium mb-1">AI Analysis</h3>
                  <p className="text-sm text-slate-400">
                    Enable AI-powered threat analysis using local Llama model
                  </p>
                </div>
              </div>
              <Switch 
                checked={aiAnalysisEnabled} 
                onCheckedChange={handleAiToggle}
                data-testid="ai-analysis-toggle"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-slate-100 font-medium mb-1">Real-time Alerts</h3>
                  <p className="text-sm text-slate-400">
                    Receive instant notifications for critical security events
                  </p>
                </div>
              </div>
              <Switch 
                checked={alertsEnabled} 
                onCheckedChange={handleAlertsToggle}
                data-testid="alerts-toggle"
              />
            </div>
          </div>
        </div>

        <div className="bg-rose-500/5 backdrop-blur-2xl border border-rose-500/20 rounded-xl p-6" data-testid="danger-zone">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-rose-500" />
            <h2 className="text-xl font-semibold text-slate-100">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Permanently delete all logs and alerts from the system. This action cannot be undone.
            </p>
            <Button
              onClick={handleResetLogs}
              disabled={loading}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all"
              data-testid="reset-logs-button"
            >
              {loading ? 'Resetting...' : 'Reset All Logs'}
            </Button>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">About SentinelX</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>Version: 1.0.0</p>
            <p>AI Model: Llama 3.1 (Local)</p>
            <p>Database: MongoDB</p>
            <p className="pt-4 border-t border-white/5 text-slate-500">
              © 2026 SentinelX Threat Intelligence Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};