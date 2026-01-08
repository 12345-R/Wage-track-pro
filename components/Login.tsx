
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

type Mode = 'login' | 'register' | 'forgot' | 'reset-confirm' | 'register-success';

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  showPassword:  boolean;
  onToggleVisible: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder, label, showPassword, onToggleVisible }) => (
  <div className="relative">
    {label && <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{label}</label>}
    <div className="relative">
      <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
      <input 
        type={showPassword ? 'text' : 'password'} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/70 backdrop-blur-md border border-white/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 pl-11 pr-12 py-4 rounded-2xl focus:outline-none transition-all font-medium text-slate-700 shadow-sm"
        placeholder={placeholder}
        required
      />
      <button 
        type="button"
        onClick={onToggleVisible}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
      </button>
    </div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (emailStr: string) => {
    return String(emailStr)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const resetFields = () => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      onLoginSuccess(user.email);
    } else {
      setError('Invalid email or password on this device.');
    }
  };

  const startRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('A valid business email is required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    const users = storageService.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already registered.');
      return;
    }

    const newUser: User = { username: email, email, password };
    storageService.saveUser(newUser);
    
    setMode('register-success');
    resetFields();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());

    if (user) {
      setSuccess(`Identity verified. Please set your new password.`);
      setMode('reset-confirm');
    } else {
      setError('No account found with that email address.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const updated = storageService.updateUserPassword(resetEmail, password);
    
    if (updated) {
      setSuccess('Security credentials updated! Please sign in.');
      setMode('login');
      resetFields();
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2000" 
          alt="Bright Minimalist Office" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-transparent to-white/30"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 mb-4">
            <i className="fa-solid fa-calculator text-4xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            WageTrack<span className="text-indigo-600">Pro</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Enterprise Access</p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-200/40 border border-white relative">
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-slate-200/40 p-1.5 rounded-2xl mb-10 border border-white/50">
              <button 
                onClick={() => { setMode('login'); resetFields(); }}
                className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('register'); resetFields(); }}
                className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Setup
              </button>
            </div>
          )}

          {mode === 'login' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Authorize Access</h3>
                <p className="text-slate-500 text-sm font-medium">Verify your administrative credentials.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/70 backdrop-blur-md border border-white/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 pl-11 pr-5 py-4 rounded-2xl focus:outline-none transition-all font-medium text-slate-700 shadow-sm"
                      placeholder="admin@business.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 px-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Reset?</button>
                  </div>
                  <PasswordInput 
                    value={password} 
                    onChange={setPassword} 
                    placeholder="••••••••" 
                    showPassword={showPassword}
                    onToggleVisible={togglePasswordVisibility}
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] text-lg mt-4">
                  Sign In
                </button>
              </form>
            </div>
          )}

          {mode === 'register' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Create Account</h3>
                <p className="text-slate-500 text-sm font-medium">Setup your business management hub.</p>
              </div>
              <form onSubmit={startRegistration} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Business Email</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/70 backdrop-blur-md border border-white/50 pl-11 pr-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                      placeholder="manager@company.com"
                      required
                    />
                  </div>
                </div>
                <PasswordInput 
                  label="Create Password" 
                  value={password} 
                  onChange={setPassword} 
                  placeholder="••••••••" 
                  showPassword={showPassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                <PasswordInput 
                  label="Confirm Password" 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                  placeholder="••••••••" 
                  showPassword={showPassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-6 text-lg">
                  Get Started
                </button>
              </form>
            </div>
          )}

          {mode === 'register-success' && (
            <div className="text-center py-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100/50">
                <i className="fa-solid fa-circle-check text-5xl"></i>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3">All Set!</h3>
              <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed px-4 text-center">Your business account has been created successfully.</p>
              <button 
                onClick={() => setMode('login')}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-lg"
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Recovery</h3>
                <p className="text-slate-500 text-sm font-medium">Verify your email to restore access.</p>
              </div>
              <form onSubmit={handleForgot} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Registered Email</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-white/70 backdrop-blur-md border border-white/50 pl-11 pr-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-lg">
                    Verify Identity
                  </button>
                  <button type="button" onClick={() => setMode('login')} className="w-full text-slate-500 text-xs font-black uppercase py-2 tracking-widest hover:text-slate-800">Back to Login</button>
                </div>
              </form>
            </div>
          )}

          {mode === 'reset-confirm' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h3>
                <p className="text-slate-500 text-sm font-medium">Set a strong new password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <PasswordInput 
                  label="New Password" 
                  value={password} 
                  onChange={setPassword} 
                  placeholder="••••••••" 
                  showPassword={showPassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                <PasswordInput 
                  label="Confirm New Password" 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                  placeholder="••••••••" 
                  showPassword={showPassword}
                  onToggleVisible={togglePasswordVisibility}
                />
                <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-[2rem] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 mt-6 text-lg">
                  Update & Restore
                </button>
              </form>
            </div>
          )}

          {error && <div className="bg-rose-50/80 backdrop-blur-md text-rose-600 text-[10px] font-black uppercase p-4 rounded-2xl mt-8 border border-rose-100 flex items-center shadow-sm"><i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}</div>}
          {success && <div className="bg-emerald-50/80 backdrop-blur-md text-emerald-600 text-[10px] font-black uppercase p-4 rounded-2xl mt-8 border border-emerald-100 flex items-center shadow-sm"><i className="fa-solid fa-circle-check mr-2"></i>{success}</div>}
        </div>

        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-12 animate-in fade-in duration-1000 delay-500">
          Secure Suite • v4.2.5 • WageTrack Pro
        </p>
      </div>
    </div>
  );
};

export default Login;
