import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, updateDoc, query, where 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  Users, Calculator, FileText, Plus, Trash2, 
  Printer, Calendar, ArrowLeft, Table, ArrowRight, Pencil, 
  Receipt, AlertTriangle, CheckCircle, LogOut, Lock 
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

// --- TELA DE LOGIN ---
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged no App principal vai lidar com a navegação
    } catch (err) {
      console.error(err);
      setError('E-mail ou senha incorretos.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-700">
            <FileText size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">RH Fácil</h1>
          <p className="text-slate-500">Acesse o sistema da sua empresa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">E-mail Corporativo</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="empresa@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition flex justify-center items-center gap-2"
          >
            {loading ? 'Entrando...' : <><Lock size={18}/> Acessar Sistema</>}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
          Não tem acesso? Contrate agora o RH Fácil.
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]); 
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
    const qEmp = collection(db, 'users', user.uid, 'employees');
    const unsubEmp = onSnapshot(qEmp, (snapshot) => setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const qAdv = collection(db, 'users', user.uid, 'advances');
    const unsubAdv = onSnapshot(qAdv, (snapshot) => setAdvances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => { unsubEmp(); unsubAdv(); };
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
    setView('dashboard');
  };

  const handleGenerateReport = (data) => {
    setReportData(data);
    setView('report_general');
  };

  const renderView = () => {
    switch(view) {
      case 'employees': return <EmployeeManager employees={employees} userId={user?.uid} />;
      case 'payroll': return <PayrollCalculator employees={employees} advances={advances} onGenerate={handleGenerateReport} />;
      case 'report_general': return <GeneralReportView data={reportData} onViewHolerites={() => setView('print_holerites')} onBack={() => setView('payroll')} />;
      case 'print_holerites': return <HoleriteView data={reportData} onBack={() => setView('report_general')} />;
      default: return <Dashboard changeView={setView} employees={employees} userId={user?.uid} />;
    }
  };

  if (loadingAuth) return <div className="flex items-center justify-center h-screen text-slate-500">Carregando...</div>;

  // SE NÃO TIVER USUÁRIO, MOSTRA TELA DE LOGIN
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-blue-700 text-white p-4 shadow-lg print:hidden">
        <div className="w-full px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" /> RH Fácil
          </h1>
          <nav className="flex gap-4 text-sm items-center">
            <button onClick={() => setView('dashboard')} className={`hover:text-blue-200 ${view === 'dashboard' ? 'underline font-bold' : ''}`}>Início</button>
            <button onClick={() => setView('employees')} className={`hover:text-blue-200 ${view === 'employees' ? 'underline font-bold' : ''}`}>Funcionários</button>
            <button onClick={() => setView('payroll')} className={`hover:text-blue-200 ${view.includes('report') || view === 'payroll' ? 'underline font-bold' : ''}`}>Folha</button>
            <div className="h-4 w-px bg-blue-500 mx-2"></div>
            <button onClick={handleLogout} className="flex items-center gap-1 text-blue-200 hover:text-white transition"><LogOut size={16}/> Sair</button>
          </nav>
        </div>
      </header>
      <main className="w-full px-6 py-6">{renderView()}</main>
    </div>
  );
}

// --- Subcomponentes (Otimizados) ---

