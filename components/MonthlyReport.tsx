
import React, { useState, useMemo } from 'react';
import { Employee, Shift } from '../types';

interface MonthlyReportProps {
  employees: Employee[];
  shifts: Shift[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ employees, shifts }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const list = [];
    for (let i = currentYear; i >= startYear; i--) list.push(i);
    return list;
  }, []);

  const reportData = useMemo(() => {
    // Filter shifts by selected month/year
    const filteredShifts = shifts.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Group by employee
    const consolidated = employees.map(emp => {
      const empShifts = filteredShifts.filter(s => s.employeeId === emp.id);
      const totalHours = empShifts.reduce((sum, s) => sum + s.totalHours, 0);
      const totalWages = empShifts.reduce((sum, s) => sum + s.earnedWage, 0);
      const shiftCount = empShifts.length;

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        rate: emp.hourlyRate,
        totalHours,
        totalWages,
        shiftCount
      };
    }).sort((a, b) => b.totalWages - a.totalWages);

    const grandTotalHours = consolidated.reduce((sum, c) => sum + c.totalHours, 0);
    const grandTotalWages = consolidated.reduce((sum, c) => sum + c.totalWages, 0);

    return { consolidated, grandTotalHours, grandTotalWages };
  }, [employees, shifts, selectedMonth, selectedYear]);

  const exportToCSV = () => {
    // Removed "Total Shifts" from headers and rows
    const headers = ["Employee Name", "Role", "Rate ($/hr)", "Total Hours", "Total Wage ($)"];
    const rows = reportData.consolidated.map(item => [
      item.name,
      item.role,
      item.rate,
      item.totalHours.toFixed(1),
      item.totalWages.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WageTrack_Report_${months[selectedMonth]}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <i className="fa-solid fa-file-invoice-dollar mr-2 text-indigo-500"></i>
          Business Performance Report
        </h3>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex items-center space-x-2">
            <button 
              onClick={exportToCSV}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2 px-3 text-sm font-medium"
              title="Export to CSV"
            >
              <i className="fa-solid fa-file-csv"></i>
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Print Sheet"
            >
              <i className="fa-solid fa-print"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-slate-800">{reportData.grandTotalHours.toFixed(1)} hrs</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Payout</p>
          <p className="text-2xl font-bold text-slate-800">${reportData.grandTotalWages.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Rate</th>
                <th className="px-6 py-4 font-semibold">Total Hours</th>
                <th className="px-6 py-4 font-semibold text-right">Total Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.consolidated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No data for selected period.</td>
                </tr>
              ) : (
                reportData.consolidated.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{item.role}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">${item.rate}/hr</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">{item.totalHours.toFixed(1)} hrs</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">
                      ${item.totalWages.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {reportData.consolidated.length > 0 && (
              <tfoot className="bg-slate-50/80 font-bold text-slate-800">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right uppercase text-xs tracking-widest text-slate-400">Totals</td>
                  <td className="px-6 py-4">{reportData.grandTotalHours.toFixed(1)} hrs</td>
                  <td className="px-6 py-4 text-right text-indigo-700 font-extrabold text-lg">
                    ${reportData.grandTotalWages.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-xs italic">
        * Report details generated for {months[selectedMonth]} {selectedYear}.
      </p>
    </div>
  );
};

export default MonthlyReport;
