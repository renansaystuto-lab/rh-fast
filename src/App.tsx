import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, updateDoc, setDoc, query, orderBy 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
  updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential
} from 'firebase/auth';
import { 
  Users, Calculator, FileText, Plus, Trash2, 
  Printer, Calendar, ArrowLeft, Table, ArrowRight, Pencil, 
  Receipt, AlertTriangle, CheckCircle, LogOut, Lock, Settings, Building2,
  DollarSign, Copy, Send, Shield, UserX, RefreshCw, Save, History, Scissors, Eye,
  Filter, ArrowDownAZ, CalendarDays
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

// --- UI COMPONENTS ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-slate-750 hover:border-slate-600 hover:-translate-y-1 active:scale-95' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20",
    secondary: "bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 hover:text-white", 
    dark: "bg-slate-900 text-white hover:bg-black"
  };
  return (
    <button className={`${variants[variant]} px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-900/50 text-blue-200 border-blue-800",
    green: "bg-emerald-900/50 text-emerald-200 border-emerald-800",
    orange: "bg-orange-900/50 text-orange-200 border-orange-800",
    red: "bg-red-900/50 text-red-200 border-red-800",
  };
  return <span className={`${colors[color]} border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>{children}</span>;
};

// --- LOGIN SCREEN ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setError('Acesso negado.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3"><FileText size={40} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-white mb-1">RH Fácil</h1>
          <p className="text-slate-400 text-sm">Acesso ao Sistema</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div><label className="block text-xs font-bold text-slate-400 mb-1 uppercase">E-mail</label><input type="email" required className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}/></div>
          <div><label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Senha</label><input type="password" required className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/></div>
          {error && <div className="text-white bg-red-600/80 p-3 rounded-lg text-sm text-center font-medium animate-pulse">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-all shadow-xl flex justify-center items-center gap-2">{loading ? 'Entrando...' : <><Lock size={20}/> Entrar</>}</button>
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

  // Estados persistentes
  const [payrollInputs, setPayrollInputs] = useState({});
  const [payrollDates, setPayrollDates] = useState({ start: '', end: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoadingAuth(false); });
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
      case 'payroll': return <PayrollCalculator employees={employees} advances={advances} onGenerate={handleGenerateReport} companyData={companyData} inputs={payrollInputs} setInputs={setPayrollInputs} dates={payrollDates} setDates={setPayrollDates} />;
      case 'report_general': return <GeneralReportView data={reportData} onViewHolerites={() => setView('print_holerites')} onBack={() => setView('payroll')} companyData={companyData} userId={user?.uid} />;
      case 'print_holerites': return <HoleriteView data={reportData} onBack={() => setView('report_general')} companyData={companyData} />;
      case 'history': return <PaymentHistory userId={user?.uid} onViewReport={(savedData) => { setReportData(savedData); setView('report_general'); }} />;
      case 'settings': return <CompanySettings userId={user?.uid} currentData={companyData} onSave={() => setView('dashboard')} currentUser={user} />;
      default: return <Dashboard changeView={setView} employees={employees} userId={user?.uid} />;
    }
  };

  if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-slate-900 text-blue-500 font-bold animate-pulse">Carregando...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 shadow-xl z-10 print:hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              {companyData?.logoUrl ? <img src={companyData.logoUrl} alt="Logo" className="h-8 w-8 object-contain"/> : <FileText className="h-8 w-8" />}
            </div>
            <div><h1 className="text-lg font-bold leading-tight">{companyData?.name || 'RH Fácil'}</h1><p className="text-[10px] text-blue-200 font-medium tracking-wider uppercase">Sistema de Gestão</p></div>
          </div>
          <nav className="hidden md:flex gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
            {['dashboard', 'employees', 'payroll', 'history'].map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/5'}`}>
                {v === 'dashboard' ? 'Início' : v === 'employees' ? 'Equipe' : v === 'payroll' ? 'Pagamentos' : 'Histórico'}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('settings')} className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"><Settings size={20}/></button>
            <button onClick={() => signOut(auth)} className="p-2 text-pink-300 hover:text-white hover:bg-red-500/20 rounded-lg transition"><LogOut size={20}/></button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">{renderView()}</main>
    </div>
  );
}

