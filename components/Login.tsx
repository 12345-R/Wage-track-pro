
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
    
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      setMode('authenticating');
      setTimeout(() => onLoginSuccess(email), 1200);
    } else {
      // Logic for new devices: if the user doesn't exist locally, explain the Universal Link
      const userExistsLocally = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userExistsLocally) {
        setError('This device does not recognize your business yet. Please open the "Universal Access Link" from your primary device to sync your data here.');
      } else {
        setError('Invalid password. Please try again.');
      }
    }
  };

  const startRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    storageService.saveUser({ username: email.split('@')[0], email, password });
    setMode('register-success');
  };

  if (mode === 'authenticating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-20 h-20 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Syncing Business Hub...</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 text-center">Restoring employees and wage records</p>
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
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 border border-indigo-50">
            <i className="fa-solid fa-calculator text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">WageTrack Pro</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Enterprise Access Hub</p>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-200/50 border border-white">
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
              <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
              <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>New Setup</button>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-500">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none focus:border-indigo-600 transition-all" placeholder="manager@business.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none focus:border-indigo-600 transition-all" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-lg transition-all active:scale-[0.98]">Login to Dashboard</button>
              
              <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                 <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest leading-relaxed text-center">
                   <i className="fa-solid fa-circle-info mr-2"></i>
                   Accessing from a new location? Use your Universal Access Link to restore data.
                 </p>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={startRegistration} className="space-y-6 animate-in fade-in duration-500">
               <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none" placeholder="manager@office.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none" placeholder="Password" />
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none" placeholder="Confirm" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 shadow-xl text-lg transition-all active:scale-[0.98]">Create Account</button>
            </form>
          )}

          {mode === 'register-success' && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
               <i className="fa-solid fa-circle-check text-6xl text-emerald-500 mb-6"></i>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Account Ready</h3>
               <p className="text-slate-500 font-medium mb-8">Your enterprise hub is active. Please sign in.</p>
               <button onClick={() => setMode('login')} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem]">Sign In Now</button>
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
