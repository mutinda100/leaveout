
import React from 'react';
import { LeaveRequest, RequestStatus, User } from '../types';
import { Clock, UserCheck, XCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface TeacherViewProps {
  requests: LeaveRequest[];
  onUpdateStatus: (id: string, status: RequestStatus, extra?: Partial<LeaveRequest>) => void;
  user: User;
  onBack?: () => void;
}

const TeacherView: React.FC<TeacherViewProps> = ({ requests, onUpdateStatus, user, onBack }) => {
  const pending = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft size={14} /> Back to Gateway
        </button>
      )}

      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Class Management</h2>
        <p className="text-slate-500 font-medium">Review and approve daily leave applications.</p>
      </div>

      <div className="space-y-6">
        <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3 px-2">
          <Clock className="text-indigo-600" size={24} />
          Requests Awaiting Approval
        </h3>
        
        {pending.length > 0 ? pending.map(r => (
          <div key={r.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-300 text-xl">
                  {r.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg">{r.studentName}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">ADM: {r.studentAdmNo} • {r.studentClass}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase">Return By</p>
                 <p className="text-xs font-bold text-slate-900">{new Date(r.expectedReturnAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100">
               <p className="text-sm font-bold text-slate-600 italic">"{r.reason}"</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onUpdateStatus(r.id, 'REJECTED')}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                Reject Request
              </button>
              <button 
                onClick={() => onUpdateStatus(r.id, 'APPROVED', { approvedAt: Date.now(), approvedBy: user.id })}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
              >
                Authorize Leave
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center text-slate-400 font-bold italic">
            Zero applications in queue.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherView;
