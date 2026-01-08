
import React, { useState } from 'react';
import { Employee } from '../types';
import { MAX_EMPLOYEES } from '../constants';

interface EmployeeListProps {
  employees: Employee[];
  onAdd: (emp: Omit<Employee, 'id' | 'avatar'> & { emoji?: string }) => void;
  onDelete: (id: string) => void;
}

const EMOJI_OPTIONS = [
  '👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🎨', '👩‍🎨', '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', 
  '👨‍🔬', '👩‍🔬', '👨‍🚒', '👩‍🚒', '👨‍⚕️', '👩‍⚕️', '👨‍🌾', '👩‍🌾', '👮‍♂️', '👮‍♀️',
  '🥷', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧑‍🚀', '🧑‍🚒', '🤵', '👰', '🧕'
];

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onAdd, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRate, setNewRate] = useState(15);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employees.length >= MAX_EMPLOYEES) {
      alert("Maximum limit of 15 employees reached.");
      return;
    }
    if (!newName || !newRole) return;
    onAdd({ name: newName, role: newRole, hourlyRate: newRate, emoji: selectedEmoji });
    setNewName('');
    setNewRole('');
    setNewRate(15);
    setSelectedEmoji(EMOJI_OPTIONS[0]);
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
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Identity & Emoji</label>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                   <div className="w-16 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-all group-hover:border-indigo-200">
                     {selectedEmoji}
                   </div>
                   <div className="absolute top-full left-0 mt-3 p-3 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 grid grid-cols-5 gap-2 w-56 animate-in zoom-in-95 invisible group-hover:visible group-focus-within:visible">
                      {EMOJI_OPTIONS.map(emo => (
                        <button 
                          key={emo} 
                          type="button" 
                          onClick={() => setSelectedEmoji(emo)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 transition-colors ${selectedEmoji === emo ? 'bg-indigo-100' : ''}`}
                        >
                          {emo}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Role</label>
              <input 
                type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Manager"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Rate ($/hr)</label>
              <input 
                type="number" required min="1" value={newRate} onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-xl shadow-slate-100">
              Save Member
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                {emp.emoji || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{emp.name}</h3>
                <p className="text-sm text-slate-500">{emp.role}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-1">${emp.hourlyRate}/hour</p>
              </div>
              <button 
                onClick={() => onDelete(emp.id)}
                className="text-slate-200 hover:text-rose-500 transition-colors p-2"
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
