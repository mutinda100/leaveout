
import React, { useState, useEffect, useMemo } from 'react';
import { LeaveRequest, DeviceRecord, RequestStatus } from '../types';
import {
  Send, CheckCircle, ArrowLeft, ShieldCheck, Home, Globe,
  Smartphone, Lock, AlertTriangle, Radio, Clock, User,
  History, LogOut, ChevronRight, MapPin, Calendar, Bell
} from 'lucide-react';
import { db } from '../firebase';
import {
  doc,
  setDoc
} from 'firebase/firestore';

interface StudentLinkViewProps {
  onAddRequest: (req: LeaveRequest) => void;
  onBack: () => void;
  requests: LeaveRequest[];
  registry: DeviceRecord[];
}

const StudentLinkView: React.FC<StudentLinkViewProps> = ({ onAddRequest, onBack, requests, registry }) => {
  const [view, setView] = useState<'DASHBOARD' | 'APPLY'>('DASHBOARD');
  const [formData, setFormData] = useState({ name: '', admNo: '', class: '', reason: '', returnTime: '' });
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // Initialize/Retrieve Device Fingerprint
  useEffect(() => {
    let savedId = localStorage.getItem('sl_device_fingerprint');
    if (!savedId) {
      savedId = `DEV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      localStorage.setItem('sl_device_fingerprint', savedId);
    }
    setDeviceId(savedId);
  }, []);

  // Filter requests belonging to this device/student
  const myRequests = useMemo(() => {
    return requests.filter(r => r.deviceFingerprint === deviceId);
  }, [requests, deviceId]);

  const activeRequest = useMemo(() => {
    return myRequests.find(r => r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'EXITED');
  }, [myRequests]);

  const checkDeviceSecurity = (admNo: string): boolean => {
    // registry is now passed as a prop from Firestore

    const existingStudent = registry.find(r => r.admNo === admNo);
    if (existingStudent && existingStudent.deviceId !== deviceId) {
      setDeviceError(`Security Violation: Student ${admNo} is bound to a different device.`);
      return false;
    }

    const existingDevice = registry.find(r => r.deviceId === deviceId);
    if (existingDevice && existingDevice.admNo !== admNo) {
      setDeviceError(`Hardware Conflict: This device is bound to ADM: ${existingDevice.admNo}.`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeviceError(null);

    if (!checkDeviceSecurity(formData.admNo)) return;

    // Register binding if new to Firestore
    if (!registry.find(r => r.admNo === formData.admNo)) {
      setDoc(doc(db, 'device_registry', formData.admNo), {
        admNo: formData.admNo,
        deviceId: deviceId,
        registeredAt: Date.now(),
        lastUsedAt: Date.now()
      }).catch(err => console.error("Error registering device:", err));
    }

    const newReq: LeaveRequest = {
      id: `req_${Date.now()}`,
      studentId: `s_${formData.admNo}`,
      studentName: formData.name,
      studentAdmNo: formData.admNo,
      studentClass: formData.class,
      type: 'NORMAL',
      reason: formData.reason,
      status: 'PENDING',
      requestedAt: Date.now(),
      expectedReturnAt: new Date(formData.returnTime).getTime(),
      deviceFingerprint: deviceId
    };

    onAddRequest(newReq);
    setView('DASHBOARD');
  };

  if (view === 'APPLY') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="bg-indigo-600 p-12 text-white relative">
            <button
              onClick={() => setView('DASHBOARD')}
              className="group absolute top-8 left-8 text-white/70 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Cancel
            </button>
            <div className="flex items-center gap-4 mb-4 mt-8">
              <ShieldCheck size={32} />
              <h1 className="text-4xl font-black tracking-tighter">New Application</h1>
            </div>
            <p className="text-indigo-100 font-medium opacity-80">Request digital clearance for temporary school exit.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-8">
            {deviceError && (
              <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex items-start gap-4">
                <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={24} />
                <p className="text-xs text-rose-700 font-bold leading-relaxed">{deviceError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student Name</label>
                <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-lg" placeholder="Name..." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Admission No</label>
                <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-lg" placeholder="e.g. 102" value={formData.admNo} onChange={e => setFormData({ ...formData, admNo: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Class</label>
                <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-lg" placeholder="e.g. 4A" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reason</label>
              <textarea required rows={3} className="w-full p-6 bg-slate-50 rounded-2xl outline-none font-bold text-lg resize-none" placeholder="Details..." value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Expected Return</label>
              <input type="datetime-local" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-lg" value={formData.returnTime} onChange={e => setFormData({ ...formData, returnTime: e.target.value })} />
            </div>

            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
              Submit Leave Request
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 lg:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Portal</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Active: {deviceId}</span>
              </div>
            </div>
          </div>
          <button onClick={onBack} className="p-4 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all">
            <LogOut size={24} />
          </button>
        </div>

        {/* Active Status Card */}
        <div className="relative overflow-hidden bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 lg:p-12">
          {activeRequest ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Current Application Status</p>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                    {activeRequest.status === 'PENDING' ? 'Awaiting Approval' :
                      activeRequest.status === 'APPROVED' ? 'Cleared to Leave' : 'Out of Bounds'}
                  </h2>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${activeRequest.status === 'PENDING' ? 'bg-amber-50 text-amber-500' :
                    activeRequest.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                  {activeRequest.status === 'PENDING' ? <Clock size={32} /> :
                    activeRequest.status === 'APPROVED' ? <CheckCircle size={32} /> : <MapPin size={32} />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Rationale</p>
                  <p className="text-lg font-bold text-slate-800 italic">"{activeRequest.reason}"</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Return</p>
                  </div>
                  <p className="text-xl font-black text-indigo-600">
                    {new Date(activeRequest.expectedReturnAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>

              {activeRequest.status === 'APPROVED' && (
                <div className="bg-indigo-600 p-8 rounded-[2rem] text-white flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
                  <div className="p-4 bg-white/20 rounded-2xl">
                    <Radio size={40} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Digital Pass Valid</h3>
                    <p className="opacity-80 font-medium">Proceed to the main gate. Your device fingerprint is authorized for clearance.</p>
                  </div>
                  <div className="w-full bg-white/10 p-4 rounded-xl font-mono text-sm tracking-widest border border-white/5">
                    TOKEN: {activeRequest.id.split('_')[1].slice(-8)}
                  </div>
                </div>
              )}

              {activeRequest.status === 'EXITED' && (
                <div className="bg-rose-600 p-8 rounded-[2rem] text-white flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/20 rounded-2xl">
                    <AlertTriangle size={40} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Active Departure</h3>
                    <p className="opacity-80 font-medium">You are currently logged out of campus. Ensure you return before the stipulated time to avoid disciplinary flagging.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Radio size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">No Active Leaves</h2>
                <p className="text-slate-500 font-medium mt-2">Apply for a temporary exit below. Your request will be bound to this device.</p>
              </div>
              <button
                onClick={() => setView('APPLY')}
                className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Send size={20} />
                New Application
              </button>
            </div>
          )}
        </div>

        {/* History & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History size={16} />
                Leave History
              </h3>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-500">{myRequests.length} Total</span>
            </div>
            <div className="divide-y divide-slate-50">
              {myRequests.length > 0 ? myRequests.map(r => (
                <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                      }`}>
                      {r.status === 'RETURNED' ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{r.reason}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(r.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${r.status === 'RETURNED' ? 'text-emerald-600 bg-emerald-50' :
                        r.status === 'REJECTED' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-100'
                      }`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400 font-bold italic text-sm">No record history found.</div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Bell size={16} className="text-amber-500" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Device Sync Active</p>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                  Clearance data is refreshed every 30 seconds. Keep app open at the gate.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-rose-600 uppercase mb-2">Gate Warning</p>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                  Leaving campus without approval triggers an automatic disciplinary flag.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Online Policy Indicator */}
        <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50 text-center">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Official Leave Protocol</p>
          <p className="text-xs text-indigo-700/80 font-medium leading-relaxed max-w-lg mx-auto">
            This digital portal is the <strong>exclusive</strong> legal means for campus departure. Manual slips, phone calls, or external apps are not recognized for gate clearance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLinkView;
