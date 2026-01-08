
import React, { useState, useEffect } from 'react';
import { AppState, Employee, Shift, View } from './types';
import { storageService } from './services/storageService';
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

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize state with current user and storage
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

  // Updated navigation for mobile bottom bar
  const mainNavItems = [
    { id: 'dashboard', label: 'Home', icon: 'fa-house' },
    { id: 'employees', label: 'Employees', icon: 'fa-users' },
    { id: 'shifts', label: 'Time Clock', icon: 'fa-clock-rotate-left' },
    { id: 'monthly-reports', label: 'Monthly Sheet', icon: 'fa-file-invoice-dollar' },
  ];

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard employees={state.employees} shifts={state.shifts} />;
      case 'employees': return <EmployeeList employees={state.employees} onAdd={addEmployee} onDelete={deleteEmployee} />;
      case 'shifts': return <ShiftLog employees={state.employees} shifts={state.shifts} onAddShift={addShift} onUpdateShift={updateShift} onDeleteShift={deleteShift} />;
      case 'ai-insights': return <AIReport employees={state.employees} shifts={state.shifts} />;
      case 'monthly-reports': return <MonthlyReport employees={state.employees} shifts={state.shifts} />;
      default: return <Dashboard employees={state.employees} shifts={state.shifts} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
      {/* Top Header - Simplified */}
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
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-500 font-bold border border-slate-200">
            {currentUser?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
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

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-[100] px-2 py-3 md:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setIsMenuOpen(false);
              }}
              className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
                currentView === item.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <div className={`w-12 h-8 rounded-2xl flex items-center justify-center transition-all ${
                currentView === item.id ? 'bg-indigo-50' : 'bg-transparent'
              }`}>
                <i className={`fa-solid ${item.icon} text-lg`}></i>
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${currentView === item.id ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          ))}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              isMenuOpen ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`w-12 h-8 rounded-2xl flex items-center justify-center transition-all ${
              isMenuOpen ? 'bg-indigo-50' : 'bg-transparent'
            }`}>
              <i className="fa-solid fa-bars text-lg"></i>
            </div>
            <span className={`text-[10px] font-bold tracking-tight ${isMenuOpen ? 'opacity-100' : 'opacity-60'}`}>
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-up Menu Modal (Drawer) */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[120] p-8 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-100">
                  {currentUser?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 truncate max-w-[200px]">{currentUser}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => { setCurrentView('ai-insights'); setIsMenuOpen(false); }}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-indigo-50 text-indigo-600 font-bold transition-all hover:bg-indigo-100"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                  <span>AI Analytics & Insights</span>
                </button>
                
                <button 
                  onClick={() => { /* Could add profile settings here */ }}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 text-slate-600 font-bold transition-all hover:bg-slate-100"
                >
                  <i className="fa-solid fa-gear text-xl"></i>
                  <span>Account Settings</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold transition-all hover:bg-rose-100"
                >
                  <i className="fa-solid fa-right-from-bracket text-xl"></i>
                  <span>Sign Out Account</span>
                </button>
              </div>

              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] pt-4">
                WageTrack Pro • v4.2.0
              </p>
            </div>
          </div>
        </>
      )}

      {/* Desktop Navigation - Hidden on Mobile */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex-col">
        <div className="p-6 space-y-2 flex-1">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${
                currentView === item.id 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setCurrentView('ai-insights')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${
              currentView === 'ai-insights' 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <i className="fa-solid fa-brain text-lg w-6"></i>
            <span>AI Analytics</span>
          </button>
        </div>
        <div className="p-6 border-t border-slate-100">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 font-bold transition-all"
           >
              <i className="fa-solid fa-right-from-bracket text-lg w-6"></i>
              <span>Logout</span>
           </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
