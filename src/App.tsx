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
  DollarSign, Copy, Send, Shield, UserX, RefreshCw, Save, History, Scissors, Eye
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 hover:rotate-0 transition-all"><FileText size={40} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-white mb-1">RH Fácil</h1>
          <p className="text-blue-200 text-sm">Gestão Inteligente</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div><label className="block text-xs font-bold text-blue-200 mb-1 uppercase">E-mail</label><input type="email" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}/></div>
          <div><label className="block text-xs font-bold text-blue-200 mb-1 uppercase">Senha</label><input type="password" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/></div>
          {error && <div className="text-white bg-red-500/80 p-3 rounded-lg text-sm text-center font-medium animate-pulse">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-white text-blue-900 font-bold py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl flex justify-center items-center gap-2">{loading ? 'Entrando...' : <><Lock size={20}/> Entrar</>}</button>
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

  if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-slate-50 text-blue-600 font-bold animate-pulse">Carregando...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 shadow-xl z-10 print:hidden">
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

// --- HISTÓRICO DE PAGAMENTOS (NOVO) ---
function PaymentHistory({ userId, onViewReport }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users', userId, 'payrolls'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const handleDelete = async (id) => {
    if(confirm("Deseja apagar este registro do histórico?")) {
      await deleteDoc(doc(db, 'users', userId, 'payrolls', id));
    }
  }

  const formatMoney = (v) => Number(v).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const formatDate = (d) => d ? d.split('-').reverse().join('/') : '';

  if(loading) return <div className="p-10 text-center">Carregando histórico...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2"><History className="text-blue-600"/> Histórico de Pagamentos</h2>
        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Nenhum pagamento fechado ainda.</div>
        ) : (
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">Folha: {formatDate(item.startDate)} à {formatDate(item.endDate)}</h4>
                  <p className="text-sm text-slate-500">Fechado em: {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs uppercase font-bold text-slate-400">Total Pago</span>
                    <p className="font-bold text-xl text-emerald-600">{formatMoney(item.totalValue)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => onViewReport(item)} className="px-4"><Eye size={18}/> Ver</Button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// --- RELATÓRIO GERAL (COM BOTÃO DE SALVAR) ---
function GeneralReportView({ data, onViewHolerites, onBack, companyData, userId }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const total = data.items.reduce((acc, i) => acc + (i.netTotal||0), 0);
  const copyPix = (pix) => { navigator.clipboard.writeText(pix); alert("PIX copiado!"); };

  const handleSaveHistory = async () => {
    if(confirm("Deseja fechar esta folha e salvar no histórico?")) {
      try {
        await addDoc(collection(db, 'users', userId, 'payrolls'), {
          ...data,
          totalValue: total,
          createdAt: new Date(),
          closedBy: companyData?.name || 'Sistema'
        });
        alert("Folha salva com sucesso no Histórico!");
      } catch(e) { alert("Erro ao salvar: " + e.message); }
    }
  };

  return (
    <div className="max-w-full mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 print:hidden flex justify-between items-center border border-slate-200">
        <div className="flex gap-2">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar</button>
          {!data.createdAt && ( // Só mostra o botão salvar se ainda não estiver salvo (não tiver data de criação)
             <Button variant="success" onClick={handleSaveHistory}><Save size={18}/> Salvar Fechamento</Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => window.print()}><Printer size={18}/> Imprimir</Button>
          <Button onClick={onViewHolerites}>Ver Holerites <ArrowRight size={18}/></Button>
        </div>
      </div>
      
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

// --- HOLERITE VIEW (2 VIAS POR PÁGINA) ---
function HoleriteView({ data, onBack, companyData }) {
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
  const date = (d) => d ? d.split('-').reverse().join('/') : '';
  const empName = companyData?.name || 'EMPRESA'; const empCnpj = companyData?.cnpj || ''; const empLogo = companyData?.logoUrl;

  const ReceiptCopy = ({ item, type }) => {
    const totalAdvances = (item.advancesIncluded || []).reduce((acc, c) => acc + (c.value||0), 0);
    const genericDiscount = (item.discount || 0) - totalAdvances;
    
    return (
      <div className="border-2 border-black p-4 h-[13cm] relative flex flex-col justify-between text-xs font-sans text-black bg-white">
        {/* Cabeçalho */}
        <div className="border-b border-black pb-2 flex justify-between items-end">
          <div className="flex items-center gap-3">
            {empLogo && <img src={empLogo} alt="Logo" className="h-8 w-auto mix-blend-multiply filter grayscale" />}
            <div><h1 className="font-bold text-sm uppercase">{empName}</h1><p className="text-[9px]">CNPJ: {empCnpj}</p></div>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-sm uppercase">Recibo de Pagamento</h2>
            <p className="text-[10px] font-bold">{date(data.startDate)} a {date(data.endDate)}</p>
            <span className="text-[8px] uppercase border border-black px-1 rounded">{type}</span>
          </div>
        </div>

        {/* Dados Funcionário */}
        <div className="grid grid-cols-12 gap-1 border-b border-black py-1">
          <div className="col-span-8"><span className="text-[9px] block text-gray-500 uppercase">Funcionário</span><span className="font-bold uppercase">{item.name}</span></div>
          <div className="col-span-4 text-right"><span className="text-[9px] block text-gray-500 uppercase">Cargo</span><span className="font-bold uppercase">{item.role}</span></div>
        </div>

        {/* Tabela de Valores */}
        <div className="flex-1 mt-1">
          <div className="grid grid-cols-[30px_1fr_40px_60px_60px] border-b border-black font-bold bg-gray-100 text-[9px] text-center uppercase">
            <div className="border-r border-black">Cód</div><div className="border-r border-black text-left pl-1">Descrição</div><div className="border-r border-black">Ref</div><div className="border-r border-black">Venc.</div><div>Desc.</div>
          </div>
          <div className="text-[10px]">
             {/* Linhas de Itens */}
             <div className="grid grid-cols-[30px_1fr_40px_60px_60px]">
                <div className="text-center border-r border-dashed border-gray-300">001</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Salário Base / Diárias</div><div className="text-center border-r border-dashed border-gray-300">{item.daysWorked}d</div><div className="text-right border-r border-dashed border-gray-300 pr-1">{money(item.grossTotal)}</div><div className="text-right pr-1"></div>
             </div>
             {(item.overtime||0)>0 && <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">002</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Horas Extras</div><div className="text-center border-r border-dashed border-gray-300">{item.overtimeHours}h</div><div className="text-right border-r border-dashed border-gray-300 pr-1">{money(item.overtime)}</div><div className="text-right pr-1"></div></div>}
             {(item.bonus||0)>0 && <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">003</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Bônus / Acréscimos</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-1">{money(item.bonus)}</div><div className="text-right pr-1"></div></div>}
             {(item.advancesIncluded||[]).map((adv,i)=>(<div key={i} className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">05{i}</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Adiantamento ({adv.description||'Vale'})</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-1"></div><div className="text-right pr-1">{money(adv.value)}</div></div>))}
             {genericDiscount>0 && <div className="grid grid-cols-[30px_1fr_40px_60px_60px]"><div className="text-center border-r border-dashed border-gray-300">099</div><div className="pl-1 border-r border-dashed border-gray-300 uppercase">Outros Descontos</div><div className="text-center border-r border-dashed border-gray-300">-</div><div className="text-right border-r border-dashed border-gray-300 pr-1"></div><div className="text-right pr-1">{money(genericDiscount)}</div></div>}
          </div>
        </div>

        {/* Rodapé Totais */}
        <div className="border-t border-black pt-1 mb-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold bg-gray-100 p-1 border border-black">
             <span>Líquido a Receber</span>
             <span className="text-base">{money(item.netTotal)}</span>
          </div>
          <div className="text-[8px] mt-1 flex gap-4 text-gray-500">
             <span>PIX: {item.pix || 'N/I'}</span>
             <span>Ref: {item.type}</span>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="text-[8px] text-justify leading-tight uppercase mb-2">
          Declaro ter recebido a importância líquida discriminada neste recibo para plena e geral quitação.
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
           <div className="text-center border-t border-black pt-1 text-[8px]">{new Date().toLocaleDateString()}<br/>DATA</div>
           <div className="text-center border-t border-black pt-1 text-[8px]">{item.name}<br/>ASSINATURA</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8 print:hidden flex justify-between items-center border border-slate-200">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition"><ArrowLeft size={20} /> Voltar</button>
        <Button onClick={() => window.print()}><Printer size={18} /> Imprimir Todos</Button>
      </div>

      <div className="print:w-full space-y-0">
        {data.items.map((item, index) => (
          <div key={index} className="print:break-after-page print:h-screen print:flex print:flex-col print:justify-between mb-8 bg-white p-8 print:p-0 shadow-xl print:shadow-none">
            {/* VIA COLABORADOR */}
            <ReceiptCopy item={item} type="VIA DO COLABORADOR" />
            
            {/* LINHA DE CORTE */}
            <div className="h-10 flex items-center justify-center relative print:my-2">
               <div className="w-full border-t-2 border-dashed border-gray-400 absolute"></div>
               <Scissors className="bg-white text-gray-500 relative z-10 px-2 rotate-90" size={32} />
            </div>

            {/* VIA EMPREGADOR */}
            <ReceiptCopy item={item} type="VIA DO EMPREGADOR" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- DEMAIS COMPONENTES (SEM ALTERAÇÕES LÓGICAS, SÓ O QUE JÁ TINHA) ---
// Configuração da Empresa, Dashboard, EmployeeManager, PayrollCalculator (Mantidos do anterior mas ajustados os imports e inputs se necessário)

function CompanySettings({ userId, currentData, onSave, currentUser }) {
  const [formData, setFormData] = useState({ name: '', cnpj: '', address: '', phone: '', logoUrl: '' });
  const [securityData, setSecurityData] = useState({ newEmail: '', newPassword: '', currentPassword: '' });
  useEffect(() => { if (currentData) setFormData({ name: currentData.name || '', cnpj: currentData.cnpj || '', address: currentData.address || '', phone: currentData.phone || '', logoUrl: currentData.logoUrl || '' }); }, [currentData]);
  const handleSaveProfile = async (e) => { e.preventDefault(); try { await setDoc(doc(db, 'users', userId, 'settings', 'profile'), formData); alert("Salvo!"); onSave(); } catch (error) { alert("Erro: " + error.message); } };
  const handleUpdateSecurity = async (e) => { e.preventDefault(); if (!securityData.currentPassword) return alert("Digite a senha atual."); try { const credential = EmailAuthProvider.credential(currentUser.email, securityData.currentPassword); await reauthenticateWithCredential(currentUser, credential); if (securityData.newEmail && securityData.newEmail !== currentUser.email) await updateEmail(currentUser, securityData.newEmail); if (securityData.newPassword) await updatePassword(currentUser, securityData.newPassword); alert("Acesso atualizado!"); setSecurityData({ newEmail: '', newPassword: '', currentPassword: '' }); } catch (error) { alert("Erro: " + error.message); } };
  return ( <div className="max-w-4xl mx-auto animate-fade-in space-y-8"><Card><h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Building2 className="text-blue-600"/> Dados da Empresa</h2><form onSubmit={handleSaveProfile} className="space-y-4"><div><label className="block text-sm font-bold mb-1">Nome</label><input type="text" required className="w-full p-3 border rounded-lg bg-slate-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1">CNPJ</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})}/></div><div><label className="block text-sm font-bold mb-1">Telefone</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div></div><div><label className="block text-sm font-bold mb-1">Endereço</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/></div><div><label className="block text-sm font-bold mb-1">URL Logo</label><input type="text" className="w-full p-3 border rounded-lg bg-slate-50" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})}/></div><div className="pt-4 flex gap-2 justify-end"><Button variant="secondary" type="button" onClick={onSave}>Voltar</Button><Button type="submit">Salvar</Button></div></form></Card><Card className="border-l-4 border-l-orange-500"><h2 className="text-2xl font-bold text-slate-700 mb-2 flex items-center gap-2"><Shield className="text-orange-500"/> Segurança</h2><form onSubmit={handleUpdateSecurity} className="space-y-4 pt-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1">Novo E-mail</label><input type="email" className="w-full p-3 border rounded-lg" value={securityData.newEmail} onChange={e => setSecurityData({...securityData, newEmail: e.target.value})} placeholder={currentUser.email} /></div><div><label className="block text-sm font-bold mb-1">Nova Senha</label><input type="password" className="w-full p-3 border rounded-lg" value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} /></div></div><div className="bg-orange-50 p-4 rounded-lg mt-4"><label className="block text-sm font-bold mb-1 text-orange-800">Senha Atual</label><input type="password" required className="w-full p-3 border border-orange-200 rounded-lg bg-white" value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} /></div><div className="pt-2 flex justify-end"><Button type="submit" className="bg-orange-600 hover:bg-orange-700 border-none">Atualizar Acesso</Button></div></form></Card></div> );
}

function Dashboard({ changeView, employees, userId }) {
  const [isValeOpen, setIsValeOpen] = useState(false);
  const [valeData, setValeData] = useState({ employeeId: '', value: '', description: '', targetMonth: new Date().toISOString().slice(0, 7) });
  const handleSaveVale = async (e) => { e.preventDefault(); if (!valeData.employeeId || !valeData.value) return alert("Preencha os dados."); try { await addDoc(collection(db, 'users', userId, 'advances'), { ...valeData, value: parseFloat(valeData.value), createdAt: new Date(), status: 'pending' }); alert("Vale lançado!"); setIsValeOpen(false); setValeData({ ...valeData, value: '', description: '' }); } catch (error) { alert("Erro: " + error.message); } };
  const activeEmployees = employees.filter(e => e.status !== 'inactive');
  const totalEmployees = activeEmployees.length;
  const totalPayrollEstimate = activeEmployees.reduce((acc, emp) => acc + (emp.baseValue || 0), 0);
  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4"><div><h2 className="text-3xl font-bold text-slate-800">Visão Geral</h2><p className="text-slate-500 mt-1">Bem-vindo ao painel de controle.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none"><div className="flex justify-between items-start"><div><p className="text-blue-100 text-sm font-medium mb-1">Funcionários Ativos</p><h3 className="text-4xl font-bold">{totalEmployees}</h3></div><div className="bg-white/20 p-2 rounded-lg"><Users size={24}/></div></div></Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none"><div className="flex justify-between items-start"><div><p className="text-emerald-100 text-sm font-medium mb-1">Folha Estimada</p><h3 className="text-4xl font-bold">R$ {totalPayrollEstimate.toLocaleString('pt-BR', {maximumFractionDigits:0})}</h3></div><div className="bg-white/20 p-2 rounded-lg"><DollarSign size={24}/></div></div></Card>
        <Card onClick={() => changeView('history')} className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none cursor-pointer group"><div className="flex justify-between items-start"><div><p className="text-purple-100 text-sm font-medium mb-1">Histórico</p><h3 className="text-3xl font-bold group-hover:scale-105 transition-transform">Folhas Fechadas</h3></div><div className="bg-white/20 p-2 rounded-lg group-hover:rotate-12 transition-transform"><History size={24}/></div></div><div className="mt-4 text-xs text-purple-100 bg-white/10 inline-block px-2 py-1 rounded">Ver pagamentos anteriores</div></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card onClick={() => changeView('employees')} className="group"><div className="flex items-center gap-4"><div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><Users size={32}/></div><div><h3 className="text-xl font-bold text-slate-800">Gerenciar Equipe</h3><p className="text-slate-500 text-sm">Adicionar, editar ou desligar colaboradores.</p></div></div></Card><Card onClick={() => changeView('payroll')} className="group"><div className="flex items-center gap-4"><div className="bg-emerald-100 p-4 rounded-full text-emerald-600 group-hover:scale-110 transition-transform"><Calculator size={32}/></div><div><h3 className="text-xl font-bold text-slate-800">Calcular Pagamentos</h3><p className="text-slate-500 text-sm">Fechar a folha, horas extras e imprimir recibos.</p></div></div></Card></div>
      {isValeOpen && ( <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up"><h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Receipt size={20}/></div> Novo Vale</h3><form onSubmit={handleSaveVale} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Funcionário</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" required value={valeData.employeeId} onChange={e => setValeData({...valeData, employeeId: e.target.value})}><option value="">Selecione...</option>{activeEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label><input type="number" step="0.01" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.value} onChange={e => setValeData({...valeData, value: e.target.value})} placeholder="0.00"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descontar em</label><input type="month" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.targetMonth} onChange={e => setValeData({...valeData, targetMonth: e.target.value})}/></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label><input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={valeData.description} onChange={e => setValeData({...valeData, description: e.target.value})} placeholder="Ex: Adiantamento"/></div><div className="flex justify-end gap-2 mt-6"><Button variant="secondary" type="button" onClick={() => setIsValeOpen(false)}>Cancelar</Button><Button type="submit" className="bg-orange-500 hover:bg-orange-600 border-none shadow-orange-500/30">Confirmar</Button></div></form></div></div> )}
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={24}/></div><h2 className="text-2xl font-bold text-slate-700">Equipe</h2></div><Button onClick={handleNew}><Plus size={20} /> Novo Cadastro</Button></div>
      {isFormOpen && ( <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"><h3 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3><form onSubmit={handleSubmit} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label><input type="text" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admissão</label><input type="date" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} /></div><div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label><input type="text" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Contrato</label><select className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="mensalista">Mensalista</option><option value="diarista">Diarista</option></select></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salário Base (R$)</label><input type="number" step="0.01" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.baseValue} onChange={e => setFormData({...formData, baseValue: e.target.value})} /></div><div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horas/Dia</label><input type="number" required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.workHoursPerDay} onChange={e => setFormData({...formData, workHoursPerDay: e.target.value})} /></div><div className="lg:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chave PIX</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} /></div></div><div className="flex justify-end gap-3 pt-4 border-t"><Button variant="secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit">Salvar Dados</Button></div></form></div></div> )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{employees.map(emp => { const isInactive = emp.status === 'inactive'; return (<Card key={emp.id} className={`group relative overflow-hidden ${isInactive ? 'bg-slate-100 opacity-80' : ''}`}>{isInactive && <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">DESLIGADO</div>}<div><div className="flex justify-between items-start mb-2"><div className={`font-bold px-2 py-1 rounded text-xs uppercase tracking-wide ${isInactive ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>{emp.role}</div><div className="text-slate-400"><Users size={18}/></div></div><h4 className={`font-bold text-lg mb-1 ${isInactive ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{emp.name}</h4><div className="text-xs text-slate-400 flex gap-2 mb-4"><span>{emp.workHoursPerDay}h/dia</span><span>•</span><span>{emp.type}</span></div><div className="border-t pt-3 flex justify-between items-center"><p className="font-mono font-bold text-slate-700 text-lg">R$ {Number(emp.baseValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p><div className="flex gap-2"><button onClick={() => handleEdit(emp)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition" title="Editar"><Pencil size={18}/></button><button onClick={() => handleToggleStatus(emp)} className={`p-2 rounded-lg transition text-white ${isInactive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`} title={isInactive ? "Reativar" : "Desligar"}>{isInactive ? <RefreshCw size={18} /> : <div className="flex items-center gap-1 text-xs font-bold"><UserX size={16}/></div>}</button></div></div></div></Card>); })}</div>
    </div>
  );
}

function PayrollCalculator({ employees, advances, onGenerate, companyData, inputs, setInputs, dates, setDates }) {
  const handleInputChange = (id, field, value) => setInputs(p => ({ ...p, [id]: { ...p[id], [field]: parseFloat(value) || 0 } }));
  const handleOvertimeHoursChange = (id, hours, emp) => { const h = parseFloat(hours) || 0; const daily = emp.type === 'mensalista' ? (emp.baseValue / 30) : emp.baseValue; const hourly = daily / (emp.workHoursPerDay || 8); setInputs(p => ({ ...p, [id]: { ...p[id], overtimeHours: h, overtime: parseFloat((hourly * h).toFixed(2)) } })); };
  const handleApplyAdvances = (empId, total, list) => { if(confirm(`Descontar R$ ${total.toFixed(2)}?`)) setInputs(p => ({ ...p, [empId]: { ...p[empId], discount: (p[empId]?.discount || 0) + total, advancesIncluded: list } })); };
  const getPending = (empId) => { if (!dates.start) return { total: 0, list: [] }; const list = advances.filter(a => a.employeeId === empId && a.targetMonth === dates.start.slice(0,7) && a.status === 'pending'); return { total: list.reduce((acc, c) => acc + c.value, 0), list }; };
  const getVals = (emp) => { const d = inputs[emp.id] || {}; const dailyRate = emp.type === 'mensalista' ? (emp.baseValue/30) : emp.baseValue; const gross = dailyRate * (d.days || 0); return { ...d, grossTotal: gross, netTotal: gross + (d.bonus||0) + (d.overtime||0) - (d.discount||0), advancesIncluded: d.advancesIncluded || [] }; };
  const activeEmployees = employees.filter(e => e.status !== 'inactive');
  const totalPayroll = activeEmployees.reduce((acc, emp) => acc + getVals(emp).netTotal, 0);
  const calculate = () => { if (!dates.start || !dates.end) return alert("Selecione datas."); if(!companyData?.name) alert("Atenção: Configure a empresa antes!"); const items = activeEmployees.map(e => ({ ...e, ...getVals(e), dailyRate: e.type === 'mensalista' ? (e.baseValue/30) : e.baseValue })).filter(i => i.days > 0 || i.netTotal > 0); if (items.length === 0) return alert("Preencha algo."); onGenerate({ startDate: dates.start, endDate: dates.end, items }); };
  const money = (v) => Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-slate-100 pb-6"><div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Calculator className="text-blue-600"/> Calcular Folha</h2><p className="text-slate-500 text-sm mt-1">Defina o período e preencha os dados.</p></div><div className="flex gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200"><div><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Início</label><input type="date" value={dates.start} className="bg-transparent font-bold text-slate-700 outline-none" onChange={e => setDates({...dates, start: e.target.value})}/></div><div className="w-px bg-slate-300"></div><div><label className="block text-[10px] font-bold uppercase text-slate-400 px-1">Fim</label><input type="date" value={dates.end} className="bg-transparent font-bold text-slate-700 outline-none" onChange={e => setDates({...dates, end: e.target.value})}/></div></div></div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold"><tr><th className="p-4">Colaborador</th><th className="p-4 w-32 text-center">Dias</th><th className="p-4 w-32 text-center">Hrs Ext</th><th className="p-4 w-32 text-right">R$ Extra</th><th className="p-4 w-32 text-right">Bônus</th><th className="p-4 w-32 text-right">Desc.</th><th className="p-4 w-40 text-right bg-blue-50/50">Líquido</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {activeEmployees.map(emp => { const v = getVals(emp); const p = getPending(emp.id); const done = v.advancesIncluded.length > 0; return (<tr key={emp.id} className="hover:bg-slate-50 transition-colors"><td className="p-4"><div className="font-bold text-slate-700">{emp.name}</div><div className="text-xs text-slate-400 mb-1">{emp.role}</div>{p.total > 0 && !done && <div onClick={() => handleApplyAdvances(emp.id, p.total, p.list)} className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-200 transition"><AlertTriangle size={12}/> Vale: {money(p.total)}</div>} {done && <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle size={12}/> Descontado</div>}</td><td className="p-4"><input type="number" className="w-full p-3 border rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={inputs[emp.id]?.days || ''} placeholder="0" onChange={e => handleInputChange(emp.id, 'days', e.target.value)}/></td><td className="p-4"><input type="number" className="w-full p-3 border border-blue-200 bg-blue-50/50 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" onChange={e => handleOvertimeHoursChange(emp.id, e.target.value, emp)}/></td><td className="p-4"><input type="number" className="w-full p-3 border border-blue-200 bg-blue-50/50 rounded-lg text-right font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" value={inputs[emp.id]?.overtime || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'overtime', e.target.value)}/></td><td className="p-4"><input type="number" className="w-full p-3 border border-emerald-200 bg-emerald-50/50 rounded-lg text-right font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" value={inputs[emp.id]?.bonus || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'bonus', e.target.value)}/></td><td className="p-4"><input type="number" className="w-full p-3 border border-red-200 bg-red-50/50 rounded-lg text-right font-bold text-red-600 focus:ring-2 focus:ring-red-500 outline-none" value={inputs[emp.id]?.discount || ''} placeholder="0,00" onChange={e => handleInputChange(emp.id, 'discount', e.target.value)}/></td><td className="p-4 text-right bg-blue-50/30"><span className="font-mono font-bold text-lg text-slate-800">{money(v.netTotal)}</span></td></tr>); })}
            </tbody>
          </table>
        </div>
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-2xl flex justify-end items-center gap-6 z-50"><div className="text-right"><span className="block text-xs font-bold text-slate-400 uppercase">Total da Folha</span><span className="text-2xl font-bold text-slate-800">{money(totalPayroll)}</span></div><Button onClick={calculate} className="shadow-xl px-8 py-3 text-lg bg-green-600 hover:bg-green-700">Gerar Documentos <ArrowRight size={20}/></Button></div>
      </Card>
    </div>
  );
}