import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, LayoutDashboard, ScrollText, AlertTriangle, 
  Users, Zap, Settings, Search, Bell, LogOut 
} from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/logs', label: 'Live Logs', icon: ScrollText },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/integrations', label: 'Integrations', icon: Zap },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#020617] text-slate-100 relative">
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/4b0dec1c-2f82-4ca3-aaed-c75274dabdaf/images/7bbdddff11bd39dd1f64ec3e101708af8ae8112feb78589ced1680c36c044415.png')` }}
      />

      <aside className="w-64 h-full border-r border-white/5 bg-slate-950/50 backdrop-blur-xl flex flex-col z-50 relative" data-testid="sidebar">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold text-white">SentinelX</h1>
              <p className="text-xs text-slate-400">Threat Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-semibold">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 w-full border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-6 z-40 relative" data-testid="header">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search threats, users, logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                data-testid="global-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors" data-testid="notifications-bell">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 scrollbar-thin" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};