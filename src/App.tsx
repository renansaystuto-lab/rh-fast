import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, updateDoc, setDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  Users, Calculator, FileText, Plus, Trash2, 
  Printer, Calendar, ArrowLeft, Table, ArrowRight, Pencil, 
  Receipt, AlertTriangle, CheckCircle, LogOut, Lock, Settings, Building2,
  DollarSign, Copy, Send
} from 'lucide-react';

// --- SUA CONFIGURAÇÃO FIXA DO FIREBASE ---
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

// --- COMPONENTES VISUAIS (DESIGN SYSTEM) ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-red-500/30",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    dark: "bg-slate-800 text-white hover:bg-slate-900"
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
  const [reportData, setReportData] = useState(null); 
  const [loadingAuth, setLoadingAuth] = useState(true);

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

  const handleGenerateReport = (data) => { setReportData(data); setView('report_general'); };

  const renderView = () => {
    switch(view) {
      case 'employees': return <EmployeeManager employees={employees} userId={user?.uid} />;
      case 'payroll': return <PayrollCalculator employees={employees} advances={advances} onGenerate={handleGenerateReport} companyData={companyData} />;
      case 'report_general': return <GeneralReportView data={reportData} onViewHolerites={() => setView('print_holerites')} onBack={() => setView('payroll')} companyData={companyData} />;
      case 'print_holerites': return <HoleriteView data={reportData} onBack={() => setView('report_general')} companyData={companyData} />;
      case 'settings': return <CompanySettings userId={user?.uid} currentData={companyData} onSave={() => setView('dashboard')} />;
      default: return <Dashboard changeView={setView} employees={employees} userId={user?.uid} />;
    }
  };

  if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-slate-50 text-blue-600 font-bold animate-pulse">Carregando RH Fácil...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 shadow-xl z-10 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              {companyData?.logoUrl ? <img src={companyData.logoUrl} alt="Logo" className="h-8 w-8 object-contain"/> : <FileText className="h-8 w-8" />}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{companyData?.name || 'RH Fácil'}</h1>
              <p className="text-[10px] text-blue-200 font-medium tracking-wider uppercase">Sistema de Gestão</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
            {['dashboard', 'employees', 'payroll'].map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/5'}`}>
                {v === 'dashboard' ? 'Início' : v === 'employees' ? 'Equipe' : 'Pagamentos'}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('settings')} className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"><Settings size={20}/></button>
            <button onClick={() => signOut(auth)} className="p-2 text-pink-300 hover:text-white hover:bg-red-500/20 rounded-lg transition"><LogOut size={20}/></button>
          </div>
        </div>
        <div className="md:hidden flex justify-center mt-4 gap-4 text-sm font-bold border-t border-white/10 pt-2">
           <button onClick={() => setView('dashboard')} className={view==='dashboard' ? 'text-white' : 'text-blue-300'}>Início</button>
           <button onClick={() => setView('employees')} className={view==='employees' ? 'text-white' : 'text-blue-300'}>Equipe</button>
           <button onClick={() => setView('payroll')} className={view==='payroll' ? 'text-white' : 'text-blue-300'}>Pagamentos</button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">{renderView()}</main>
    </div>
  );
}

