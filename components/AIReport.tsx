
import React, { useState } from 'react';
import { analyzeWages } from '../services/geminiService';
import { Employee, Shift } from '../types';

interface AIReportProps {
  employees: Employee[];
  shifts: Shift[];
}

const AIReport: React.FC<AIReportProps> = ({ employees, shifts }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    const result = await analyzeWages(employees, shifts);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-2">Workforce Insights</h2>
            <p className="text-indigo-100">Use Google Gemini AI to analyze your shift data, detect inefficiencies, and get budgeting recommendations based on current spending.</p>
          </div>
          <button 
            onClick={generateReport}
            disabled={loading || shifts.length === 0}
            className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <><i className="fa-solid fa-spinner animate-spin"></i><span>Analyzing...</span></>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i><span>Generate Analysis</span></>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 prose prose-slate max-w-none animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-50">
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
               <i className="fa-solid fa-robot"></i>
             </div>
             <h3 className="text-lg font-bold text-slate-800 m-0">AI Summary</h3>
           </div>
           <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium">
             {report}
           </div>
        </div>
      )}

      {shifts.length === 0 && !report && (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
          <i className="fa-solid fa-database text-4xl mb-4 block"></i>
          <p>Please log some shifts first to enable AI analysis.</p>
        </div>
      )}
    </div>
  );
};

export default AIReport;
