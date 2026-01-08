
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
    {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>}
    <div className="relative">
      <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
      <input 
        type={showPassword ? 'text' : 'password'} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 pl-11 pr-12 py-4 rounded-2xl focus:outline-none transition-all font-medium text-slate-700"
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
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1920" 
          alt="Business Management" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-105"
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
                  The hub for high-efficiency businesses tracking time, wages, and productivity in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: 'fa-clock', title: 'Smart Time Tracking', desc: 'Precise logs for your team.' },
                  { icon: 'fa-brain', title: 'AI Insights', desc: 'Predict trends and efficiency with Gemini.' },
                  { icon: 'fa-save', title: 'Auto Persistence', desc: 'Changes are saved instantly as you work.' }
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
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            © 2024 WageTrack Pro • Enterprise Suite
          </div>
        </div>
      </div>

      {/* Form Interaction Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden bg-slate-100">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white">
            {/* Header Tabs */}
            {(mode === 'login' || mode === 'register') && (
              <div className="flex bg-slate-100/50 p-1 rounded-2xl mb-8">
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
                <h3 className="text-2xl font-black text-slate-900 mb-6">Welcome Back</h3>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 px-5 py-4 rounded-2xl focus:outline-none transition-all font-medium text-slate-700"
                      placeholder="admin@business.com"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 px-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                      <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Forgot?</button>
                    </div>
                    <PasswordInput 
                      value={password} 
                      onChange={setPassword} 
                      placeholder="••••••••" 
                      showPassword={showPassword}
                      onToggleVisible={togglePasswordVisibility}
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]">
                    Authorize Access
                  </button>
                </form>
              </div>
            )}

            {mode === 'register' && (
              <div className="animate-in fade-in duration-500">
                <h3 className="text-2xl font-black text-slate-900 mb-6">Create Account</h3>
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
                  <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4">
                    Create Account
                  </button>
                </form>
              </div>
            )}

            {mode === 'register-success' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/50">
                  <i className="fa-solid fa-circle-check text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">All Set!</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">Account created. All your data will be saved automatically.</p>
                <button 
                  onClick={() => setMode('login')}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-black text-slate-900 mb-6">Recovery</h3>
                <form onSubmit={handleForgot} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Registered Email</label>
                    <input 
                      type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                      Verify Identity
                    </button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-slate-400 text-xs font-bold uppercase py-2">Back</button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'reset-confirm' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-black text-slate-900 mb-6">Reset Password</h3>
                <form onSubmit={handleResetPassword} className="space-y-4">
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
                  <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 mt-4">
                    Update & Restore
                  </button>
                </form>
              </div>
            )}

            {error && <div className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase p-4 rounded-2xl mt-8 animate-bounce">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase p-4 rounded-2xl mt-8">{success}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