// --- TELA DE CONFIGURAÇÃO (CORRIGIDA) ---
function CompanySettings({ userId, currentData, onSave }) {
  // Inicializa com campos vazios para não dar erro
  const [formData, setFormData] = useState({
    name: '', cnpj: '', address: '', phone: '', logoUrl: ''
  });

  // Atualiza com dados do banco, garantindo que nenhum campo seja 'undefined'
  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name || '',
        cnpj: currentData.cnpj || '',
        address: currentData.address || '',
        phone: currentData.phone || '',
        logoUrl: currentData.logoUrl || ''
      });
    }
  }, [currentData]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', userId, 'settings', 'profile'), formData);
      alert("Configurações salvas com sucesso!");
      onSave();
    } catch (error) { alert("Erro ao salvar: " + error.message); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card>
        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Building2 className="text-blue-600"/> Configurações da Empresa</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-bold mb-1">Razão Social / Nome</label><input type="text" required className="w-full p-3 border rounded-lg bg-slate-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Padaria do João Ltda"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold mb-1">CNPJ</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} placeholder="00.000.000/0001-00"/></div>
            <div><label className="block text-sm font-bold mb-1">Telefone</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
          </div>
          <div><label className="block text-sm font-bold mb-1">Endereço</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/></div>
          <div><label className="block text-sm font-bold mb-1">URL da Logo</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://..."/></div>
          <div className="pt-4 flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={onSave}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Dashboard({ changeView, employees, userId }) {
  const [isValeOpen, setIsValeOpen] = useState(false);
  const [valeData, setValeData] = useState({ employeeId: '', value: '', description: '', targetMonth: new Date().toISOString().slice(0, 7) });

  const handleSaveVale = async (e) => {
    e.preventDefault();
    if (!valeData.employeeId || !valeData.value) return alert("Preencha os dados.");
    try { await addDoc(collection(db, 'users', userId, 'advances'), { ...valeData, value: parseFloat(valeData.value), createdAt: new Date(), status: 'pending' }); alert("Vale lançado!"); setIsValeOpen(false); setValeData({ ...valeData, value: '', description: '' }); } catch (error) { alert("Erro: " + error.message); }
  };

  const totalEmployees = employees.length;
  const totalPayrollEstimate = employees.reduce((acc, emp) => acc + (emp.baseValue || 0), 0);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div><h2 className="text-3xl font-bold text-slate-800">Visão Geral</h2><p className="text-slate-500 mt-1">Bem-vindo ao painel de controle.</p></div>
        <div className="text-right hidden md:block"><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Data de Hoje</p><p className="text-xl font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none"><div className="flex justify-between items-start"><div><p className="text-blue-100 text-sm font-medium mb-1">Funcionários Ativos</p><h3 className="text-4xl font-bold">{totalEmployees}</h3></div><div className="bg-white/20 p-2 rounded-lg"><Users size={24}/></div></div><div className="mt-4 text-xs text-blue-100 bg-white/10 inline-block px-2 py-1 rounded">Equipe completa</div></Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none"><div className="flex justify-between items-start"><div><p className="text-emerald-100 text-sm font-medium mb-1">Folha Estimada</p><h3 className="text-4xl font-bold">R$ {totalPayrollEstimate.toLocaleString('pt-BR', {maximumFractionDigits:0})}</h3></div><div className="bg-white/20 p-2 rounded-lg"><DollarSign size={24}/></div></div><div className="mt-4 text-xs text-emerald-100 bg-white/10 inline-block px-2 py-1 rounded">Base mensal fixa</div></Card>
        <Card onClick={() => setIsValeOpen(true)} className="bg-gradient-to-br from-orange-400 to-pink-500 text-white border-none cursor-pointer group"><div className="flex justify-between items-start"><div><p className="text-orange-100 text-sm font-medium mb-1">Ação Rápida</p><h3 className="text-3xl font-bold group-hover:scale-105 transition-transform">Lançar Vale</h3></div><div className="bg-white/20 p-2 rounded-lg group-hover:rotate-12 transition-transform"><Receipt size={24}/></div></div><div className="mt-4 text-xs text-orange-100 bg-white/10 inline-block px-2 py-1 rounded">Adiantamentos / Compras</div></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card onClick={() => changeView('employees')} className="group"><div className="flex items-center gap-4"><div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><Users size={32}/></div><div><h3 className="text-xl font-bold text-slate-800">Gerenciar Equipe</h3><p className="text-slate-500 text-sm">Adicionar, editar ou remover colaboradores.</p></div><div className="ml-auto bg-slate-50 p-2 rounded-full text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition"><ArrowRight size={20}/></div></div></Card>
        <Card onClick={() => changeView('payroll')} className="group"><div className="flex items-center gap-4"><div className="bg-emerald-100 p-4 rounded-full text-emerald-600 group-hover:scale-110 transition-transform"><Calculator size={32}/></div><div><h3 className="text-xl font-bold text-slate-800">Calcular Pagamentos</h3><p className="text-slate-500 text-sm">Fechar a folha, horas extras e imprimir recibos.</p></div><div className="ml-auto bg-slate-50 p-2 rounded-full text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition"><ArrowRight size={20}/></div></div></Card>
      </div>
      {isValeOpen && ( <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up"><h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Receipt size={20}/></div> Novo Vale</h3><form onSubmit={handleSaveVale} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Funcionário</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" required value={valeData.employeeId} onChange={e => setValeData({...valeData, employeeId: e.target.value})}><option value="">Selecione...</option>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label><input type="number" step="0.01" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.value} onChange={e => setValeData({...valeData, value: e.target.value})} placeholder="0.00"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descontar em</label><input type="month" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.targetMonth} onChange={e => setValeData({...valeData, targetMonth: e.target.value})}/></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label><input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.description} onChange={e => setValeData({...valeData, description: e.target.value})} placeholder="Ex: Adiantamento"/></div><div className="flex justify-end gap-2 mt-6"><Button variant="secondary" type="button" onClick={() => setIsValeOpen(false)}>Cancelar</Button><Button type="submit" className="bg-orange-500 hover:bg-orange-600 border-none shadow-orange-500/30">Confirmar</Button></div></form></div></div> )}
    </div>
  );
}

