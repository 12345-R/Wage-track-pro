
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
    <div className="space-y-6">
      <div className={`bg-white p-8 rounded-2xl shadow-sm border transition-colors ${editingId ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-clock-rotate-left'} mr-2 text-indigo-500`}></i>
            {editingId ? 'Edit Shift Entry' : 'Log Manual Shift'}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-bold text-rose-500 hover:underline uppercase tracking-wider">
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleInitiateLog} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employee</label>
            <select required value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 appearance-none">
              <option value="">Select...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Clock In</label>
              <button type="button" onClick={() => setTimeToNow(setClockIn)} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase">Set Now</button>
            </div>
            <input type="time" required value={clockIn} onChange={(e) => setClockIn(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Clock Out</label>
              <button type="button" onClick={() => setTimeToNow(setClockOut)} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase">Set Now</button>
            </div>
            <input type="time" required value={clockOut} onChange={(e) => setClockOut(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-end">
            <button type="submit" className={`w-full text-white py-2 rounded-xl transition-all shadow-lg ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
              {editingId ? 'Update Entry' : 'Review Shift'}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Modal */}
      {pendingShift && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <i className="fa-solid fa-file-signature text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Verify Shift Log</h3>
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Employee</span>
                <span className="text-sm font-bold text-slate-800">{employees.find(e => e.id === pendingShift.employeeId)?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Times</span>
                <span className="text-sm text-slate-700">{pendingShift.clockIn} - {pendingShift.clockOut}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Duration</span>
                <span className="text-sm font-bold text-indigo-600">{pendingShift.totalHours} hrs</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-emerald-600 uppercase">Total Wage</span>
                <span className="text-lg font-black text-emerald-600">${pendingShift.earnedWage.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <button onClick={finalizeLog} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all">Save To History</button>
              <button onClick={() => setPendingShift(null)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600">Edit Details</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Shift History</h3>
          <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md font-mono">{shifts.length} Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Earned</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shifts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No shifts logged yet</td></tr>
              ) : (
                shifts.slice().reverse().map(shift => {
                  const emp = employees.find(e => e.id === shift.employeeId);
                  return (
                    <tr key={shift.id} className={`hover:bg-slate-50/50 transition-colors group ${editingId === shift.id ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={emp?.avatar} className="w-8 h-8 rounded-full" onError={(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User'} />
                          <span className="font-medium text-slate-700 truncate max-w-[120px]">{emp?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{shift.date}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-medium">{shift.totalHours} hrs</span>
                        <span className="ml-2 text-slate-300 text-xs">({shift.clockIn} - {shift.clockOut})</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">${shift.earnedWage.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(shift)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Shift"><i className="fa-solid fa-pen-to-square"></i></button>
                          <button onClick={() => onDeleteShift(shift.id)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Delete Shift"><i className="fa-solid fa-trash-can"></i></button>
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
