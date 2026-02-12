
import React, { useState } from 'react';
import { LeaveRequest, RequestStatus, User, LeaveType } from '../types';
import { 
  Check, X, Clock, UserCheck, 
  Sparkles, Copy, CheckCircle2,
  AlertTriangle, History, Ban,
  XCircle, Info, Calendar, ArrowRight,
  ShieldCheck, Eye
} from 'lucide-react';
import { getAdminInsights } from '../geminiService';
import SecurityView from './SecurityView';

interface AdminDashboardProps {
  requests: LeaveRequest[];
  onUpdateStatus: (id: string, status: RequestStatus, extra?: Partial<LeaveRequest>) => void;
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onUpdateStatus, user }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GATE_MONITOR'>('DASHBOARD');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use string literals for RequestStatus as defined in types.ts
  const pending = requests.filter(r => r.status === 'PENDING');
  const out = requests.filter(r => r.status === 'EXITED');
  const denied = requests.filter(r => r.status === 'REJECTED');
  const returned = requests.filter(r => r.status === 'RETURNED');

  const handleRunAI = async () => {
    setIsAnalyzing(true);
    const insights = await getAdminInsights(requests);
    setAiInsight(insights || "Records analyzed. All systems normal.");
    setIsAnalyzing(false);
  };

  if (activeTab === 'GATE_MONITOR') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Gate Surveillance</h2>
            <p className="text-slate-500 font-medium">Viewing live clearance data shared with Security</p>
          </div>
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
          >
            Return to Dashboard
          </button>
        </div>
        <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-[2rem] flex items-center gap-4 text-indigo-700">
           <Eye size={24} />
           <p className="text-sm font-bold italic">"You are currently observing the Gate Protocol Terminal exactly as seen by the Security Officer."</p>
        </div>
        <SecurityView 
          requests={requests} 
          // Use 'EXITED' string literal for status
          onConfirmExit={(id) => onUpdateStatus(id, 'EXITED', { exitedAt: Date.now(), exitedConfirmedBy: user.id })}
          isAdminMirror={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">Executive Suite</h2>
          <p className="text-slate-500 font-medium text-lg mt-2">Centralized command for student movement and audit logs.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('GATE_MONITOR')}
            className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-indigo-600 transition-all shadow-sm active:scale-95"
          >
            <ShieldCheck size={18} />
            Monitor Gate Clearances
          </button>
          <button 
            onClick={handleRunAI}
            disabled={isAnalyzing}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isAnalyzing ? 'Analyzing Metrics...' : 'Execute Deep AI Audit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Awaiting Action', val: pending.length, color: 'indigo', icon: Clock, bg: 'bg-indigo-50' },
          { label: 'Confirmed Out', val: out.length, color: 'amber', icon: AlertTriangle, bg: 'bg-amber-50' },
          { label: 'Returned Today', val: returned.length, color: 'emerald', icon: UserCheck, bg: 'bg-emerald-50' },
          { label: 'Denied Entries', val: denied.length, color: 'rose', icon: Ban, bg: 'bg-rose-50' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center text-${s.color}-600 mb-6`}>
              <s.icon size={24} />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">{s.val}</p>
          </div>
        ))}
      </div>

      {aiInsight && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col lg:flex-row gap-10 animate-in zoom-in-95 duration-700 relative overflow-hidden">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-900 shadow-xl shrink-0 z-10 mx-auto lg:mx-0">
            <Sparkles size={40} />
          </div>
          <div className="z-10 flex-1">
            <h4 className="font-extrabold text-white text-2xl mb-4 tracking-tight flex items-center gap-3">
              Advanced Behavioral & Compliance Audit
              <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full text-indigo-200">AI AGENT ACTIVE</span>
            </h4>
            <div className="text-indigo-50 leading-relaxed font-medium whitespace-pre-line text-lg bg-white/5 p-6 rounded-2xl border border-white/10">
              {aiInsight}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <section className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3 px-2">
            <Clock className="text-indigo-600" size={24} />
            Pending Verification
          </h3>
          <div className="space-y-4">
            {pending.length > 0 ? pending.map(r => (
              <div key={r.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-extrabold text-slate-300 text-xl uppercase italic">
                    {r.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg">{r.studentName}</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">ADM: {r.studentAdmNo} • {r.studentClass}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl mb-6">
                  <p className="text-sm font-semibold text-slate-600 italic">"{r.reason}"</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onUpdateStatus(r.id, 'REJECTED')} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-colors">Reject</button>
                  <button onClick={() => onUpdateStatus(r.id, 'APPROVED', { approvedAt: Date.now(), approvedBy: user.id })} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Authorize Pass</button>
                </div>
              </div>
            )) : (
              <div className="py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center text-slate-400 font-bold italic">Queue Clear</div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3 px-2">
            <AlertTriangle className="text-amber-500" size={24} />
            Currently Off Campus
          </h3>
          <div className="space-y-4">
            {out.length > 0 ? out.map(r => (
              <div key={r.id} className="bg-white rounded-3xl p-8 border border-amber-100 shadow-sm border-l-8 border-l-amber-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg">{r.studentName}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{r.studentAdmNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-amber-600 uppercase">Exit Time</p>
                    <p className="text-xs font-bold text-slate-900">{new Date(r.exitedAt!).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateStatus(r.id, 'RETURNED', { returnedAt: Date.now(), returnedConfirmedBy: user.id })}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-50"
                >
                  Confirm Official Return
                </button>
              </div>
            )) : (
              <div className="py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center text-slate-400 font-bold italic">No students currently out</div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3 px-2">
            <Ban className="text-rose-500" size={24} />
            Denied Today
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
            {denied.length > 0 ? denied.map(r => (
              <div key={r.id} className="flex justify-between items-center opacity-60">
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.studentName}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase">{r.studentAdmNo}</p>
                </div>
                <span className="text-[9px] font-black text-rose-500 uppercase bg-rose-50 px-3 py-1 rounded-full">Rejected</span>
              </div>
            )) : (
              <p className="text-center text-slate-400 font-bold italic text-xs py-8">Zero denials logged today.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3 px-2">
            <CheckCircle2 className="text-emerald-500" size={24} />
            Returned Today
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
            {returned.length > 0 ? returned.map(r => (
              <div key={r.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.studentName}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase">Cleared: {new Date(r.returnedAt!).toLocaleTimeString()}</p>
                </div>
                <UserCheck size={18} className="text-emerald-500" />
              </div>
            )) : (
              <p className="text-center text-slate-400 font-bold italic text-xs py-8">Waiting for returns...</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
