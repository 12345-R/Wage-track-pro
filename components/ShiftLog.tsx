
import React, { useState } from 'react';
import { Employee, Shift } from '../types';

interface ShiftLogProps {
  employees: Employee[];
  shifts: Shift[];
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onUpdateShift: (id: string, shift: Omit<Shift, 'id'>) => void;
  onDeleteShift: (id: string) => void;
}

const ShiftLog: React.FC<ShiftLogProps> = ({ employees, shifts, onAddShift, onUpdateShift, onDeleteShift }) => {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clockIn, setClockIn] = useState('09:00');
  const [clockOut, setClockOut] = useState('17:00');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation state
  const [pendingShift, setPendingShift] = useState<Omit<Shift, 'id'> | null>(null);

  const setTimeToNow = (setter: (val: string) => void) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setter(timeStr);
  };

  const calculateShift = () => {
    if (!selectedEmp) return null;
    const emp = employees.find(e => e.id === selectedEmp);
    if (!emp) return null;

    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    
    let diffHours = (outH + outM / 60) - (inH + inM / 60);
    if (diffHours < 0) diffHours += 24; // Handle overnight shifts

    return {
      employeeId: selectedEmp,
      date,
      clockIn,
      clockOut,
      totalHours: Number(diffHours.toFixed(2)),
      earnedWage: Number((diffHours * emp.hourlyRate).toFixed(2))
    };
  };

  const handleInitiateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const shift = calculateShift();
    if (shift) {
      setPendingShift(shift);
    }
  };

  const finalizeLog = () => {
    if (!pendingShift) return;

    if (editingId) {
      onUpdateShift(editingId, pendingShift);
    } else {
      onAddShift(pendingShift);
    }

    resetForm();
    setPendingShift(null);
  };

  const resetForm = () => {
    setSelectedEmp('');
    setClockIn('09:00');
    setClockOut('17:00');
    setEditingId(null);
  };

  const startEdit = (shift: Shift) => {
    setEditingId(shift.id);
    setSelectedEmp(shift.employeeId);
    setDate(shift.date);
    setClockIn(shift.clockIn);
    setClockOut(shift.clockOut || '17:00');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* Redesigned Manual Log Section */}
      <div className={`bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 transition-all duration-300 ${editingId ? 'border-indigo-400 bg-indigo-50/20' : 'border-transparent'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-clock-rotate-left'} text-xl`}></i>
              </div>
              {editingId ? 'Update Record' : 'Log New Shift'}
            </h3>
            <p className="text-slate-500 font-medium mt-1 ml-16">Enter employee hours and verify earnings.</p>
          </div>
          {editingId && (
            <button 
              onClick={resetForm} 
              className="text-sm font-black text-rose-500 hover:text-rose-600 bg-rose-50 px-6 py-3 rounded-2xl transition-all uppercase tracking-widest active:scale-95"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleInitiateLog} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1 group-focus-within:text-indigo-500 transition-colors">Select Staff</label>
              <div className="relative">
                <i className="fa-solid fa-user-tag absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400"></i>
                <select 
                  required 
                  value={selectedEmp} 
                  onChange={(e) => setSelectedEmp(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg font-bold text-slate-700 appearance-none transition-all shadow-sm"
                >
                  <option value="">Choose Employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1 group-focus-within:text-indigo-500 transition-colors">Shift Date</label>
              <div className="relative">
                <i className="fa-solid fa-calendar-day absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400"></i>
                <input 
                  type="date" 
                  required 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg font-bold text-slate-700 transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-[0.15em] group-focus-within:text-indigo-500 transition-colors">Clock In</label>
                <button 
                  type="button" 
                  onClick={() => setTimeToNow(setClockIn)} 
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-tighter"
                >
                  Now
                </button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-play absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400"></i>
                <input 
                  type="time" 
                  required 
                  value={clockIn} 
                  onChange={(e) => setClockIn(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg font-bold text-slate-700 transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-[0.15em] group-focus-within:text-indigo-500 transition-colors">Clock Out</label>
                <button 
                  type="button" 
                  onClick={() => setTimeToNow(setClockOut)} 
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-tighter"
                >
                  Now
                </button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-stop absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400"></i>
                <input 
                  type="time" 
                  required 
                  value={clockOut} 
                  onChange={(e) => setClockOut(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg font-bold text-slate-700 transition-all shadow-sm" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className={`w-full text-white py-6 rounded-3xl text-xl font-black transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center space-x-3 ${
                editingId 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              <i className={`fa-solid ${editingId ? 'fa-check-double' : 'fa-magnifying-glass-chart'}`}></i>
              <span>{editingId ? 'Commit Update' : 'Review & Calculate Earnings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verification Modal - Increased Font and Sizing */}
      {pendingShift && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-lg shadow-emerald-50">
              <i className="fa-solid fa-file-invoice text-4xl"></i>
            </div>
            <h3 className="text-3xl font-black text-slate-900 text-center mb-2">Final Verification</h3>
            <p className="text-slate-500 text-center font-medium mb-10">Please confirm these details are accurate.</p>
            
            <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 space-y-5 border border-slate-100 shadow-inner">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee</span>
                <span className="text-lg font-bold text-slate-900">{employees.find(e => e.id === pendingShift.employeeId)?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Schedule</span>
                <span className="text-base font-bold text-slate-700">{pendingShift.clockIn} → {pendingShift.clockOut}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Time</span>
                <span className="text-base font-black text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">{pendingShift.totalHours} Hours</span>
              </div>
              <div className="flex justify-between items-center pt-5 mt-4 border-t border-slate-200">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Net Payout</span>
                <span className="text-4xl font-black text-emerald-600">${pendingShift.earnedWage.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-4">
              <button onClick={finalizeLog} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all text-lg shadow-xl shadow-slate-200">
                Confirm & Post Entry
              </button>
              <button onClick={() => setPendingShift(null)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 text-base">Back to Editor</button>
            </div>
          </div>
        </div>
      )}

      {/* Shift History Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Shift History</h3>
            <p className="text-sm font-medium text-slate-400">Manage recently recorded work sessions.</p>
          </div>
          <span className="bg-slate-100 text-slate-600 text-sm px-4 py-2 rounded-2xl font-black tracking-tight">{shifts.length} Total Logs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black">
                <th className="px-10 py-6">Staff Member</th>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Work Window</th>
                <th className="px-10 py-6 text-right">Earned Payout</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shifts.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-24 text-center text-slate-300 font-medium text-lg">No work records discovered in history.</td></tr>
              ) : (
                shifts.slice().reverse().map(shift => {
                  const emp = employees.find(e => e.id === shift.employeeId);
                  return (
                    <tr key={shift.id} className={`hover:bg-indigo-50/20 transition-all group ${editingId === shift.id ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-4">
                          <img src={emp?.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-white" onError={(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User'} />
                          <span className="font-bold text-slate-800 text-base">{emp?.name || 'Deactivated User'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-slate-500 font-bold text-sm whitespace-nowrap">{shift.date}</td>
                      <td className="px-10 py-6 text-slate-500 font-medium text-sm whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{shift.totalHours} hrs worked</span>
                          <span className="text-slate-400 text-xs">{shift.clockIn} - {shift.clockOut}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-emerald-600 text-lg whitespace-nowrap">${shift.earnedWage.toFixed(2)}</td>
                      <td className="px-10 py-6 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center space-x-4 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(shift)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center shadow-sm" title="Edit Shift"><i className="fa-solid fa-pen-to-square"></i></button>
                          <button onClick={() => onDeleteShift(shift.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center shadow-sm" title="Delete Shift"><i className="fa-solid fa-trash-can"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShiftLog;
