
import React, { useState } from 'react';
import { LeaveRequest, LeaveType } from '../types';
import { HeartPulse, Activity, Stethoscope, Copy, CheckCircle2, ExternalLink, ArrowLeft, Globe, Link2 } from 'lucide-react';

interface NurseViewProps {
  onAddEmergency: (req: LeaveRequest) => void;
  onBack?: () => void;
}

const NurseView: React.FC<NurseViewProps> = ({ onAddEmergency, onBack }) => {
  const [formData, setFormData] = useState({ name: '', admNo: '', class: '', condition: '' });
  const [copied, setCopied] = useState(false);

  const getPortalUrl = () => {
    return window.location.origin + '/#s';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPortalUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: LeaveRequest = {
      id: `emergency_${Date.now()}`,
      studentId: `s_${formData.admNo}`,
      studentName: formData.name,
      studentAdmNo: formData.admNo,
      studentClass: formData.class,
      type: 'EMERGENCY',
      reason: `MEDICAL URGENCY: ${formData.condition}`,
      status: 'PENDING',
      requestedAt: Date.now(),
      expectedReturnAt: Date.now() + 10800000,
    };
    onAddEmergency(newReq);
    setFormData({ name: '', admNo: '', class: '', condition: '' });
    alert('PRIORITY DISPATCH: Administration has been alerted of this emergency exit.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft size={14} /> Back to Gateway
        </button>
      )}

      {/* Cloud Link Sharing Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-50 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-600 mb-2">
            <Globe size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Online System Active</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Nurse Protocol</h2>
          <p className="text-slate-500 font-medium">Issue emergency dispatches or share the student portal link.</p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          <button 
            onClick={handleCopyLink}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-xl active:scale-95 ${
              copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
            }`}
          >
            {copied ? <CheckCircle2 size={20} /> : <Link2 size={20} />}
            {copied ? 'Cloud Link Copied' : 'Copy Student Portal Link'}
          </button>
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl max-w-xs overflow-hidden">
            <p className="text-[9px] font-mono text-slate-400 truncate">{getPortalUrl()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-rose-50 shadow-2xl p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-rose-50/50 pointer-events-none">
           <Stethoscope size={100} />
        </div>
        
        <form onSubmit={handleTrigger} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Patient Full Name</label>
              <input 
                required 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-rose-100 font-extrabold border-2 border-transparent focus:border-rose-400 transition-all text-xl" 
                placeholder="Enter student name..."
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Admission ID</label>
              <input 
                required 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-rose-100 font-extrabold border-2 border-transparent focus:border-rose-400 transition-all text-xl" 
                placeholder="e.g. 4022"
                value={formData.admNo} 
                onChange={e => setFormData({...formData, admNo: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Current Class</label>
              <input 
                required 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-rose-100 font-extrabold border-2 border-transparent focus:border-rose-400 transition-all text-xl" 
                placeholder="e.g. Form 1W"
                value={formData.class} 
                onChange={e => setFormData({...formData, class: e.target.value})} 
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Condition Rationale</label>
            <textarea 
              required 
              rows={4} 
              className="w-full p-8 bg-slate-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-rose-100 font-bold border-2 border-transparent focus:border-rose-400 transition-all text-lg resize-none shadow-inner" 
              placeholder="Medical justification for immediate departure..." 
              value={formData.condition} 
              onChange={e => setFormData({...formData, condition: e.target.value})} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-7 bg-rose-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-4 uppercase tracking-tighter"
          >
            <Activity size={24} />
            Initialize Dispatch
          </button>
        </form>
      </div>
      
      <div className="bg-rose-50 border-2 border-rose-100/50 p-8 rounded-[2.5rem] flex gap-5 text-rose-900 shadow-sm">
        <div className="p-3 bg-white rounded-2xl shrink-0 h-fit text-rose-500 shadow-sm">
          <HeartPulse size={24} />
        </div>
        <p className="text-sm font-bold leading-relaxed italic">
          "Emergency Dispatches are prioritized at the Administration Command Center. The Digital Pass will appear at the Gate Terminal immediately upon Admin's final verification."
        </p>
      </div>
    </div>
  );
};

export default NurseView;
