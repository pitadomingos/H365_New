import React, { useState, useEffect } from 'react';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Home, 
  ClipboardList, 
  Pill, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Activity, 
  Droplet, 
  QrCode, 
  AlertTriangle, 
  Dna, 
  Apple, 
  Stethoscope, 
  MapPin, 
  Download, 
  Info, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Beaker, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Smartphone, 
  Lock, 
  Eye, 
  Check,
  Bell,
  UserPlus,
  ChevronLeft,
  Heart,
  Phone
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/patient-portal';

// Interface definitions
interface Patient {
  id: string;
  nationalId: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dateOfBirth: string;
  photoUrl: string;
  district: string;
  province: string;
  lastVisit?: string;
  status?: string;
  location?: string;
  timeAdded?: string;
  allergies?: string[];
  chronicConditions?: string[];
  email?: string;
  phone?: string;
  address?: string;
  nextOfKinName?: string;
  nextOfKinRelation?: string;
  nextOfKinPhone?: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  reason: string;
  reminders: string;
  instructions: string;
  pillColor: string;
  adherenceLog?: string[];
}

interface Visit {
  id: number;
  date: string;
  dept: string;
  reason: string;
  doctor?: string;
  facility: string;
}

interface LabResult {
  id: number;
  test: string;
  date: string;
  status: string;
  results: string;
}

interface ToastMessage {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // i18n
  const { currentLocale, toggleLocale } = useLocale();
  const t = getTranslator(currentLocale);

  // Navigation & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'home' | 'records' | 'medications' | 'profile'>('home');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loginNid, setLoginNid] = useState<string>('');
  
