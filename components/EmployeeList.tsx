
import React, { useState } from 'react';
import { Employee } from '../types';
import { MAX_EMPLOYEES } from '../constants';

interface EmployeeListProps {
  employees: Employee[];
  onAdd: (emp: Omit<Employee, 'id' | 'avatar'>) => void;
  onDelete: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onAdd, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRate, setNewRate] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employees.length >= MAX_EMPLOYEES) {
      alert("Maximum limit of 15 employees reached.");
      return;
    }
    if (!newName || !newRole) return;
    onAdd({ name: newName, role: newRole, hourlyRate: newRate });
    setNewName('');
    setNewRole('');
    setNewRate(15);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Team Members ({employees.length}/{MAX_EMPLOYEES})</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={employees.length >= MAX_EMPLOYEES}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className={`fa-solid ${showAddForm ? 'fa-xmark' : 'fa-plus'} mr-2`}></i>
          {showAddForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
            <input 
              type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
            <input 
              type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Designer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Hourly Rate ($)</label>
            <input 
              type="number" required min="1" value={newRate} onChange={(e) => setNewRate(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800 transition-colors">
              Save Member
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center space-x-4">
              <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{emp.name}</h3>
                <p className="text-sm text-slate-500">{emp.role}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-1">${emp.hourlyRate}/hour</p>
              </div>
              <button 
                onClick={() => onDelete(emp.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
