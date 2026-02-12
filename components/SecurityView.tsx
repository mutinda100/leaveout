
import React, { useState } from 'react';
import { LeaveRequest } from '../types';
import { Shield, Search, ExternalLink, QrCode, CheckCircle2, MessageSquareQuote, ArrowLeft } from 'lucide-react';

interface SecurityViewProps {
  requests: LeaveRequest[];
  onConfirmExit: (id: string) => void;
  isAdminMirror?: boolean;
  onBack?: () => void;
}

const SecurityView: React.FC<SecurityViewProps> = ({ requests, onConfirmExit, isAdminMirror = false, onBack }) => {
  const [search, setSearch] = useState('');
  const [lastActionMessage, setLastActionMessage] = useState<{name: string, time: string} | null>(null);
  
  const approvedForExit = requests.filter(r => 
    r.status === 'APPROVED' && 
    (r.studentName.toLowerCase().includes(search.toLowerCase()) || r.studentAdmNo.includes(search))
  );

  const handleConfirm = (id: string, name: string) => {
    if (isAdminMirror) return;
    onConfirmExit(id);
    setLastActionMessage({ name, time: new Date().toLocaleTimeString() });
    setTimeout(() => setLastActionMessage(null), 8000);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-700">
      
      {!isAdminMirror && onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft size={14} /> Back to Gateway
        </button>
      )}

      {lastActionMessage && (
        <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-12 duration-500 flex items-center gap-6">
           <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
             <CheckCircle2 size={28} />
           </div>
           <div>
             <h4 className="text-lg font-black tracking-tight uppercase">Gate Clearance Logged</h4>
             <p className="text-indigo-100 font-medium">Student **{lastActionMessage.name}** confirmed exit at {lastActionMessage.time}.</p>
           </div>
        </div>
      )}

      {!isAdminMirror && (
        <div className="text-center">
          <div className="w-20 h-20 bg-white text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-indigo-50">
            <Shield size={36} />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Gate Clearance Terminal</h2>
          <p className="text-slate-500 font-medium">Verify official passes for departure authorization.</p>
        </div>
      )}

      <div className="relative group max-w-2xl mx-auto">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
        <input 
          className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-indigo-50 focus:border-indigo-400 shadow-xl shadow-slate-100 font-bold text-xl transition-all" 
          placeholder="Admission ID Scan..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isAdminMirror}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {approvedForExit.length > 0 ? approvedForExit.map(r => (
          <div key={r.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col group animate-in zoom-in-95">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <QrCode size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">Cleared by Office</span>
                  <p className="text-[9px] font-black text-slate-400 mt-2 uppercase">Pass ID: {r.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-1">{r.studentName}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">{r.studentAdmNo} • {r.studentClass}</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareQuote size={14} className="text-indigo-400" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Authorization</p>
                </div>
                <p className="text-sm font-bold text-slate-700 italic">"{r.reason}"</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleConfirm(r.id, r.studentName)}
              disabled={isAdminMirror}
              className={`w-full py-6 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isAdminMirror ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
            >
              <ExternalLink size={20} />
              {isAdminMirror ? 'Officer Eyes Only' : 'Confirm & Open Gate'}
            </button>
          </div>
        )) : (
          <div className="col-span-full py-24 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
            <p className="text-slate-400 font-extrabold italic text-xl uppercase tracking-tighter">No students cleared for exit.</p>
            <p className="text-slate-300 text-xs font-medium">Verify status with administration office.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityView;
