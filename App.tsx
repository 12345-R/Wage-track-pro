
import React, { useState, useEffect } from 'react';
import { AppState, Employee, Shift, View } from './types';
import { storageService } from './services/storageService';
import { APP_VERSION } from './constants';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import ShiftLog from './components/ShiftLog';
import AIReport from './components/AIReport';
import MonthlyReport from './components/MonthlyReport';
import Login from './components/Login';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('wagetrack_current_user');
  });
  
  const [state, setState] = useState<AppState>(() => {
    const user = localStorage.getItem('wagetrack_current_user');
    return user ? storageService.load(user) : { employees: [], shifts: [] };
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Identity Key Management
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [identityKey, setIdentityKey] = useState('');

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('wagetrack_app_version');
    if (lastSeenVersion && lastSeenVersion !== APP_VERSION) {
      localStorage.setItem('wagetrack_app_version', APP_VERSION);
      window.location.reload();
    } else {
      localStorage.setItem('wagetrack_app_version', APP_VERSION);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      storageService.save(currentUser, state);
    }
  }, [state, currentUser]);

  const handleLoginSuccess = (email: string) => {
    setCurrentUser(email);
    localStorage.setItem('wagetrack_current_user', email);
    setState(storageService.load(email));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wagetrack_current_user');
    setCurrentView('dashboard');
    setIsMenuOpen(false);
  };

  const handleShowIdentity = () => {
    if (currentUser) {
      const key = storageService.getIdentityKey(currentUser);
      setIdentityKey(key);
      setShowSyncModal(true);
    }
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }));
  };

  const updateEmployee = (id: string, empData: Omit<Employee, 'id'>) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => e.id === id ? { ...empData, id } : e)
    }));
  };

  const deleteEmployee = (id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id),
      shifts: prev.shifts.filter(s => s.employeeId !== id)
    }));
  };

  const addShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({
      ...prev,
      shifts: [...prev.shifts, newShift]
    }));
  };

  const updateShift = (id: string, updatedData: Omit<Shift, 'id'>) => {
    setState(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => s.id === id ? { ...updatedData, id } : s)
    }));
  };

  const deleteShift = (id: string) => {
    if (window.confirm("Delete this shift entry?")) {
      setState(prev => ({
        ...prev,
        shifts: prev.shifts.filter(s => s.id !== id)
      }));
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: 'fa-house' },
    { id: 'shifts', label: 'Time Clock', icon: 'fa-clock-rotate-left' },
    { id: 'reports', label: 'Report', icon: 'fa-file-invoice-dollar' },
  ];

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Home', icon: 'fa-house' },
    { id: 'employees', label: 'Employees', icon: 'fa-users' },
    { id: 'shifts', label: 'Time Clock', icon: 'fa-clock-rotate-left' },
    { id: 'reports', label: 'Report', icon: 'fa-file-invoice-dollar' },
    { id: 'ai-insights', label: 'AI Analytics', icon: 'fa-brain' },
  ];

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard employees={state.employees} shifts={state.shifts} />;
      case 'employees': return (
        <EmployeeList 
          employees={state.employees} 
          onAdd={addEmployee} 
          onUpdate={updateEmployee}
          onDelete={deleteEmployee} 
        />
      );
      case 'shifts': return <ShiftLog employees={state.employees} shifts={state.shifts} onAddShift={addShift} onUpdateShift={updateShift} onDeleteShift={deleteShift} />;
      case 'ai-insights': return <AIReport employees={state.employees} shifts={state.shifts} />;
      case 'reports': return <MonthlyReport employees={state.employees} shifts={state.shifts} />;
      default: return <Dashboard employees={state.employees} shifts={state.shifts} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-28 md:pb-0">
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-[60] justify-between">
        <div className="flex items-center space-x-2 text-indigo-600">
          <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <i className="fa-solid fa-calculator text-xs"></i>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800">WageTrack<span className="text-indigo-600">Pro</span></span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-sm font-black text-slate-800 tabular-nums tracking-tight leading-none">
              {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
            </p>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-500 font-bold border border-slate-200">
            {currentUser?.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full transition-all duration-300">
        <header className="mb-6 px-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            {currentView === 'dashboard' ? 'Dashboard' : currentView.replace('-', ' ')}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">
            {currentView === 'dashboard' ? 'Daily Performance' : 'Management Console'}
          </p>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderView()}
        </div>
      </main>

      {/* Identity Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <i className="fa-solid fa-cloud-bolt text-2xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Business Identity Key</h3>
            <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">Copy this key to sync your account to a new device. On the new device, select <b>"Restore Business"</b> during login and paste this code.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-8 relative border border-slate-100">
              <textarea 
                readOnly 
                value={identityKey} 
                className="w-full bg-transparent border-none text-[10px] font-mono text-slate-400 h-32 resize-none focus:ring-0"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(identityKey);
                  alert('Identity key copied to clipboard!');
                }}
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600 shadow-sm border border-slate-100 hover:bg-indigo-50 transition-all uppercase tracking-widest"
              >
                Copy Code
              </button>
            </div>
            
            <button 
              onClick={() => setShowSyncModal(false)}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
            >
              Close Identity Hub
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 z-[100] px-1 py-3 md:hidden">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setIsMenuOpen(false);
              }}
              className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
                currentView === item.id ? 'text-white' : 'text-slate-400'
              }`}
            >
              <div className={`w-16 h-11 rounded-2xl flex items-center justify-center transition-all ${
                currentView === item.id ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent'
              }`}>
                <i className={`fa-solid ${item.icon} text-2xl`}></i>
              </div>
              <span className={`text-[13px] font-bold tracking-tight ${currentView === item.id ? 'opacity-100' : 'opacity-50'}`}>
                {item.label}
              </span>
            </button>
          ))}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              isMenuOpen ? 'text-white' : 'text-slate-400'
            }`}
          >
            <div className={`w-16 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isMenuOpen ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent'
            }`}>
              <i className="fa-solid fa-bars text-2xl"></i>
            </div>
            <span className={`text-[13px] font-bold tracking-tight ${isMenuOpen ? 'opacity-100' : 'opacity-50'}`}>
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Slide-up Menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[120] p-8 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black">
                  {currentUser?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 truncate max-w-[200px]">{currentUser}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Admin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => { setCurrentView('employees'); setIsMenuOpen(false); }}
                  className="flex items-center space-x-4 p-5 rounded-2xl bg-slate-50 text-slate-700 font-black hover:bg-slate-100 transition-all"
                >
                  <i className="fa-solid fa-users text-xl"></i>
                  <span>Team Management</span>
                </button>

                <button 
                  onClick={() => { handleShowIdentity(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-4 p-5 rounded-2xl bg-emerald-50 text-emerald-600 font-black hover:bg-emerald-100"
                >
                  <i className="fa-solid fa-fingerprint text-xl"></i>
                  <div className="text-left">
                    <p>Business Identity Hub</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-400">Sync to new devices</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setCurrentView('ai-insights'); setIsMenuOpen(false); }}
                  className="flex items-center space-x-4 p-5 rounded-2xl bg-indigo-50 text-indigo-600 font-black hover:bg-indigo-100"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                  <span>AI Analytics</span>
                </button>

                <button onClick={handleLogout} className="flex items-center space-x-4 p-5 rounded-2xl bg-rose-50 text-rose-600 font-bold">
                  <i className="fa-solid fa-right-from-bracket text-xl"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex-col">
        <div className="p-6 space-y-2 flex-1">
          {sidebarNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${
                currentView === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button 
                onClick={handleShowIdentity}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-emerald-600 hover:bg-emerald-50 font-bold transition-all"
             >
                <i className="fa-solid fa-fingerprint text-lg w-6"></i>
                <span>Identity Key</span>
             </button>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100">
           <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 font-bold">
              <i className="fa-solid fa-right-from-bracket text-lg w-6"></i>
              <span>Logout</span>
           </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
