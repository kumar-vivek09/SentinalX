import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#020617] via-[#0B1120] to-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/4b0dec1c-2f82-4ca3-aaed-c75274dabdaf/images/7bbdddff11bd39dd1f64ec3e101708af8ae8112feb78589ced1680c36c044415.png')` }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-12 h-12 text-cyan-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">SentinelX</h1>
              <p className="text-slate-400 text-sm">Threat Intelligence</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-2" data-testid="login-error">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sentinelx.com"
                  className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                  data-testid="login-email-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                  data-testid="login-password-input"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium" data-testid="register-link">
                Register
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-slate-500 text-xs text-center">
              Demo: admin@sentinelx.com / Admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};