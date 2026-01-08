
import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

type Mode = 'login' | 'register' | 'register-success' | 'authenticating';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMode('authenticating');
    
    try {
      const response = await storageService.authenticate(email, password);
      
      if (response.success) {
        // Data is already handled inside the authenticate method
        onLoginSuccess(email);
      } else {
        setError(response.error || 'Check your credentials.');
        setMode('login');
      }
    } catch (err) {
      setError('Connection to security hub failed. Try again.');
      setMode('login');
    }
  };

  const startRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    // Save to global registry so other devices can "see" this account
    storageService.saveUserToGlobal({ username: email.split('@')[0], email, password });
    setMode('register-success');
  };

  if (mode === 'authenticating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Authorizing Universal Access</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-3 animate-pulse">Retrieving encrypted business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover" 
          alt="Office" 
        />
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 border border-indigo-50">
            <i className="fa-solid fa-calculator text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">WageTrack Pro</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Global Enterprise Hub</p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-200/50 border border-white">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
            <button 
              onClick={() => { setMode('login'); setError(''); }} 
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }} 
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-500">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-lg" 
                  placeholder="admin@business.com" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-lg" 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-xl transition-all active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={startRegistration} className="space-y-5 animate-in fade-in duration-500">
               <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-indigo-600 text-lg" placeholder="manager@office.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-indigo-600" placeholder="Password" />
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-indigo-600" placeholder="Confirm" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 shadow-xl text-xl mt-4">Create Global Account</button>
            </form>
          )}

          {mode === 'register-success' && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-circle-check text-4xl"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Global Registry Complete</h3>
               <p className="text-slate-500 font-medium mb-8">Your enterprise credentials are now active. You can log in from any device.</p>
               <button onClick={() => setMode('login')} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] text-xl">Proceed to Dashboard</button>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-rose-50 text-rose-600 text-[11px] font-black uppercase rounded-2xl border border-rose-100 animate-in slide-in-from-top-2 flex items-center">
              <i className="fa-solid fa-triangle-exclamation mr-3 text-lg"></i>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
