import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, updateDoc, setDoc, query, orderBy 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  Users, Calculator, FileText, Plus, Trash2, 
  Printer, Calendar, ArrowLeft, Table, ArrowRight, Pencil, 
  Receipt, AlertTriangle, CheckCircle, LogOut, Lock, Settings, Building2,
  History, Eye, EyeOff, Save, DollarSign, Send, Copy, DownloadCloud, 
  FileCheck, ShieldAlert, Briefcase, UserMinus, FileX, Menu, X
} from 'lucide-react';

// --- CONFIGURAÇÃO FIXA DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBXOGHkqIIqZvKzBKGMDHvVUU0kqTNGgz4",
  authDomain: "rh-fast-44bce.firebaseapp.com",
  projectId: "rh-fast-44bce",
  storageBucket: "rh-fast-44bce.firebasestorage.app",
  messagingSenderId: "289648358268",
  appId: "1:289648358268:web:92d3cd6fdf5450003faaf9",
  measurementId: "G-FZYBH4XWP9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DADOS PARA IMPORTAÇÃO (BACKUP) ---
const EMPLOYEES_FROM_SHEET = [
  {name: "DHAMERSON RENAN GOMES", role: "ANALISTA DE ECOMMERCE", baseValue: 171.72, pix: "45990762879", workHoursPerDay: 8},
  {name: "OLAIR FERREIRA CINTRA", role: "PESPONTADOR", baseValue: 106.70, pix: "16991194786", workHoursPerDay: 8},
  {name: "IRACI CORREIA", role: "CORTADOR", baseValue: 150.00, pix: "16991801098", workHoursPerDay: 8},
  {name: "APARECIDO", role: "CORTADOR", baseValue: 150.00, pix: "", workHoursPerDay: 8},
  {name: "GUSTAVO GABRIEL OLIVEIRA", role: "AUXILIAR DE PRODUÇÃO", baseValue: 100.00, pix: "16992936523", workHoursPerDay: 8},
  {name: "GUILHERME OLIVEIRA MATOS", role: "AUXILIAR ECOMMERCE", baseValue: 62.66, pix: "581.846.488.12 - INTER", workHoursPerDay: 8},
  {name: "DAVI GABRIEL DE FREITAS", role: "APONTADOR DE SOLA", baseValue: 166.19, pix: "44075320847", workHoursPerDay: 8},
  {name: "ANTONIO EXPEDITO", role: "MONTADOR", baseValue: 133.00, pix: "5721232803", workHoursPerDay: 8},
  {name: "JARBAS JOSE BATISTA", role: "CORTADOR", baseValue: 150.00, pix: "16994238977", workHoursPerDay: 8},
  {name: "GUILERME MORETTI SILVA", role: "AUXILIAR", baseValue: 100.00, pix: "16992672495", workHoursPerDay: 8},
  {name: "FERNADO ALVES RANIELI", role: "FECHADOR DE LADO", baseValue: 133.33, pix: "27392484826", workHoursPerDay: 8},
  {name: "JULIO CESAR MOLINA", role: "AUXILIAR DE EOMERCE", baseValue: 100.00, pix: "39111177870", workHoursPerDay: 8},
  {name: "DANILO FELICIANO DE OLIVEIRA", role: "REVISOR", baseValue: 122.00, pix: "31475854846", workHoursPerDay: 8},
  {name: "TIAGO GARCIA DAS NEVES", role: "MOLINEIRO", baseValue: 161.00, pix: "265.074.938.56 - MP", workHoursPerDay: 8},
  {name: "MARCO ANTONIO OLIVEIRA INACIO", role: "AUXILIAR", baseValue: 114.28, pix: "16997109877", workHoursPerDay: 8},
  {name: "ADRIANO CESAR GABRIEL", role: "ACABADOR", baseValue: 152.00, pix: "16981627406", workHoursPerDay: 8},
  {name: "DIEGO MAZZALI", role: "APONTADOR DE SOLA", baseValue: 142.00, pix: "29677051873", workHoursPerDay: 8},
  {name: "ALEX BENTO", role: "GERENTE", baseValue: 238.00, pix: "", workHoursPerDay: 8},
  {name: "EDUARDO HENRIQUE SILVA", role: "AUXILIAR", baseValue: 123.80, pix: "EDUARDOHEYTOR19@GMAIL.COM", workHoursPerDay: 8},
  {name: "SERGIO MESSIAS", role: "PLANEJAMENTO", baseValue: 164.00, pix: "13859745832", workHoursPerDay: 8}
];