  // Data State
  const [medications, setMedications] = useState<Medication[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [confirmedMeds, setConfirmedMeds] = useState<number[]>([]);
  
  // Settings & UX State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    email: '',
    phone: '',
    address: '',
    nextOfKinName: '',
    nextOfKinRelation: '',
    nextOfKinPhone: ''
  });

  // Modal State
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Registration State
  const [showRegistration, setShowRegistration] = useState<boolean>(false);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [registerForm, setRegisterForm] = useState({
    nationalId: '',
    fullName: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '',
    district: '',
    province: '',
    phone: '',
    email: '',
    allergies: '',
    chronicConditions: '',
    nextOfKinName: '',
    nextOfKinRelation: 'Spouse',
    nextOfKinPhone: '',
  });

  // Initialize App and Theme
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Session restore
    const savedNid = localStorage.getItem('session_nid');
    if (savedNid) {
      loadSessionData(savedNid);
    }
  }, []);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Load patient data from API server (port 3000)
  const loadSessionData = async (nid: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const profileRes = await fetch(`${API_BASE}/patients/${nid}`);
      if (!profileRes.ok) {
        throw new Error('Could not find patient records on main server.');
      }
      const patientData: Patient = await profileRes.ok ? await profileRes.json() : null;
      setPatient(patientData);
      setIsAuthenticated(true);
      localStorage.setItem('session_nid', nid);

      // Populate edit form
      setEditForm({
        email: patientData.email || '',
        phone: patientData.phone || '',
        address: patientData.address || '',
        nextOfKinName: patientData.nextOfKinName || '',
        nextOfKinRelation: patientData.nextOfKinRelation || 'Spouse',
        nextOfKinPhone: patientData.nextOfKinPhone || ''
      });

      // 2. Fetch Medications
      const medsRes = await fetch(`${API_BASE}/patients/${nid}/medications`);
      if (medsRes.ok) {
        const medsData: Medication[] = await medsRes.json();
        setMedications(medsData);
        
        // Find which meds are already logged today
        const loggedToday = medsData
          .filter(m => {
            if (!m.adherenceLog || m.adherenceLog.length === 0) return false;
            const lastLog = new Date(m.adherenceLog[m.adherenceLog.length - 1]);
            const today = new Date();
            return lastLog.toDateString() === today.toDateString();
          })
          .map(m => m.id);
        setConfirmedMeds(loggedToday);
      }

      // 3. Fetch Records (Visits & Labs)
      const recordsRes = await fetch(`${API_BASE}/patients/${nid}/records`);
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setVisits(recordsData.visits || []);
        setLabs(recordsData.labs || []);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Connection Error', err.message || 'Unable to sync with H365 central server.', 'error');
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginNid.trim()) {
      showToast('Validation Error', 'Please enter a valid National ID.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: loginNid.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server rejected login.');
      }

      showToast('Access Granted', `Welcome back, ${data.patient.fullName}!`, 'success');
      loadSessionData(loginNid.trim());
    } catch (err: any) {
      console.error(err);
      showToast('Access Denied', err.message || 'No patient profile matches this ID on the SaaS server.', 'error');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_nid');
    setIsAuthenticated(false);
    setPatient(null);
    setMedications([]);
    setVisits([]);
    setLabs([]);
    setConfirmedMeds([]);
    setCurrentView('home');
  };

  const openRegistration = () => {
    setRegisterForm(prev => ({ ...prev, nationalId: loginNid }));
    setRegStep(1);
    setShowRegistration(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.nationalId || !registerForm.fullName || !registerForm.gender || !registerForm.dateOfBirth) {
      showToast('Missing Fields', 'Please fill in all required fields on step 1.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...registerForm,
        allergies: registerForm.allergies ? registerForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        chronicConditions: registerForm.chronicConditions ? registerForm.chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      setShowRegistration(false);
      showToast('Registration Successful!', `Welcome, ${data.patient.fullName}! Your health record has been created.`, 'success');
      await loadSessionData(registerForm.nationalId);
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Could not create account. Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntake = async (medId: number) => {
    if (!patient) return;
    try {
      const res = await fetch(`${API_BASE}/patients/${patient.nationalId}/medications/${medId}/confirm`, {
        method: 'POST'
      });
      if (res.ok) {
        setConfirmedMeds(prev => [...prev, medId]);
        showToast('Intake Confirmed', 'Your adherence log has been sync-recorded for your provider.', 'success');
        
        // Refresh medications log
        const medsRes = await fetch(`${API_BASE}/patients/${patient.nationalId}/medications`);
        if (medsRes.ok) {
          setMedications(await medsRes.json());
        }
      } else {
        throw new Error('Failed to confirm adherence');
      }
    } catch (err) {
      showToast('Sync Failed', 'Could not record dose. Please check connection.', 'error');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/patients/${patient.nationalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setPatient(data.patient);
      setIsEditing(false);
      showToast('Profile Updated', 'Cloud registry successfully updated over active sync window.', 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Unable to update details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSatelliteSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Satellite Sync', 'Secure orbit L-LAN sync session established. Delta logs applied.', 'success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative pb-20">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-900' :
            toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/90 dark:text-rose-300 dark:border-rose-900' :
            'bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/90 dark:text-blue-300 dark:border-blue-900'
          } backdrop-blur-md`}>
            <div className="mt-0.5">
              {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
               toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-500" /> :
               <Info className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
              <p className="text-sm mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      {!isAuthenticated ? (

        showRegistration ? (
          /* ─────────────────────────────────────────────────
             SELF-REGISTRATION SCREEN
          ───────────────────────────────────────────────── */
          <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Registration Header */}
            <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setShowRegistration(false)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none">{currentLocale === 'pt' ? 'Criar Registo de Saúde' : 'Create Health Record'}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">{currentLocale === 'pt' ? `Passo ${regStep} de 3` : `Step ${regStep} of 3`}</p>
              </div>
              <div className="flex gap-1.5">
                {[1,2,3].map(s => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === regStep ? 'w-6 bg-primary' : s < regStep ? 'w-3 bg-primary/40' : 'w-3 bg-slate-200 dark:bg-slate-700'
                  }`} />
                ))}
              </div>
            </div>

            <form onSubmit={handleRegister} className="flex-1 overflow-y-auto px-4 pt-4 pb-28 max-w-md mx-auto w-full space-y-5">

              {/* ── STEP 1: Personal Identity ── */}
              {regStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Personal Identity</h3>
                      <p className="text-xs text-slate-400">Your legal identification details</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">{t('patientPortal.login.idLabel')} <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder={t('patientPortal.login.idPlaceholder')}
                        value={registerForm.nationalId}
                        onChange={e => setRegisterForm(p => ({ ...p, nationalId: e.target.value }))}
                        className="w-full h-11 px-4 text-center font-mono tracking-[0.2em] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="As on national document"
                        value={registerForm.fullName}
                        onChange={e => setRegisterForm(p => ({ ...p, fullName: e.target.value }))}
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Gender <span className="text-rose-500">*</span></label>
                        <select
                          value={registerForm.gender}
                          onChange={e => setRegisterForm(p => ({ ...p, gender: e.target.value as any }))}
                          className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Date of Birth <span className="text-rose-500">*</span></label>
                        <input
                          type="date"
                          value={registerForm.dateOfBirth}
                          onChange={e => setRegisterForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                          className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">District</label>
                        <input
                          type="text"
                          placeholder="e.g. Tete"
                          value={registerForm.district}
                          onChange={e => setRegisterForm(p => ({ ...p, district: e.target.value }))}
                          className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Province</label>
                        <input
                          type="text"
                          placeholder="e.g. Tete"
                          value={registerForm.province}
                          onChange={e => setRegisterForm(p => ({ ...p, province: e.target.value }))}
                          className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Contact Details ── */}
              {regStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Contact Details</h3>
                      <p className="text-xs text-slate-400">How we can reach you</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+258 8X XXX XXXX"
                        value={registerForm.phone}
                        onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Next of Kin</h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Emergency contact name"
                        value={registerForm.nextOfKinName}
                        onChange={e => setRegisterForm(p => ({ ...p, nextOfKinName: e.target.value }))}
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Relation</label>
                        <select
                          value={registerForm.nextOfKinRelation}
                          onChange={e => setRegisterForm(p => ({ ...p, nextOfKinRelation: e.target.value }))}
                          className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        >
                          <option>Spouse</option>
                          <option>Parent</option>
                          <option>Sibling</option>
                          <option>Child</option>
                          <option>Friend</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Phone</label>
                        <input
                          type="tel"
                          placeholder="+258 8X XXX"
                          value={registerForm.nextOfKinPhone}
                          onChange={e => setRegisterForm(p => ({ ...p, nextOfKinPhone: e.target.value }))}
                          className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Health Background ── */}
              {regStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Health Background</h3>
                      <p className="text-xs text-slate-400">Medical history (optional but helpful)</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Known Allergies</label>
                      <input
                        type="text"
                        placeholder="e.g. Penicillin, Latex (comma separated)"
                        value={registerForm.allergies}
                        onChange={e => setRegisterForm(p => ({ ...p, allergies: e.target.value }))}
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                      />
                      <p className="text-[10px] text-slate-400 ml-1">Leave blank if none known</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Chronic Conditions</label>
                      <input
                        type="text"
                        placeholder="e.g. Diabetes, Hypertension"
                        value={registerForm.chronicConditions}
                        onChange={e => setRegisterForm(p => ({ ...p, chronicConditions: e.target.value }))}
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                      />
                      <p className="text-[10px] text-slate-400 ml-1">Leave blank if none known</p>
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-3xl p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Registration Summary</p>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-semibold">{registerForm.fullName || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">NID</span><span className="font-mono font-semibold">{registerForm.nationalId || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Gender</span><span className="font-semibold">{registerForm.gender}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">DOB</span><span className="font-semibold">{registerForm.dateOfBirth || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Province</span><span className="font-semibold">{registerForm.province || '—'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-md mx-auto flex gap-3">
                  {regStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setRegStep(s => (s - 1) as any)}
                      className="flex-1 h-12 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                  )}
                  {regStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (regStep === 1 && (!registerForm.nationalId || !registerForm.fullName || !registerForm.dateOfBirth)) {
                          showToast('Missing Fields', 'National ID, Full Name and Date of Birth are required.', 'error');
                          return;
                        }
                        setRegStep(s => (s + 1) as any);
                      }}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Create Health Record</>}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (

        /* ─────────────────────────────────────────────────
           LOGIN SCREEN
        ───────────────────────────────────────────────── */
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          
          {/* Header Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md border dark:border-slate-700 text-xs font-black text-slate-500 dark:text-slate-300 hover:scale-105 transition-transform tracking-widest uppercase"
            >
              {currentLocale === 'en' ? 'PT' : 'EN'}
            </button>
            <button 
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-md border dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:scale-105 transition-transform"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl shadow-primary/20 mb-2">
                 <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {t('patientPortal.login.title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
                {t('patientPortal.login.subtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
              
              <div className="mb-6 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full">
                  NHIS SECURE
                </span>
                <span className="text-[10px] font-mono text-slate-400">Node: CL-772</span>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('patientPortal.login.idLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('patientPortal.login.idPlaceholder')}
                    value={loginNid}
                    onChange={(e) => setLoginNid(e.target.value)}
                    className="w-full h-12 text-lg text-center tracking-[0.2em] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t('patientPortal.login.button')}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Register CTA */}
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-3">{currentLocale === 'pt' ? 'Primeira vez aqui? Sem necessidade de visita.' : 'First time here? No facility visit needed.'}</p>
                <button
                  type="button"
                  onClick={openRegistration}
                  className="w-full h-11 border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all group"
                >
                  <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {currentLocale === 'pt' ? 'Criar Novo Registo de Saúde' : 'Create New Health Record'}
                </button>
              </div>

              {/* Demo Credentials Helper */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-xs">
                <div className="flex gap-2 text-primary font-bold items-center uppercase tracking-wider">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{t('patientPortal.login.demoCredentials')}</span>
                </div>
                <div className="mt-1 space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Li-Rieal Antonio:</span>
                    <span className="font-bold text-primary">1029384756</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delfina Correia:</span>
                    <span className="font-bold text-primary">5647382910</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Graciela Tembanne:</span>
                    <span className="font-bold text-primary">9988776655</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              HealthFlow Node Core • v0.4.3 Standalone
            </p>
          </div>
        </div>
        )

      ) : (

        /* MAIN PORTAL */
        <div className="mx-auto max-w-md min-h-screen flex flex-col relative px-4 pt-4">
          
          {/* Header Dashboard Nav */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b py-3 px-1 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-xl p-2 shadow-md">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white leading-none">H365 Hub</h3>
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={triggerSatelliteSync}
                className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 ${isSyncing ? 'animate-spin' : ''}`}
                title="Trigger Satellite Sync"
              >
                <Activity className="h-4 w-4" />
              </button>
              <button
                onClick={toggleLocale}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
                title="Toggle Language"
              >
                {currentLocale === 'en' ? 'PT' : 'EN'}
              </button>
              <button 
                onClick={toggleTheme}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/80 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* VIEW RENDER SWITCH */}
            
            {/* 1. DASHBOARD VIEW */}
            {currentView === 'home' && patient && (
              <div className="space-y-6">
                
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
                      {t('patientPortal.dashboard.welcome', { name: patient.fullName.split(' ')[0] })}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Sync node CL-772-MZ • Valid access
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden shadow-inner bg-slate-100">
                    <img 
                      src={patient.photoUrl} 
                      alt="User avatar" 
                      className="rounded-full h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${patient.fullName}`;
                      }}
                    />
                  </div>
                </div>

                {/* Gradient Digital Health ID Card */}
                <div className="bg-gradient-to-br from-primary to-indigo-700 text-white rounded-3xl shadow-xl shadow-primary/20 overflow-hidden relative group p-6 space-y-6 select-none transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/30">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Droplet className="h-24 w-24 text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Universal Health Node</p>
                       <h3 className="text-xl font-bold tracking-tight leading-none font-heading">{patient.fullName}</h3>
                     </div>
                     <button 
                       onClick={() => setShowQrModal(true)}
                       className="bg-white/20 hover:bg-white/30 p-2.5 rounded-2xl backdrop-blur-md transition-colors"
                       title="View QR Code"
                     >
                        <QrCode className="h-6 w-6" />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Document ID</p>
                        <p className="font-mono text-sm tracking-wider">{patient.nationalId}</p>
                     </div>
                     <div className="space-y-0.5 text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Blood Profile</p>
                        <p className="text-md font-extrabold font-heading">O Positive (O+)</p>
                     </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                     <div className="flex -space-x-1">
                        <div className="h-5 w-8 bg-white/20 rounded-md border border-white/30" />
                        <div className="h-5 w-8 bg-white/10 rounded-md border border-white/20" />
                     </div>
                     <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                       Valid: LIFETIME
                     </span>
                  </div>
                </div>

                {/* Health Summary Sections */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    {currentLocale === 'pt' ? 'Alertas de Saúde' : 'System Health Alerts'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-300 rounded-full">CRITICAL</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">ALLERGIES</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None Reported'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <Dna className="h-5 w-5 text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-300 rounded-full">MONITOR</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">CHRONIC STATUS</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {patient.chronicConditions && patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'No Conditions'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nutrition and Treatment Recommendations */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    {currentLocale === 'pt' ? 'Orientação Clínica & Dieta' : 'Clinical Guidance & Diet'}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex gap-4 border-l-4 border-l-emerald-500 shadow-sm">
                       <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Apple className="h-5 w-5" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Nutrition Plan</p>
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded">ACTIVE</span>
                          </div>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">Low Sodium Intake</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            Increase fresh potassium-rich inputs (greens, bananas) to assist hypertension management. Restrict process salts.
                          </p>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex gap-4 border-l-4 border-l-blue-500 shadow-sm">
                       <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Stethoscope className="h-5 w-5" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Clinical Treatment</p>
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded">MONITOR</span>
                          </div>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">Hypertension Management</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            Regular medication compliance expected. Daily walking of at least 30 minutes is highly recommended.
                          </p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Support Box */}
                <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-3xl space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                         <Info className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider font-heading">National Health Helpline</p>
                   </div>
                   <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      All clinical updates are validated by authorized node operators. In case of emergency or severe reactions, call 117 or report to your nearest ER node.
                   </p>
                   <button 
                     onClick={() => showToast('Report Request', 'Downloading health passport PDF packet...', 'info')}
                     className="w-full h-10 border border-primary/20 text-primary hover:bg-primary/5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors bg-white dark:bg-slate-900"
                   >
                      <Download className="h-4 w-4" /> Download Health Report (PDF)
                   </button>
                </div>
              </div>
            )}

            {/* 2. MEDICATIONS VIEW */}
            {currentView === 'medications' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">{t('patientPortal.meds.title')}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                     <Bell className="h-3.5 w-3.5 text-primary" /> {currentLocale === 'pt' ? 'Registe a conformidade diária com a prescrição.' : 'Track and record daily prescription compliance.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {medications.length > 0 ? (
                    medications.map((med) => {
                      const isConfirmed = confirmedMeds.includes(med.id);
                      return (
                        <div key={med.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex relative">
                          <div className={`w-2.5 shrink-0 ${med.pillColor || 'bg-blue-500'}`} />
                          <div className="p-5 flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                               <div className="space-y-0.5">
                                  <h4 className="text-lg font-bold text-slate-850 dark:text-slate-100 leading-none">{med.name}</h4>
                                  <p className="text-xs font-semibold text-slate-400">{med.dosage} • {med.reason}</p>
                               </div>
                               <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                 isConfirmed 
                                 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-900' 
                                 : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-900'
                               }`}>
                                  {isConfirmed ? "LOGGED" : "PENDING"}
                               </span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                               <div className="flex items-center gap-1.5 text-primary dark:text-primary/90 font-bold border-b border-slate-100 dark:border-slate-850 pb-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>Reminder: {med.reminders} ({med.frequency})</span>
                               </div>
                               <p className="italic leading-snug">
                                  &ldquo;{med.instructions}&rdquo;
                               </p>
                            </div>

                            <button 
                              className={`w-full h-11 text-xs font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                isConfirmed 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 cursor-default" 
                                : "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10"
                              }`}
                              onClick={() => !isConfirmed && handleConfirmIntake(med.id)}
                              disabled={isConfirmed}
                            >
                              {isConfirmed ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Logged for Today
                                </>
                              ) : (
                                <>
                                  <Pill className="h-4 w-4" />
                                  Confirm Intake Dose
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 space-y-3">
                       <Pill className="mx-auto h-12 w-12 opacity-30 text-slate-400" />
                       <p className="font-semibold text-sm">No active medications loaded.</p>
                    </div>
                  )}
                </div>

                {/* Adherence Insight Card */}
                <div className="bg-slate-900 text-white rounded-3xl overflow-hidden relative shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <TrendingUp className="h-24 w-24" />
                  </div>
                  <div className="p-6 space-y-3 relative z-10">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Adherence Statistics</p>
                     <h4 className="text-lg font-bold font-heading">High Compliance Target</h4>
                     <p className="text-xs text-slate-300 leading-relaxed">
                       Logging your medication intake supports clinical reviews and updates during your next scheduled consultation at H365 node.
                     </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. RECORDS & CLINICAL HISTORY VIEW */}
            {currentView === 'records' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">{t('patientPortal.records.title')}</h2>
                  <p className="text-xs text-slate-400">{currentLocale === 'pt' ? 'Veja resumos de visitas, análises laboratoriais e pacotes de estado.' : 'View visit summaries, laboratory analyses, and status packets.'}</p>
                </div>

                {/* Sub-tabs Component */}
                <RecordTabs visits={visits} labs={labs} />
              </div>
            )}

            {/* 4. PROFILE & SETTINGS VIEW */}
            {currentView === 'profile' && patient && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">{currentLocale === 'pt' ? 'Definições de Perfil' : 'Profile Settings'}</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                       <Edit className="h-3.5 w-3.5 text-primary" />
                       {t('patientPortal.profile.edit')}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  /* PROFILE EDIT FORM */
                  <form onSubmit={handleProfileSave} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">{t('patientPortal.profile.contactInfo')}</h3>
                      
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">{t('patientPortal.profile.email')}</label>
                          <input 
                            type="email"
                            value={editForm.email} 
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">{t('patientPortal.profile.phone')}</label>
                          <input 
                            type="text"
                            value={editForm.phone} 
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">{t('patientPortal.profile.address')}</label>
                          <textarea 
                            value={editForm.address} 
                            onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 h-20 dark:text-white text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">{t('patientPortal.profile.nextOfKin')}</h3>
                      
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kin Full Name</label>
                          <input 
                            type="text"
                            value={editForm.nextOfKinName} 
                            onChange={(e) => setEditForm({...editForm, nextOfKinName: e.target.value})}
                            className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Relation</label>
                            <input 
                              type="text"
                              value={editForm.nextOfKinRelation} 
                              onChange={(e) => setEditForm({...editForm, nextOfKinRelation: e.target.value})}
                              className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kin Phone</label>
                            <input 
                              type="text"
                              value={editForm.nextOfKinPhone} 
                              onChange={(e) => setEditForm({...editForm, nextOfKinPhone: e.target.value})}
                              className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button" 
                        className="flex-1 h-12 border dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                        onClick={() => setIsEditing(false)}
                      >
                        {t('patientPortal.profile.cancel')}
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 h-12 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t('patientPortal.profile.save')}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* PROFILE DISPLAY MODE */
                  <div className="space-y-6">
                    {/* User Card */}
                    <div className="flex flex-col items-center py-6 space-y-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                       <div className="h-24 w-24 rounded-full border-4 border-primary/10 overflow-hidden relative shadow-inner">
                          <img 
                            src={patient.photoUrl} 
                            alt="Patient profile" 
                            className="object-cover h-full w-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${patient.fullName}`;
                            }}
                          />
                       </div>
                       <div className="text-center space-y-1">
                          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white font-heading">{patient.fullName}</h3>
                          <p className="text-xs text-slate-400 font-mono tracking-wider">NHIS Registry: {patient.nationalId}</p>
                       </div>
                       <div className="flex gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-900/40">Verified Patient</span>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-100 dark:border-emerald-900/40">SaaS Node Active</span>
                       </div>
                    </div>

                    {/* Contact details list */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                       <div className="p-4 flex items-start gap-4">
                          <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">EMAIL REGISTRY</p>
                             <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">{patient.email || 'None Provided'}</p>
                          </div>
                       </div>
                       <div className="p-4 flex items-start gap-4">
                          <Smartphone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">CONTACT PHONE</p>
                             <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 font-mono">{patient.phone || 'None Provided'}</p>
                          </div>
                       </div>
                       <div className="p-4 flex items-start gap-4">
                          <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">PHYSICAL ADDRESS</p>
                             <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-tight">{patient.address || 'None Provided'}</p>
                          </div>
                       </div>
                    </div>

                    {/* Next of Kin Details */}
                    {patient.nextOfKinName && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Next of Kin Registry</h3>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Kin Contact:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{patient.nextOfKinName} ({patient.nextOfKinRelation})</span>
                           </div>
                           <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-850">
                              <span className="text-slate-400">Phone:</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{patient.nextOfKinPhone || 'N/A'}</span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Settings Sections */}
                    <div className="space-y-3">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Security Standard</h3>
                       <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                          <div className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Lock className="h-5 w-5 text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Biometric Authentications</span>
                             </div>
                             <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase">INACTIVE</span>
                          </div>
                          <div className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Eye className="h-5 w-5 text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Conceal PHI Data details</span>
                             </div>
                             <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase">INACTIVE</span>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Bottom Tab Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-2 py-2 safe-area-bottom shadow-[0_-2px_15px_rgba(0,0,0,0.05)] max-w-md mx-auto rounded-t-3xl">
            {[
              { id: 'home', icon: Home, label: t('patientPortal.nav.home') },
              { id: 'records', icon: ClipboardList, label: t('patientPortal.nav.records') },
              { id: 'medications', icon: Pill, label: t('patientPortal.nav.meds') },
              { id: 'profile', icon: User, label: t('patientPortal.nav.profile') },
            ].map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentView(item.id as any);
                  }}
                  className={`flex flex-col items-center gap-1.5 min-w-[64px] py-1 transition-all duration-200 relative ${
                    isActive ? "text-primary scale-110" : "text-slate-400 hover:text-slate-500"
                  }`}
                >
                  <item.icon className={`h-5 w-5 transition-colors ${isActive ? "fill-primary/5 text-primary" : "text-slate-400"}`} />
                  <span className={`text-[10px] font-bold tracking-wider ${isActive ? "text-primary font-black" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -top-2 h-1.5 w-6 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* QR Code Identification Modal */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 w-full max-w-xs space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => setShowQrModal(false)}
                    className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                     <X className="h-5 w-5" />
                  </button>

                  <div className="text-center space-y-1.5">
                     <h4 className="text-md font-bold text-slate-850 dark:text-slate-100 font-heading">Digital Health Passport</h4>
                     <p className="text-xs text-slate-450 dark:text-slate-400 leading-snug">Present this code to clinical operators for automated file lookup.</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border dark:border-slate-900 flex justify-center items-center shadow-inner relative group">
                     <QrCode className="h-44 w-44 text-slate-850 dark:text-white" />
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center font-bold text-xs text-primary uppercase tracking-widest pointer-events-none">Scan Ready</div>
                  </div>

                  <div className="text-center font-mono text-xs text-slate-500 tracking-wider">
                     NHIS-NID: {patient?.nationalId}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Separate helper component for records tab to keep code clean and readable
interface RecordTabsProps {
  visits: Visit[];
  labs: LabResult[];
}

function RecordTabs({ visits, labs }: RecordTabsProps) {
  const [activeTab, setActiveTab] = useState<'visits' | 'labs'>('visits');

  return (
    <div className="space-y-4">
      {/* Tab Select Header */}
      <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl h-11 border dark:border-slate-850">
        <button
          onClick={() => setActiveTab('visits')}
          className={`text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'visits'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Visits ({visits.length})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'labs'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <Beaker className="h-4 w-4" />
          Labs ({labs.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[250px] animate-in fade-in duration-300">
        
        {/* VISITS TAB */}
        {activeTab === 'visits' && (
          <div className="space-y-3">
            {visits.length > 0 ? (
              visits.map((visit) => (
                <div key={visit.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:border-primary/20 dark:hover:border-primary/45 transition-colors group">
                  <div className="h-10 w-10 rounded-2xl bg-primary/5 text-primary dark:bg-primary/20 flex items-center justify-center shrink-0">
                     <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                         {new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                       <span className="text-[8px] font-bold uppercase px-1.5 bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400 border dark:border-slate-850 rounded">VERIFIED</span>
                     </div>
                     <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate font-heading leading-tight">{visit.dept}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate leading-snug">&ldquo;Reason: {visit.reason}&rdquo;</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary dark:group-hover:text-white transition-colors shrink-0" />
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 space-y-2">
                 <ClipboardList className="mx-auto h-10 w-10 opacity-30" />
                 <p className="font-semibold text-sm">No visits found in clinical record.</p>
              </div>
            )}
          </div>
        )}

        {/* LAB RESULTS TAB */}
        {activeTab === 'labs' && (
          <div className="space-y-3">
            {labs.length > 0 ? (
              labs.map((lab) => (
                <div key={lab.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-primary/80">
                  <div className="p-4 space-y-3">
                     <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                           <p className="text-sm font-extrabold text-slate-850 dark:text-slate-100 font-heading leading-tight">{lab.test}</p>
                           <p className="text-[10px] text-slate-400 font-semibold uppercase font-mono">{lab.date}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          lab.status === 'Normal' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-350' 
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-350'
                        }`}>
                          {lab.status}
                        </span>
                     </div>
                     <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-900 break-words leading-relaxed shadow-inner">
                        {lab.results}
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 space-y-2">
                 <Beaker className="mx-auto h-10 w-10 opacity-30" />
                 <p className="font-semibold text-sm">No laboratory analyses loaded.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync Delay Alert Info */}
      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex gap-3 shadow-sm">
         <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
         <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-amber-750 dark:text-amber-300 uppercase tracking-wider">Sync Packet Delay Alert</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">
              Lab results and diagnostic files from remote clinical nodes are integrated within standard 24h satellite synchronization windows.
            </p>
         </div>
      </div>
    </div>
  );
}