function Dashboard({ changeView, employees, userId }) {
  const [isValeOpen, setIsValeOpen] = useState(false);
  const [valeData, setValeData] = useState({ employeeId: '', value: '', description: '', targetMonth: new Date().toISOString().slice(0, 7) });

  const handleSaveVale = async (e) => {
    e.preventDefault();
    if (!valeData.employeeId || !valeData.value) return alert("Selecione funcionário e valor.");
    try {
      await addDoc(collection(db, 'users', userId, 'advances'), {
        ...valeData, value: parseFloat(valeData.value), createdAt: new Date(), status: 'pending' 
      });
      alert("Vale lançado!"); setIsValeOpen(false); setValeData({ ...valeData, value: '', description: '' });
    } catch (error) { alert("Erro: " + error.message); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-center py-8"><h2 className="text-3xl font-bold text-slate-700">Painel de Controle</h2><p className="text-slate-500">Gerencie sua empresa.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => changeView('employees')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={32} /></div><div><h3 className="text-lg font-bold">Funcionários</h3><p className="text-slate-500 text-sm">{employees.length} cadastrados</p></div></div>
        <div onClick={() => setIsValeOpen(true)} className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-200 cursor-pointer hover:shadow-lg transition flex items-center gap-4 group"><div className="bg-orange-100 p-3 rounded-full text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition"><Receipt size={32} /></div><div><h3 className="text-lg font-bold text-orange-900">Lançar Vale</h3><p className="text-orange-700 text-sm">Adiantamentos</p></div></div>
        <div onClick={() => changeView('payroll')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition flex items-center gap-4"><div className="bg-green-100 p-3 rounded-full text-green-600"><Table size={32} /></div><div><h3 className="text-lg font-bold">Calcular Folha</h3><p className="text-slate-500 text-sm">Fechar mês</p></div></div>
      </div>
      {isValeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full animate-slide-up"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Receipt className="text-orange-500"/> Novo Vale</h3><form onSubmit={handleSaveVale} className="space-y-4"><div><label className="block text-sm font-bold mb-1">Funcionário</label><select className="w-full p-2 border rounded" required value={valeData.employeeId} onChange={e => setValeData({...valeData, employeeId: e.target.value})}><option value="">Selecione...</option>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1">Valor (R$)</label><input type="number" step="0.01" required className="w-full p-2 border rounded" value={valeData.value} onChange={e => setValeData({...valeData, value: e.target.value})} placeholder="0.00"/></div><div><label className="block text-sm font-bold mb-1">Descontar em</label><input type="month" required className="w-full p-2 border rounded" value={valeData.targetMonth} onChange={e => setValeData({...valeData, targetMonth: e.target.value})}/></div></div><div><label className="block text-sm font-bold mb-1">Descrição</label><input type="text" className="w-full p-2 border rounded" value={valeData.description} onChange={e => setValeData({...valeData, description: e.target.value})} placeholder="Ex: Gasolina..."/></div><div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setIsValeOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button><button type="submit" className="px-6 py-2 bg-orange-600 text-white font-bold rounded hover:bg-orange-700">Salvar</button></div></form></div></div>
      )}
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-700">Sua Equipe</h2><button onClick={handleNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={20} /> Novo Funcionário</button></div>
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"><h3 className="font-bold mb-4 text-slate-500">{editingId ? 'Editar' : 'Novo'}</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div className="lg:col-span-2"><input type="text" required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome" /></div><div className="lg:col-span-1"><input type="text" className="w-full p-2 border rounded" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="CPF" /></div><div className="lg:col-span-1"><input type="date" className="w-full p-2 border rounded" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} /></div><div className="lg:col-span-4"><input type="text" className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Endereço" /></div><div className="lg:col-span-1"><input type="text" required className="w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Cargo" /></div><div className="lg:col-span-1"><select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="mensalista">Mensalista</option><option value="diarista">Diarista</option></select></div><div className="lg:col-span-1"><input type="number" step="0.01" required className="w-full p-2 border rounded" value={formData.baseValue} onChange={e => setFormData({...formData, baseValue: e.target.value})} placeholder="Valor (R$)" /></div><div className="lg:col-span-1"><input type="number" required className="w-full p-2 border rounded" value={formData.workHoursPerDay} onChange={e => setFormData({...formData, workHoursPerDay: e.target.value})} placeholder="Horas/Dia" /></div><div className="lg:col-span-4"><input type="text" className="w-full p-2 border rounded" value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} placeholder="Chave PIX" /></div></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button><button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold">Salvar</button></div></form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{employees.map(emp => (<div key={emp.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm"><div><h4 className="font-bold text-lg">{emp.name}</h4><p className="text-slate-500 text-sm">{emp.role}</p></div><div className="text-right flex flex-col items-end gap-2"><p className="font-bold text-slate-700">R$ {Number(emp.baseValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p><div className="flex gap-1"><button onClick={() => handleEdit(emp)} className="text-blue-500 p-2 bg-blue-50 rounded"><Pencil size={18}/></button><button onClick={() => handleDelete(emp.id)} className="text-red-400 p-2 hover:bg-red-50 rounded"><Trash2 size={18}/></button></div></div></div>))}</div>
    </div>
  );
}

function PayrollCalculator({ employees, advances, onGenerate }) {
  const [inputs, setInputs] = useState({});
  const [dates, setDates] = useState({ start: '', end: '' });
  const handleInputChange = (id, field, value) => setInputs(p => ({ ...p, [id]: { ...p[id], [field]: parseFloat(value) || 0 } }));
  
  const handleOvertimeHoursChange = (id, hours, emp) => {
    const h = parseFloat(hours) || 0;
    const daily = emp.type === 'mensalista' ? (emp.baseValue / 30) : emp.baseValue;
    const hourly = daily / (emp.workHoursPerDay || 8);
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
    const dailyRate = emp.type === 'mensalista' ? (emp.baseValue/30) : emp.baseValue;
    const gross = dailyRate * (d.days || 0);
    return { ...d, grossTotal: gross, netTotal: gross + (d.bonus||0) + (d.overtime||0) - (d.discount||0), advancesIncluded: d.advancesIncluded || [] };
  };

  const calculate = () => {
    if (!dates.start || !dates.end) return alert("Selecione datas.");
    const items = employees.map(e => ({ ...e, ...getVals(e), dailyRate: e.type === 'mensalista' ? (e.baseValue/30) : e.baseValue })).filter(i => i.days > 0 || i.netTotal > 0);
    if (items.length === 0) return alert("Preencha algo.");
    onGenerate({ startDate: dates.start, endDate: dates.end, items });
  };

  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-700 mb-6 border-b pb-4 flex items-center gap-2"><Calendar className="text-blue-600"/> Calcular Folha</h2>
        <div className="flex gap-4 mb-6"><div><label className="block text-sm font-bold">Início</label><input type="date" className="p-2 border rounded" onChange={e => setDates({...dates, start: e.target.value})}/></div><div><label className="block text-sm font-bold">Fim</label><input type="date" className="p-2 border rounded" onChange={e => setDates({...dates, end: e.target.value})}/></div></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-100 uppercase text-slate-600"><tr><th className="p-3">Nome</th><th className="p-3 w-16">Dias</th><th className="p-3 w-24">Hrs Ext</th><th className="p-3 w-28">R$ Extra</th><th className="p-3 w-28">Acresc.</th><th className="p-3 w-28">Desc.</th><th className="p-3 w-32 bg-yellow-100">Líquido</th></tr></thead><tbody>
          {employees.map(emp => {
            const v = getVals(emp); const p = getPending(emp.id); const done = v.advancesIncluded.length > 0;
            return (<tr key={emp.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{emp.name} {p.total > 0 && !done && <div onClick={() => handleApplyAdvances(emp.id, p.total, p.list)} className="cursor-pointer text-xs text-orange-600 flex items-center gap-1 mt-1"><AlertTriangle size={10}/> Vales: {money(p.total)}</div>} {done && <div className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={10}/> Descontado</div>}</td><td className="p-3"><input type="number" className="w-full p-1 border rounded text-center" onChange={e => handleInputChange(emp.id, 'days', e.target.value)}/></td><td className="p-3 bg-blue-50"><input type="number" className="w-full p-1 border border-blue-200 rounded text-center" onChange={e => handleOvertimeHoursChange(emp.id, e.target.value, emp)}/></td><td className="p-3 bg-blue-50"><input type="number" className="w-full p-1 border border-blue-200 rounded text-right font-bold text-blue-700" value={inputs[emp.id]?.overtime || ''} onChange={e => handleInputChange(emp.id, 'overtime', e.target.value)}/></td><td className="p-3"><input type="number" className="w-full p-1 border rounded text-right text-green-600" onChange={e => handleInputChange(emp.id, 'bonus', e.target.value)}/></td><td className="p-3"><input type="number" className="w-full p-1 border rounded text-right text-red-600 font-bold" value={inputs[emp.id]?.discount || ''} onChange={e => handleInputChange(emp.id, 'discount', e.target.value)}/></td><td className="p-3 bg-yellow-50 font-bold text-right text-slate-800">{money(v.netTotal)}</td></tr>);
          })}
        </tbody></table></div>
        <div className="mt-4 text-right"><button onClick={calculate} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg">Gerar Documentos</button></div>
      </div>
    </div>
  );
}

function GeneralReportView({ data, onViewHolerites, onBack }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const total = data.items.reduce((acc, i) => acc + (i.netTotal||0), 0);

  return (
    <div className="max-w-full mx-auto pb-20">
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg mb-6 print:hidden flex justify-between items-center"><button onClick={onBack} className="flex items-center gap-2 hover:text-slate-300 font-bold"><ArrowLeft size={20} /> Editar</button><div className="flex gap-4"><button onClick={() => window.print()} className="bg-green-600 px-4 py-2 rounded font-bold flex gap-2"><Printer size={20}/> Imprimir</button><button onClick={onViewHolerites} className="bg-blue-600 px-4 py-2 rounded font-bold flex gap-2">Ver Holerites <ArrowRight size={20}/></button></div></div>
      <div className="bg-white print:w-full"><div className="bg-black text-white p-2 font-bold uppercase text-center text-lg border-2 border-black flex justify-between"><span>Relatório Pagamento</span><span>{date(data.startDate)} à {date(data.endDate)}</span></div><table className="w-full border-collapse border-2 border-black text-xs md:text-sm font-sans"><thead><tr className="bg-[#0f5132] text-white uppercase text-center h-10"><th className="border border-white p-1">Nome</th><th className="border border-white p-1 w-12">Dias</th><th className="border border-white p-1 w-20">$ Dia</th><th className="border border-white p-1 w-24">Bruto</th><th className="border border-white p-1 w-24">Desconto</th><th className="border border-white p-1 w-24">Acresc.</th><th className="border border-white p-1 w-24">Extra</th><th className="border border-white p-1 w-28 bg-[#198754]">LÍQUIDO</th><th className="border border-white p-1 w-32">PIX</th></tr></thead><tbody>{data.items.map((i, idx) => (<tr key={idx} className="text-center hover:bg-yellow-50 font-medium text-black"><td className="border border-black p-1 text-left uppercase pl-2">{i.name}</td><td className="border border-black p-1 bg-[#d1e7dd]">{i.daysWorked}</td><td className="border border-black p-1 bg-yellow-200">{money(i.dailyRate)}</td><td className="border border-black p-1 bg-yellow-200">{money(i.grossTotal)}</td><td className="border border-black p-1 text-red-600">{i.discount > 0 ? `(${money(i.discount)})` : '-'}</td><td className="border border-black p-1 text-blue-600">{i.bonus > 0 ? money(i.bonus) : '-'}</td><td className="border border-black p-1 text-blue-600">{i.overtime > 0 ? money(i.overtime) : '-'}</td><td className="border border-black p-1 bg-yellow-400 font-bold text-base">{money(i.netTotal)}</td><td className="border border-black p-1 text-[10px] text-left break-all">{i.pix}</td></tr>))}<tr className="bg-black text-white font-bold uppercase"><td colSpan="7" className="p-2 text-right pr-4">Total Geral:</td><td className="p-2 bg-yellow-400 text-black border border-black">{money(total)}</td><td className="bg-white border border-black"></td></tr></tbody></table></div>
    </div>
  );
}

function HoleriteView({ data, onBack }) {
  const [companyName, setCompanyName] = useState('SUA EMPRESA AQUI LTDA');
  const [companyCNPJ, setCompanyCNPJ] = useState('00.000.000/0001-00');
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg mb-8 print:hidden flex justify-between">
        <div className="flex gap-4 items-center"><button onClick={onBack} className="flex items-center gap-2 hover:text-blue-300 font-bold"><ArrowLeft size={20} /> Voltar</button><div className="flex gap-2"><input type="text" className="text-black p-1 rounded text-sm w-48" value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Nome Empresa"/><input type="text" className="text-black p-1 rounded text-sm w-32" value={companyCNPJ} onChange={e=>setCompanyCNPJ(e.target.value)} placeholder="CNPJ"/></div></div>
        <button onClick={() => window.print()} className="bg-blue-600 px-6 py-2 rounded-lg font-bold shadow flex gap-2"><Printer size={20} /> Imprimir</button>
      </div>
      <div className="print:w-full">{data.items.map((item, index) => {
        const totalAdvances = (item.advancesIncluded || []).reduce((acc, c) => acc + (c.value||0), 0);
        const genericDiscount = (item.discount || 0) - totalAdvances;
        return (
          <div key={index} className="bg-white text-black font-sans text-xs mb-10 print:mb-4 print:break-inside-avoid max-w-[21cm] mx-auto border-2 border-black flex">
            <div className="flex-1">
              <div className="border-b border-black p-2 flex justify-between items-end"><div><h1 className="font-bold text-sm uppercase">{companyName}</h1><p className="text-[10px]">CNPJ: {companyCNPJ}</p></div><div className="text-right"><h2 className="font-bold text-sm uppercase">Recibo de Pagamento</h2><p className="text-[10px]">{date(data.startDate)} a {date(data.endDate)}</p></div></div>
              <div className="border-b border-black p-1 grid grid-cols-12 gap-1 bg-gray-50"><div className="col-span-1 font-bold">Cód.</div><div className="col-span-6 font-bold">Nome</div><div className="col-span-5 font-bold">Função</div><div className="col-span-1">00{index + 1}</div><div className="col-span-6 uppercase">{item.name}</div><div className="col-span-5 uppercase">{item.role}</div></div>
              <div className="relative min-h-[250px]"><div className="grid grid-cols-[50px_1fr_60px_80px_80px] border-b border-black font-bold bg-gray-100 text-[10px] text-center"><div className="border-r border-black p-1">Cód</div><div className="border-r border-black p-1 text-left pl-2">Descrição</div><div className="border-r border-black p-1">Ref</div><div className="border-r border-black p-1">Vencimentos</div><div className="p-1">Descontos</div></div>
              <div className="text-[11px]">
                 <div className="grid grid-cols-[50px_1fr_60px_80px_80px]"><div className="text-center border-r border-dashed border-gray-300">001</div><div className="pl-2 border-r border-dashed border-gray-300 uppercase">Salário / Diárias</div><div className="text-center border-r border-dashed border-gray-300">{item.daysWorked}d</div><div className="text-right border-r border-dashed border-gray-300 pr-2">{money(item.grossTotal)}</div><div className="text-right pr-2">0,00</div></div>
                 {(item.overtime||0)>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px]"><div className="text-center border-r border-dashed border-gray-300">002</div><div className="pl-2 border-r border-dashed border-gray-300 uppercase">Horas Extras</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-2">{money(item.overtime)}</div><div className="text-right pr-2">0,00</div></div>}
                 {(item.bonus||0)>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px]"><div className="text-center border-r border-dashed border-gray-300">003</div><div className="pl-2 border-r border-dashed border-gray-300 uppercase">Acréscimos</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-2">{money(item.bonus)}</div><div className="text-right pr-2">0,00</div></div>}
                 {(item.advancesIncluded||[]).map((adv,i)=>(<div key={i} className="grid grid-cols-[50px_1fr_60px_80px_80px]"><div className="text-center border-r border-dashed border-gray-300">05{i}</div><div className="pl-2 border-r border-dashed border-gray-300 uppercase text-red-800">Vale: {adv.description||'Adiantamento'}</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-2">0,00</div><div className="text-right pr-2">{money(adv.value)}</div></div>))}
                 {genericDiscount>0 && <div className="grid grid-cols-[50px_1fr_60px_80px_80px]"><div className="text-center border-r border-dashed border-gray-300">099</div><div className="pl-2 border-r border-dashed border-gray-300 uppercase">Outros Descontos</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-2">0,00</div><div className="text-right pr-2">{money(genericDiscount)}</div></div>}
              </div>
              <div className="absolute top-0 bottom-0 left-[50px] w-px bg-black opacity-20"></div><div className="absolute top-0 bottom-0 right-[220px] w-px bg-black opacity-20"></div><div className="absolute top-0 bottom-0 right-[160px] w-px bg-black opacity-20"></div><div className="absolute top-0 bottom-0 right-[80px] w-px bg-black opacity-20"></div></div>
              <div className="border-t border-black bg-gray-100 p-2 flex justify-between items-center border-b border-black"><div className="text-[10px]">PIX: <b>{item.pix || 'Não informado'}</b></div><div className="flex items-center gap-2 border border-black px-2 py-1 bg-white"><span className="uppercase font-bold text-xs">Líquido ⇨</span><span className="font-bold text-lg">{money(item.netTotal)}</span></div></div>
              <div className="p-2 text-[9px] text-justify leading-tight">DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DESTE RECIBO PARA PLENA QUITAÇÃO DO PERÍODO.</div>
              <div className="grid grid-cols-2 gap-8 mt-4 px-4 pb-2 items-end"><div className="text-center"><p className="border-t border-black pt-1">{new Date().toLocaleDateString()}</p><p className="text-[9px] uppercase">Data</p></div><div className="text-center"><p className="border-t border-black pt-1">{item.name}</p><p className="text-[9px] uppercase">Assinatura</p></div></div>
            </div>
            <div className="w-10 border-l-2 border-dashed border-black flex flex-col items-center justify-center relative bg-gray-50"><div className="absolute w-full h-full flex items-center justify-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}><p className="text-[8px] uppercase font-bold tracking-widest text-gray-400">VIA CONTABILIDADE</p></div></div>
          </div>
        );})}
      </div>
    </div>
  );
}