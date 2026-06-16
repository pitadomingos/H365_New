import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import {
  ShieldCheck, Loader2, Home, ClipboardList, Pill, User, LogOut,
  Moon, Sun, Activity, AlertTriangle, Download, Calendar, Clock,
  ChevronRight, Beaker, CheckCircle2, Edit, Save, X, Mail,
  Smartphone, Lock, Check, Bell, UserPlus, ChevronLeft, Heart,
  Phone, Search, Plus, FileText, HardHat, Settings, RefreshCw,
  Wifi, WifiOff, Stethoscope, BarChart2
} from 'lucide-react';

const _VITE_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000').replace(/\/$/, '');
const API_BASE = _VITE_BASE + '/api/patient-portal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Patient {
  id: string; nationalId: string; fullName: string;
  gender: 'Male' | 'Female' | 'Other'; age: number; dateOfBirth: string;
  photoUrl: string; district: string; province: string; lastVisit?: string;
  status?: string; allergies?: string[]; chronicConditions?: string[];
  email?: string; phone?: string; address?: string;
  nextOfKinName?: string; nextOfKinRelation?: string; nextOfKinPhone?: string;
}
interface Medication {
  id: number; name: string; dosage: string; frequency: string;
  reason: string; reminders: string; instructions: string;
  pillColor: string; adherenceLog?: string[];
}
interface Visit { id: number; date: string; dept: string; reason: string; doctor?: string; facility: string; }
interface LabResult { id: number; test: string; date: string; status: string; results: string; }
interface ToastMessage { title: string; message: string; type: 'success' | 'error' | 'info'; }

type AppView = 'home' | 'records' | 'medications' | 'profile' | 'occupational';

