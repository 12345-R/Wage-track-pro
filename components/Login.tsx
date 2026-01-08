
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

type Mode = 'login' | 'register' | 'sync' | 'register-success';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [syncKey, setSyncKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      onLoginSuccess(user.email);
    } else {
      // Logic for different devices: if the user doesn't exist locally, suggest sync
      const userExistsLocally = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userExistsLocally) {
        setError('This device does not recognize your account. Please use "Sync New Device" to restore your data.');
      } else {
        setError('Invalid password.');
      }
    }
  };

  const handleSyncRestore = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = storageService.applyIdentityBundle(syncKey);
    if (result.success && result.email) {
      setSuccess('Identity Restored! Logging you in...');
      setTimeout(() => onLoginSuccess(result.email!), 1500);
    } else {
      setError(result.error || 'Sync failed.');
    }
  };

  const startRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const newUser: User = { username: email, email, password };
    storageService.saveUser(newUser);
    setMode('register-success');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0 opacity-40">
        <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="bg" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 border border-indigo-50">
            <i className="fa-solid fa-calculator text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">WageTrack Pro</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Enterprise Payroll Hub</p>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-200/50 border border-white">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
            <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
            <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>New Setup</button>
            <button onClick={() => { setMode('sync'); setError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === 'sync' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}><i className="fa-solid fa-cloud-arrow-down mr-1"></i>Sync</button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-500">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium" placeholder="admin@business.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-lg">Sign In</button>
            </form>
          )}

          {mode === 'sync' && (
            <form onSubmit={handleSyncRestore} className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                 <h3 className="text-xl font-black text-emerald-600">Sync New Device</h3>
                 <p className="text-xs font-medium text-slate-500 mt-1">Restore your business profile instantly using your Sync Key.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Universal Identity Key</label>
                <textarea required value={syncKey} onChange={e => setSyncKey(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-[10px] text-slate-600 h-32 resize-none" placeholder="Paste your base64 sync code here..." />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-[2rem] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 text-lg">Restore from Identity Key</button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={startRegistration} className="space-y-6 animate-in fade-in duration-500">
               <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none" placeholder="manager@office.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none" placeholder="Password" />
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none" placeholder="Confirm" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl text-lg">Setup Business</button>
            </form>
          )}

          {mode === 'register-success' && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
               <i className="fa-solid fa-circle-check text-6xl text-emerald-500 mb-6"></i>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Success!</h3>
               <p className="text-slate-500 font-medium mb-8">Your account is ready. Please sign in.</p>
               <button onClick={() => setMode('login')} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem]">Sign In Now</button>
            </div>
          )}

          {error && <div className="mt-8 p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-2xl border border-rose-100 animate-in slide-in-from-top-2"><i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}</div>}
          {success && <div className="mt-8 p-4 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2"><i className="fa-solid fa-check-circle mr-2"></i>{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default Login;
