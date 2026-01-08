
import React, { useState, useEffect } from 'react';
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

  const handleLogShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const emp = employees.find(e => e.id === selectedEmp);
    if (!emp) return;

    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    
    let diffHours = (outH + outM / 60) - (inH + inM / 60);
    if (diffHours < 0) diffHours += 24; // Handle overnight shifts

    const shiftData = {
      employeeId: selectedEmp,
      date,
      clockIn,
      clockOut,
      totalHours: Number(diffHours.toFixed(2)),
      earnedWage: Number((diffHours * emp.hourlyRate).toFixed(2))
    };

    if (editingId) {
      onUpdateShift(editingId, shiftData);
      setEditingId(null);
    } else {
      onAddShift(shiftData);
    }

    resetForm();
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
            <button 
              onClick={resetForm}
              className="text-xs font-bold text-rose-500 hover:underline uppercase tracking-wider"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleLogShift} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employee</label>
            <select 
              required value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">Select...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
            <input 
              type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clock In</label>
            <input 
              type="time" required value={clockIn} onChange={(e) => setClockIn(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clock Out</label>
            <input 
              type="time" required value={clockOut} onChange={(e) => setClockOut(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              className={`w-full text-white py-2 rounded-xl transition-all shadow-lg ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              {editingId ? 'Update Entry' : 'Log Shift'}
            </button>
          </div>
        </form>
      </div>

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
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No shifts logged yet</td>
                </tr>
              ) : (
                shifts.slice().reverse().map(shift => {
                  const emp = employees.find(e => e.id === shift.employeeId);
                  return (
                    <tr key={shift.id} className={`hover:bg-slate-50/50 transition-colors group ${editingId === shift.id ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={emp?.avatar} className="w-8 h-8 rounded-full" />
                          <span className="font-medium text-slate-700 truncate max-w-[120px]">{emp?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{shift.date}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-medium">{shift.totalHours} hrs</span>
                        <span className="ml-2 text-slate-300 text-xs">
                          ({shift.clockIn} - {shift.clockOut})
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">${shift.earnedWage.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(shift)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit Shift"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button 
                            onClick={() => onDeleteShift(shift.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Shift"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
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