function EmployeeManager({ employees, userId }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialFormState = { name: '', role: '', baseValue: '', type: 'mensalista', pix: '', cpf: '', address: '', admissionDate: '', workHoursPerDay: '8' };
  const [formData, setFormData] = useState(initialFormState);
  const handleEdit = (employee) => { setFormData({ ...employee }); setEditingId(employee.id); setIsFormOpen(true); };
  const handleNew = () => { setFormData(initialFormState); setEditingId(null); setIsFormOpen(true); };
  const handleSubmit = async (e) => { e.preventDefault(); if (!formData.name) return; const data = { ...formData, baseValue: parseFloat(formData.baseValue), workHoursPerDay: parseFloat(formData.workHoursPerDay) || 8 }; try { if (editingId) { await updateDoc(doc(db, 'users', userId, 'employees', editingId), data); } else { await addDoc(collection(db, 'users', userId, 'employees'), data); } setIsFormOpen(false); } catch (err) { alert("Erro!"); } };
  const handleDelete = async (id) => { if (confirm('Excluir?')) await deleteDoc(doc(db, 'users', userId, 'employees', id)); };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
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
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salário Base (R$)</label><input type="number" step="0.01" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.baseValue} onChange={e => setFormData({...formData, baseValue: e.target.value})} /></div>
                <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horas/Dia</label><input type="number" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.workHoursPerDay} onChange={e => setFormData({...formData, workHoursPerDay: e.target.value})} /></div>
                <div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chave PIX</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t"><Button variant="secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit">Salvar Dados</Button></div>
            </form> 
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{employees.map(emp => (<Card key={emp.id} className="group"><div><div className="flex justify-between items-start mb-2"><div className="bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded text-xs uppercase tracking-wide">{emp.role}</div><div className="text-slate-400 group-hover:text-blue-500 transition"><Users size={18}/></div></div><h4 className="font-bold text-lg text-slate-800 mb-1">{emp.name}</h4><div className="text-xs text-slate-400 flex gap-2 mb-4"><span>{emp.workHoursPerDay}h/dia</span><span>•</span><span>{emp.type}</span></div><div className="border-t pt-3 flex justify-between items-center"><p className="font-mono font-bold text-slate-700 text-lg">R$ {Number(emp.baseValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p><div className="flex gap-2"><button onClick={() => handleEdit(emp)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"><Pencil size={18}/></button><button onClick={() => handleDelete(emp.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button></div></div></div></Card>))}</div>
    </div>
  );
}

function PayrollCalculator({ employees, advances, onGenerate, companyData }) {
  const [inputs, setInputs] = useState({});
  const [dates, setDates] = useState({ start: '', end: '' });
  const handleInputChange = (id, field, value) => setInputs(p => ({ ...p, [id]: { ...p[id], [field]: parseFloat(value) || 0 } }));
  const handleOvertimeHoursChange = (id, hours, emp) => { const h = parseFloat(hours) || 0; const daily = emp.type === 'mensalista' ? (emp.baseValue / 30) : emp.baseValue; const hourly = daily / (emp.workHoursPerDay || 8); setInputs(p => ({ ...p, [id]: { ...p[id], overtimeHours: h, overtime: parseFloat((hourly * h).toFixed(2)) } })); };
  const handleApplyAdvances = (empId, total, list) => { if(confirm(`Descontar R$ ${total.toFixed(2)}?`)) setInputs(p => ({ ...p, [empId]: { ...p[empId], discount: (p[empId]?.discount || 0) + total, advancesIncluded: list } })); };
  const getPending = (empId) => { if (!dates.start) return { total: 0, list: [] }; const list = advances.filter(a => a.employeeId === empId && a.targetMonth === dates.start.slice(0,7) && a.status === 'pending'); return { total: list.reduce((acc, c) => acc + c.value, 0), list }; };
  const getVals = (emp) => { const d = inputs[emp.id] || {}; const dailyRate = emp.type === 'mensalista' ? (emp.baseValue/30) : emp.baseValue; const gross = dailyRate * (d.days || 0); return { ...d, grossTotal: gross, netTotal: gross + (d.bonus||0) + (d.overtime||0) - (d.discount||0), advancesIncluded: d.advancesIncluded || [] }; };
  const calculate = () => { if (!dates.start || !dates.end) return alert("Selecione datas."); if(!companyData?.name) alert("Atenção: Configure a empresa antes!"); const items = employees.map(e => ({ ...e, ...getVals(e), dailyRate: e.type === 'mensalista' ? (e.baseValue/30) : e.baseValue })).filter(i => i.days > 0 || i.netTotal > 0); if (items.length === 0) return alert("Preencha algo."); onGenerate({ startDate: dates.start, endDate: dates.end, items }); };
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-slate-100 pb-6">
          <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Calculator className="text-blue-600"/> Calcular Folha</h2><p className="text-slate-500 text-sm mt-1">Defina o período e preencha os dados variáveis.</p></div>
          <div className="flex gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200"><div><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Início</label><input type="date" className="bg-transparent font-bold text-slate-700 outline-none" onChange={e => setDates({...dates, start: e.target.value})}/></div><div className="w-px bg-slate-300"></div><div><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Fim</label><input type="date" className="bg-transparent font-bold text-slate-700 outline-none" onChange={e => setDates({...dates, end: e.target.value})}/></div></div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold"><tr><th className="p-4">Colaborador</th><th className="p-4 w-20 text-center">Dias</th><th className="p-4 w-24 text-center">Hrs Ext</th><th className="p-4 w-32 text-right">R$ Extra</th><th className="p-4 w-32 text-right">Bônus</th><th className="p-4 w-32 text-right">Desc.</th><th className="p-4 w-40 text-right bg-blue-50/50">Líquido</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => { const v = getVals(emp); const p = getPending(emp.id); const done = v.advancesIncluded.length > 0; return (<tr key={emp.id} className="hover:bg-slate-50 transition-colors"><td className="p-4"><div className="font-bold text-slate-700">{emp.name}</div><div className="text-xs text-slate-400 mb-1">{emp.role}</div>{p.total > 0 && !done && <div onClick={() => handleApplyAdvances(emp.id, p.total, p.list)} className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-200 transition"><AlertTriangle size={12}/> Vale: {money(p.total)}</div>} {done && <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle size={12}/> Descontado</div>}</td><td className="p-4"><input type="number" className="w-full p-2 border rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" onChange={e => handleInputChange(emp.id, 'days', e.target.value)}/></td><td className="p-4"><input type="number" className="w-full p-2 border border-blue-200 bg-blue-50/50 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" onChange={e => handleOvertimeHoursChange(emp.id, e.target.value, emp)}/></td><td className="p-4"><input type="number" className="w-full p-2 border border-blue-200 bg-blue-50/50 rounded-lg text-right font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" value={inputs[emp.id]?.overtime || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'overtime', e.target.value)}/></td><td className="p-4"><input type="number" className="w-full p-2 border border-emerald-200 bg-emerald-50/50 rounded-lg text-right font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0,00" onChange={e => handleInputChange(emp.id, 'bonus', e.target.value)}/></td><td className="p-4"><input type="number" className="w-full p-2 border border-red-200 bg-red-50/50 rounded-lg text-right font-bold text-red-600 focus:ring-2 focus:ring-red-500 outline-none" value={inputs[emp.id]?.discount || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'discount', e.target.value)}/></td><td className="p-4 text-right bg-blue-50/30"><span className="font-mono font-bold text-lg text-slate-800">{money(v.netTotal)}</span></td></tr>); })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={calculate} className="shadow-xl px-8 py-3 text-lg">Gerar Documentos <ArrowRight size={20}/></Button></div>
      </Card>
    </div>
  );
}

