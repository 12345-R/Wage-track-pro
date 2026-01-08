
import React, { useState, useRef } from 'react';
import { Employee } from '../types';
import { MAX_EMPLOYEES } from '../constants';

interface EmployeeListProps {
  employees: Employee[];
  onAdd: (emp: Omit<Employee, 'id'>) => void;
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
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  
  // Confirmation states
  const [confirmingAdd, setConfirmingAdd] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (employees.length >= MAX_EMPLOYEES) return;
    if (!newName || !newRole) return;
    setConfirmingAdd(true);
  };

  const finalizeAdd = () => {
    const avatar = customAvatar || `https://picsum.photos/seed/${newName.replace(/\s/g, '')}/150`;
    onAdd({ 
      name: newName, 
      role: newRole, 
      hourlyRate: newRate, 
      emoji: selectedEmoji,
      avatar: avatar
    });

    setNewName('');
    setNewRole('');
    setNewRate(15);
    setSelectedEmoji(EMOJI_OPTIONS[0]);
    setCustomAvatar(null);
    setShowAddForm(false);
    setConfirmingAdd(false);
  };

  const finalizeDelete = () => {
    if (confirmingDelete) {
      onDelete(confirmingDelete);
      setConfirmingDelete(null);
    }
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
        <form onSubmit={handleInitiateAdd} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Identity & Avatar</label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                   <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 group overflow-hidden"
                   >
                     {customAvatar ? (
                       <img src={customAvatar} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                         <i className="fa-solid fa-camera text-xl"></i>
                       </span>
                     )}
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="relative group">
                   <div className="w-16 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm group-hover:border-indigo-200 cursor-pointer">
                     {selectedEmoji}
                   </div>
                   <div className="absolute top-full left-0 mt-3 p-3 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 grid grid-cols-5 gap-2 w-56 animate-in zoom-in-95 invisible group-hover:visible group-focus-within:visible">
                      {EMOJI_OPTIONS.map(emo => (
                        <button key={emo} type="button" onClick={() => setSelectedEmoji(emo)} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 ${selectedEmoji === emo ? 'bg-indigo-100' : ''}`}>
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

      {/* Confirmation Modals */}
      {confirmingAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <i className="fa-solid fa-user-plus text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Confirm New Member</h3>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2">
              <p className="text-sm font-bold text-slate-800 flex justify-between"><span>Name:</span> <span>{newName}</span></p>
              <p className="text-sm text-slate-500 flex justify-between"><span>Role:</span> <span>{newRole}</span></p>
              <p className="text-sm text-slate-500 flex justify-between"><span>Rate:</span> <span>${newRate}/hr</span></p>
            </div>
            <div className="flex flex-col space-y-3">
              <button onClick={finalizeAdd} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all">Confirm & Add</button>
              <button onClick={() => setConfirmingAdd(false)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <i className="fa-solid fa-trash-can text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Delete Employee?</h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              This will permanently remove <strong>{employees.find(e => e.id === confirmingDelete)?.name}</strong> and all their associated shift history.
            </p>
            <div className="flex flex-col space-y-3">
              <button onClick={finalizeDelete} className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl hover:bg-rose-700 transition-all">Yes, Delete Everything</button>
              <button onClick={() => setConfirmingDelete(null)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600">Keep Employee</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={emp.avatar} 
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-100" 
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`; }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-sm border border-slate-50 flex items-center justify-center text-xl">
                  {emp.emoji || '👤'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{emp.name}</h3>
                <p className="text-sm text-slate-500">{emp.role}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-1">${emp.hourlyRate}/hour</p>
              </div>
              <button 
                onClick={() => setConfirmingDelete(emp.id)}
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