// ─── Vitality Gauge (SVG Arc) ─────────────────────────────────────────────────
function VitalityGauge({ score }: { score: number }) {
  const r = 54; const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = pct * circ;
  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="#0891b2" strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-black text-slate-800">{score.toFixed(1)}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: ToastMessage }) {
  const bg = toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-cyan-600';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${bg} text-white px-5 py-3 rounded-2xl shadow-2xl max-w-xs w-full`}>
      <p className="text-xs font-black uppercase tracking-wider">{toast.title}</p>
      <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { currentLocale, toggleLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const pt = currentLocale === 'pt';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [occupationalExams, setOccupationalExams] = useState<any[]>([]);
  const [loginNid, setLoginNid] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [confirmedMeds, setConfirmedMeds] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState<'personal' | 'emergency' | null>(null);
  const [editForm, setEditForm] = useState({ email: '', phone: '', address: '', nextOfKinName: '', nextOfKinRelation: '', nextOfKinPhone: '' });
  const [showRegistration, setShowRegistration] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [registerForm, setRegisterForm] = useState({ nationalId: '', fullName: '', gender: 'Female' as 'Male' | 'Female' | 'Other', dateOfBirth: '', district: '', province: '', phone: '', email: '', allergies: '', chronicConditions: '', nextOfKinName: '', nextOfKinRelation: 'Spouse', nextOfKinPhone: '', photoUrl: '' });
  // Adherence time-of-day state
  const [adherencePeriods, setAdherencePeriods] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true); document.documentElement.classList.add('dark');
    }
    const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
    const savedNid = localStorage.getItem('session_nid');
    const savedAt = Number(localStorage.getItem('session_nid_at') || '0');
    if (savedNid && Date.now() - savedAt < SESSION_TTL_MS) { loadSessionData(savedNid); }
    else { localStorage.removeItem('session_nid'); localStorage.removeItem('session_nid_at'); }
  }, []);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleTheme = () => {
    if (isDarkMode) { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); setIsDarkMode(false); }
    else { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); setIsDarkMode(true); }
  };

  const loadSessionData = async (nid: string) => {
    setIsLoading(true);
    try {
      const profileRes = await fetch(`${API_BASE}/patients/${nid}`);
      if (!profileRes.ok) throw new Error('Could not find patient records.');
      const patientData: Patient = await profileRes.json();
      setPatient(patientData); setIsAuthenticated(true);
      localStorage.setItem('session_nid', nid); localStorage.setItem('session_nid_at', Date.now().toString());
      setEditForm({ email: patientData.email || '', phone: patientData.phone || '', address: patientData.address || '', nextOfKinName: patientData.nextOfKinName || '', nextOfKinRelation: patientData.nextOfKinRelation || 'Spouse', nextOfKinPhone: patientData.nextOfKinPhone || '' });
      const medsRes = await fetch(`${API_BASE}/patients/${nid}/medications`);
      if (medsRes.ok) { const medsData: Medication[] = await medsRes.json(); setMedications(medsData); const loggedToday = medsData.filter(m => m.adherenceLog?.length && new Date(m.adherenceLog[m.adherenceLog.length - 1]).toDateString() === new Date().toDateString()).map(m => m.id); setConfirmedMeds(loggedToday); }
      const recordsRes = await fetch(`${API_BASE}/patients/${nid}/records`);
      if (recordsRes.ok) { const rd = await recordsRes.json(); setVisits(rd.visits || []); setLabs(rd.labs || []); }
      try {
        const examsRes = await fetch(`${_VITE_BASE}/api/chaem/exams?nid=${encodeURIComponent(nid)}`);
        if (examsRes.ok) { const ed = await examsRes.json(); setOccupationalExams(ed.exams || []); }
        else { const stored = localStorage.getItem('h365_occupational_exams'); if (stored) setOccupationalExams(JSON.parse(stored).filter((e: any) => e.patientId === nid)); }
      } catch { const stored = localStorage.getItem('h365_occupational_exams'); if (stored) setOccupationalExams(JSON.parse(stored).filter((e: any) => e.patientId === nid)); }
    } catch (err: any) { showToast('Erro de Ligação', err.message || 'Não foi possível ligar ao servidor H365.', 'error'); handleLogout(); }
    finally { setIsLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); if (!loginNid.trim()) { showToast('Validação', pt ? 'Introduza um ID válido.' : 'Enter a valid ID.', 'error'); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nationalId: loginNid.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login rejected.');
      showToast(pt ? 'Bem-vindo!' : 'Welcome!', data.patient.fullName, 'success');
      loadSessionData(loginNid.trim());
    } catch (err: any) { showToast(pt ? 'Acesso Negado' : 'Access Denied', err.message, 'error'); setIsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_nid'); localStorage.removeItem('session_nid_at');
    setIsAuthenticated(false); setPatient(null); setMedications([]); setVisits([]); setLabs([]); setConfirmedMeds([]); setCurrentView('home');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.nationalId || !registerForm.fullName || !registerForm.gender || !registerForm.dateOfBirth) { showToast(pt ? 'Campos Obrigatórios' : 'Required Fields', pt ? 'Preencha todos os campos.' : 'Fill all required fields.', 'error'); return; }
    setIsLoading(true);
    try {
      const payload = { ...registerForm, allergies: registerForm.allergies ? registerForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [], chronicConditions: registerForm.chronicConditions ? registerForm.chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [] };
      const res = await fetch(`${API_BASE}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      setShowRegistration(false);
      showToast(pt ? 'Registo Bem-sucedido!' : 'Registered!', data.patient.fullName, 'success');
      await loadSessionData(registerForm.nationalId);
    } catch (err: any) { showToast(pt ? 'Registo Falhou' : 'Registration Failed', err.message, 'error'); }
    finally { setIsLoading(false); }
  };

  const handleConfirmIntake = async (medId: number, period: string) => {
    if (!patient) return;
    try {
      const res = await fetch(`${API_BASE}/patients/${patient.nationalId}/medications/${medId}/confirm`, { method: 'POST' });
      if (res.ok) {
        setAdherencePeriods(prev => ({ ...prev, [medId]: [...(prev[medId] || []), period] }));
        if (!confirmedMeds.includes(medId)) setConfirmedMeds(prev => [...prev, medId]);
        showToast(pt ? 'Toma Confirmada' : 'Intake Confirmed', period, 'success');
      }
    } catch { showToast('Sync', pt ? 'Falha na sincronização.' : 'Sync failed.', 'error'); }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!patient) return; setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patients/${patient.nationalId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');
      setPatient(data.patient); setEditSection(null); setIsEditing(false);
      showToast(pt ? 'Perfil Actualizado' : 'Profile Updated', '', 'success');
    } catch (err: any) { showToast('Erro', err.message, 'error'); }
    finally { setIsLoading(false); }
  };

  const triggerSatelliteSync = async () => {
    if (!patient) return; setIsSyncing(true);
    try {
      const batch = [{ type: 'session_heartbeat', nid: patient.nationalId, timestamp: Date.now() }, ...confirmedMeds.map(medId => ({ type: 'adherence_log', nid: patient.nationalId, medId, timestamp: Date.now() }))];
      const res = await fetch(`${_VITE_BASE}/api/sync/batch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workstationId: `portal-${patient.nationalId}`, facilityId: 'h365-saas', batch }) });
      const data = await res.json();
      showToast('Satellite Sync', res.ok ? `${data.processedCount ?? batch.length} registos sincronizados.` : 'Falha na sincronização.', res.ok ? 'success' : 'error');
    } catch { showToast('Sync', 'Servidor inacessível.', 'error'); }
    finally { setIsSyncing(false); }
  };

  const downloadHealthReport = async () => {
    if (!patient) return; setIsLoading(true);
    showToast(pt ? 'Relatório' : 'Report', pt ? 'A gerar PDF...' : 'Generating PDF...', 'info');
    try {
      const el = document.getElementById('health-report-pdf'); if (!el) return;
      el.style.display = 'block';
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`${patient.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      el.style.display = 'none';
      showToast(pt ? 'Sucesso' : 'Success', pt ? 'PDF baixado!' : 'PDF downloaded!', 'success');
    } catch { showToast('Erro', pt ? 'Falha ao gerar PDF.' : 'Failed to generate PDF.', 'error'); }
    finally { setIsLoading(false); }
  };

  // Vitality score calculation
  const vitalityScore = useMemo(() => {
    let score = 100;
    score -= Math.min((patient?.chronicConditions?.length ?? 0) * 5, 30);
    score -= Math.min(labs.filter(l => l.status === 'Critical' || l.status === 'Elevated').length * 8, 20);
    if (medications.length > 0) score = Math.round(score * (0.6 + 0.4 * confirmedMeds.length / medications.length));
    return Math.max(0, Math.min(100, score));
  }, [patient, labs, medications, confirmedMeds]);

  // ─── Login Screen ───────────────────────────────────────────────────────────
  if (!isAuthenticated && !showRegistration) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {toast && <Toast toast={toast} />}
        {/* Header */}
        <div className="bg-cyan-600 px-6 pt-14 pb-10 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-black">H365 Portal</h1>
          <p className="text-cyan-100 text-sm mt-1">{pt ? 'Portal de Saúde do Paciente' : 'Patient Health Portal'}</p>
        </div>
        {/* Login Card */}
        <div className="flex-1 px-6 -mt-6 z-10">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-1">{pt ? 'Iniciar Sessão' : 'Sign In'}</h2>
            <p className="text-xs text-slate-400 mb-6">{pt ? 'Use o seu Nº de Identificação Nacional' : 'Use your National ID number'}</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">{pt ? 'ID Nacional / BI / NUIT' : 'National ID / BI / NUIT'}</label>
                <input value={loginNid} onChange={e => setLoginNid(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 h-12 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="ex: 123456789AB" autoComplete="off" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{pt ? 'Entrar' : 'Sign In'}</>}
              </button>
            </form>
            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 mb-3">{pt ? 'Novo no portal?' : 'New to the portal?'}</p>
              <button onClick={() => { setRegisterForm(p => ({ ...p, nationalId: loginNid })); setRegStep(1); setShowRegistration(true); }}
                className="w-full h-11 border-2 border-cyan-500 text-cyan-600 font-bold rounded-2xl text-sm hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" /> {pt ? 'Criar Conta' : 'Create Account'}
              </button>
            </div>
            <button onClick={toggleLocale} className="mt-4 w-full text-center text-[10px] text-slate-400 hover:text-cyan-600 font-bold uppercase tracking-widest">
              {pt ? 'Switch to English' : 'Mudar para Português'}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-300 py-6 font-bold">H365 SAÚDE DIGITAL · MOÇAMBIQUE</p>
      </div>
    );
  }

  // ─── Registration Modal ─────────────────────────────────────────────────────
  if (showRegistration) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {toast && <Toast toast={toast} />}
        <div className="bg-cyan-600 px-6 pt-14 pb-8 text-white flex items-center gap-4">
          <button onClick={() => setShowRegistration(false)} className="p-2 rounded-full bg-white/20">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">{pt ? 'Nova Conta' : 'Create Account'}</h1>
            <p className="text-cyan-100 text-xs">{pt ? `Passo ${regStep} de 3` : `Step ${regStep} of 3`}</p>
          </div>
        </div>
        <div className="flex-1 px-6 py-6">
          <div className="flex gap-2 mb-6">
            {[1,2,3].map(s => <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= regStep ? 'bg-cyan-500' : 'bg-slate-200'}`} />)}
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            {regStep === 1 && (<>
              {[['nationalId', pt ? 'ID Nacional *' : 'National ID *'], ['fullName', pt ? 'Nome Completo *' : 'Full Name *'], ['dateOfBirth', pt ? 'Data de Nascimento *' : 'Date of Birth *']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">{l}</label>
                  <input type={k === 'dateOfBirth' ? 'date' : 'text'} value={(registerForm as any)[k]} onChange={e => setRegisterForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-2xl px-4 h-12 text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">{pt ? 'Género *' : 'Gender *'}</label>
                <select value={registerForm.gender} onChange={e => setRegisterForm(p => ({ ...p, gender: e.target.value as any }))}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 h-12 text-sm focus:outline-none focus:border-cyan-500">
                  <option value="Female">{pt ? 'Feminino' : 'Female'}</option>
                  <option value="Male">{pt ? 'Masculino' : 'Male'}</option>
                  <option value="Other">{pt ? 'Outro' : 'Other'}</option>
                </select>
              </div>
            </>)}
            {regStep === 2 && (<>
              {[['province', pt ? 'Província' : 'Province'], ['district', pt ? 'Distrito' : 'District'], ['phone', pt ? 'Telefone' : 'Phone'], ['email', 'Email']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">{l}</label>
                  <input value={(registerForm as any)[k]} onChange={e => setRegisterForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-2xl px-4 h-12 text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              ))}
            </>)}
            {regStep === 3 && (<>
              {[['nextOfKinName', pt ? 'Nome do Contacto de Emergência' : 'Emergency Contact Name'], ['nextOfKinPhone', pt ? 'Telefone do Contacto' : 'Contact Phone']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">{l}</label>
                  <input value={(registerForm as any)[k]} onChange={e => setRegisterForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-2xl px-4 h-12 text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">{pt ? 'Alergias (separadas por vírgula)' : 'Allergies (comma-separated)'}</label>
                <input value={registerForm.allergies} onChange={e => setRegisterForm(p => ({ ...p, allergies: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 h-12 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
            </>)}
            <div className="flex gap-3 pt-4">
              {regStep > 1 && <button type="button" onClick={() => setRegStep(s => (s - 1) as 1 | 2 | 3)} className="flex-1 h-12 border-2 border-slate-200 rounded-2xl font-bold text-slate-600">{pt ? 'Anterior' : 'Back'}</button>}
              {regStep < 3
                ? <button type="button" onClick={() => setRegStep(s => (s + 1) as 1 | 2 | 3)} className="flex-1 h-12 bg-cyan-600 text-white rounded-2xl font-bold">{pt ? 'Próximo' : 'Next'}</button>
                : <button type="submit" disabled={isLoading} className="flex-1 h-12 bg-cyan-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (pt ? 'Criar Conta' : 'Create Account')}
                  </button>}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── Authenticated App Shell ────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: 'home',        icon: Home,          label: pt ? 'Início' : 'Home' },
    { id: 'records',     icon: ClipboardList, label: pt ? 'Registos' : 'Records' },
    { id: 'medications', icon: Pill,          label: pt ? 'Medicação' : 'Meds' },
    { id: 'profile',     icon: User,          label: pt ? 'Perfil' : 'Profile' },
  ];

  const PAGE_TITLES: Record<AppView, string> = {
    home:        pt ? 'Resumo de Saúde' : 'Health Summary',
    records:     pt ? 'Registos' : 'Records',
    medications: pt ? 'Medicação' : 'Medications',
    profile:     pt ? 'Perfil' : 'Profile',
    occupational: 'CHAEM',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative">
      {toast && <Toast toast={toast} />}

      {/* Hidden PDF Template */}
      {patient && (
        <div id="health-report-pdf" className="fixed top-0 left-[-9999px] w-[800px] bg-white text-slate-900 p-10 hidden font-sans">
          <div className="flex items-center justify-between border-b-4 border-cyan-600 pb-6 mb-6">
            <h1 className="text-2xl font-black text-cyan-700">H365 Patient Portal</h1>
            <p className="text-sm text-slate-500">{new Date().toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[['Name', patient.fullName], ['NID', patient.nationalId], ['DOB', patient.dateOfBirth], ['Gender', patient.gender], ['Phone', patient.phone || 'N/A'], ['Province', patient.province]].map(([l, v]) => (
              <div key={l}><p className="text-xs text-slate-400 font-bold uppercase">{l}</p><p className="text-sm font-bold text-slate-800">{v}</p></div>
            ))}
          </div>
          <div className="mb-4"><h3 className="font-bold border-b pb-1 mb-2">Medications ({medications.length})</h3>{medications.map(m => <p key={m.id} className="text-xs py-1">• {m.name} — {m.dosage} — {m.frequency}</p>)}</div>
          <div className="mb-4"><h3 className="font-bold border-b pb-1 mb-2">Recent Visits ({visits.length})</h3>{visits.slice(0, 5).map(v => <p key={v.id} className="text-xs py-1">• {v.date} — {v.dept} — {v.reason}</p>)}</div>
          <div><h3 className="font-bold border-b pb-1 mb-2">Lab Results ({labs.length})</h3>{labs.slice(0, 5).map(l => <p key={l.id} className="text-xs py-1">• {l.test} — {l.status} — {l.results}</p>)}</div>
        </div>
      )}

      {/* ── Fixed Header ── */}
      <header className="sticky top-0 z-30 bg-cyan-600 px-5 pt-12 pb-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {currentView === 'occupational' && (
            <button onClick={() => setCurrentView('home')} className="p-2 rounded-full bg-white/20 mr-1">
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}
          <h1 className="text-white font-black text-lg tracking-tight">{PAGE_TITLES[currentView]}</h1>
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'records' && <button className="p-2 rounded-full bg-white/20"><Search className="h-4 w-4 text-white" /></button>}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-white/20">
            {isDarkMode ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4 text-white" />}
          </button>
          <button className="p-2 rounded-full bg-white/20 relative">
            <Bell className="h-4 w-4 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
          </button>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <main className="flex-1 overflow-y-auto pb-28">

        {/* ══ HOME ══════════════════════════════════════════════════════════ */}
        {currentView === 'home' && (
          <div className="px-4 py-5 space-y-5">
            {/* Patient greeting */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                {patient?.photoUrl
                  ? <img src={patient.photoUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-cyan-100"><User className="h-6 w-6 text-cyan-500" /></div>}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{pt ? 'Bem-vindo' : 'Welcome back'}</p>
                <p className="text-base font-black text-slate-800">{patient?.fullName?.split(' ')[0]}</p>
              </div>
            </div>

            {/* Vitality Index Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Índice de Vitalidade' : 'Vitality Index'}</h2>
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center">
                  <span className="text-[8px] text-slate-400 font-bold">i</span>
                </div>
              </div>
              <VitalityGauge score={vitalityScore} />
              <div className="flex items-center justify-center gap-5 mt-3">
                {[['bg-cyan-500', pt ? 'Saúde' : 'Health'], ['bg-slate-700', pt ? 'Clínico' : 'Clinical'], ['bg-slate-300', pt ? 'Vitais' : 'Vitals']].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${c}`} />
                    <span className="text-[10px] font-bold text-slate-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity quick stats */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">{pt ? 'Actividade Recente' : 'Recent Activity'}</h2>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { icon: Heart, label: pt ? 'Saúde' : 'Health', value: `${vitalityScore}`, color: 'bg-red-50 text-red-500' },
                  { icon: Pill, label: pt ? 'Meds' : 'Meds', value: `${confirmedMeds.length}`, color: 'bg-cyan-50 text-cyan-600' },
                  { icon: Activity, label: pt ? 'Vivos' : 'Live', value: `${labs.length}`, color: 'bg-emerald-50 text-emerald-600' },
                  { icon: Clock, label: pt ? 'Visitas' : 'Visits', value: `${visits.length}`, color: 'bg-amber-50 text-amber-600' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className={`${color} rounded-2xl p-3 flex flex-col items-center gap-1`}>
                    <Icon className="h-5 w-5" />
                    <p className="text-xs font-black">{value}</p>
                    <p className="text-[9px] font-bold opacity-70">{label}</p>
                  </div>
                ))}
              </div>
              {visits.slice(0, 2).map(v => (
                <button key={v.id} onClick={() => setCurrentView('records')}
                  className="w-full flex items-center gap-3 py-3 border-t border-slate-50 first:border-0">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-slate-700">{v.reason}</p>
                    <p className="text-[10px] text-slate-400">{v.date} · {v.dept}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCurrentView('occupational')}
                className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  <HardHat className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-xs font-black text-slate-700">CHAEM</p>
                <p className="text-[10px] text-slate-400">{occupationalExams.length} {pt ? 'exames' : 'exams'}</p>
              </button>
              <button onClick={triggerSatelliteSync} disabled={isSyncing}
                className="bg-cyan-600 rounded-3xl p-4 flex flex-col gap-2 shadow-sm text-left">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {isSyncing ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <RefreshCw className="h-5 w-5 text-white" />}
                </div>
                <p className="text-xs font-black text-white">Satellite Sync</p>
                <p className="text-[10px] text-white/70">{pt ? 'Sincronizar dados' : 'Sync data'}</p>
              </button>
            </div>
          </div>
        )}

        {/* ══ RECORDS ═══════════════════════════════════════════════════════ */}
        {currentView === 'records' && (
          <div className="px-4 py-5 space-y-4">
            {/* Visit History */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Histórico de Consultas' : 'Visit History'}</h2>
              </div>
              {visits.length === 0 && <p className="px-5 pb-5 text-xs text-slate-400">{pt ? 'Sem consultas registadas.' : 'No visits recorded.'}</p>}
              {visits.map((v, i) => (
                <div key={v.id} className={`px-5 py-4 flex items-center gap-3 ${i < visits.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400">{v.date}</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{v.reason}</p>
                    <p className="text-[10px] text-slate-400 truncate">{v.dept} · {v.doctor}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>

            {/* Lab Results */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Resultados de Laboratório' : 'Diagnostic Lab Results'}</h2>
              </div>
              {labs.length === 0 && <p className="px-5 pb-5 text-xs text-slate-400">{pt ? 'Sem resultados disponíveis.' : 'No results available.'}</p>}
              {labs.map((l, i) => (
                <div key={l.id} className={`px-5 py-4 flex items-center gap-3 ${i < labs.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Beaker className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400">{l.date}</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{l.test}</p>
                    <p className="text-[10px] truncate" style={{ color: l.status === 'Critical' ? '#ef4444' : l.status === 'Elevated' ? '#f59e0b' : '#10b981' }}>{l.status} — {l.results}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>

            {/* Clinician Notes placeholder */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Notas Clínicas' : 'Clinician Notes'}</h2>
              </div>
              {patient?.chronicConditions && patient.chronicConditions.length > 0
                ? patient.chronicConditions.map((c, i) => (
                  <div key={i} className={`px-5 py-4 flex items-center gap-3 ${i < (patient.chronicConditions?.length ?? 0) - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="flex-1"><p className="text-sm font-bold text-slate-700">{c}</p><p className="text-[10px] text-slate-400">{pt ? 'Condição Crónica' : 'Chronic Condition'}</p></div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                ))
                : <p className="px-5 pb-5 text-xs text-slate-400">{pt ? 'Sem notas clínicas.' : 'No clinician notes.'}</p>}
            </div>
          </div>
        )}

        {/* ══ OCCUPATIONAL / CHAEM ══════════════════════════════════════════ */}
        {currentView === 'occupational' && (
          <div className="px-4 py-5 space-y-4">
            {/* Info banner */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {pt ? 'Repositório seguro de certificados ocupacionais e PDFs AMA.' : 'Secure repository for occupational certificates and AMA PDFs.'}
              </p>
            </div>

            {/* Occupational Certificates */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Certificados Ocupacionais' : 'Occupational Certificates'}</h2>
              </div>
              {occupationalExams.length === 0
                ? <p className="px-5 pb-5 text-xs text-slate-400">{pt ? 'Nenhum exame disponível.' : 'No exams available.'}</p>
                : occupationalExams.map((exam, i) => (
                  <div key={exam.id || i} className={`px-5 py-4 flex items-center gap-3 ${i < occupationalExams.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{exam.examType || 'AMA'} — {exam.sector}</p>
                      <p className="text-[10px] text-slate-400">{exam.date} · <span className={exam.status === 'Apto' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{exam.status}</span></p>
                    </div>
                    <button className="p-2 bg-teal-50 rounded-xl"><Download className="h-4 w-4 text-teal-600" /></button>
                  </div>
                ))}
            </div>

            {/* AMA PDFs */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">AMA PDFs</h2>
              </div>
              {[pt ? 'Ver / Baixar' : 'View / Download', pt ? 'Ver / Baixar' : 'View / Download'].map((label, i) => (
                <div key={i} className={`px-5 py-4 flex items-center gap-3 ${i === 0 ? 'border-b border-slate-50' : ''}`}>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="flex-1 text-sm font-bold text-slate-700">AMA PDFs — {label}</p>
                  <button onClick={downloadHealthReport} className="p-2 bg-blue-50 rounded-xl"><Download className="h-4 w-4 text-blue-500" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ MEDICATIONS ═══════════════════════════════════════════════════ */}
        {currentView === 'medications' && (
          <div className="px-4 py-5 space-y-4">
            {/* Active Prescriptions */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Prescrições Activas' : 'Active Prescriptions'}</h2>
              </div>
              {medications.length === 0 && <p className="px-5 pb-5 text-xs text-slate-400">{pt ? 'Sem medicação prescrita.' : 'No prescriptions.'}</p>}
              {medications.map((med, i) => (
                <div key={med.id} className={`px-5 py-4 flex items-center gap-3 ${i < medications.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ backgroundColor: med.pillColor || '#0891b2' }}>
                    {med.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{med.name}</p>
                    <p className="text-[10px] text-slate-400">{med.dosage} · {med.frequency}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>

            {/* Daily Adherence Tracking */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">{pt ? 'Adesão Diária' : 'Daily Adherence Tracking'}</h2>
              {medications.length > 0 ? (
                <>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div /> 
                    {([pt ? 'Manhã' : 'Morning', pt ? 'Tarde' : 'Noon', pt ? 'Noite' : 'Evening']).map(p => (
                      <p key={p} className="text-[10px] font-black text-center text-slate-500 uppercase">{p}</p>
                    ))}
                  </div>
                  {medications.map(med => {
                    const periods = adherencePeriods[med.id] || [];
                    return (
                      <div key={med.id} className="grid grid-cols-4 gap-2 mb-3 items-center">
                        <p className="text-[10px] font-bold text-slate-600 truncate">{med.name.split(' ')[0]}</p>
                        {(['morning', 'noon', 'evening']).map(period => {
                          const checked = periods.includes(period) || confirmedMeds.includes(med.id);
                          return (
                            <button key={period} onClick={() => !checked && handleConfirmIntake(med.id, period)}
                              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-all ${checked ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300 hover:border-cyan-400'}`}>
                              {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  <button onClick={triggerSatelliteSync} disabled={isSyncing}
                    className="w-full mt-3 h-11 bg-cyan-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
                    {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{pt ? 'Ver Hoje' : 'View Today'}</>}
                  </button>
                </>
              ) : <p className="text-xs text-slate-400">{pt ? 'Sem medicação para rastrear.' : 'No medications to track.'}</p>}
            </div>
          </div>
        )}

        {/* ══ PROFILE ═══════════════════════════════════════════════════════ */}
        {currentView === 'profile' && (
          <div className="px-4 py-5 space-y-4">
            {/* Avatar */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200">
                {patient?.photoUrl
                  ? <img src={patient.photoUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><User className="h-10 w-10 text-slate-400" /></div>}
              </div>
              <div className="text-center">
                <p className="font-black text-slate-800">{patient?.fullName}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{patient?.nationalId}</p>
              </div>
            </div>

            {/* Personal Data */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Dados Pessoais' : 'Personal Data'}</h2>
                <button onClick={() => { setEditSection('personal'); setIsEditing(true); }}
                  className="px-3 py-1.5 border-2 border-cyan-500 text-cyan-600 rounded-full text-[10px] font-black uppercase">{pt ? 'Editar' : 'Edit'}</button>
              </div>
              {editSection === 'personal' && isEditing
                ? <form onSubmit={handleProfileSave} className="px-5 pb-5 space-y-3">
                    {[['email', 'Email', 'email'], ['phone', pt ? 'Telefone' : 'Phone', 'tel'], ['address', pt ? 'Morada' : 'Address', 'text']].map(([k, l, type]) => (
                      <div key={k}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{l}</label>
                        <input type={type} value={(editForm as any)[k]} onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))}
                          className="w-full border-2 border-slate-200 rounded-xl px-3 h-10 text-sm focus:outline-none focus:border-cyan-500" />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setEditSection(null)} className="flex-1 h-10 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold">{pt ? 'Cancelar' : 'Cancel'}</button>
                      <button type="submit" disabled={isLoading} className="flex-1 h-10 bg-cyan-600 text-white rounded-xl text-sm font-bold">{isLoading ? '...' : pt ? 'Guardar' : 'Save'}</button>
                    </div>
                  </form>
                : <div className="px-5 pb-5 space-y-3">
                    {[['name', pt ? 'Nome' : 'Name', patient?.fullName], ['dob', pt ? 'Nascimento' : 'DOB', patient?.dateOfBirth], ['gender', pt ? 'Género' : 'Gender', patient?.gender], ['province', pt ? 'Província' : 'Province', patient?.province], ['phone', pt ? 'Telefone' : 'Phone', patient?.phone || '—'], ['email', 'Email', patient?.email || '—']].map(([k, l, v]) => (
                      <div key={k} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{l}</span>
                        <span className="text-xs font-bold text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>}
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{pt ? 'Contacto de Emergência' : 'Emergency Contacts'}</h2>
                <button onClick={() => { setEditSection('emergency'); setIsEditing(true); }}
                  className="px-3 py-1.5 border-2 border-cyan-500 text-cyan-600 rounded-full text-[10px] font-black uppercase">{pt ? 'Editar' : 'Edit'}</button>
              </div>
              {editSection === 'emergency' && isEditing
                ? <form onSubmit={handleProfileSave} className="px-5 pb-5 space-y-3">
                    {[['nextOfKinName', pt ? 'Nome' : 'Name', 'text'], ['nextOfKinPhone', pt ? 'Telefone' : 'Phone', 'tel']].map(([k, l, type]) => (
                      <div key={k}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{l}</label>
                        <input type={type} value={(editForm as any)[k]} onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))}
                          className="w-full border-2 border-slate-200 rounded-xl px-3 h-10 text-sm focus:outline-none focus:border-cyan-500" />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setEditSection(null)} className="flex-1 h-10 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold">{pt ? 'Cancelar' : 'Cancel'}</button>
                      <button type="submit" disabled={isLoading} className="flex-1 h-10 bg-cyan-600 text-white rounded-xl text-sm font-bold">{isLoading ? '...' : pt ? 'Guardar' : 'Save'}</button>
                    </div>
                  </form>
                : <div className="px-5 pb-5 space-y-3">
                    {[['name', pt ? 'Nome' : 'Name', patient?.nextOfKinName || '—'], ['phone', pt ? 'Telefone' : 'Phone', patient?.nextOfKinPhone || '—'], ['relation', pt ? 'Relação' : 'Relation', patient?.nextOfKinRelation || '—']].map(([k, l, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{l}</span>
                        <span className="text-xs font-bold text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>}
            </div>

            {/* Settings rows */}
            {[
              { icon: Sun, label: isDarkMode ? (pt ? 'Modo Claro' : 'Light Mode') : (pt ? 'Modo Escuro' : 'Dark Mode'), action: toggleTheme },
              { icon: Download, label: pt ? 'Baixar Relatório de Saúde' : 'Download Health Report', action: downloadHealthReport },
              { icon: RefreshCw, label: 'Satellite Sync', action: triggerSatelliteSync },
              { icon: LogOut, label: pt ? 'Terminar Sessão' : 'Sign Out', action: handleLogout, danger: true },
            ].map(({ icon: Icon, label, action, danger }) => (
              <button key={label} onClick={action}
                className={`w-full bg-white rounded-3xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${danger ? 'text-red-500' : 'text-slate-700'}`}>
                <Icon className={`h-5 w-5 ${danger ? 'text-red-400' : 'text-slate-400'}`} />
                <span className="flex-1 text-sm font-bold text-left">{label}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 shadow-2xl z-30">
        <div className="flex items-end justify-around px-4 py-3 pb-safe">
          {NAV_ITEMS.slice(0, 2).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setCurrentView(id as AppView)}
              className="flex flex-col items-center gap-1 min-w-[3rem]">
              <Icon className={`h-6 w-6 transition-colors ${currentView === id ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wide ${currentView === id ? 'text-cyan-600' : 'text-slate-400'}`}>{label}</span>
            </button>
          ))}
          {/* FAB centre button */}
          <button onClick={() => setCurrentView('occupational')}
            className="flex flex-col items-center -mt-5">
            <div className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${currentView === 'occupational' ? 'bg-cyan-700' : 'bg-cyan-600'}`}>
              <HardHat className="h-7 w-7 text-white" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mt-1">CHAEM</span>
          </button>
          {NAV_ITEMS.slice(2).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setCurrentView(id as AppView)}
              className="flex flex-col items-center gap-1 min-w-[3rem]">
              <Icon className={`h-6 w-6 transition-colors ${currentView === id ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wide ${currentView === id ? 'text-cyan-600' : 'text-slate-400'}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
