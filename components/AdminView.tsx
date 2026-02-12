
import React, { useState, useEffect, useMemo } from 'react';
import { LeaveRequest, RequestStatus, User, DeviceRecord, LeaveType } from '../types';
import {
  Sparkles, Activity, History, AlertCircle,
  Clock, UserCheck, ShieldCheck, Eye, Ban, CheckCircle2,
  Filter, Search, MoreVertical, Check, X, ArrowUpRight,
  TrendingUp, Users, AlertTriangle, ArrowLeft, Smartphone, RotateCcw, ShieldAlert,
  ChevronDown, XCircle, Globe, Link2
} from 'lucide-react';
import { getAdminInsights } from '../geminiService';
import SecurityView from './SecurityView';
import { db } from '../firebase';
import {
  doc,
  deleteDoc
} from 'firebase/firestore';

interface AdminViewProps {
  requests: LeaveRequest[];
  onUpdateStatus: (id: string, status: RequestStatus, extra?: Partial<LeaveRequest>) => void;
  user: User;
  onBack?: () => void;
  registry: DeviceRecord[];
}

const AdminView: React.FC<AdminViewProps> = ({ requests, onUpdateStatus, user, onBack, registry }) => {
  const [activeView, setActiveView] = useState<'ANALYTICS' | 'GATE_MONITOR' | 'SECURITY_AUDIT'>('ANALYTICS');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<LeaveType | 'ALL'>('ALL');

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derived unique classes for filter dropdown
  const uniqueClasses = useMemo(() => {
    const classes = new Set(requests.map(r => r.studentClass));
    return Array.from(classes).sort();
  }, [requests]);

  // Optimized Multi-Criteria Filtering logic
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
      const matchesType = selectedType === 'ALL' || r.type === selectedType;
      const matchesClass = selectedClass === 'ALL' || r.studentClass === selectedClass;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' ||
        r.studentName.toLowerCase().includes(query) ||
        r.studentAdmNo.includes(query) ||
        r.reason.toLowerCase().includes(query);

      return matchesStatus && matchesType && matchesClass && matchesSearch;
    });
  }, [requests, filterStatus, searchQuery, selectedClass, selectedType]);

  const resetFilters = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
    setSelectedClass('ALL');
    setSelectedType('ALL');
  };

  const getPortalUrl = () => {
    return window.location.origin + '/#s';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPortalUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = useMemo(() => ({
    pending: requests.filter(r => r.status === 'PENDING').length,
    out: requests.filter(r => r.status === 'EXITED').length,
    returned: requests.filter(r => r.status === 'RETURNED').length,
    emergency: requests.filter(r => r.type === 'EMERGENCY').length,
  }), [requests]);

  const handleResetDevice = async (admNo: string) => {
    try {
      // Find the document ID for this student. In this design, we'll use admNo as the doc ID for simplicity in registry.
      await deleteDoc(doc(db, 'device_registry', admNo));
    } catch (error) {
      console.error("Error resetting device binding:", error);
    }
  };

  const handleRunAI = async () => {
    setIsAnalyzing(true);
    const insights = await getAdminInsights(requests);
    setAiInsight(insights || "Strategic analysis complete. No critical anomalies detected in current leave patterns.");
    setIsAnalyzing(false);
  };

  if (activeView === 'GATE_MONITOR') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('ANALYTICS')}
              className="group w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Master Dashboard</span>
                <span className="text-slate-300 text-[10px]">/</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gate Monitor</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gate Surveillance</h2>
            </div>
          </div>
        </div>
        <SecurityView requests={requests} onConfirmExit={() => { }} isAdminMirror={true} />
      </div>
    );
  }

  if (activeView === 'SECURITY_AUDIT') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('ANALYTICS')}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security & Device Audit</h2>
              <p className="text-slate-500 font-medium">Verify and manage hardware bindings for students.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} className="text-indigo-600" />
              Registered Student Hardware
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ADM No</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Identifier</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Date</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registry.length > 0 ? registry.map(r => (
                  <tr key={r.admNo} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-900 tracking-tight"># {r.admNo}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-slate-400" />
                        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-indigo-600">{r.deviceId}</code>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs text-slate-500 font-bold">
                      {new Date(r.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => handleResetDevice(r.admNo)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all ml-auto"
                      >
                        <RotateCcw size={12} />
                        Reset Binding
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-slate-400 italic">No devices registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform w-fit"
            >
              <ArrowLeft size={14} /> Back to Gateway
            </button>
          )}
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Command Center</h2>
            <p className="text-slate-500 font-medium text-lg">Leave regulation, behavioral metrics, and operational audit.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView('SECURITY_AUDIT')}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-indigo-600 transition-all shadow-sm"
          >
            <ShieldAlert size={18} />
            Security Audit
          </button>
          <button
            onClick={() => setActiveView('GATE_MONITOR')}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-indigo-600 transition-all shadow-sm"
          >
            <ShieldCheck size={18} />
            Monitor Gate
          </button>
          <button
            onClick={handleRunAI}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
          >
            <Sparkles size={18} className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Analyzing Behavioral Data...' : 'Generate Executive Insights'}
          </button>
        </div>
      </div>

      {/* Access Distribution Section (Replicated from Nurse View) */}
      <div className="bg-indigo-600 p-10 rounded-[3rem] border border-indigo-500 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center gap-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-white/10 pointer-events-none">
          <Globe size={180} />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-200 mb-2">
            <Globe size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Portal Access Control</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight">Student Portal Link</h3>
          <p className="text-indigo-100/80 font-medium max-w-md">Distribute this link to students to enable them to apply for leave via their browser.</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={handleCopyLink}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-xl active:scale-95 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            {copied ? <CheckCircle2 size={20} /> : <Link2 size={20} />}
            {copied ? 'Portal Link Copied' : 'Share Portal with Students'}
          </button>
          <div className="px-4 py-2 bg-indigo-700/50 border border-indigo-400/30 rounded-xl max-w-xs overflow-hidden backdrop-blur-sm">
            <p className="text-[9px] font-mono text-indigo-200/70 truncate">{getPortalUrl()}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Pending Review', val: stats.pending, color: 'indigo', icon: Clock, trend: '+2 from morning' },
          { label: 'Students Off-Campus', val: stats.out, color: 'amber', icon: AlertTriangle, trend: 'Peak hour active' },
          { label: 'Returns Confirmed', val: stats.returned, color: 'emerald', icon: UserCheck, trend: '100% compliance' },
          { label: 'Emergency Dispatches', val: stats.emergency, color: 'rose', icon: Activity, trend: 'Check health logs' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-6 shadow-inner`}>
              <s.icon size={28} />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</p>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-bold text-${s.color}-600 bg-${s.color}-50 px-2 py-1 rounded-lg`}>{s.trend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Panel */}
      {aiInsight && (
        <div className="relative bg-slate-900 rounded-[3rem] p-10 lg:p-14 overflow-hidden group shadow-2xl animate-in zoom-in-95">
          <div className="absolute top-0 right-0 p-12 text-white/5 opacity-20 group-hover:scale-110 transition-transform duration-1000">
            <TrendingUp size={300} strokeWidth={1} />
          </div>
          <button
            onClick={() => setAiInsight(null)}
            className="absolute top-10 right-10 z-20 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-indigo-500 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em]">Strategy Report</div>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles size={40} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-3xl font-black text-white tracking-tight mb-6">Deep Behavioral & Compliance Audit</h4>
                <div className="prose prose-invert max-w-none">
                  <div className="text-indigo-100/90 leading-relaxed font-medium whitespace-pre-line text-lg bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-inner">
                    {aiInsight}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Table Section with Enhanced Search & Filtering */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/50 space-y-6">
          {/* Status Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {[
                { id: 'ALL', label: 'All Activity' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'APPROVED', label: 'Authorized' },
                { id: 'EXITED', label: 'Off-Campus' },
                { id: 'RETURNED', label: 'Completed' },
                { id: 'REJECTED', label: 'Denied' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id as any)}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Global Reset */}
            {(filterStatus !== 'ALL' || searchQuery !== '' || selectedClass !== 'ALL' || selectedType !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-colors"
              >
                <XCircle size={14} /> Clear All Filters
              </button>
            )}
          </div>

          {/* Advanced Search Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-sm font-bold w-full"
                placeholder="Search by Name, ADM No, or Reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 appearance-none text-sm font-bold w-full cursor-pointer"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="ALL">All Classes</option>
                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="relative">
              <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 appearance-none text-sm font-bold w-full cursor-pointer"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
              >
                <option value="ALL">All Request Types</option>
                <option value="NORMAL">Normal Leave</option>
                <option value="EMERGENCY">Emergency Exit</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Result Count Info */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Displaying {filteredRequests.length} of {requests.length} records
            </span>
            <div className="h-px flex-1 bg-slate-200/50"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Reason</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Tracking</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.length > 0 ? filteredRequests.map(r => (
                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.studentAdmNo}`}
                        className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm"
                        alt=""
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-none mb-1.5">{r.studentName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ADM: {r.studentAdmNo} • {r.studentClass}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${r.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                        {r.type}
                      </span>
                      <p className="text-xs font-bold text-slate-600 italic line-clamp-1 max-w-[200px]">"{r.reason}"</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${r.status === 'PENDING' ? 'bg-indigo-500 animate-pulse' :
                          r.status === 'APPROVED' ? 'bg-amber-500' :
                            r.status === 'EXITED' ? 'bg-amber-600' :
                              r.status === 'RETURNED' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{r.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{r.deviceFingerprint || 'LEGACY-REQ'}</span>
                      {r.deviceFingerprint && (
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter">Verified Device</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(r.id, 'REJECTED')}
                            className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(r.id, 'APPROVED', { approvedAt: Date.now(), approvedBy: user.id })}
                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                        </>
                      )}
                      {r.status === 'EXITED' && (
                        <button
                          onClick={() => onUpdateStatus(r.id, 'RETURNED', { returnedAt: Date.now(), returnedConfirmedBy: user.id })}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          Verify Return
                        </button>
                      )}
                      {['RETURNED', 'REJECTED'].includes(r.status) && (
                        <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                          <History size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Filter size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-extrabold text-xl uppercase tracking-tighter">No matching records found</p>
                    <p className="text-slate-300 text-xs font-medium mt-1 uppercase tracking-widest">Adjust your filters or search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
