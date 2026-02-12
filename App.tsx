
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, LeaveRequest, RequestStatus, DeviceRecord } from './types';
import { STAFF_USERS, Roles } from './constants';
import {
  ShieldAlert,
  Stethoscope,
  Lock,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronRight,
  User as UserIcon,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Globe,
  Cloud
} from 'lucide-react';
import StudentLinkView from './components/StudentLinkView';
import NurseView from './components/NurseView';
import SecurityView from './components/SecurityView';
import AdminView from './components/AdminView';
import TeacherView from './components/TeacherView';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'AUTH' | 'STAFF' | 'STUDENT_PORTAL'>('AUTH');

  // Security State
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [registry, setRegistry] = useState<DeviceRecord[]>([]);

  useEffect(() => {
    // Sync Requests
    // User requested to query only PENDING, but that breaks history/other views. 
    // We fetch all to maintain "Do not break existing UI components" requirement.
    const qReq = query(collection(db, 'leaveRequests'), orderBy('createdAt', 'desc'));
    const unsubscribeReq = onSnapshot(qReq, (snapshot) => {
      const updatedRequests = snapshot.docs.map(doc => {
        const data = doc.data();
        // Map Firestore schema to internal LeaveRequest type
        return {
          id: doc.id,
          ...data,
          studentAdmNo: data.admissionNumber, // Map back
          requestedAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        };
      }) as LeaveRequest[];
      setRequests(updatedRequests);
    });

    // Sync Device Registry
    const qReg = query(collection(db, 'device_registry'));
    const unsubscribeReg = onSnapshot(qReg, (snapshot) => {
      const updatedRegistry = snapshot.docs.map(doc => doc.data()) as DeviceRecord[];
      setRegistry(updatedRegistry);
    });

    return () => {
      unsubscribeReq();
      unsubscribeReg();
    };
  }, []);

  // Handle Hash Routing for Short Student Portal Link
  const checkHash = useCallback(() => {
    if (window.location.hash === '#s') {
      setViewMode('STUDENT_PORTAL');
    } else if (!currentUser) {
      setViewMode('AUTH');
    }
  }, [currentUser]);

  useEffect(() => {
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [checkHash]);


  const addRequest = useCallback(async (req: LeaveRequest) => {
    try {
      // Map internal type to required Firestore Fields
      await addDoc(collection(db, 'leaveRequests'), {
        admissionNumber: req.studentAdmNo,
        reason: req.reason,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        // Keep other fields for UI consistency
        studentName: req.studentName,
        studentClass: req.studentClass,
        type: req.type,
        studentId: req.studentId,
        validFrom: req.validFrom || null,
        validTo: req.validTo || null,
        deviceFingerprint: req.deviceFingerprint,
        expectedReturnAt: req.expectedReturnAt
      });
    } catch (error) {
      console.error("Error adding request:", error);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: RequestStatus, extra: Partial<LeaveRequest> = {}) => {
    try {
      const requestRef = doc(db, 'leaveRequests', id);
      await updateDoc(requestRef, {
        status,
        ...extra
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }, []);

  const handleUserSelect = (user: User) => {
    if (user.role === 'ADMIN' || user.role === 'NURSE') {
      setPendingUser(user);
      setPassword('');
      setAuthError(null);
    } else {
      handleLogin(user);
    }
  };

  const verifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    const normalizedPwd = password.toLowerCase().trim();

    if (pendingUser.role === 'ADMIN' && normalizedPwd === 'humble') {
      handleLogin(pendingUser);
    } else if (pendingUser.role === 'NURSE' && normalizedPwd === 'medical') {
      handleLogin(pendingUser);
    } else {
      setAuthError('Invalid Authorization Key');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setViewMode('STAFF');
    setPendingUser(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setViewMode('AUTH');
    setPendingUser(null);
    if (window.location.hash === '#s') {
      window.location.hash = '';
    }
  };

  const openStudentPortal = () => {
    window.location.hash = 's';
  };

  if (viewMode === 'STUDENT_PORTAL') {
    return (
      <StudentLinkView
        onAddRequest={addRequest}
        onBack={handleLogout}
        requests={requests}
        registry={registry}
      />
    );
  }

  if (viewMode === 'AUTH') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center">
            <div className="inline-flex w-24 h-24 bg-indigo-600 rounded-[2.5rem] items-center justify-center text-white shadow-2xl mb-6 relative">
              <ShieldCheck size={48} />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-slate-50 text-white shadow-lg animate-bounce">
                <Cloud size={16} />
              </div>
            </div>
            <div className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Cloud System Online
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Gateway</h1>
            <p className="text-slate-500 font-medium">Digital Verification & Leave Regulation</p>
          </div>

          <div className="mt-10">
            {!pendingUser ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Staff Authenticated Access</div>
                {STAFF_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleUserSelect(u)}
                    className="w-full p-6 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-between hover:border-indigo-600 hover:shadow-xl transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                        {u.role === 'ADMIN' && <LayoutDashboard size={24} />}
                        {u.role === 'NURSE' && <Stethoscope size={24} />}
                        {u.role === 'SECURITY' && <Lock size={24} />}
                        {u.role === 'TEACHER' && <UserIcon size={24} />}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{u.role}</p>
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                      </div>
                    </div>
                    {(u.role === 'ADMIN' || u.role === 'NURSE') && <KeyRound size={16} className="text-slate-300 group-hover:text-indigo-600" />}
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600" />
                  </button>
                ))}

                <div className="pt-10 flex flex-col items-center">
                  <div className="w-full h-px bg-slate-200 mb-8 relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Links</span>
                  </div>
                  <button
                    onClick={openStudentPortal}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                  >
                    <Globe size={16} className="group-hover:animate-spin-slow" />
                    Student Digital Portal Access
                  </button>
                  <p className="text-[10px] text-slate-300 font-medium mt-4">Cloud-hosted on Netlify Infrastructure</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                <button onClick={() => setPendingUser(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest mb-8">
                  <ArrowLeft size={14} /> Change User
                </button>

                <div className="flex items-center gap-4 mb-8 text-left">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    {pendingUser.role === 'ADMIN' ? <LayoutDashboard size={28} /> : <Stethoscope size={28} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{pendingUser.role} SECURE LOGIN</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{pendingUser.name}</p>
                  </div>
                </div>

                <form onSubmit={verifyCredentials} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 text-left">Security Phrase</label>
                    <input
                      type="password"
                      autoFocus
                      required
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold border-2 border-transparent focus:border-indigo-400 transition-all text-center tracking-widest"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 justify-center text-rose-500 font-bold text-xs animate-in shake duration-300">
                      <AlertCircle size={14} />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Authorize Access
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-slate-200/50 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="group px-4 py-2 bg-white hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl flex items-center gap-2 transition-all border border-slate-200 text-xs font-black uppercase tracking-widest shadow-sm"
              title="Return to Access Gateway"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Log Out</span>
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white hidden xs:flex">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">SecureLeave</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{currentUser?.role} PORTAL</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-extrabold text-slate-900 leading-none mb-1">{currentUser?.name}</p>
              <button onClick={handleLogout} className="text-[10px] text-rose-500 font-black uppercase hover:underline flex items-center gap-1 ml-auto">
                <LogOut size={10} /> Logout
              </button>
            </div>
            <img src={currentUser?.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" alt="User" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
        {currentUser?.role === 'ADMIN' && (
          <AdminView
            requests={requests}
            onUpdateStatus={updateStatus}
            user={currentUser}
            onBack={handleLogout}
            registry={registry}
          />
        )}
        {currentUser?.role === 'NURSE' && (
          <NurseView onAddEmergency={addRequest} onBack={handleLogout} />
        )}
        {currentUser?.role === 'SECURITY' && (
          <SecurityView
            requests={requests}
            onConfirmExit={(id) => updateStatus(id, 'EXITED', { exitedAt: Date.now(), exitedConfirmedBy: currentUser.id })}
            onBack={handleLogout}
          />
        )}
        {currentUser?.role === 'TEACHER' && (
          <TeacherView
            requests={requests}
            onUpdateStatus={updateStatus}
            user={currentUser}
            onBack={handleLogout}
          />
        )}
      </main>
    </div>
  );
};

export default App;
