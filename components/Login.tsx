
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

type Mode = 'login' | 'register' | 'forgot' | 'reset-confirm' | 'otp-verify';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [showMockNotification, setShowMockNotification] = useState(false);

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
    setUserOtp('');
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
      setError('Invalid email or password. Please try again.');
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setMode('otp-verify');
    setShowMockNotification(true);
    setTimeout(() => setShowMockNotification(false), 8000);
  };

  const verifyOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp === generatedOtp) {
      const newUser: User = { username: email, email, password };
      storageService.saveUser(newUser);
      setSuccess('Account verified! You can now access your dashboard.');
      setMode('login');
      resetFields();
    } else {
      setError('Invalid verification code. Check your mock notification.');
    }
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

    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === resetEmail.toLowerCase());
    
    if (userIndex !== -1) {
      users[userIndex].password = password;
      localStorage.setItem('wagetrack_pro_users', JSON.stringify(users));
      setSuccess('Security credentials updated! Please sign in.');
      setMode('login');
      resetFields();
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Visual / Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1920" 
          alt="Business Management" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 via-slate-900/60 to-transparent"></div>
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-white mb-12">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                <i className="fa-solid fa-calculator text-3xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tight">WageTrack<span className="text-indigo-400">Pro</span></span>
            </div>
            
            <div className="space-y-12">
              <div className="max-w-md">
                <h2 className="text-5xl font-black text-white leading-tight mb-6">
                  Manage your workforce with <span className="text-indigo-400">Precision.</span>
                </h2>
                <p className="text-slate-300 text-lg font-medium leading-relaxed">
                  The ultimate hub for high-efficiency businesses tracking time, wages, and productivity in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: 'fa-clock', title: 'Smart Time Tracking', desc: 'Precise clock-in/out logs for up to 15 employees.' },
                  { icon: 'fa-brain', title: 'AI-Powered Insights', desc: 'Predict budget trends and employee efficiency with Gemini.' },
                  { icon: 'fa-file-invoice-dollar', title: 'Automated Payroll', desc: 'Export consolidated monthly sheets in one click.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 max-w-sm">
                    <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400">
                      <i className={`fa-solid ${item.icon} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center space-x-4">
            <span>Trusted by 500+ Local Enterprises</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>
        </div>
      </div>

      {/* Form Interaction Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
        {/* Floating OTP Notification - Improved Mock Notification */}
        {showMockNotification && (
          <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right-full fade-in duration-500 max-w-xs">
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-600 px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Incoming Verification</span>
                <i className="fa-solid fa-envelope text-indigo-200"></i>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-2 font-medium">From: WageTrack Security</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Authorization Code</p>
                  <span className="text-2xl font-black text-indigo-600 tracking-[0.2em]">{generatedOtp}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md">
          {/* Mobile Logo Visibility */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center space-x-3 text-indigo-600">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-200">
                <i className="fa-solid fa-calculator text-2xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">WageTrack<span className="text-indigo-600">Pro</span></span>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            {/* Header Tabs */}
            {(mode === 'login' || mode === 'register') && (
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                <button 
                  onClick={() => { setMode('login'); resetFields(); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMode('register'); resetFields(); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Get Started
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Welcome Back</h3>
                  <p className="text-slate-500 text-sm font-medium">Enter your credentials to access your administrative dashboard.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                    <div className="relative">
                      <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 pl-11 pr-5 py-4 rounded-2xl focus:outline-none transition-all font-medium text-slate-700"
                        placeholder="admin@business.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 px-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                      <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 pl-11 pr-5 py-4 rounded-2xl focus:outline-none transition-all font-medium text-slate-700"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]">
                    Authorize Access
                  </button>
                </form>
              </div>
            )}

            {mode === 'register' && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Create Account</h3>
                  <p className="text-slate-500 text-sm font-medium">Start managing up to 15 employees with our Pro tier.</p>
                </div>
                <form onSubmit={startRegistration} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Email</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="manager@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Create Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                    <input 
                      type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4">
                    Send Verification Code
                  </button>
                </form>
              </div>
            )}

            {mode === 'otp-verify' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                    <i className="fa-solid fa-shield-check text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Two-Factor Security</h3>
                  <p className="text-slate-500 text-sm mt-2 px-4">We've sent a 6-digit authorization code to <br /><strong className="text-slate-800">{email}</strong></p>
                </div>
                <form onSubmit={verifyOtpAndRegister} className="space-y-8">
                  <input 
                    type="text" 
                    value={userOtp}
                    onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full text-center text-4xl font-black tracking-[0.4em] bg-slate-50 border border-slate-100 px-5 py-6 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-indigo-600"
                    autoFocus
                  />
                  <div className="space-y-3">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                      Verify & Activate
                    </button>
                    <button type="button" onClick={() => setMode('register')} className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest py-2 hover:text-slate-600 transition-colors">
                      Use a different email
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900">Account Recovery</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Don't worry, enter your email and we'll verify your identity.</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Registered Email</label>
                    <input 
                      type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="your@email.com"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                      Verify Account
                    </button>
                    <button type="button" onClick={() => { setMode('login'); resetFields(); }} className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest py-2 hover:text-slate-600 transition-colors">
                      Back to Login
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'reset-confirm' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900">Set New Password</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Create a new secure password for your administrative account.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">New Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Confirm New Password</label>
                    <input 
                      type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 mt-4">
                    Restore Access
                  </button>
                </form>
              </div>
            )}

            {/* Notifications */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider p-4 rounded-2xl flex items-center mt-8 animate-in shake">
                <i className="fa-solid fa-triangle-exclamation mr-3 text-sm"></i>
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider p-4 rounded-2xl flex items-center mt-8">
                <i className="fa-solid fa-circle-check mr-3 text-sm"></i>
                {success}
              </div>
            )}
          </div>

          <p className="text-center text-slate-400 text-[10px] mt-10 uppercase font-black tracking-[0.2em]">
            Enterprise Security v4.2 • Protected by AES-256
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
