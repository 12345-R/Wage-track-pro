
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

  // Synchronize state with current user and storage
  useEffect(() => {
    if (currentUser) {
      storageService.save(currentUser, state);
    }
  }, [state, currentUser]);

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('wagetrack_current_user', username);
    setState(storageService.load(username));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wagetrack_current_user');
    setCurrentView('dashboard');
    setIsMenuOpen(false);
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'avatar'> & { emoji?: string }) => {
    const newEmp: Employee = {
      ...empData,
      id: Math.random().toString(36).substr(2, 9),
      avatar: `https://picsum.photos/seed/${empData.name.replace(/\s/g, '')}/150`
    };
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }));
  };

  const deleteEmployee = (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee? This will also remove their shift history.")) {
      setState(prev => ({
        ...prev,
        employees: prev.employees.filter(e => e.id !== id),
        shifts: prev.shifts.filter(s => s.employeeId !== id)
      }));
    }
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

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'employees', label: 'Employees', icon: 'fa-users-gear' },
    { id: 'shifts', label: 'Shift Logs', icon: 'fa-calendar-check' },
    { id: 'monthly-reports', label: 'Monthly Sheet', icon: 'fa-file-invoice-dollar' },
    { id: 'ai-insights', label: 'AI Analytics', icon: 'fa-brain' }
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 sticky top-0 z-[60] justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>
          <div className="flex items-center space-x-2 text-indigo-600">
            <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
              <i className="fa-solid fa-calculator text-sm"></i>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">WageTrack<span className="text-indigo-600">Pro</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right border-r border-slate-200 pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Account</p>
            <div className="flex items-center text-indigo-500 text-xs font-bold">
              <i className="fa-solid fa-circle-user mr-1.5"></i>
              {currentUser}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-500 transition-colors text-sm font-semibold flex items-center space-x-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <nav className={`fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full shadow-none'} flex flex-col`}>
        <div className="p-6 flex-1">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  currentView === item.id 
                    ? 'bg-indigo-50 text-indigo-600 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-lg w-6 ${currentView === item.id ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-6 border-t border-slate-50 space-y-4">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold group"
           >
              <i className="fa-solid fa-right-from-bracket text-lg w-6 group-hover:translate-x-1 transition-transform"></i>
              <span>Sign Out</span>
           </button>

           <div className="flex items-center space-x-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-500 font-bold">
                {currentUser?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{currentUser}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Business Admin</p>
              </div>
           </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
            {currentView.replace('-', ' ')}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {currentView === 'dashboard' ? 'Real-time overview of business payroll and hours.' : 'Manage your business resources effectively.'}
          </p>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderView()}
        </div>
      </main>

      <footer className="p-4 text-center border-t border-slate-200 bg-white">
        <p className="text-slate-400 text-xs">WageTrack Pro &copy; {new Date().getFullYear()} • Secure Multi-Tenant Management</p>
      </footer>
    </div>
  );
};

export default App;
