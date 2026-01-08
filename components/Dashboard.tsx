
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Employee, Shift } from '../types';

interface DashboardProps {
  employees: Employee[];
  shifts: Shift[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, shifts }) => {
  const stats = useMemo(() => {
    const totalWage = shifts.reduce((sum, s) => sum + s.earnedWage, 0);
    const totalHours = shifts.reduce((sum, s) => sum + s.totalHours, 0);
    const activeToday = shifts.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
    
    // Wage per employee chart data
    const chartData = employees.map(emp => {
      const empShifts = shifts.filter(s => s.employeeId === emp.id);
      return {
        name: emp.name.split(' ')[0],
        wage: empShifts.reduce((sum, s) => sum + s.earnedWage, 0)
      };
    }).sort((a, b) => b.wage - a.wage).slice(0, 5);

    return { totalWage, totalHours, activeToday, chartData };
  }, [employees, shifts]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-8">
      {/* Hero Stats Section - Total Hours and Wages of ALL Employees */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-money-bills text-8xl"></i>
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Total Company Payroll</p>
            <h2 className="text-5xl font-black">${stats.totalWage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
          <div className="mt-8 flex items-center space-x-2 text-indigo-100 text-sm font-medium">
             <i className="fa-solid fa-arrow-up-right-dots"></i>
             <span>Aggregate across {employees.length} employees</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-clock text-8xl"></i>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total Worked Hours</p>
            <h2 className="text-5xl font-black text-slate-900">{stats.totalHours.toFixed(1)} <span className="text-2xl text-slate-400">HRS</span></h2>
          </div>
          <div className="mt-8 flex items-center space-x-2 text-emerald-600 text-sm font-bold bg-emerald-50 w-fit px-3 py-1 rounded-full">
             <i className="fa-solid fa-check-circle"></i>
             <span>{stats.activeToday} Active today</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-bold text-slate-800">Earnings Distribution (Top 5)</h4>
            <div className="flex space-x-1">
              {COLORS.map(c => <div key={c} className="w-2 h-2 rounded-full" style={{backgroundColor: c}}></div>)}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="wage" radius={[10, 10, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick View / Team Snapshot */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Team Snapshot</h4>
          <div className="space-y-5">
            {employees.slice(0, 4).map(emp => {
               const empShifts = shifts.filter(s => s.employeeId === emp.id);
               const earned = empShifts.reduce((sum, s) => sum + s.earnedWage, 0);
               return (
                 <div key={emp.id} className="flex items-center justify-between group">
                   <div className="flex items-center space-x-3">
                     <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover" />
                     <div>
                       <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                       <p className="text-[10px] text-slate-400 font-semibold uppercase">{emp.role}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-900">${earned.toFixed(0)}</p>
                     <p className="text-[10px] text-slate-400">Total Earned</p>
                   </div>
                 </div>
               );
            })}
            <button className="w-full py-3 mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              View Full Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
