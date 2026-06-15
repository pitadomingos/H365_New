import React, { useState, useEffect } from 'react';
import { useLocale, LocaleProvider } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { ShieldCheck, Activity, Search, AlertCircle, PlusCircle, LogOut, CheckCircle2, User, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Shared Interface Simulation
interface OccupationalExam {
  id: string;
  patientId: string; // nationalId
  patientName: string;
  examType: 'Admissional' | 'Periódico' | 'Demissional' | 'Mudança de Função' | 'Retorno ao Trabalho';
  date: string;
  companyName: string;
  doctorName: string;
  status: 'Apto' | 'Apto com Restrições' | 'Inapto';
  notes: string;
}

function ChaemDashboard() {
  const { currentLocale, toggleLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [exams, setExams] = useState<OccupationalExam[]>([]);
  const [showNewExam, setShowNewExam] = useState(false);
  const [form, setForm] = useState<Partial<OccupationalExam>>({
    examType: 'Admissional',
    status: 'Apto'
  });

  // Load exams from shared local storage (L-LAN simulation)
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('h365_occupational_exams');
      if (stored) {
        setExams(JSON.parse(stored));
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const saveExam = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: OccupationalExam = {
      id: `EXM-${Math.floor(Math.random() * 100000)}`,
      patientId: form.patientId || '',
      patientName: form.patientName || '',
      examType: form.examType as any,
      date: new Date().toISOString().split('T')[0],
      companyName: form.companyName || '',
      doctorName: 'Dr. Admin CHAEM',
      status: form.status as any,
      notes: form.notes || ''
    };
    
    const updated = [newExam, ...exams];
    setExams(updated);
    localStorage.setItem('h365_occupational_exams', JSON.stringify(updated));
    setShowNewExam(false);
    setForm({ examType: 'Admissional', status: 'Apto' });
    alert('Exame Registado com Sucesso! (Sincronizado na L-LAN)');
  };

  const getStatusColor = (status: string) => {
    if (status === 'Apto') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Inapto') return 'bg-rose-100 text-rose-800';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-800">CHAEM</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Saúde Ocupacional & Higiene</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLocale}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {currentLocale === 'en' ? 'EN' : 'PT'}
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 hidden sm:block">Dr. Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel Central</h2>
            <p className="text-slate-500 text-sm mt-1">Gestão de Exames Ocupacionais e Certificados de Aptidão</p>
          </div>
          <button 
            onClick={() => setShowNewExam(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Exame
          </button>
        </div>

        {showNewExam && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" /> Registar Novo Exame Ocupacional
            </h3>
            <form onSubmit={saveExam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">BI / ID do Paciente</label>
                <input required value={form.patientId || ''} onChange={e => setForm({...form, patientId: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                <input required value={form.patientName || ''} onChange={e => setForm({...form, patientName: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Empresa / Empregador</label>
                <input required value={form.companyName || ''} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Exame</label>
                <select value={form.examType} onChange={e => setForm({...form, examType: e.target.value as any})} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option>Admissional</option>
                  <option>Periódico</option>
                  <option>Demissional</option>
                  <option>Mudança de Função</option>
                  <option>Retorno ao Trabalho</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Aptidão (AMA)</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option>Apto</option>
                  <option>Apto com Restrições</option>
                  <option>Inapto</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Observações Médicas</label>
                <textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none h-24" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowNewExam(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 shadow-sm">Guardar & Emitir Certificado</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">Histórico Recente L-LAN</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Pesquisar BI ou Empresa..." className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-300 outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Paciente / BI</th>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Aptidão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum exame registado na base de dados local.</td>
                  </tr>
                ) : exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{exam.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{exam.patientName}</div>
                      <div className="text-xs text-slate-500">{exam.patientId}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{exam.companyName}</td>
                    <td className="px-6 py-4 text-slate-600">{exam.examType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <LocaleProvider>
      <ChaemDashboard />
    </LocaleProvider>
  );
}

export default App;
