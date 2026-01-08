
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
    // Check for sync/access data in URL first
    const syncResult = storageService.checkForAccessLink();
    if (syncResult.success && syncResult.email) {
      localStorage.setItem('wagetrack_current_user', syncResult.email);
      return syncResult.email;
    }
    return localStorage.getItem('wagetrack_current_user');
  });
  
  const [state, setState] = useState<AppState>(() => {
    const user = currentUser || localStorage.getItem('wagetrack_current_user');
    return user ? storageService.load(user) : { employees: [], shifts: [] };
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Access Link State
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessUrl, setAccessUrl] = useState('');

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

  const generateAccessLink = () => {
    if (currentUser) {
      const url = storageService.getUniversalLink(currentUser);
      setAccessUrl(url);
      setShowAccessModal(true);
    }
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...empData, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, employees: [...prev.employees, newEmp] }));
  };

  const updateEmployee = (id: string, empData: Omit<Employee, 'id'>) => {
    setState(prev => ({ ...prev, employees: prev.employees.map(e => e.id === id ? { ...empData, id } : e) }));
  };

  const deleteEmployee = (id: string) => {
    setState(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== id), shifts: prev.shifts.filter(s => s.employeeId !== id) }));
  };

  const addShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = { ...shiftData, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, shifts: [...prev.shifts, newShift] }));
  };

  const updateShift = (id: string, updatedData: Omit<Shift, 'id'>) => {
    setState(prev => ({ ...prev, shifts: prev.shifts.map(s => s.id === id ? { ...updatedData, id } : s) }));
  };

  const deleteShift = (id: string) => {
    if (window.confirm("Delete this shift entry?")) {
      setState(prev => ({ ...prev, shifts: prev.shifts.filter(s => s.id !== id) }));
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
          <button 
            onClick={generateAccessLink} 
            className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
          >
            <i className="fa-solid fa-link"></i>
            <span>Generate Access Link</span>
          </button>
          <div className="hidden sm:flex flex-col text-right pr-4 border-r border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
             <p className="text-sm font-black text-slate-800 tabular-nums">{currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}</p>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-200 border border-white transition-all active:scale-90">
            {currentUser?.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full transition-all duration-300">
        <header className="mb-6 px-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{currentView.replace('-', ' ')}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Enterprise Management Hub</p>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {currentView === 'dashboard' && <Dashboard employees={state.employees} shifts={state.shifts} />}
          {currentView === 'employees' && <EmployeeList employees={state.employees} onAdd={addEmployee} onUpdate={updateEmployee} onDelete={deleteEmployee} />}
          {currentView === 'shifts' && <ShiftLog employees={state.employees} shifts={state.shifts} onAddShift={addShift} onUpdateShift={updateShift} onDeleteShift={deleteShift} />}
          {currentView === 'ai-insights' && <AIReport employees={state.employees} shifts={state.shifts} />}
          {currentView === 'reports' && <MonthlyReport employees={state.employees} shifts={state.shifts} />}
        </div>
      </main>

      {/* Access Link Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-sm">
              <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Universal Access Link</h3>
            <p className="text-slate-500 text-center text-sm font-medium mb-8">Open this link on any new phone or computer to instantly sync all your team data and employee records.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 relative">
              <textarea 
                readOnly 
                value={accessUrl} 
                className="w-full bg-transparent border-none text-[10px] font-mono text-slate-400 break-all resize-none h-24 outline-none"
              />
              <button 
                onClick={() => { navigator.clipboard.writeText(accessUrl); alert('Link Copied!'); }}
                className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
              >
                Copy Universal Link
              </button>
            </div>
            
            <button onClick={() => setShowAccessModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-[0.2em] py-2">Close Security Hub</button>
          </div>
        </div>
      )}

      {/* Navigation and Menus */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 z-[100] px-1 py-3 md:hidden">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {bottomNavItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id as View); setIsMenuOpen(false); }} className={`flex flex-col items-center space-y-1 ${currentView === item.id ? 'text-white' : 'text-slate-400'}`}>
              <div className={`w-16 h-11 rounded-2xl flex items-center justify-center ${currentView === item.id ? 'bg-white/10 shadow-lg' : ''}`}><i className={`fa-solid ${item.icon} text-2xl`}></i></div>
              <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center space-y-1 ${isMenuOpen ? 'text-white' : 'text-slate-400'}`}>
            <div className={`w-16 h-11 rounded-2xl flex items-center justify-center ${isMenuOpen ? 'bg-white/10' : ''}`}><i className="fa-solid fa-bars text-2xl"></i></div>
            <span className="text-[11px] font-bold tracking-tight">Menu</span>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[120] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10"></div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-8 p-4 bg-indigo-50 rounded-3xl border border-indigo-100">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black">
                  {currentUser?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-slate-900 truncate max-w-[200px]">{currentUser}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Enterprise Global Admin</p>
                </div>
              </div>
              <button onClick={() => { setCurrentView('employees'); setIsMenuOpen(false); }} className="w-full flex items-center space-x-4 p-5 rounded-[1.5rem] bg-slate-50 text-slate-700 font-black hover:bg-slate-100 transition-all"><i className="fa-solid fa-users text-xl text-indigo-500"></i><span>Team Management</span></button>
              <button onClick={() => { generateAccessLink(); setIsMenuOpen(false); }} className="w-full flex items-center space-x-4 p-5 rounded-[1.5rem] bg-emerald-50 text-emerald-600 font-black hover:bg-emerald-100 transition-all"><i className="fa-solid fa-link text-xl"></i><span>Generate Access Link</span></button>
              <button onClick={() => { setCurrentView('ai-insights'); setIsMenuOpen(false); }} className="w-full flex items-center space-x-4 p-5 rounded-[1.5rem] bg-slate-50 text-slate-700 font-black hover:bg-slate-100 transition-all"><i className="fa-solid fa-wand-magic-sparkles text-xl text-indigo-500"></i><span>AI Analytics</span></button>
              <button onClick={handleLogout} className="w-full flex items-center space-x-4 p-5 rounded-[1.5rem] bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all"><i className="fa-solid fa-right-from-bracket text-xl"></i><span>Sign Out</span></button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex-col">
        <div className="p-6 space-y-2 flex-1">
          {sidebarNavItems.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id as View)} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-black ${currentView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <i className={`fa-solid ${item.icon} text-lg w-6`}></i><span>{item.label}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button onClick={generateAccessLink} className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-emerald-600 hover:bg-emerald-50 font-black transition-all">
                <i className="fa-solid fa-link text-lg w-6"></i><span>Access Link</span>
             </button>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100">
           <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 font-black transition-all">
              <i className="fa-solid fa-right-from-bracket text-lg w-6"></i><span>Logout</span>
           </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