// --- HISTÓRICO DE PAGAMENTOS ---
function PaymentHistory({ userId, onViewReport }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const q = query(collection(db, 'users', userId, 'payrolls'), orderBy('createdAt', 'desc')); const unsub = onSnapshot(q, (snap) => { setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }); return () => unsub(); }, [userId]);
  const handleDelete = async (id) => { if(confirm("Apagar registro?")) await deleteDoc(doc(db, 'users', userId, 'payrolls', id)); }
  const formatMoney = (v) => Number(v).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const formatDate = (d) => d ? d.split('-').reverse().join('/') : '';
  if(loading) return <div className="p-10 text-center text-slate-400">Carregando...</div>;
  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <Card><h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><History className="text-blue-500"/> Histórico de Pagamentos</h2>
        {history.length === 0 ? (<div className="text-center py-10 text-slate-500">Nenhum pagamento fechado.</div>) : (
          <div className="space-y-4">{history.map(item => (<div key={item.id} className="border border-slate-700 bg-slate-750 rounded-xl p-4 flex justify-between items-center hover:bg-slate-700 transition"><div><h4 className="font-bold text-lg text-white">Folha: {formatDate(item.startDate)} à {formatDate(item.endDate)}</h4><p className="text-sm text-slate-400">Fechado em: {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p></div><div className="flex items-center gap-6"><div className="text-right"><span className="text-xs uppercase font-bold text-slate-500">Total Pago</span><p className="font-bold text-xl text-emerald-400">{formatMoney(item.totalValue)}</p></div><div className="flex gap-2"><Button onClick={() => onViewReport(item)} className="px-4"><Eye size={18}/> Ver</Button><button onClick={() => handleDelete(item.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg"><Trash2 size={18}/></button></div></div></div>))}</div>
        )}
      </Card>
    </div>
  );
}

// --- CONFIGURAÇÃO DA EMPRESA ---
function CompanySettings({ userId, currentData, onSave, currentUser }) {
  const [formData, setFormData] = useState({ name: '', cnpj: '', address: '', phone: '', logoUrl: '' });
  const [securityData, setSecurityData] = useState({ newEmail: '', newPassword: '', currentPassword: '' });
  useEffect(() => { if (currentData) setFormData({ name: currentData.name || '', cnpj: currentData.cnpj || '', address: currentData.address || '', phone: currentData.phone || '', logoUrl: currentData.logoUrl || '' }); }, [currentData]);
  const handleSaveProfile = async (e) => { e.preventDefault(); try { await setDoc(doc(db, 'users', userId, 'settings', 'profile'), formData); alert("Salvo!"); onSave(); } catch (error) { alert("Erro: " + error.message); } };
  const handleUpdateSecurity = async (e) => { e.preventDefault(); if (!securityData.currentPassword) return alert("Digite a senha atual."); try { const credential = EmailAuthProvider.credential(currentUser.email, securityData.currentPassword); await reauthenticateWithCredential(currentUser, credential); if (securityData.newEmail && securityData.newEmail !== currentUser.email) await updateEmail(currentUser, securityData.newEmail); if (securityData.newPassword) await updatePassword(currentUser, securityData.newPassword); alert("Acesso atualizado!"); setSecurityData({ newEmail: '', newPassword: '', currentPassword: '' }); } catch (error) { alert("Erro: " + error.message); } };
  
  const inputStyle = "w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition";
  
  return ( <div className="max-w-4xl mx-auto animate-fade-in space-y-8"><Card><h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Building2 className="text-blue-500"/> Dados da Empresa</h2><form onSubmit={handleSaveProfile} className="space-y-4"><div><label className="block text-sm font-bold mb-1 text-slate-400">Nome</label><input type="text" required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1 text-slate-400">CNPJ</label><input type="text" className={inputStyle} value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})}/></div><div><label className="block text-sm font-bold mb-1 text-slate-400">Telefone</label><input type="text" className={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div></div><div><label className="block text-sm font-bold mb-1 text-slate-400">Endereço</label><input type="text" className={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/></div><div><label className="block text-sm font-bold mb-1 text-slate-400">URL Logo</label><input type="text" className={inputStyle} value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})}/></div><div className="pt-4 flex gap-2 justify-end"><Button variant="secondary" type="button" onClick={onSave}>Voltar</Button><Button type="submit">Salvar</Button></div></form></Card><Card className="border-l-4 border-l-orange-600"><h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Shield className="text-orange-500"/> Segurança</h2><form onSubmit={handleUpdateSecurity} className="space-y-4 pt-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1 text-slate-400">Novo E-mail</label><input type="email" className={inputStyle} value={securityData.newEmail} onChange={e => setSecurityData({...securityData, newEmail: e.target.value})} placeholder={currentUser.email} /></div><div><label className="block text-sm font-bold mb-1 text-slate-400">Nova Senha</label><input type="password" className={inputStyle} value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} /></div></div><div className="bg-orange-900/30 p-4 rounded-lg mt-4 border border-orange-800"><label className="block text-sm font-bold mb-1 text-orange-400">Senha Atual</label><input type="password" required className={inputStyle} value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} /></div><div className="pt-2 flex justify-end"><Button type="submit" className="bg-orange-600 hover:bg-orange-700 border-none text-white">Atualizar Acesso</Button></div></form></Card></div> );
}

function Dashboard({ changeView, employees, userId }) {
  const [isValeOpen, setIsValeOpen] = useState(false);
  const [valeData, setValeData] = useState({ employeeId: '', value: '', description: '', targetMonth: new Date().toISOString().slice(0, 7) });
  const handleSaveVale = async (e) => { e.preventDefault(); if (!valeData.employeeId || !valeData.value) return alert("Preencha os dados."); try { await addDoc(collection(db, 'users', userId, 'advances'), { ...valeData, value: parseFloat(valeData.value), createdAt: new Date(), status: 'pending' }); alert("Vale lançado!"); setIsValeOpen(false); setValeData({ ...valeData, value: '', description: '' }); } catch (error) { alert("Erro: " + error.message); } };
  const activeEmployees = employees.filter(e => e.status !== 'inactive');
  const totalEmployees = activeEmployees.length;
  const totalPayrollEstimate = activeEmployees.reduce((acc, emp) => acc + (emp.baseValue || 0), 0);
  
  const inputStyle = "w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-white";

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4"><div><h2 className="text-3xl font-bold text-white">Visão Geral</h2><p className="text-slate-400 mt-1">Bem-vindo ao painel de controle.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white border-blue-700"><div className="flex justify-between items-start"><div><p className="text-blue-200 text-xs font-bold uppercase mb-1">Colaboradores</p><h3 className="text-3xl font-bold">{totalEmployees}</h3></div><div className="bg-white/10 p-2 rounded-lg"><Users size={20}/></div></div></Card>
        <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white border-emerald-700"><div className="flex justify-between items-start"><div><p className="text-emerald-200 text-xs font-bold uppercase mb-1">Folha Base</p><h3 className="text-3xl font-bold">R$ {totalPayrollEstimate.toLocaleString('pt-BR', {maximumFractionDigits:0})}</h3></div><div className="bg-white/10 p-2 rounded-lg"><DollarSign size={20}/></div></div></Card>
        <Card onClick={() => setIsValeOpen(true)} className="bg-gradient-to-br from-orange-900 to-red-900 text-white border-orange-700 cursor-pointer group"><div className="flex justify-between items-start"><div><p className="text-orange-200 text-xs font-bold uppercase mb-1">Ação Rápida</p><h3 className="text-3xl font-bold group-hover:scale-105 transition-transform">Lançar Vale</h3></div><div className="bg-white/10 p-2 rounded-lg group-hover:rotate-12 transition-transform"><Receipt size={20}/></div></div></Card>
        <Card onClick={() => changeView('history')} className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white border-purple-700 cursor-pointer group"><div className="flex justify-between items-start"><div><p className="text-purple-200 text-xs font-bold uppercase mb-1">Arquivo</p><h3 className="text-3xl font-bold group-hover:scale-105 transition-transform">Histórico</h3></div><div className="bg-white/10 p-2 rounded-lg group-hover:rotate-12 transition-transform"><History size={20}/></div></div></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card onClick={() => changeView('employees')} className="group"><div className="flex items-center gap-4"><div className="bg-blue-900/50 p-4 rounded-full text-blue-400 group-hover:scale-110 transition-transform"><Users size={32}/></div><div><h3 className="text-xl font-bold text-white">Gerenciar Equipe</h3><p className="text-slate-400 text-sm">Adicionar, editar ou desligar colaboradores.</p></div></div></Card><Card onClick={() => changeView('payroll')} className="group"><div className="flex items-center gap-4"><div className="bg-emerald-900/50 p-4 rounded-full text-emerald-400 group-hover:scale-110 transition-transform"><Calculator size={32}/></div><div><h3 className="text-xl font-bold text-white">Calcular Pagamentos</h3><p className="text-slate-400 text-sm">Fechar a folha, horas extras e imprimir recibos.</p></div></div></Card></div>
      {isValeOpen && ( <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full animate-slide-up"><h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><div className="bg-orange-500/20 p-2 rounded-lg text-orange-500"><Receipt size={20}/></div> Novo Vale</h3><form onSubmit={handleSaveVale} className="space-y-4"><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Funcionário</label><select className={inputStyle} required value={valeData.employeeId} onChange={e => setValeData({...valeData, employeeId: e.target.value})}><option value="">Selecione...</option>{activeEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor (R$)</label><input type="number" step="0.01" required className={inputStyle} value={valeData.value} onChange={e => setValeData({...valeData, value: e.target.value})} placeholder="0.00"/></div><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descontar em</label><input type="month" required className={inputStyle} value={valeData.targetMonth} onChange={e => setValeData({...valeData, targetMonth: e.target.value})}/></div></div><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Motivo</label><input type="text" className={inputStyle} value={valeData.description} onChange={e => setValeData({...valeData, description: e.target.value})} placeholder="Ex: Adiantamento"/></div><div className="flex justify-end gap-2 mt-6"><Button variant="secondary" type="button" onClick={() => setIsValeOpen(false)}>Cancelar</Button><Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white border-none">Confirmar</Button></div></form></div></div> )}
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
  const handleToggleStatus = async (employee) => { const isInactive = employee.status === 'inactive'; if (confirm(`Deseja ${isInactive ? 'REATIVAR' : 'DESLIGAR'} ${employee.name}?`)) { await updateDoc(doc(db, 'users', userId, 'employees', employee.id), { status: isInactive ? 'active' : 'inactive' }); } };
  const handleSubmit = async (e) => { e.preventDefault(); if (!formData.name) return; const data = { ...formData, baseValue: parseFloat(formData.baseValue), workHoursPerDay: parseFloat(formData.workHoursPerDay) || 8, status: formData.status || 'active' }; try { if (editingId) { await updateDoc(doc(db, 'users', userId, 'employees', editingId), data); } else { await addDoc(collection(db, 'users', userId, 'employees'), { ...data, createdAt: new Date() }); } setIsFormOpen(false); } catch (err) { alert("Erro!"); } };
  const handleDelete = async (id) => { if (confirm('Excluir permanentemente?')) await deleteDoc(doc(db, 'users', userId, 'employees', id)); };

  const inputStyle = "w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition";

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><div className="bg-blue-900/50 p-2 rounded-lg text-blue-400"><Users size={24}/></div><h2 className="text-2xl font-bold text-white">Equipe</h2></div><Button onClick={handleNew}><Plus size={20} /> Novo Cadastro</Button></div>
      {isFormOpen && ( <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"><h3 className="text-2xl font-bold mb-6 text-white border-b border-slate-700 pb-4">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3><form onSubmit={handleSubmit} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label><input type="text" required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">CPF</label><input type="text" className={inputStyle} value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Admissão</label><input type="date" className={inputStyle} value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} /></div><div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Endereço</label><input type="text" className={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cargo</label><input type="text" required className={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo Contrato</label><select className={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="mensalista">Mensalista</option><option value="diarista">Diarista</option></select></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Salário Base (R$)</label><input type="number" step="0.01" required className={inputStyle} value={formData.baseValue} onChange={e => setFormData({...formData, baseValue: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Horas/Dia</label><input type="number" required className={inputStyle} value={formData.workHoursPerDay} onChange={e => setFormData({...formData, workHoursPerDay: e.target.value})} /></div><div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chave PIX</label><input type="text" className={inputStyle} value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} /></div></div><div className="flex justify-end gap-3 pt-4 border-t border-slate-700"><Button variant="secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit">Salvar Dados</Button></div></form></div></div> )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{employees.map(emp => { const isInactive = emp.status === 'inactive'; return (<Card key={emp.id} className={`group relative overflow-hidden ${isInactive ? 'opacity-60 bg-slate-800/50' : ''}`}>{isInactive && <div className="absolute top-0 right-0 bg-slate-700 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">DESLIGADO</div>}<div><div className="flex justify-between items-start mb-2"><div className={`font-bold px-2 py-1 rounded text-xs uppercase tracking-wide ${isInactive ? 'bg-slate-700 text-slate-400' : 'bg-blue-900/50 text-blue-400 border border-blue-800'}`}>{emp.role}</div><div className="text-slate-600"><Users size={18}/></div></div><h4 className={`font-bold text-lg mb-1 text-white ${isInactive ? 'line-through text-slate-500' : ''}`}>{emp.name}</h4><div className="text-xs text-slate-400 flex gap-2 mb-4"><span>{emp.workHoursPerDay}h/dia</span><span>•</span><span>{emp.type}</span></div><div className="border-t border-slate-700 pt-3 flex justify-between items-center"><p className="font-mono font-bold text-slate-300 text-lg">R$ {Number(emp.baseValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p><div className="flex gap-2"><button onClick={() => handleEdit(emp)} className="text-blue-400 hover:bg-slate-700 p-2 rounded-lg transition" title="Editar"><Pencil size={18}/></button><button onClick={() => handleToggleStatus(emp)} className={`p-2 rounded-lg transition text-white ${isInactive ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`} title={isInactive ? "Reativar" : "Desligar"}>{isInactive ? <RefreshCw size={18} /> : <div className="flex items-center gap-1 text-xs font-bold"><UserX size={16}/></div>}</button></div></div></div></Card>); })}</div>
    </div>
  );
}

// --- CALCULADORA ---
function PayrollCalculator({ employees, advances, onGenerate, companyData, inputs, setInputs, dates, setDates }) {
  const [sortOrder, setSortOrder] = useState('name'); 

  const handleInputChange = (id, field, value) => setInputs(p => ({ ...p, [id]: { ...p[id], [field]: field === 'discountReason' ? value : parseFloat(value) || 0 } }));
  const handleOvertimeHoursChange = (id, hours, emp) => { const h = parseFloat(hours) || 0; const daily = emp.type === 'mensalista' ? (emp.baseValue / 30) : emp.baseValue; const hourly = daily / (emp.workHoursPerDay || 8); setInputs(p => ({ ...p, [id]: { ...p[id], overtimeHours: h, overtime: parseFloat((hourly * h).toFixed(2)) } })); };
  const handleApplyAdvances = (empId, total, list) => { if(confirm(`Descontar R$ ${total.toFixed(2)}?`)) setInputs(p => ({ ...p, [empId]: { ...p[empId], discount: (p[empId]?.discount || 0) + total, advancesIncluded: list } })); };
  const getPending = (empId) => { if (!dates.start) return { total: 0, list: [] }; const list = advances.filter(a => a.employeeId === empId && a.targetMonth === dates.start.slice(0,7) && a.status === 'pending'); return { total: list.reduce((acc, c) => acc + c.value, 0), list }; };
  const getVals = (emp) => { const d = inputs[emp.id] || {}; const dailyRate = emp.type === 'mensalista' ? (emp.baseValue/30) : emp.baseValue; const gross = dailyRate * (d.days || 0); return { ...d, grossTotal: gross, netTotal: gross + (d.bonus||0) + (d.overtime||0) - (d.discount||0), advancesIncluded: d.advancesIncluded || [], discountReason: d.discountReason || '' }; };
  
  let activeEmployees = employees.filter(e => e.status !== 'inactive');
  activeEmployees.sort((a, b) => {
    if (sortOrder === 'name') return a.name.localeCompare(b.name);
    if (sortOrder === 'admission') return new Date(a.admissionDate || '2099-01-01') - new Date(b.admissionDate || '2099-01-01');
    return 0;
  });

  const totalPayroll = activeEmployees.reduce((acc, emp) => acc + getVals(emp).netTotal, 0);
  const calculate = () => { if (!dates.start || !dates.end) return alert("Selecione datas."); if(!companyData?.name) alert("Atenção: Configure a empresa antes!"); const items = activeEmployees.map(e => ({ ...e, ...getVals(e), dailyRate: e.type === 'mensalista' ? (e.baseValue/30) : e.baseValue })).filter(i => i.days > 0 || i.netTotal > 0); if (items.length === 0) return alert("Preencha algo."); onGenerate({ startDate: dates.start, endDate: dates.end, items }); };
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

  const inputClass = "w-full p-3 border border-slate-600 bg-slate-900 rounded-lg text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600";
  const discountInputClass = "w-full p-3 bg-slate-900 border-2 border-red-500 rounded-lg text-right text-red-500 font-bold focus:ring-2 focus:ring-red-400 outline-none placeholder-red-700 transition-all";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <Card className="pb-40">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-slate-700 pb-6">
          <div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Calculator className="text-blue-500"/> Calcular Folha</h2><p className="text-slate-400 text-sm mt-1">Defina o período e preencha os dados.</p></div>
          <div className="flex gap-4 items-end">
            <div className="flex bg-slate-700 p-1 rounded-xl border border-slate-600">
                <button onClick={() => setSortOrder('name')} className={`p-2 rounded-lg transition ${sortOrder === 'name' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Ordem Alfabética"><ArrowDownAZ size={20}/></button>
                <button onClick={() => setSortOrder('admission')} className={`p-2 rounded-lg transition ${sortOrder === 'admission' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Data Admissão"><CalendarDays size={20}/></button>
            </div>
            <div className="flex gap-4 bg-slate-700 p-2 rounded-xl border border-slate-600">
              <div><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Início</label><input type="date" value={dates.start} className="bg-transparent font-bold text-white outline-none [&::-webkit-calendar-picker-indicator]:invert" onChange={e => setDates({...dates, start: e.target.value})}/></div>
              <div className="w-px bg-slate-500"></div>
              <div><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Fim</label><input type="date" value={dates.end} className="bg-transparent font-bold text-white outline-none [&::-webkit-calendar-picker-indicator]:invert" onChange={e => setDates({...dates, end: e.target.value})}/></div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-bold sticky top-0 z-10 shadow-lg"><tr><th className="p-4 bg-slate-800">Colaborador</th><th className="p-4 w-32 text-center bg-slate-800">Dias</th><th className="p-4 w-32 text-center bg-slate-800 text-blue-400">Hrs Ext</th><th className="p-4 w-32 text-center bg-slate-800 text-blue-400">R$ Extra</th><th className="p-4 w-32 text-center bg-slate-800 text-emerald-400">Bônus</th><th className="p-4 w-32 text-center bg-slate-800 text-red-400">Desc.</th><th className="p-4 w-40 text-right bg-slate-800">Líquido</th></tr></thead>
            <tbody className="divide-y divide-slate-700">
              {activeEmployees.map(emp => { const v = getVals(emp); const p = getPending(emp.id); const done = v.advancesIncluded.length > 0; return (<tr key={emp.id} className="hover:bg-slate-700/50 transition-colors"><td className="p-4"><div className="font-bold text-white">{emp.name}</div><div className="text-xs text-slate-400 mb-1">{emp.role}</div>
              {p.total > 0 && !done && <div onClick={() => handleApplyAdvances(emp.id, p.total, p.list)} className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 border border-orange-400 transition shadow-lg shadow-orange-500/20 animate-pulse"><AlertTriangle size={12}/> Vale ABERTO: {money(p.total)}</div>} 
              {done && <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-900/50 text-emerald-200 text-xs font-bold border border-emerald-700"><CheckCircle size={12}/> Descontado</div>}</td>
              <td className="p-4"><input type="number" className={`${inputClass} text-center`} value={inputs[emp.id]?.days || ''} placeholder="0" onChange={e => handleInputChange(emp.id, 'days', e.target.value)}/></td>
              <td className="p-4"><input type="number" className={`${inputClass} text-center`} placeholder="0" onChange={e => handleOvertimeHoursChange(emp.id, e.target.value, emp)}/></td><td className="p-4"><input type="number" className={`${inputClass} text-right text-blue-400`} value={inputs[emp.id]?.overtime || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'overtime', e.target.value)}/></td><td className="p-4"><input type="number" className={`${inputClass} text-right text-emerald-400`} value={inputs[emp.id]?.bonus || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'bonus', e.target.value)}/></td>
              <td className="p-4 space-y-1">
                <input type="number" className={discountInputClass} value={inputs[emp.id]?.discount || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'discount', e.target.value)}/>
                <input type="text" className="w-full p-1 text-[10px] bg-slate-900 border-2 border-red-500 rounded text-red-500 placeholder-red-700 focus:ring-1 focus:ring-red-400 outline-none mt-1 font-bold transition-all" value={inputs[emp.id]?.discountReason || ''} placeholder="Motivo (Opc.)" onChange={e => handleInputChange(emp.id, 'discountReason', e.target.value)}/>
              </td>
              <td className="p-4 text-right bg-slate-900/30"><span className="font-mono font-bold text-lg text-white">{money(v.netTotal)}</span></td></tr>); })}
            </tbody>
          </table>
        </div>
        <div className="fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 p-4 shadow-2xl flex justify-end items-center gap-6 z-50"><div className="text-right"><span className="block text-xs font-bold text-slate-400 uppercase">Total da Folha</span><span className="text-2xl font-bold text-white">{money(totalPayroll)}</span></div><Button onClick={calculate} className="shadow-xl px-8 py-3 text-lg bg-emerald-600 hover:bg-emerald-500">Gerar Documentos <ArrowRight size={20}/></Button></div>
      </Card>
    </div>
  );
}

function GeneralReportView({ data, onViewHolerites, onBack, companyData, userId }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const total = data.items.reduce((acc, i) => acc + (i.netTotal||0), 0);
  const copyPix = (pix) => { navigator.clipboard.writeText(pix); alert("PIX copiado!"); };
  const handleSaveHistory = async () => { if(confirm("Fechar folha e salvar?")) { try { await addDoc(collection(db, 'users', userId, 'payrolls'), { ...data, totalValue: total, createdAt: new Date(), closedBy: companyData?.name || 'Sistema' }); alert("Salvo no Histórico!"); } catch(e) { alert("Erro: " + e.message); } } };

  // Filtra quem teve desconto > 0
  const employeesWithDiscount = data.items.filter(item => (item.discount || 0) > 0);

  // PREPARAR LISTA DE DESCONTOS DETALHADOS (SOMA DE VALES + MANUAIS)
  const allDiscountDetails = [];
  employeesWithDiscount.forEach(emp => {
    // 1. Adicionar cada vale como uma linha
    if (emp.advancesIncluded && emp.advancesIncluded.length > 0) {
      emp.advancesIncluded.forEach(adv => {
        allDiscountDetails.push({
          name: emp.name,
          reason: `VALE: ${adv.description || 'Adiantamento'}`,
          value: adv.value
        });
      });
    }
    
    // 2. Adicionar desconto manual (se houver saldo restante)
    const totalAdvances = (emp.advancesIncluded || []).reduce((a, b) => a + b.value, 0);
    const manualDiscount = (emp.discount || 0) - totalAdvances;
    
    if (manualDiscount > 0.01) {
      allDiscountDetails.push({
        name: emp.name,
        reason: emp.discountReason ? `MANUAL: ${emp.discountReason}` : 'OUTROS DESCONTOS',
        value: manualDiscount
      });
    }
  });

  return (
    <div className="max-w-full mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 print:hidden flex justify-between items-center border border-slate-200">
        <div className="flex gap-2"><button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar</button>{!data.createdAt && <Button variant="success" onClick={handleSaveHistory}><Save size={18}/> Salvar Fechamento</Button>}</div>
        <div className="flex gap-3"><Button variant="secondary" onClick={() => window.print()}><Printer size={18}/> Imprimir Relatório</Button><Button onClick={onViewHolerites}>Ver Holerites <ArrowRight size={18}/></Button></div>
      </div>
      
      <div className="bg-white print:w-full shadow-2xl overflow-hidden rounded-lg border-2 border-black">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-end border-b-2 border-black print:bg-slate-900 print:text-white">
          <div><h1 className="text-xl font-bold uppercase tracking-wider">{companyData?.name}</h1><p className="text-slate-400 text-xs mt-1">Relatório Gerencial de Pagamentos</p></div>
          <div className="text-right"><p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Período</p><p className="text-lg font-bold">{date(data.startDate)} - {date(data.endDate)}</p></div>
        </div>

        <table className="w-full text-sm font-sans border-collapse">
          <thead className="bg-slate-200 text-black uppercase text-xs font-bold border-b-2 border-black">
            <tr>
              <th className="p-2 text-left pl-4 border-r border-black">Colaborador</th>
              <th className="p-2 text-center border-r border-black">Dias</th>
              <th className="p-2 text-right border-r border-black">Base</th>
              <th className="p-2 text-right border-r border-black">Bruto</th>
              <th className="p-2 text-right text-red-700 border-r border-black">Desc.</th>
              <th className="p-2 text-right text-blue-700 border-r border-black">Extras</th>
              <th className="p-2 text-right bg-slate-300 border-r border-black">LÍQUIDO</th>
              <th className="p-2 text-left pl-4 w-40">PIX</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((i, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-slate-100 border-b border-slate-300">
                <td className="p-2 pl-4 border-r border-slate-300"><div className="font-bold text-black uppercase">{i.name}</div><div className="text-[10px] text-slate-500 uppercase">{i.role}</div></td>
                <td className="p-2 text-center border-r border-slate-300 font-medium">{i.daysWorked}</td>
                <td className="p-2 text-right text-slate-600 border-r border-slate-300">{money(i.dailyRate)}</td>
                <td className="p-2 text-right font-medium border-r border-slate-300">{money(i.grossTotal)}</td>
                <td className="p-2 text-right text-red-600 font-bold border-r border-slate-300">{(i.discount||0)>0 ? `(${money(i.discount)})` : '-'}</td>
                <td className="p-2 text-right text-blue-600 font-bold border-r border-slate-300">{money((i.bonus||0)+(i.overtime||0))}</td>
                <td className="p-2 text-right font-bold text-black bg-slate-200 border-r border-slate-300 text-base">{money(i.netTotal)}</td>
                <td className="p-2 pl-4 flex items-center gap-2 group"><span className="text-xs truncate max-w-[120px] block font-mono" title={i.pix}>{i.pix}</span>{i.pix && <button onClick={() => copyPix(i.pix)} className="opacity-0 group-hover:opacity-100 text-blue-600 hover:scale-110 transition print:hidden"><Copy size={14}/></button>}</td>
              </tr>
            ))}
            <tr className="bg-slate-800 text-white border-t-2 border-black">
              <td colSpan="6" className="p-3 text-right uppercase font-bold tracking-wider text-sm">Total Geral da Folha:</td>
              <td className="p-3 text-right font-bold text-xl bg-slate-700 border-l border-r border-black">{money(total)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* RESUMO DE DESCONTOS (CORRIGIDO PARA MOSTRAR DETALHES REAIS) */}
        {allDiscountDetails.length > 0 && (
          <div className="mt-8 mx-4 mb-4 break-inside-avoid">
            <h3 className="text-lg font-bold uppercase mb-2 border-b-2 border-red-500 text-red-700 inline-block">Resumo Detalhado de Descontos</h3>
            <table className="w-full text-sm font-sans border-collapse border border-slate-300">
              <thead className="bg-red-50 text-red-900 uppercase text-xs font-bold">
                <tr>
                  <th className="p-2 text-left border border-slate-300">Funcionário</th>
                  <th className="p-2 text-left border border-slate-300">Motivo do Desconto</th>
                  <th className="p-2 text-right border border-slate-300 w-32">Valor</th>
                </tr>
              </thead>
              <tbody>
                {allDiscountDetails.map((detail, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-bold uppercase">{detail.name}</td>
                    <td className="p-2 border border-slate-300 uppercase text-slate-600">{detail.reason}</td>
                    <td className="p-2 border border-slate-300 text-right font-bold text-red-600">{money(detail.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function HoleriteView({ data, onBack, companyData }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const empName = companyData?.name || 'EMPRESA'; const empCnpj = companyData?.cnpj || ''; const empLogo = companyData?.logoUrl;

  const ReceiptCopy = ({ item, type }) => {
    const totalAdvances = (item.advancesIncluded || []).reduce((acc, c) => acc + (c.value||0), 0);
    const genericDiscount = (item.discount || 0) - totalAdvances;
    
    return (
      <div className="border-2 border-black p-4 h-[13cm] relative flex flex-col justify-between text-xs font-sans text-black bg-white">
        <div className="border-b border-black pb-2 flex justify-between items-end"><div className="flex items-center gap-3">{empLogo && <img src={empLogo} alt="Logo" className="h-8 w-auto mix-blend-multiply filter grayscale" />}<div><h1 className="font-bold text-sm uppercase">{empName}</h1><p className="text-[9px]">CNPJ: {empCnpj}</p></div></div><div className="text-right"><h2 className="font-bold text-sm uppercase">Recibo de Pagamento</h2><p className="text-[10px] font-bold">{date(data.startDate)} a {date(data.endDate)}</p><span className="text-[8px] uppercase border border-black px-1 rounded">{type}</span></div></div>
        <div className="grid grid-cols-12 gap-1 border-b border-black py-1"><div className="col-span-8"><span className="text-[9px] block text-gray-500 uppercase">Funcionário</span><span className="font-bold uppercase">{item.name}</span></div><div className="col-span-4 text-right"><span className="text-[9px] block text-gray-500 uppercase">Cargo</span><span className="font-bold uppercase">{item.role}</span></div></div>
        <div className="flex-1 mt-1"><div className="grid grid-cols-[30px_1fr_40px_60px_60px] border-b border-black font-bold bg-gray-100 text-[9px] text-center uppercase"><div className="border-r border-black">Cód</div><div className="border-r border-black text-left pl-1">Descrição</div><div className="border-r border-black">Ref</div><div className="border-r border-black">Venc.</div><div>Desc.</div></div>
          <div className="text-[10px]">
             <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">001</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Salário Base / Diárias</div><div className="text-center border-r border-dashed border-gray-300">{item.daysWorked}d</div><div className="text-right border-r border-dashed border-gray-300 pr-1">{money(item.grossTotal)}</div><div className="text-right pr-1"></div></div>
             {(item.overtime||0)>0 && <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">002</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Horas Extras</div><div className="text-center border-r border-dashed border-gray-300">{item.overtimeHours}h</div><div className="text-right border-r border-dashed border-gray-300 pr-1">{money(item.overtime)}</div><div className="text-right pr-1"></div></div>}
             {(item.bonus||0)>0 && <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">003</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Bônus / Acréscimos</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-1">{money(item.bonus)}</div><div className="text-right pr-1"></div></div>}
             {(item.advancesIncluded||[]).map((adv,i)=>(<div key={i} className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">05{i}</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Adiantamento ({adv.description||'Vale'})</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-1"></div><div className="text-right pr-1">{money(adv.value)}</div></div>))}
             {genericDiscount>0 && <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">099</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">{item.discountReason ? `Desconto: ${item.discountReason}` : 'Outros Descontos'}</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-1"></div><div className="text-right pr-1">{money(genericDiscount)}</div></div>}
          </div>
        </div>
        <div className="border-t border-black pt-1 mb-2"><div className="flex justify-between items-center text-[10px] uppercase font-bold bg-gray-100 p-1 border border-black"><span>Líquido a Receber</span><span className="text-base">{money(item.netTotal)}</span></div><div className="text-[8px] mt-1 flex gap-4 text-gray-500"><span>PIX: {item.pix || 'N/I'}</span><span>Ref: {item.type}</span></div></div>
        <div className="text-[8px] text-justify leading-tight uppercase mb-2">Declaro ter recebido a importância líquida discriminada neste recibo para plena e geral quitação.</div>
        <div className="grid grid-cols-2 gap-4 items-end"><div className="text-center border-t border-black pt-1 text-[8px]">{new Date().toLocaleDateString()}<br/>DATA</div><div className="text-center border-t border-black pt-1 text-[8px]">{item.name}<br/>ASSINATURA</div></div>
      </div>
    );
  };

  // --- LÓGICA DE PAGINAÇÃO: 2 PESSOAS DIFERENTES POR PÁGINA ---
  const chunks = [];
  for (let i = 0; i < data.items.length; i += 2) {
    chunks.push(data.items.slice(i, i + 2));
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8 print:hidden flex justify-between items-center border border-slate-200">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar</button>
        <Button onClick={() => window.print()}><Printer size={18} /> Imprimir Todos</Button>
      </div>

      <div className="print:w-full space-y-0">
        {chunks.map((chunk, pageIndex) => (
          <div key={pageIndex} className="print:break-after-page print:h-screen print:flex print:flex-col print:justify-between mb-8 bg-white p-8 print:p-0 shadow-xl print:shadow-none">
            
            {/* --- FUNCIONÁRIO 1 (METADE DE CIMA) --- */}
            <ReceiptCopy item={chunk[0]} type="" />
            
            {/* LINHA DE CORTE */}
            <div className="h-10 flex items-center justify-center relative print:my-2">
               <div className="w-full border-t-2 border-dashed border-gray-400 absolute"></div>
               <Scissors className="bg-white text-gray-500 relative z-10 px-2 rotate-90" size={32} />
            </div>

            {/* --- FUNCIONÁRIO 2 (METADE DE BAIXO - SE EXISTIR) --- */}
            {chunk[1] ? (
              <ReceiptCopy item={chunk[1]} type="" />
            ) : (
              <div className="border-2 border-dashed border-gray-300 p-4 h-[13cm] flex items-center justify-center text-gray-400 font-bold text-xl bg-gray-50">
                ESPAÇO RESERVADO (PÁGINA FINAL)
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}