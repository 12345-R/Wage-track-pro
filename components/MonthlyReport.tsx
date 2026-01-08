
import React, { useState, useMemo } from 'react';
import { Employee, Shift } from '../types';

interface ReportProps {
  employees: Employee[];
  shifts: Shift[];
}

type ReportScope = 'team' | 'individual';

const MonthlyReport: React.FC<ReportProps> = ({ employees, shifts }) => {
  const [scope, setScope] = useState<ReportScope>('team');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // Custom date range states - Default to start of current month to today
  const today = new Date();
  const firstOfOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstOfOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // Filtering range derived directly from calendar inputs
  const activeRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set hours to start/end of day for accurate filtering
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }, [startDate, endDate]);

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
    }).filter(item => scope === 'team' || (scope === 'individual' && item.shiftCount > 0))
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
    link.download = `WageTrack_Report_${startDate}_to_${endDate}.csv`;
    link.click();
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="space-y-10 pb-16">
      {/* ADVANCED FILTER DECK - SIMPLIFIED TO CALENDAR ONLY */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Section 1: Scope Selection */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Reporting Mode</label>
              <div className="flex bg-slate-100 p-2 rounded-[1.5rem]">
                <button 
                  onClick={() => setScope('team')}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-black transition-all ${scope === 'team' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <i className="fa-solid fa-users mr-2"></i>Full Team
                </button>
                <button 
                  onClick={() => setScope('individual')}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-black transition-all ${scope === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <i className="fa-solid fa-user mr-2"></i>Individual
                </button>
              </div>
            </div>

            {scope === 'individual' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Employee</label>
                <div className="relative">
                  <select 
                    value={selectedEmployeeId} 
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-700 text-base appearance-none shadow-sm"
                  >
                    <option value="">Choose employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Date Range (The new focus) */}
          <div className="lg:col-span-5 space-y-6">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Calendar Window</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <i className="fa-solid fa-calendar-day absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-700 text-base shadow-sm"
                />
              </div>
              <div className="relative">
                <i className="fa-solid fa-calendar-check absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-700 text-base shadow-sm"
                />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 px-1 italic">Shifts will be analyzed between these two specific dates.</p>
          </div>

          {/* Section 3: Actions */}
          <div className="lg:col-span-3 flex flex-col justify-end space-y-4">
             <button 
              onClick={exportCSV}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-50 text-base"
             >
               <i className="fa-solid fa-file-csv mr-2"></i>Export CSV
             </button>
             <button 
              onClick={() => window.print()}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 text-base"
             >
               <i className="fa-solid fa-print mr-2"></i>Print Ledger
             </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS - INCREASED SIZES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center space-x-8">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl shadow-sm">
            <i className="fa-solid fa-stopwatch"></i>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Clocked Hours</p>
            <h4 className="text-5xl font-black text-slate-900 leading-none">
              {reportData.grandTotalHours.toFixed(1)} <span className="text-lg text-slate-400 font-bold tracking-tight">HRS</span>
            </h4>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center space-x-8">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-3xl shadow-sm">
            <i className="fa-solid fa-coins"></i>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Aggregate Payout</p>
            <h4 className="text-5xl font-black text-slate-900 leading-none">
              ${reportData.grandTotalWages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
        </div>
      </div>

      {/* DETAILED VIEW - LARGER TEXT THROUGHOUT */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {scope === 'team' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">
                  <th className="px-12 py-8">Staff Member</th>
                  <th className="px-12 py-8">Role & Rate</th>
                  <th className="px-12 py-8">Shift Count</th>
                  <th className="px-12 py-8">Total Time</th>
                  <th className="px-12 py-8 text-right">Period Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reportData.consolidated.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-12 py-24 text-center text-slate-400 text-lg font-medium italic">No shift data found for the selected calendar window.</td>
                   </tr>
                ) : (
                  reportData.consolidated.map(item => (
                    <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-12 py-7 whitespace-nowrap">
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            <img src={item.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                            <span className="absolute -bottom-2 -right-2 text-xl">{item.emoji}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg">{item.name}</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ID: {item.id.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-7 whitespace-nowrap">
                        <p className="text-base font-bold text-slate-700">{item.role}</p>
                        <p className="text-sm font-black text-indigo-500 tracking-tighter">${item.rate}/hr Base</p>
                      </td>
                      <td className="px-12 py-7 whitespace-nowrap">
                        <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-black">{item.shiftCount} Shifts</span>
                      </td>
                      <td className="px-12 py-7">
                        <span className="text-lg font-black text-slate-800 tracking-tight">{item.totalHours.toFixed(1)} hrs</span>
                      </td>
                      <td className="px-12 py-7 text-right">
                        <p className="text-2xl font-black text-indigo-600 tracking-tighter">
                          ${item.totalWages.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="p-12 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-100">
                  {selectedEmployee?.emoji || '👤'}
                </div>
                <div>
                  <h5 className="text-3xl font-black text-slate-900 tracking-tight">{selectedEmployee?.name || 'Awaiting Selection'}</h5>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedEmployee?.role || 'Individual Audit Ledger'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contracted Base Rate</p>
                <p className="text-3xl font-black text-indigo-600 tracking-tighter">${selectedEmployee?.hourlyRate || 0}/hr</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">
                    <th className="px-12 py-7">Shift Date</th>
                    <th className="px-12 py-7">Clock In</th>
                    <th className="px-12 py-7">Clock Out</th>
                    <th className="px-12 py-7">Duration</th>
                    <th className="px-12 py-7 text-right">Shift Gross</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.scopeShifts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-12 py-32 text-center text-slate-300 font-bold text-xl italic leading-relaxed">
                        No shifts recorded for {selectedEmployee?.name || 'this member'} in this period.
                      </td>
                    </tr>
                  ) : (
                    reportData.scopeShifts.map(shift => (
                      <tr key={shift.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-12 py-7 font-black text-slate-800 text-base">{shift.date}</td>
                        <td className="px-12 py-7 text-base text-slate-500 font-bold">{shift.clockIn}</td>
                        <td className="px-12 py-7 text-base text-slate-500 font-bold">{shift.clockOut || '--'}</td>
                        <td className="px-12 py-7">
                          <span className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-black">{shift.totalHours} hrs clocked</span>
                        </td>
                        <td className="px-12 py-7 text-right">
                          <span className="text-xl font-black text-emerald-600 tracking-tighter">${shift.earnedWage.toFixed(2)}</span>
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

      <div className="text-center pt-10">
        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.6em]">
          Business Integrity Ledger • System ID {new Date().getTime().toString().slice(-8)}
        </p>
      </div>
    </div>
  );
};

export default MonthlyReport;
