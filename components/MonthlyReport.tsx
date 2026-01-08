
import React, { useState, useMemo } from 'react';
import { Employee, Shift } from '../types';

interface ReportProps {
  employees: Employee[];
  shifts: Shift[];
}

type ReportScope = 'team' | 'individual';
type DatePreset = 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

const MonthlyReport: React.FC<ReportProps> = ({ employees, shifts }) => {
  const [scope, setScope] = useState<ReportScope>('team');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [preset, setPreset] = useState<DatePreset>('this-month');
  
  // Custom date range states
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Helper to get date ranges based on presets
  const activeRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'this-week':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        start = new Date(now.setDate(diff));
        end = new Date();
        break;
      case 'last-week':
        const lastWeekStart = new Date();
        lastWeekStart.setDate(now.getDate() - now.getDay() - 6);
        const lastWeekEnd = new Date();
        lastWeekEnd.setDate(now.getDate() - now.getDay());
        start = lastWeekStart;
        end = lastWeekEnd;
        break;
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        return { start: new Date(startDate), end: new Date(endDate) };
    }
    
    // Set hours to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }, [preset, startDate, endDate]);

  const reportData = useMemo(() => {
    const { start, end } = activeRange;
    
    // Filter shifts within range
    const filteredShifts = shifts.filter(s => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });

    // If individual scope, filter further
    const scopeShifts = scope === 'individual' && selectedEmployeeId 
      ? filteredShifts.filter(s => s.employeeId === selectedEmployeeId)
      : filteredShifts;

    // Team Summary data
    const consolidated = employees.map(emp => {
      const empShifts = filteredShifts.filter(s => s.employeeId === emp.id);
      const totalHours = empShifts.reduce((sum, s) => sum + s.totalHours, 0);
      const totalWages = empShifts.reduce((sum, s) => sum + s.earnedWage, 0);
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        rate: emp.hourlyRate,
        avatar: emp.avatar,
        emoji: emp.emoji,
        totalHours,
        totalWages,
        shiftCount: empShifts.length
      };
    }).filter(item => item.shiftCount > 0 || scope === 'team') // Show all if team, or only active if filtered
      .sort((a, b) => b.totalWages - a.totalWages);

    const grandTotalHours = scopeShifts.reduce((sum, s) => sum + s.totalHours, 0);
    const grandTotalWages = scopeShifts.reduce((sum, s) => sum + s.earnedWage, 0);

    return { consolidated, scopeShifts, grandTotalHours, grandTotalWages };
  }, [employees, shifts, activeRange, scope, selectedEmployeeId]);

  const exportCSV = () => {
    const headers = ["Date", "Employee", "Clock In", "Clock Out", "Hours", "Wage ($)"];
    const rows = reportData.scopeShifts.map(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      return [
        s.date,
        emp?.name || 'Unknown',
        s.clockIn,
        s.clockOut || '--',
        s.totalHours,
        s.earnedWage
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WageTrack_Report_${preset}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="space-y-8 pb-10">
      {/* ADVANCED FILTER DECK */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Column 1: Mode & Target */}
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Report Scope</label>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setScope('team')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${scope === 'team' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <i className="fa-solid fa-users mr-2"></i>Full Team
                </button>
                <button 
                  onClick={() => setScope('individual')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${scope === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <i className="fa-solid fa-user mr-2"></i>Individual
                </button>
              </div>
            </div>

            {scope === 'individual' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Employee</label>
                <select 
                  value={selectedEmployeeId} 
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm"
                >
                  <option value="">Choose employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Column 2: Timeframe */}
          <div className="flex-[1.5] space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Timeframe Basis</label>
              <div className="flex flex-wrap gap-2">
                {(['this-week', 'last-week', 'this-month', 'last-month', 'custom'] as const).map((p) => (
                  <button 
                    key={p}
                    onClick={() => setPreset(p)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${preset === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {preset === 'custom' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                  <input 
                    type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                  <input 
                    type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="lg:w-48 flex flex-col justify-end space-y-3">
             <button 
              onClick={exportCSV}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 text-sm"
             >
               <i className="fa-solid fa-file-csv mr-2"></i>Export CSV
             </button>
             <button 
              onClick={() => window.print()}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 text-sm"
             >
               <i className="fa-solid fa-print mr-2"></i>Print PDF
             </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center space-x-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-2xl shadow-sm">
            <i className="fa-solid fa-business-time"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Period Hours</p>
            <h4 className="text-3xl font-black text-slate-900">{reportData.grandTotalHours.toFixed(1)} <span className="text-sm text-slate-400 font-bold">hrs</span></h4>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center space-x-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl shadow-sm">
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Wage Payout</p>
            <h4 className="text-3xl font-black text-slate-900">${reportData.grandTotalWages.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          </div>
        </div>
      </div>

      {/* DETAILED VIEW */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        {scope === 'team' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-10 py-6">Staff Member</th>
                  <th className="px-10 py-6">Base Rate</th>
                  <th className="px-10 py-6">Shifts</th>
                  <th className="px-10 py-6">Hours</th>
                  <th className="px-10 py-6 text-right">Total Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reportData.consolidated.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img src={item.avatar} className="w-10 h-10 rounded-xl object-cover" />
                          <span className="absolute -bottom-1 -right-1 text-xs">{item.emoji}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-sm font-bold text-slate-500">${item.rate}/hr</td>
                    <td className="px-10 py-5 text-sm font-medium text-slate-500">{item.shiftCount} shifts</td>
                    <td className="px-10 py-5">
                      <span className="text-sm font-black text-slate-700">{item.totalHours.toFixed(1)} hrs</span>
                    </td>
                    <td className="px-10 py-5 text-right font-black text-indigo-600 text-base">
                      ${item.totalWages.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-100">
                  {selectedEmployee?.emoji || '👤'}
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-900">{selectedEmployee?.name || 'Please select an employee'}</h5>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedEmployee?.role || 'Staff Profile'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Base Rate</p>
                <p className="text-xl font-black text-indigo-600">${selectedEmployee?.hourlyRate || 0}/hr</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-10 py-5">Date</th>
                    <th className="px-10 py-5">Clock In</th>
                    <th className="px-10 py-5">Clock Out</th>
                    <th className="px-10 py-5">Duration</th>
                    <th className="px-10 py-5 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.scopeShifts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center text-slate-300 font-medium">No shifts recorded in this timeframe.</td>
                    </tr>
                  ) : (
                    reportData.scopeShifts.map(shift => (
                      <tr key={shift.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-10 py-5 font-bold text-slate-700 text-sm">{shift.date}</td>
                        <td className="px-10 py-5 text-sm text-slate-500">{shift.clockIn}</td>
                        <td className="px-10 py-5 text-sm text-slate-500">{shift.clockOut || '--'}</td>
                        <td className="px-10 py-5">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">{shift.totalHours} hrs</span>
                        </td>
                        <td className="px-10 py-5 text-right font-black text-emerald-600 text-sm">
                          ${shift.earnedWage.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Automated Ledger Analysis • System Ref: {new Date().getTime()}
        </p>
      </div>
    </div>
  );
};

export default MonthlyReport;