function GeneralReportView({ data, onViewHolerites, onBack, companyData }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const total = data.items.reduce((acc, i) => acc + (i.netTotal||0), 0);
  const copyPix = (pix) => { navigator.clipboard.writeText(pix); alert("PIX copiado!"); };

  return (
    <div className="max-w-full mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 print:hidden flex justify-between items-center border border-slate-200"><button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar</button><div className="flex gap-3"><Button variant="secondary" onClick={() => window.print()}><Printer size={18}/> Imprimir Relatório</Button><Button onClick={onViewHolerites}>Ver Holerites <ArrowRight size={18}/></Button></div></div>
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
                <td className="p-3 text-right font-bold text-slate-800 bg-blue-50/50 text-base">{money(i.netTotal)}</td>
                <td className="p-3 flex items-center gap-2 group"><span className="text-xs truncate max-w-[120px] block" title={i.pix}>{i.pix}</span>{i.pix && <button onClick={() => copyPix(i.pix)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:scale-110 transition"><Copy size={14}/></button>}</td>
              </tr>
            ))}
            <tr className="bg-slate-800 text-white"><td colSpan="6" className="p-4 text-right uppercase font-bold tracking-wider text-sm">Total Geral da Folha:</td><td className="p-4 text-right font-bold text-xl bg-slate-700">{money(total)}</td><td></td></tr>
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
                   {genericDiscount>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px] hover:bg-red-50"><div className="text-center border-r border-dashed border-slate-200 py-1 text-slate-400">099</div><div className="pl-3 border-r border-dashed border-slate-200 py-1 uppercase text-red-800">Outros Descontos</div><div className="text-center border-r border-dashed border-slate-200 py-1">-</div><div className="text-right border-r border-dashed border-slate-200 py-1 pr-2 text-slate-300">0,00</div><div className="text-right py-1 pr-2 text-red-700">{money(genericDiscount)}</div></div>}
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