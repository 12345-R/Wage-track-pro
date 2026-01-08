
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

type Mode = 'login' | 'register' | 'forgot' | 'reset-confirm';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetFields = () => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = storageService.getUsers();
    const user = users.find(u => 
      (u.username === username || u.email === username) && u.password === password
    );

    if (user) {
      onLoginSuccess(user.username);
    } else {
      setError('Invalid credentials. Please check your username/email and password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    const users = storageService.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError('Username already taken.');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Email already registered.');
      return;
    }

    const newUser: User = { username, email, password };
    storageService.saveUser(newUser);
    setSuccess('Account created successfully! Please sign in.');
    setMode('login');
    resetFields();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());

    if (user) {
      setSuccess(`Identity verified for ${user.username}. Set your new password below.`);
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

    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === resetEmail.toLowerCase());
    
    if (userIndex !== -1) {
      users[userIndex].password = password;
      localStorage.setItem('wagetrack_pro_users', JSON.stringify(users));
      setSuccess('Password updated successfully! You can now log in.');
      setMode('login');
      resetFields();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex bg-indigo-600 text-white w-16 h-16 rounded-3xl items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6">
            <i className="fa-solid fa-calculator text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">WageTrack<span className="text-indigo-500">Pro</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Secure Payroll Management</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
          {/* Header Tabs (only for login/register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => { setMode('login'); resetFields(); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('register'); resetFields(); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Dynamic Content Based on Mode */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Username or Email</label>
                <input 
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-100 px-5 py-4 rounded-2xl focus:outline-none transition-all font-medium"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <div className="flex justify-between px-1 mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Forgot Password?</button>
                </div>
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-100 px-5 py-4 rounded-2xl focus:outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]">
                Sign In
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Username</label>
                <input 
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Email Address</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Password</label>
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Confirm Password</label>
                <input 
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                Register Business
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-black text-slate-800 mb-2">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your registered email address to find your account.</p>
              <form onSubmit={handleForgot} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                  <input 
                    type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                    placeholder="your@email.com"
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  Verify Identity
                </button>
                <button type="button" onClick={() => { setMode('login'); resetFields(); }} className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest py-2">
                  Back to Login
                </button>
              </form>
            </div>
          )}

          {mode === 'reset-confirm' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-black text-slate-800 mb-2">New Password</h2>
              <p className="text-slate-500 text-sm mb-6">Create a secure new password for your account.</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">New Password</label>
                  <input 
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Confirm New Password</label>
                  <input 
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 mt-4">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs font-bold p-4 rounded-2xl flex items-center mt-6 animate-in shake">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 text-xs font-bold p-4 rounded-2xl flex items-center mt-6">
              <i className="fa-solid fa-circle-check mr-2"></i>
              {success}
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase font-bold tracking-widest leading-loose">
          WageTrack Pro v2.5 • Enterprise Data Isolation Enabled
        </p>
      </div>
    </div>
  );
};

export default Login;
