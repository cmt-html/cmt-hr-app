import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldAlert, Sparkles, User, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Zoho HR clone demo shortcuts for testers
  const testAccounts = [
    { label: 'Admin (Systems)', email: 'admin@cloudmojo.tech', role: 'ADMIN', color: 'from-amber-500 to-orange-600', subdomain: 'cloudmojo' },
    { label: 'HR Manager', email: 'jane.hr@cloudmojo.tech', role: 'HR', color: 'from-pink-500 to-rose-600', subdomain: 'cloudmojo' },
    { label: ' Sarah (Tech Manager)', email: 'sarah.manager@cloudmojo.tech', role: 'MANAGER', color: 'from-emerald-500 to-teal-600', subdomain: 'cloudmojo' },
    { label: 'John Doe (Developer)', email: 'john.dev@cloudmojo.tech', role: 'EMPLOYEE', color: 'from-blue-500 to-indigo-600', subdomain: 'cloudmojo' },
    { label: 'Free Tenant Admin', email: 'admin@org2.com', role: 'ADMIN', color: 'from-amber-500 to-orange-600', subdomain: 'startup' },
    { label: 'Free Tenant Employee', email: 'emp1@org2.com', role: 'EMPLOYEE', color: 'from-blue-500 to-indigo-600', subdomain: 'startup' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your corporate email and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(email, password, subdomain);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (accEmail, sub) => {
    setError('');
    setSubmitting(true);
    try {
      // In Zoho HR demo fallback, the seed password is "password123"
      await login(accEmail, 'password123', sub);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16 overflow-hidden">
      
      {/* Aesthetic glowing gradients background */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Brand visual showcase */}
        <div className="md:col-span-6 text-left space-y-6 hidden md:block">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <Logo size={44} />
            </div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles size={14} className="animate-spin" />
              <span>Zoho HR Premium Replica v1.0</span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-outfit font-extrabold text-white leading-tight tracking-tight">
            CloudMojo HRMS Portal
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-md">
            Unlock absolute organization scaling. Track attendance coordinates, manage leave approval trees, schedule reviews, and trigger workflow automations through an executive digital workspace.
          </p>
          <div className="border-t border-slate-800/80 pt-6">
            <p className="text-[12px] font-bold text-indigo-400/90 uppercase tracking-widest mb-4">Quick login dashboards</p>
            <div className="grid grid-cols-2 gap-3">
              {testAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email, acc.subdomain)}
                  className="flex flex-col text-left p-3.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 rounded-xl transition-all duration-300 group cursor-pointer"
                >
                  <span className="text-[12px] font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{acc.label}</span>
                  <span className="text-[10px] text-slate-500 truncate">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Login form card */}
        <div className="md:col-span-6 bg-slate-900/40 border border-slate-800 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl">
          
          <div className="flex items-center space-x-3 mb-8 md:hidden">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-950/40 border border-slate-800">
              <Logo size={28} />
            </div>
            <span className="font-outfit font-extrabold text-xl text-white">CloudMojo HR</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white font-outfit">Log In</h2>
            <p className="text-slate-400 text-[13px] mt-1.5">Enter credentials below or tap a quick-test account on the left.</p>
          </div>

          {/* Form error notification */}
          {error && (
            <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium mb-6">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Subdomain Slug</label>
                <span className="text-[10px] text-slate-500 font-semibold lowercase">Optional • e.g. cloudmojo, startup</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Sparkles size={16} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. cloudmojo"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="email"
                  placeholder="admin@cloudmojo.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer text-[13px] group"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Sign In to HRMS</span>
                  <ArrowRight size={16} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

          </form>

          {/* Quick-select grid on mobile devices */}
          <div className="mt-8 border-t border-slate-800/80 pt-6 md:hidden">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick login shortcuts</p>
            <div className="grid grid-cols-2 gap-3">
              {testAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email, acc.subdomain)}
                  className="p-3 bg-slate-950 border border-slate-800 text-left rounded-xl hover:border-indigo-500/40 text-[11px] font-semibold text-slate-200 truncate cursor-pointer"
                >
                  {acc.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