// --- UI COMPONENTS ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-red-500/30",
  };
  return (
    <button className={`${variants[variant]} px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };
  return <span className={`${colors[color]} border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>{children}</span>;
};

const PrivacyValue = ({ value, isPrivate, prefix = "R$ " }) => {
  if (isPrivate) return <span className="blur-sm select-none bg-slate-100 rounded px-2 text-transparent">00000</span>;
  return <span>{prefix}{Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
};

// --- TELA DE LOGIN ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setError('Acesso negado. Verifique seus dados.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 hover:rotate-0 transition-all">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">RH Fácil</h1>
          <p className="text-blue-200 text-sm">Gestão Inteligente para Empresas Ágeis</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-blue-200 mb-1 uppercase tracking-wider">E-mail Corporativo</label>
            <input type="email" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-200 mb-1 uppercase tracking-wider">Senha de Acesso</label>
            <input type="password" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          {error && <div className="text-white bg-red-500/80 p-3 rounded-lg text-sm text-center font-medium backdrop-blur-sm animate-pulse">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-white text-blue-900 font-bold py-4 rounded-xl hover:bg-blue-50 hover:scale-[1.02] transition-all shadow-xl flex justify-center items-center gap-2">
            {loading ? 'Validando...' : <><Lock size={20}/> Entrar no Sistema</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]); 
  const [companyData, setCompanyData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [editingPayroll, setEditingPayroll] = useState(null); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubEmp = onSnapshot(collection(db, 'users', user.uid, 'employees'), (snap) => setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubAdv = onSnapshot(collection(db, 'users', user.uid, 'advances'), (snap) => setAdvances(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSettings = onSnapshot(doc(db, 'users', user.uid, 'settings', 'profile'), (doc) => { if (doc.exists()) setCompanyData(doc.data()); });
    return () => { unsubEmp(); unsubAdv(); unsubSettings(); };
  }, [user]);

  const navigate = (v) => { setView(v); setMobileMenuOpen(false); };
  const handleEditPayroll = (data) => { setEditingPayroll(data); navigate('payroll'); };
  const handleViewReport = (data) => { setEditingPayroll(data); navigate('report_general'); };
  const handleNewCalculation = () => { setEditingPayroll(null); navigate('payroll'); };

  const renderView = () => {
    switch(view) {
      case 'employees': return <EmployeeManager employees={employees} userId={user?.uid} />;
      case 'payroll': return <PayrollCalculator employees={employees} advances={advances} userId={user?.uid} initialData={editingPayroll} onGenerate={handleViewReport} companyData={companyData} privacyMode={privacyMode} />;
      case 'history': return <PayrollHistory userId={user?.uid} onViewReport={handleViewReport} onEdit={handleEditPayroll} privacyMode={privacyMode} />;
      case 'report_general': return <GeneralReportView data={editingPayroll} onViewHolerites={() => navigate('print_holerites')} onBack={() => navigate('payroll')} companyData={companyData} privacyMode={privacyMode} />;
      case 'print_holerites': return <HoleriteView data={editingPayroll} onBack={() => navigate('report_general')} companyData={companyData} />;
      case 'settings': return <CompanySettings userId={user?.uid} currentData={companyData} onSave={() => navigate('dashboard')} />;
      case 'docs': return <DocumentGenerator employees={employees} companyData={companyData} onBack={() => navigate('dashboard')} />;
      default: return <Dashboard changeView={navigate} onNewCalc={handleNewCalculation} employees={employees} userId={user?.uid} privacyMode={privacyMode} />;
    }
  };

  if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-slate-50 text-blue-600 font-bold animate-pulse">Carregando RH Fácil...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 shadow-xl z-20 sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              {companyData?.logoUrl ? <img src={companyData.logoUrl} alt="Logo" className="h-8 w-8 object-contain"/> : <FileText className="h-8 w-8" />}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight truncate max-w-[120px] md:max-w-none">{companyData?.name || 'RH Fácil'}</h1>
              <p className="text-[10px] text-blue-200 font-medium tracking-wider uppercase hidden md:block">Gestão Integrada</p>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
            {['dashboard', 'employees', 'payroll', 'history', 'docs'].map(v => (
              <button key={v} onClick={v === 'payroll' ? handleNewCalculation : () => navigate(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/5'}`}>
                {v === 'dashboard' ? 'Início' : v === 'employees' ? 'Equipe' : v === 'payroll' ? 'Calcular' : v === 'history' ? 'Histórico' : 'Documentos'}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition" title={privacyMode ? "Mostrar Valores" : "Ocultar Valores"}>
              {privacyMode ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
            
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            <button onClick={() => navigate('settings')} className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition hidden md:block"><Settings size={20}/></button>
            <button onClick={() => signOut(auth)} className="p-2 text-pink-300 hover:text-white hover:bg-red-500/20 rounded-lg transition hidden md:block"><LogOut size={20}/></button>
            
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white"><div className="space-y-1"><div className="w-6 h-0.5 bg-white"></div><div className="w-6 h-0.5 bg-white"></div><div className="w-6 h-0.5 bg-white"></div></div></button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-blue-900 shadow-2xl border-t border-white/10 p-4 flex flex-col gap-2 animate-slide-down">
             <button onClick={() => navigate('dashboard')} className="p-3 rounded text-left text-white hover:bg-white/10">Início</button>
             <button onClick={() => navigate('employees')} className="p-3 rounded text-left text-white hover:bg-white/10">Equipe</button>
             <button onClick={handleNewCalculation} className="p-3 rounded text-left text-white hover:bg-white/10">Calcular Folha</button>
             <button onClick={() => navigate('history')} className="p-3 rounded text-left text-white hover:bg-white/10">Histórico</button>
             <button onClick={() => navigate('docs')} className="p-3 rounded text-left text-white hover:bg-white/10">Gerar Documentos</button>
             <div className="h-px bg-white/10 my-2"></div>
             <button onClick={() => navigate('settings')} className="p-3 rounded text-left text-blue-200 flex gap-2"><Settings size={18}/> Configurações</button>
             <button onClick={() => signOut(auth)} className="p-3 rounded text-left text-pink-300 flex gap-2"><LogOut size={18}/> Sair</button>
          </div>
        )}
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">{renderView()}</main>
    </div>
  );
}

// --- GERENCIADOR DE FUNCIONÁRIOS (CORRIGIDO) ---
function EmployeeManager({ employees, userId }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialFormState = { name: '', role: '', baseValue: '', type: 'mensalista', pix: '', cpf: '', address: '', admissionDate: '', workHoursPerDay: '8' };
  const [formData, setFormData] = useState(initialFormState);
  const handleEdit = (employee) => { setFormData({ ...employee }); setEditingId(employee.id); setIsFormOpen(true); };
  const handleNew = () => { setFormData(initialFormState); setEditingId(null); setIsFormOpen(true); };
  const handleSubmit = async (e) => { e.preventDefault(); if (!formData.name) return; const data = { ...formData, baseValue: parseFloat(formData.baseValue), workHoursPerDay: parseFloat(formData.workHoursPerDay) || 8 }; try { if (editingId) { await updateDoc(doc(db, 'users', userId, 'employees', editingId), data); } else { await addDoc(collection(db, 'users', userId, 'employees'), data); } setIsFormOpen(false); } catch (err) { alert("Erro!"); } };
  const handleDelete = async (id) => { if (confirm('Excluir?')) await deleteDoc(doc(db, 'users', userId, 'employees', id)); };

  // Função segura para data
  const safeDate = (dateStr) => {
    if(!dateStr) return 'N/I';
    try { return new Date(dateStr).toLocaleDateString('pt-BR'); } catch { return 'Data Inválida'; }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={24}/></div><h2 className="text-2xl font-bold text-slate-700">Equipe</h2></div><Button onClick={handleNew}><Plus size={20} /> Novo Cadastro</Button></div>
      {isFormOpen && ( 
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <h3 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label><input type="text" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} /></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admissão</label><input type="date" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} /></div>
                <div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label><input type="text" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Contrato</label><select className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="mensalista">Mensalista</option><option value="diarista">Diarista</option></select></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Diária/Mês (R$)</label><input type="number" step="0.01" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.baseValue} onChange={e => setFormData({...formData, baseValue: e.target.value})} /></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horas/Dia</label><input type="number" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.workHoursPerDay} onChange={e => setFormData({...formData, workHoursPerDay: e.target.value})} /></div>
                <div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chave PIX</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t"><Button variant="secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit">Salvar Dados</Button></div>
            </form> 
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{employees.map(emp => (<Card key={emp.id} className="group"><div><div className="flex justify-between items-start mb-2"><div className="bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded text-xs uppercase tracking-wide">{emp.role}</div><div className="text-slate-400 group-hover:text-blue-500 transition"><Users size={18}/></div></div><h4 className="font-bold text-lg text-slate-800 mb-1">{emp.name}</h4><div className="text-xs text-slate-400 flex gap-2 mb-4"><span>{emp.workHoursPerDay}h/dia</span><span>•</span><span>{safeDate(emp.admissionDate)}</span></div><div className="border-t pt-3 flex justify-between items-center"><p className="font-mono font-bold text-slate-700 text-lg">R$ {Number(emp.baseValue || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p><div className="flex gap-2"><button onClick={() => handleEdit(emp)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"><Pencil size={18}/></button><button onClick={() => handleDelete(emp.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button></div></div></div></Card>))}</div>
    </div>
  );
}

// --- GERADOR DE DOCUMENTOS ---
function DocumentGenerator({ employees, companyData, onBack }) {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [docType, setDocType] = useState('declaracao_trabalho');
  const [generated, setGenerated] = useState(false);
  const [terminationValue, setTerminationValue] = useState('');

  const employee = employees.find(e => e.id === selectedEmp);
  const today = new Date().toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'});

  const getDocContent = () => {
    if (!employee) return null;
    const header = (<div className="text-center border-b-2 border-black pb-4 mb-8"><h1 className="text-xl font-bold uppercase">{companyData?.name || 'NOME DA EMPRESA'}</h1><p className="text-sm">CNPJ: {companyData?.cnpj || '00.000.000/0000-00'}</p><p className="text-sm">{companyData?.address || 'Endereço da Empresa'}</p></div>);
    const footer = (<div className="mt-20 pt-8 border-t border-black flex justify-between"><div className="text-center"><p className="font-bold">{companyData?.name}</p><p className="text-xs">Empregador</p></div><div className="text-center"><p className="font-bold">{employee.name}</p><p className="text-xs">Funcionário(a)</p></div></div>);
    let title = "", body = "";

    switch (docType) {
      case 'declaracao_trabalho': title = "DECLARAÇÃO DE TRABALHO"; body = `Declaramos para os devidos fins que o(a) Sr(a). ${employee.name}, inscrito(a) no CPF sob nº ${employee.cpf || '___________'}, trabalha nesta empresa exercendo a função de ${employee.role}, recebendo mensalmente a quantia de R$ ${Number(employee.baseValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}.`; break;
      case 'advertencia': title = "ADVERTÊNCIA DISCIPLINAR"; body = `Pelo presente, fica o(a) Sr(a). ${employee.name}, portador(a) da função de ${employee.role}, ADVERTIDO(A) pelo motivo descrito abaixo:\n\n(ESCREVA O MOTIVO AQUI À CANETA)\n\nEsclarecemos que a reincidência na falta poderá ocasionar uma suspensão ou até mesmo demissão por justa causa.`; break;
      case 'vale_transporte': title = "TERMO DE OPÇÃO VALE TRANSPORTE"; body = `Eu, ${employee.name}, ocupante do cargo de ${employee.role}, declaro que:\n\n( ) OPTU pelo uso do Vale-Transporte.\n( ) NÃO OPTU pelo uso do Vale-Transporte.\n\nComprometo-me a utilizar o benefício exclusivamente para o deslocamento residência-trabalho e vice-versa.`; break;
      case 'uniforme': title = "RECIBO DE ENTREGA DE UNIFORME/EPI"; body = `Recebi da empresa ${companyData?.name} os itens de uniforme/EPI abaixo relacionados para uso exclusivo em serviço. Comprometo-me a zelar pela sua guarda e conservação.\n\nITENS:\n___________________________________________________\n___________________________________________________\n___________________________________________________`; break;
      case 'rescisao': title = "TERMO DE QUITAÇÃO E RESCISÃO"; body = `Pelo presente instrumento particular, de um lado a empresa ${companyData?.name}, e de outro lado o(a) Sr(a). ${employee.name}, inscrito(a) no CPF sob nº ${employee.cpf || '___________'}, declaram para os devidos fins de direito que, nesta data, têm entre si, justo e contratado, o DISTRATO E RESCISÃO do contrato de trabalho/prestação de serviços havido entre as partes.\n\nO(A) contratado(a) declara ter recebido, neste ato, a importância líquida de R$ ${Number(terminationValue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (referente a saldo de salários e demais verbas pactuadas), outorgando à empresa plena, rasa, geral e irrevogável quitação, para nada mais reclamar a qualquer título, seja no presente ou no futuro, referente ao período trabalhado.`; break;
    }

    return (<div className="bg-white p-12 max-w-[21cm] mx-auto shadow-2xl min-h-[29.7cm] print:shadow-none print:m-0 text-black font-serif">{header}<h2 className="text-2xl font-bold text-center mb-12 underline">{title}</h2><p className="text-lg leading-loose text-justify mb-12 whitespace-pre-wrap">{body}</p><p className="text-right mb-12">{companyData?.address?.split(',')[1] || 'Cidade'}, {today}.</p>{footer}</div>);
  };

  if (generated) { return (<div className="max-w-4xl mx-auto pb-20 animate-fade-in"><div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg mb-8 print:hidden flex justify-between"><button onClick={() => setGenerated(false)} className="flex items-center gap-2 hover:text-blue-300 font-bold"><ArrowLeft size={20} /> Voltar</button><Button onClick={() => window.print()}><Printer size={20}/> Imprimir Documento</Button></div><div className="print:w-full">{getDocContent()}</div></div>); }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card><h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2"><FileText className="text-blue-600"/> Gerador de Documentos</h2><div className="space-y-6"><div><label className="block text-sm font-bold mb-2">1. Selecione o Funcionário</label><select className="w-full p-3 border rounded-xl bg-slate-50" value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}><option value="">Selecione...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div><div><label className="block text-sm font-bold mb-2">2. Tipo de Documento</label><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><button onClick={() => setDocType('rescisao')} className={`p-4 rounded-xl border-2 text-left transition ${docType==='rescisao' ? 'border-red-600 bg-red-50 shadow-md' : 'border-slate-100 hover:border-red-300'}`}><UserMinus className="mb-2 text-red-600"/> <div className="font-bold text-sm text-red-900">Termo de Rescisão</div><div className="text-xs text-slate-500">Quitação final</div></button><button onClick={() => setDocType('advertencia')} className={`p-4 rounded-xl border-2 text-left transition ${docType==='advertencia' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-300'}`}><ShieldAlert className="mb-2 text-orange-500"/> <div className="font-bold text-sm">Advertência</div><div className="text-xs text-slate-400">Disciplinar</div></button><button onClick={() => setDocType('declaracao_trabalho')} className={`p-4 rounded-xl border-2 text-left transition ${docType==='declaracao_trabalho' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300'}`}><FileCheck className="mb-2 text-blue-500"/> <div className="font-bold text-sm">Declaração</div><div className="text-xs text-slate-400">Para bancos</div></button><button onClick={() => setDocType('uniforme')} className={`p-4 rounded-xl border-2 text-left transition ${docType==='uniforme' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-300'}`}><CheckCircle className="mb-2 text-emerald-500"/> <div className="font-bold text-sm">Recibo de EPI</div><div className="text-xs text-slate-400">Uniforme</div></button></div></div>{docType === 'rescisao' && (<div className="animate-slide-up bg-red-50 p-4 rounded-xl border border-red-100"><label className="block text-sm font-bold mb-1 text-red-800">Valor Total da Rescisão (R$)</label><input type="number" step="0.01" className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg font-bold text-red-700" placeholder="0,00" value={terminationValue} onChange={e => setTerminationValue(e.target.value)}/><p className="text-xs text-red-500 mt-1">Valor líquido acordado.</p></div>)}<div className="pt-4 flex justify-end"><Button onClick={() => { if(!selectedEmp) return alert("Selecione um funcionário"); setGenerated(true); }} disabled={!selectedEmp} className="w-full md:w-auto">Gerar Documento <ArrowRight size={20}/></Button></div></div></Card>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard({ changeView, onNewCalc, employees, userId, privacyMode }) {
  const [isValeOpen, setIsValeOpen] = useState(false);
  const [valeData, setValeData] = useState({ employeeId: '', value: '', description: '', targetMonth: new Date().toISOString().slice(0, 7) });

  const handleSaveVale = async (e) => {
    e.preventDefault();
    if (!valeData.employeeId || !valeData.value) return alert("Preencha os dados.");
    try { await addDoc(collection(db, 'users', userId, 'advances'), { ...valeData, value: parseFloat(valeData.value), createdAt: new Date(), status: 'pending' }); alert("Vale lançado!"); setIsValeOpen(false); setValeData({ ...valeData, value: '', description: '' }); } catch (error) { alert("Erro: " + error.message); }
  };

  const totalEmployees = employees.length;
  const totalPayrollEstimate = employees.reduce((acc, emp) => acc + (emp.baseValue || 0), 0);
  const currentMonth = new Date().getMonth();
  const anniversaries = employees.filter(e => e.admissionDate && new Date(e.admissionDate).getMonth() === currentMonth);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div><h2 className="text-3xl font-bold text-slate-800">Visão Geral</h2><p className="text-slate-500 mt-1">Bem-vindo ao painel de controle.</p></div>
        <div className="text-right hidden md:block"><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Data de Hoje</p><p className="text-xl font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
      </div>
      {anniversaries.length > 0 && (<div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-start gap-4 animate-fade-in"><div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><FileCheck size={24}/></div><div><h4 className="font-bold text-indigo-900">Aniversário de Empresa este Mês! 🎉</h4><p className="text-sm text-indigo-700 mt-1">{anniversaries.map(e => `${e.name.split(' ')[0]} (${new Date(e.admissionDate).getDate()}/${new Date(e.admissionDate).getMonth()+1})`).join(', ')}</p></div></div>)}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none"><div className="flex justify-between items-start"><div><p className="text-blue-100 text-sm font-medium mb-1">Funcionários</p><h3 className="text-4xl font-bold">{totalEmployees}</h3></div><div className="bg-white/20 p-2 rounded-lg"><Users size={24}/></div></div></Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none"><div className="flex justify-between items-start"><div><p className="text-emerald-100 text-sm font-medium mb-1">Folha Estimada</p><h3 className="text-4xl font-bold"><PrivacyValue value={totalPayrollEstimate} isPrivate={privacyMode} /></h3></div><div className="bg-white/20 p-2 rounded-lg"><DollarSign size={24}/></div></div></Card>
        <Card onClick={() => setIsValeOpen(true)} className="bg-gradient-to-br from-orange-400 to-pink-500 text-white border-none cursor-pointer group"><div className="flex justify-between items-start"><div><p className="text-orange-100 text-sm font-medium mb-1">Ação Rápida</p><h3 className="text-3xl font-bold group-hover:scale-105 transition-transform">Lançar Vale</h3></div><div className="bg-white/20 p-2 rounded-lg group-hover:rotate-12 transition-transform"><Receipt size={24}/></div></div></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card onClick={() => changeView('employees')} className="group cursor-pointer hover:border-blue-300"><div className="flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><Users size={24}/></div><div><h3 className="text-lg font-bold text-slate-800">Gerenciar Equipe</h3><p className="text-slate-500 text-xs">Cadastros e Dados</p></div></div></Card>
        <Card onClick={onNewCalc} className="group cursor-pointer hover:border-emerald-300"><div className="flex items-center gap-4"><div className="bg-emerald-100 p-3 rounded-full text-emerald-600 group-hover:scale-110 transition-transform"><Calculator size={24}/></div><div><h3 className="text-lg font-bold text-slate-800">Calcular Pagamentos</h3><p className="text-slate-500 text-xs">Folha e Recibos</p></div></div></Card>
        <Card onClick={() => changeView('docs')} className="group cursor-pointer hover:border-indigo-300"><div className="flex items-center gap-4"><div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:scale-110 transition-transform"><FileText size={24}/></div><div><h3 className="text-lg font-bold text-slate-800">Gerar Documentos</h3><p className="text-slate-500 text-xs">Declarações e Rescisão</p></div></div></Card>
      </div>
      {isValeOpen && ( <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up"><h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Receipt size={20}/></div> Novo Vale</h3><form onSubmit={handleSaveVale} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Funcionário</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" required value={valeData.employeeId} onChange={e => setValeData({...valeData, employeeId: e.target.value})}><option value="">Selecione...</option>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label><input type="number" step="0.01" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.value} onChange={e => setValeData({...valeData, value: e.target.value})} placeholder="0.00"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descontar em</label><input type="month" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.targetMonth} onChange={e => setValeData({...valeData, targetMonth: e.target.value})}/></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label><input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.description} onChange={e => setValeData({...valeData, description: e.target.value})} placeholder="Ex: Adiantamento quinzenal"/></div><div className="flex justify-end gap-2 mt-6"><Button variant="secondary" type="button" onClick={() => setIsValeOpen(false)}>Cancelar</Button><Button type="submit" className="bg-orange-500 hover:bg-orange-600 border-none shadow-orange-500/30">Confirmar Lançamento</Button></div></form></div></div> )}
    </div>
  );
}

// --- HISTÓRICO ---
function PayrollHistory({ userId, onViewReport, onEdit, privacyMode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users', userId, 'payrolls'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (id) => { if(confirm("Excluir histórico?")) await deleteDoc(doc(db, 'users', userId, 'payrolls', id)); };
  const formatDate = (dateString) => dateString ? dateString.split('-').reverse().join('/') : '';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><History className="text-blue-600"/> Histórico</h2></div>
      {loading ? <div className="text-center py-10 text-slate-500">Carregando...</div> : (
        <div className="grid gap-4">
          {history.length === 0 && <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">Nenhum pagamento salvo.</div>}
          {history.map(item => (
            <Card key={item.id} className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-green-100 p-3 rounded-full text-green-600 hidden md:block"><CheckCircle size={24}/></div>
                <div><h4 className="font-bold text-lg text-slate-800">{new Date(item.createdAt?.seconds * 1000).toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}</h4><div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1"><span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(item.startDate)} - {formatDate(item.endDate)}</span><span className="flex items-center gap-1"><Users size={14}/> {item.items?.length || 0}</span></div></div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right"><p className="text-xs text-slate-400 font-bold uppercase">Total Pago</p><p className="text-xl font-bold text-slate-700"><PrivacyValue value={item.total} isPrivate={privacyMode}/></p></div>
                <div className="flex gap-2"><Button variant="secondary" onClick={() => onViewReport(item)} className="px-3"><Eye size={18}/></Button><Button variant="primary" onClick={() => onEdit(item)} className="px-3"><Pencil size={18}/></Button><button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- CALCULADORA (MOBILE FIRST) ---
function PayrollCalculator({ employees, advances, userId, initialData, onGenerate, companyData, privacyMode }) {
  const [inputs, setInputs] = useState({});
  const [dates, setDates] = useState({ start: '', end: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDates({ start: initialData.startDate, end: initialData.endDate });
      const restoredInputs = {};
      initialData.items.forEach(item => {
        restoredInputs[item.id] = {
          days: item.daysWorked,
          discount: item.discount,
          bonus: item.bonus,
          overtime: item.overtime,
          overtimeHours: item.overtimeHours,
          advancesIncluded: item.advancesIncluded || []
        };
      });
      setInputs(restoredInputs);
    } else { setInputs({}); setDates({ start: '', end: '' }); }
  }, [initialData]);

  const handleInputChange = (id, field, value) => setInputs(p => ({ ...p, [id]: { ...p[id], [field]: parseFloat(value) || 0 } }));
  
  const handleOvertimeHoursChange = (id, hours, emp) => {
    const h = parseFloat(hours) || 0;
    const hourly = (emp.type === 'mensalista' ? (emp.baseValue / 30) : emp.baseValue) / (emp.workHoursPerDay || 8);
    setInputs(p => ({ ...p, [id]: { ...p[id], overtimeHours: h, overtime: parseFloat((hourly * h).toFixed(2)) } }));
  };

  const handleApplyAdvances = (empId, total, list) => {
    if(confirm(`Descontar R$ ${total.toFixed(2)}?`)) setInputs(p => ({ ...p, [empId]: { ...p[empId], discount: (p[empId]?.discount || 0) + total, advancesIncluded: list } }));
  };

  const getPending = (empId) => {
    if (!dates.start) return { total: 0, list: [] };
    const list = advances.filter(a => a.employeeId === empId && a.targetMonth === dates.start.slice(0,7) && a.status === 'pending');
    return { total: list.reduce((acc, c) => acc + c.value, 0), list };
  };

  const getVals = (emp) => {
    const d = inputs[emp.id] || {};
    const base = emp.baseValue || 0;
    const gross = (emp.type === 'mensalista' ? (base / 30) : base) * (d.days || 0);
    return { ...d, grossTotal: gross, netTotal: gross + (d.bonus||0) + (d.overtime||0) - (d.discount||0), advancesIncluded: d.advancesIncluded || [] };
  };

  const totalPayroll = employees.reduce((acc, emp) => acc + getVals(emp).netTotal, 0);

  const saveAndGenerate = async () => {
    if (!dates.start || !dates.end) return alert("Selecione o período.");
    if(!companyData?.name) alert("Atenção: Configure a empresa antes!");
    const items = employees.map(e => ({ ...e, ...getVals(e), dailyRate: e.type === 'mensalista' ? (e.baseValue/30) : e.baseValue })).filter(i => i.days > 0 || i.netTotal > 0);
    if (items.length === 0) return alert("Preencha os dados.");
    setSaving(true);
    try {
      const payrollData = { startDate: dates.start, endDate: dates.end, total: totalPayroll, items: items, updatedAt: new Date() };
      if (initialData && initialData.id) {
        await updateDoc(doc(db, 'users', userId, 'payrolls', initialData.id), payrollData);
        onGenerate({ ...payrollData, id: initialData.id, createdAt: initialData.createdAt });
      } else {
        const docRef = await addDoc(collection(db, 'users', userId, 'payrolls'), { ...payrollData, createdAt: new Date(), createdBy: userId });
        onGenerate({ ...payrollData, id: docRef.id });
      }
    } catch (error) { alert("Erro: " + error.message); }
    setSaving(false);
  };

  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 sticky top-20 z-10">
        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"><Calculator className="text-blue-600"/> {initialData ? 'Editar Folha' : 'Calcular Folha'}</h2>
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Início</label><input type="date" className="w-full p-2 border rounded-lg bg-slate-50 text-sm font-bold" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})}/></div>
          <div className="flex-1"><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Fim</label><input type="date" className="w-full p-2 border rounded-lg bg-slate-50 text-sm font-bold" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})}/></div>
        </div>
      </div>

      <div className="space-y-4">
        {employees.map(emp => {
          const v = getVals(emp); const p = getPending(emp.id); const done = v.advancesIncluded.length > 0;
          return (
            <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                <div><h4 className="font-bold text-slate-800">{emp.name}</h4><p className="text-xs text-slate-500 uppercase">{emp.role}</p></div>
                {p.total > 0 && !done && <button onClick={() => handleApplyAdvances(emp.id, p.total, p.list)} className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1 animate-pulse"><AlertTriangle size={12}/> Vale: {money(p.total)}</button>}
                {done && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> Descontado</span>}
              </div>
              
              <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Dias Trab.</label><input type="number" className="w-full p-2 border rounded bg-white text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" value={inputs[emp.id]?.days || ''} onChange={e => handleInputChange(emp.id, 'days', e.target.value)}/></div>
                <div><label className="text-[10px] font-bold text-blue-400 uppercase">Hrs Extras</label><input type="number" className="w-full p-2 border border-blue-200 bg-blue-50 text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" value={inputs[emp.id]?.overtimeHours || ''} onChange={e => handleOvertimeHoursChange(emp.id, e.target.value, emp)}/></div>
                <div className="col-span-2 md:col-span-1"><label className="text-[10px] font-bold text-blue-400 uppercase">R$ Extra</label><input type="number" className="w-full p-2 border border-blue-200 bg-blue-50 text-right font-bold text-blue-700 outline-none" value={inputs[emp.id]?.overtime || ''} onChange={e => handleInputChange(emp.id, 'overtime', e.target.value)} placeholder="0.00"/></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-emerald-500 uppercase">Bônus</label><input type="number" className="w-full p-2 border border-emerald-200 bg-emerald-50 text-right font-bold text-emerald-700 outline-none" value={inputs[emp.id]?.bonus || ''} onChange={e => handleInputChange(emp.id, 'bonus', e.target.value)} placeholder="0.00"/></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-red-400 uppercase">Desconto</label><input type="number" className="w-full p-2 border border-red-200 bg-red-50 text-right font-bold text-red-700 outline-none" value={inputs[emp.id]?.discount || ''} onChange={e => handleInputChange(emp.id, 'discount', e.target.value)} placeholder="0.00"/></div>
                <div className="col-span-2 md:col-span-1 bg-slate-100 rounded p-2 flex justify-between items-center md:block"><span className="text-[10px] font-bold text-slate-400 uppercase md:hidden">Líquido:</span><div className="text-right font-bold text-slate-800 text-lg"><PrivacyValue value={v.netTotal} isPrivate={privacyMode}/></div></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col md:flex-row justify-between items-center gap-4 z-50">
        <div className="flex justify-between w-full md:w-auto gap-4"><div><p className="text-[10px] text-slate-400 uppercase font-bold">Total Geral</p><p className="text-2xl font-bold text-slate-800"><PrivacyValue value={totalPayroll} isPrivate={privacyMode}/></p></div></div>
        <Button onClick={saveAndGenerate} disabled={saving} className="w-full md:w-auto shadow-xl py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">{saving ? 'Processando...' : <><Printer size={20}/> {initialData ? 'Atualizar' : 'Gerar Documentos'}</>}</Button>
      </div>
    </div>
  );
}

// --- RELATÓRIO E HOLERITE (Mantidos e Corrigidos) ---
function GeneralReportView({ data, onViewHolerites, onBack, companyData, privacyMode }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const total = data.items.reduce((acc, i) => acc + (i.netTotal||0), 0);
  const copyPix = (pix) => { navigator.clipboard.writeText(pix); alert("PIX copiado!"); };

  return (
    <div className="max-w-full mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 print:hidden flex justify-between items-center border border-slate-200"><button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar para Edição</button><div className="flex gap-3"><Button variant="secondary" onClick={() => window.print()}><Printer size={18}/> Imprimir Relatório</Button><Button onClick={onViewHolerites}>Ver Holerites <ArrowRight size={18}/></Button></div></div>
      <div className="bg-white print:w-full shadow-2xl overflow-hidden rounded-lg">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-end"><div><h1 className="text-2xl font-bold uppercase tracking-wider">{companyData?.name}</h1><p className="text-slate-400 text-sm mt-1">Relatório Gerencial de Pagamentos</p></div><div className="text-right"><p className="text-slate-400 text-sm uppercase font-bold tracking-wider">Período</p><p className="text-xl font-bold">{date(data.startDate)} - {date(data.endDate)}</p></div></div>
        <table className="w-full text-sm font-sans">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b border-slate-200"><tr><th className="p-3 text-left pl-6">Colaborador</th><th className="p-3 text-center">Dias</th><th className="p-3 text-right">Base</th><th className="p-3 text-right">Bruto</th><th className="p-3 text-right text-red-500">Desc.</th><th className="p-3 text-right text-blue-500">Extra/Bônus</th><th className="p-3 text-right bg-blue-50/50">LÍQUIDO</th><th className="p-3 text-left w-48">PIX</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data.items.map((i, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 pl-6"><div className="font-bold text-slate-700 uppercase">{i.name}</div><div className="text-[10px] text-slate-400 uppercase">{i.role}</div></td>
                <td className="p-3 text-center"><Badge color="blue">{i.daysWorked}d</Badge></td>
                <td className="p-3 text-right text-slate-500">{money(i.dailyRate)}</td>
                <td className="p-3 text-right font-medium">{money(i.grossTotal)}</td>
                <td className="p-3 text-right text-red-600 font-medium">{(i.discount||0)>0 ? `(${money(i.discount)})` : '-'}</td>
                <td className="p-3 text-right text-blue-600 font-medium">{money((i.bonus||0)+(i.overtime||0))}</td>
                <td className="p-3 text-right font-bold text-slate-800 bg-blue-50/50 text-base"><PrivacyValue value={i.netTotal} isPrivate={privacyMode}/></td>
                <td className="p-3 flex items-center gap-2 group"><span className="text-xs truncate max-w-[120px] block" title={i.pix}>{i.pix}</span>{i.pix && <button onClick={() => copyPix(i.pix)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:scale-110 transition"><Copy size={14}/></button>}</td>
              </tr>
            ))}
            <tr className="bg-slate-800 text-white"><td colSpan="6" className="p-4 text-right uppercase font-bold tracking-wider text-sm">Total Geral da Folha:</td><td className="p-4 text-right font-bold text-xl bg-slate-700"><PrivacyValue value={total} isPrivate={privacyMode}/></td><td></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HoleriteView({ data, onBack, companyData }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const empName = companyData?.name || 'EMPRESA'; const empCnpj = companyData?.cnpj || ''; const empLogo = companyData?.logoUrl;

  const sendWhatsapp = (item) => {
    const msg = `Olá ${item.name.split(' ')[0]}! Segue o resumo do seu holerite (${date(data.startDate)} a ${date(data.endDate)}).%0A%0A*Total Bruto:* ${money(item.grossTotal + (item.bonus||0) + (item.overtime||0))}%0A*Descontos:* ${money(item.discount)}%0A*VALOR LÍQUIDO:* ${money(item.netTotal)}%0A%0AQualquer dúvida, estamos à disposição.`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8 print:hidden flex justify-between items-center border border-slate-200"><button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar</button><Button onClick={() => window.print()}><Printer size={18} /> Imprimir Todos</Button></div>
      <div className="print:w-full space-y-8">{data.items.map((item, index) => {
        const totalAdvances = (item.advancesIncluded || []).reduce((acc, c) => acc + (c.value||0), 0);
        const genericDiscount = (item.discount || 0) - totalAdvances;
        return (
          <div key={index} className="bg-white text-black font-sans text-xs mb-10 print:mb-4 print:break-inside-avoid max-w-[21cm] mx-auto border-2 border-slate-800 flex shadow-2xl print:shadow-none relative group">
            <button onClick={() => sendWhatsapp(item)} className="absolute -right-12 top-0 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition print:hidden" title="Enviar no WhatsApp"><Send size={20}/></button>
            <div className="flex-1">
              <div className="border-b-2 border-slate-800 p-4 flex justify-between items-end bg-slate-50">
                <div className="flex items-center gap-4">{empLogo && <img src={empLogo} alt="Logo" className="h-12 w-auto mix-blend-multiply" />}<div><h1 className="font-bold text-lg uppercase tracking-tight">{empName}</h1><p className="text-[10px] text-slate-500 font-mono">CNPJ: {empCnpj}</p></div></div>
                <div className="text-right"><h2 className="font-bold text-sm uppercase tracking-widest border-b-2 border-slate-800 mb-1">Recibo de Pagamento</h2><p className="text-xs font-bold">{date(data.startDate)} a {date(data.endDate)}</p></div>
              </div>
              <div className="border-b border-slate-800 p-2 grid grid-cols-12 gap-2 bg-white"><div className="col-span-1 font-bold text-slate-400 uppercase text-[10px]">Cód.</div><div className="col-span-6 font-bold text-slate-400 uppercase text-[10px]">Funcionário</div><div className="col-span-5 font-bold text-slate-400 uppercase text-[10px]">Cargo</div><div className="col-span-1 font-mono">00{index + 1}</div><div className="col-span-6 uppercase font-bold">{item.name}</div><div className="col-span-5 uppercase">{item.role}</div></div>
              <div className="relative min-h-[280px]">
                <div className="grid grid-cols-[50px_1fr_60px_80px_80px] border-b border-slate-300 font-bold bg-slate-100 text-[10px] text-center uppercase tracking-wider"><div className="border-r border-slate-300 p-1">Ref</div><div className="border-r border-slate-300 p-1 text-left pl-3">Descrição</div><div className="border-r border-slate-300 p-1">Qtd</div><div className="border-r border-slate-300 p-1 text-green-700">Vencimentos</div><div className="p-1 text-red-700">Descontos</div></div>
                <div className="text-[11px] font-mono">
                   <div className="grid grid-cols-[50px_1fr_60px_80px_80px] hover:bg-slate-50"><div className="text-center border-r border-dashed border-slate-200 py-1 text-slate-400">001</div><div className="pl-3 border-r border-dashed border-slate-200 py-1 uppercase">Salário Base / Diárias</div><div className="text-center border-r border-dashed border-slate-200 py-1">{item.daysWorked}d</div><div className="text-right border-r border-dashed border-slate-200 py-1 pr-2 text-slate-700">{money(item.grossTotal)}</div><div className="text-right py-1 pr-2 text-slate-300">0,00</div></div>
                   {(item.overtime||0)>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px] hover:bg-slate-50"><div className="text-center border-r border-dashed border-slate-200 py-1 text-slate-400">002</div><div className="pl-3 border-r border-dashed border-slate-200 py-1 uppercase">Horas Extras</div><div className="text-center border-r border-dashed border-slate-200 py-1">{item.overtimeHours}h</div><div className="text-right border-r border-dashed border-slate-200 py-1 pr-2 text-slate-700">{money(item.overtime)}</div><div className="text-right py-1 pr-2 text-slate-300">0,00</div></div>}
                   {(item.bonus||0)>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px] hover:bg-slate-50"><div className="text-center border-r border-dashed border-slate-200 py-1 text-slate-400">003</div><div className="pl-3 border-r border-dashed border-slate-200 py-1 uppercase">Bônus / Acréscimos</div><div className="text-center border-r border-dashed border-slate-200 py-1">-</div><div className="text-right border-r border-dashed border-slate-200 py-1 pr-2 text-slate-700">{money(item.bonus)}</div><div className="text-right py-1 pr-2 text-slate-300">0,00</div></div>}
                   {(item.advancesIncluded||[]).map((adv,i)=>(<div key={i} className="grid grid-cols-[50px_1fr_60px_80px_80px] hover:bg-red-50"><div className="text-center border-r border-dashed border-slate-200 py-1 text-slate-400">05{i}</div><div className="pl-3 border-r border-dashed border-slate-200 py-1 uppercase text-red-800 font-medium">Adiantamento ({adv.description||'Vale'})</div><div className="text-center border-r border-dashed border-slate-200 py-1">-</div><div className="text-right border-r border-dashed border-slate-200 py-1 pr-2 text-slate-300">0,00</div><div className="text-right py-1 pr-2 text-red-700">{money(adv.value)}</div></div>))}
                   {genericDiscount>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px] hover:bg-red-50"><div className="text-center border-r border-dashed border-slate-200 py-1 text-slate-400">099</div><div className="pl-3 border-r border-dashed border-slate-200 py-1 uppercase">Outros Descontos</div><div className="text-center border-r border-dashed border-slate-200 py-1">-</div><div className="text-right border-r border-dashed border-slate-200 py-1 pr-2 text-slate-300">0,00</div><div className="text-right py-1 pr-2 text-red-700">{money(genericDiscount)}</div></div>}
                </div>
                <div className="absolute top-0 bottom-0 left-[50px] w-px bg-slate-200"></div><div className="absolute top-0 bottom-0 right-[220px] w-px bg-slate-200"></div><div className="absolute top-0 bottom-0 right-[160px] w-px bg-slate-200"></div><div className="absolute top-0 bottom-0 right-[80px] w-px bg-slate-200"></div>
              </div>
              <div className="border-t-2 border-slate-800 bg-slate-50 p-3 flex justify-between items-center border-b border-slate-800"><div className="text-[10px] font-medium text-slate-500">Chave PIX: <b className="text-slate-800">{item.pix || 'Não informado'}</b></div><div className="flex items-center gap-3 bg-white border border-slate-300 px-4 py-2 rounded shadow-sm"><span className="uppercase font-bold text-xs tracking-wider text-slate-500">Total Líquido</span><span className="font-bold text-xl text-slate-900">{money(item.netTotal)}</span></div></div>
              <div className="p-4 text-[9px] text-justify text-slate-500 leading-relaxed uppercase tracking-wide">Declaro ter recebido a importância líquida discriminada neste recibo para plena e geral quitação dos serviços prestados e valores aqui descritos.</div>
              <div className="grid grid-cols-2 gap-12 mt-4 px-8 pb-6 items-end"><div className="text-center"><p className="border-t border-slate-400 pt-2 font-medium">{new Date().toLocaleDateString()}</p><p className="text-[9px] uppercase text-slate-400 font-bold mt-1">Data do Pagamento</p></div><div className="text-center"><p className="border-t border-slate-400 pt-2 font-medium uppercase">{item.name}</p><p className="text-[9px] uppercase text-slate-400 font-bold mt-1">Assinatura do Colaborador</p></div></div>
            </div>
            <div className="w-12 border-l-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative bg-slate-50"><div className="absolute w-full h-full flex items-center justify-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}><p className="text-[8px] uppercase font-bold tracking-[0.3em] text-slate-300 py-4 border-r border-slate-200 pr-2 whitespace-nowrap">Via Contabilidade / Arquivo</p></div></div>
          </div>
        );})}
      </div>
    </div>
  );
}