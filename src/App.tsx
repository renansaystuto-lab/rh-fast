import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  Users,
  Calculator,
  FileText,
  Plus,
  Trash2,
  Printer,
  Calendar,
  ArrowLeft,
  Table,
  ArrowRight,
  Pencil,
  Receipt,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// --- SUA CONFIGURAÇÃO FIXA DO FIREBASE ---
const firebaseConfig = {
  apiKey: 'AIzaSyBXOGHkqIIqZvKzBKGMDHvVUU0kqTNGgz4',
  authDomain: 'rh-fast-44bce.firebaseapp.com',
  projectId: 'rh-fast-44bce',
  storageBucket: 'rh-fast-44bce.firebasestorage.app',
  messagingSenderId: '289648358268',
  appId: '1:289648358268:web:92d3cd6fdf5450003faaf9',
  measurementId: 'G-FZYBH4XWP9',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Componente Principal ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error(err));
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;

    const qEmp = collection(db, 'users', user.uid, 'employees');
    const unsubEmp = onSnapshot(qEmp, (snapshot) => {
      setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qAdv = collection(db, 'users', user.uid, 'advances');
    const unsubAdv = onSnapshot(qAdv, (snapshot) => {
      setAdvances(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubEmp();
      unsubAdv();
    };
  }, [user]);

  const handleGenerateReport = (data) => {
    setReportData(data);
    setView('report_general');
  };

  const renderView = () => {
    switch (view) {
      case 'employees':
        return <EmployeeManager employees={employees} userId={user?.uid} />;
      case 'payroll':
        return (
          <PayrollCalculator
            employees={employees}
            advances={advances}
            onGenerate={handleGenerateReport}
          />
        );
      case 'report_general':
        return (
          <GeneralReportView
            data={reportData}
            onViewHolerites={() => setView('print_holerites')}
            onBack={() => setView('payroll')}
          />
        );
      case 'print_holerites':
        return (
          <HoleriteView
            data={reportData}
            onBack={() => setView('report_general')}
          />
        );
      default:
        return (
          <Dashboard
            changeView={setView}
            employees={employees}
            userId={user?.uid}
          />
        );
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Carregando sistema RH...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-blue-700 text-white p-4 shadow-lg print:hidden">
        <div className="w-full px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" /> RH Fácil
          </h1>
          <nav className="flex gap-4 text-sm">
            <button
              onClick={() => setView('dashboard')}
              className={`hover:text-blue-200 ${
                view === 'dashboard' ? 'underline font-bold' : ''
              }`}
            >
              Início
            </button>
            <button
              onClick={() => setView('employees')}
              className={`hover:text-blue-200 ${
                view === 'employees' ? 'underline font-bold' : ''
              }`}
            >
              Funcionários
            </button>
            <button
              onClick={() => setView('payroll')}
              className={`hover:text-blue-200 ${
                view.includes('report') || view === 'payroll'
                  ? 'underline font-bold'
                  : ''
              }`}
            >
              Folha & Relatórios
            </button>
          </nav>
        </div>
      </header>
      <main className="w-full px-6 py-6">{renderView()}</main>
    </div>
  );
}

// 1. Dashboard
function Dashboard({ changeView, employees, userId }) {
  const [isValeOpen, setIsValeOpen] = useState(false);
  const [valeData, setValeData] = useState({
    employeeId: '',
    value: '',
    description: '',
    targetMonth: new Date().toISOString().slice(0, 7),
  });

  const handleSaveVale = async (e) => {
    e.preventDefault();
    if (!valeData.employeeId || !valeData.value)
      return alert('Selecione funcionário e valor.');

    try {
      await addDoc(collection(db, 'users', userId, 'advances'), {
        ...valeData,
        value: parseFloat(valeData.value),
        createdAt: new Date(),
        status: 'pending',
      });
      alert('Vale lançado com sucesso!');
      setIsValeOpen(false);
      setValeData({ ...valeData, value: '', description: '' });
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-slate-700">
          Painel de Controle
        </h2>
        <p className="text-slate-500">
          Gerencie pagamentos, adiantamentos e equipe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => changeView('employees')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Funcionários</h3>
            <p className="text-slate-500 text-sm">
              {employees.length} cadastrados
            </p>
          </div>
        </div>

        <div
          onClick={() => setIsValeOpen(true)}
          className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-200 cursor-pointer hover:shadow-lg transition flex items-center gap-4 group"
        >
          <div className="bg-orange-100 p-3 rounded-full text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition">
            <Receipt size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-900">Lançar Vale</h3>
            <p className="text-orange-700 text-sm">Adiantamentos e Compras</p>
          </div>
        </div>

        <div
          onClick={() => changeView('payroll')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <Table size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Calcular Folha</h3>
            <p className="text-slate-500 text-sm">Fechar mês e relatórios</p>
          </div>
        </div>
      </div>

      {isValeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Receipt className="text-orange-500" /> Novo Vale / Adiantamento
            </h3>
            <form onSubmit={handleSaveVale} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Funcionário
                </label>
                <select
                  className="w-full p-2 border rounded"
                  required
                  value={valeData.employeeId}
                  onChange={(e) =>
                    setValeData({ ...valeData, employeeId: e.target.value })
                  }
                >
                  <option value="">Selecione...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full p-2 border rounded"
                    value={valeData.value}
                    onChange={(e) =>
                      setValeData({ ...valeData, value: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Descontar em
                  </label>
                  <input
                    type="month"
                    required
                    className="w-full p-2 border rounded"
                    value={valeData.targetMonth}
                    onChange={(e) =>
                      setValeData({ ...valeData, targetMonth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={valeData.description}
                  onChange={(e) =>
                    setValeData({ ...valeData, description: e.target.value })
                  }
                  placeholder="Ex: Gasolina, Almoço, Adiantamento..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsValeOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white font-bold rounded hover:bg-orange-700"
                >
                  Salvar Vale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Gerenciador de Funcionários
function EmployeeManager({ employees, userId }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialFormState = {
    name: '',
    role: '',
    baseValue: '',
    type: 'mensalista',
    pix: '',
    cpf: '',
    address: '',
    admissionDate: '',
    workHoursPerDay: '8',
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (employee) => {
    setFormData({ ...employee });
    setEditingId(employee.id);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.baseValue) return;
    const dataToSave = {
      ...formData,
      baseValue: parseFloat(formData.baseValue),
      workHoursPerDay: parseFloat(formData.workHoursPerDay) || 8,
      updatedAt: new Date(),
    };
    try {
      if (editingId) {
        await updateDoc(
          doc(db, 'users', userId, 'employees', editingId),
          dataToSave
        );
        alert('Atualizado!');
      } else {
        await addDoc(collection(db, 'users', userId, 'employees'), {
          ...dataToSave,
          createdAt: new Date(),
        });
        alert('Cadastrado!');
      }
      setFormData(initialFormState);
      setIsFormOpen(false);
      setEditingId(null);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir funcionário?'))
      await deleteDoc(doc(db, 'users', userId, 'employees', id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-700">Sua Equipe</h2>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={20} /> Novo Funcionário
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-fade-in"
        >
          <h3 className="font-semibold mb-6 text-sm uppercase tracking-wide text-slate-500 border-b pb-2">
            {editingId ? 'Editar' : 'Cadastrar'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold mb-1">Nome</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold mb-1">CPF</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold mb-1">Admissão</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={formData.admissionDate}
                onChange={(e) =>
                  setFormData({ ...formData, admissionDate: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold mb-1">Endereço</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold mb-1">Cargo</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold mb-1">Tipo</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="mensalista">Mensalista</option>
                <option value="diarista">Diarista</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold mb-1">Base (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full p-2 border rounded"
                value={formData.baseValue}
                onChange={(e) =>
                  setFormData({ ...formData, baseValue: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold mb-1">
                Jornada (h)
              </label>
              <input
                type="number"
                required
                className="w-full p-2 border rounded"
                value={formData.workHoursPerDay}
                onChange={(e) =>
                  setFormData({ ...formData, workHoursPerDay: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold mb-1">PIX</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.pix}
                onChange={(e) =>
                  setFormData({ ...formData, pix: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded font-bold"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm relative group hover:border-blue-300 transition"
          >
            <div>
              <h4 className="font-bold text-lg">{emp.name}</h4>
              <p className="text-slate-500 text-sm">{emp.role}</p>
              <div className="text-xs text-slate-400 mt-1 flex gap-2">
                <span>{emp.workHoursPerDay}h/dia</span>
                <span>•</span>
                <span>
                  {emp.admissionDate
                    ? new Date(emp.admissionDate).toLocaleDateString('pt-BR')
                    : 'Adm: N/I'}
                </span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <p className="font-mono font-bold text-slate-700">
                {Number(emp.baseValue).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(emp)}
                  className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Calculadora
function PayrollCalculator({ employees, advances, onGenerate }) {
  const [inputs, setInputs] = useState({});
  const [dates, setDates] = useState({ start: '', end: '' });

  const handleInputChange = (id, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleOvertimeHoursChange = (id, hours, emp) => {
    const hoursNum = parseFloat(hours) || 0;
    let dailyRate =
      emp.type === 'mensalista' ? emp.baseValue / 30 : emp.baseValue;
    let hourlyRate = dailyRate / (emp.workHoursPerDay || 8);
    let overtimeValue = hourlyRate * hoursNum;
    setInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        overtimeHours: hoursNum,
        overtime: parseFloat(overtimeValue.toFixed(2)),
      },
    }));
  };

  const handleApplyAdvances = (empId, totalAdvanceValue, advanceList) => {
    if (
      window.confirm(
        `Confirma descontar R$ ${totalAdvanceValue.toFixed(2)} referente a ${
          advanceList.length
        } vales?`
      )
    ) {
      setInputs((prev) => ({
        ...prev,
        [empId]: {
          ...prev[empId],
          discount: (prev[empId]?.discount || 0) + totalAdvanceValue,
          advancesIncluded: advanceList,
        },
      }));
    }
  };

  const getCalculatedValues = (emp) => {
    const data = inputs[emp.id] || {};
    const days = data.days || 0;
    const discount = data.discount || 0;
    const bonus = data.bonus || 0;
    const overtime = data.overtime || 0;
    let grossTotal = 0;

    if (emp.type === 'mensalista') {
      grossTotal = (emp.baseValue / 30) * days;
    } else {
      grossTotal = emp.baseValue * days;
    }
    const netTotal = grossTotal + bonus + overtime - discount;
    return {
      days,
      discount,
      bonus,
      overtime,
      grossTotal,
      netTotal,
      dailyRate: emp.type === 'mensalista' ? emp.baseValue / 30 : emp.baseValue,
      advancesIncluded: data.advancesIncluded || [],
    };
  };

  const getPendingAdvances = (empId) => {
    if (!dates.start) return { total: 0, list: [] };
    const selectedMonth = dates.start.slice(0, 7);
    const list = advances.filter(
      (a) =>
        a.employeeId === empId &&
        a.targetMonth === selectedMonth &&
        a.status === 'pending'
    );
    const total = list.reduce((acc, curr) => acc + curr.value, 0);
    return { total, list };
  };

  const totalPayroll = employees.reduce(
    (acc, emp) => acc + getCalculatedValues(emp).netTotal,
    0
  );

  const calculate = () => {
    if (!dates.start || !dates.end) return alert('Selecione o período.');
    const results = employees.map((emp) => ({
      ...emp,
      ...getCalculatedValues(emp),
    }));
    const validResults = results.filter(
      (r) => r.daysWorked > 0 || r.netTotal > 0
    );
    if (validResults.length === 0) return alert('Preencha os dados.');
    onGenerate({
      startDate: dates.start,
      endDate: dates.end,
      items: validResults,
    });
  };

  // Função segura para formatar dinheiro
  const formatMoney = (val) =>
    Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-700 mb-6 border-b pb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" /> Calcular Folha
        </h2>
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold mb-1">Início</label>
            <input
              type="date"
              className="p-2 border rounded"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Fim</label>
            <input
              type="date"
              className="p-2 border rounded"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 uppercase text-slate-600">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3 w-16">Dias</th>
                <th className="p-3 w-24">Hrs Extra</th>
                <th className="p-3 w-28">Valor Extra</th>
                <th className="p-3 w-28">Acresc.</th>
                <th className="p-3 w-28">Desc.</th>
                <th className="p-3 w-32 bg-yellow-100 border-l">
                  Total Líquido
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const values = getCalculatedValues(emp);
                const pendingAdv = getPendingAdvances(emp.id);
                const alreadyIncluded = values.advancesIncluded.length > 0;

                return (
                  <tr key={emp.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium relative">
                      {emp.name}
                      {pendingAdv.total > 0 && !alreadyIncluded && (
                        <div
                          onClick={() =>
                            handleApplyAdvances(
                              emp.id,
                              pendingAdv.total,
                              pendingAdv.list
                            )
                          }
                          className="mt-1 cursor-pointer bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded border border-orange-200 flex items-center gap-1 animate-pulse hover:bg-orange-200"
                        >
                          <AlertTriangle size={12} /> Há Vales:{' '}
                          {formatMoney(pendingAdv.total)}
                        </div>
                      )}
                      {alreadyIncluded && (
                        <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle size={10} /> Vales descontados
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-center"
                        placeholder="0"
                        onChange={(e) =>
                          handleInputChange(emp.id, 'days', e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3 bg-blue-50">
                      <input
                        type="number"
                        className="w-full p-1 border border-blue-200 rounded text-center bg-white"
                        placeholder="0h"
                        onChange={(e) =>
                          handleOvertimeHoursChange(emp.id, e.target.value, emp)
                        }
                      />
                    </td>
                    <td className="p-3 bg-blue-50">
                      <input
                        type="number"
                        className="w-full p-1 border border-blue-200 rounded text-right text-blue-700 font-bold"
                        placeholder="0.00"
                        value={inputs[emp.id]?.overtime || ''}
                        onChange={(e) =>
                          handleInputChange(emp.id, 'overtime', e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-right text-green-600"
                        placeholder="0.00"
                        onChange={(e) =>
                          handleInputChange(emp.id, 'bonus', e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-right text-red-600 font-bold"
                        value={inputs[emp.id]?.discount || ''}
                        placeholder="0.00"
                        onChange={(e) =>
                          handleInputChange(emp.id, 'discount', e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3 bg-yellow-50 font-bold text-right border-l text-slate-800">
                      {formatMoney(values.netTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-bold text-yellow-800 uppercase text-xs tracking-wider">
              Total Geral da Prévia
            </span>
            <div className="text-2xl font-bold text-slate-800">
              {formatMoney(totalPayroll)}
            </div>
          </div>
          <button
            onClick={calculate}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700"
          >
            Gerar Documentos
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. RELATÓRIO GERAL
function GeneralReportView({ data, onViewHolerites, onBack }) {
  // CORREÇÃO: Função segura que não trava se o valor for undefined
  const formatMoney = (val) =>
    Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  const formatDate = (dateString) =>
    dateString ? dateString.split('-').reverse().join('/') : '';
  const totalLiquidoGeral = data.items.reduce(
    (acc, item) => acc + (item.netTotal || 0),
    0
  );

  return (
    <div className="max-w-full mx-auto pb-20">
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg mb-6 print:hidden flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:text-slate-300 font-bold"
        >
          <ArrowLeft size={20} /> Editar
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="bg-green-600 px-4 py-2 rounded font-bold hover:bg-green-700 flex gap-2"
          >
            <Printer size={20} /> Imprimir
          </button>
          <button
            onClick={onViewHolerites}
            className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-700 flex gap-2"
          >
            Ver Holerites <ArrowRight size={20} />
          </button>
        </div>
      </div>
      <div className="bg-white print:w-full">
        <div className="bg-black text-white p-2 font-bold uppercase text-center text-lg border-2 border-black flex justify-between">
          <span>Relatório Pagamento</span>
          <span>
            Período: {formatDate(data.startDate)} à {formatDate(data.endDate)}
          </span>
        </div>
        <table className="w-full border-collapse border-2 border-black text-xs md:text-sm font-sans">
          <thead>
            <tr className="bg-[#0f5132] text-white uppercase text-center h-10">
              <th className="border border-white p-1">Nome</th>
              <th className="border border-white p-1 w-12">Dias</th>
              <th className="border border-white p-1 w-20">$ Dia</th>
              <th className="border border-white p-1 w-24">Bruto</th>
              <th className="border border-white p-1 w-24">Desconto</th>
              <th className="border border-white p-1 w-24">Acresc.</th>
              <th className="border border-white p-1 w-24">Extra</th>
              <th className="border border-white p-1 w-28 bg-[#198754]">
                LÍQUIDO
              </th>
              <th className="border border-white p-1 w-32">PIX</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr
                key={idx}
                className="text-center hover:bg-yellow-50 font-medium text-black"
              >
                <td className="border border-black p-1 text-left uppercase pl-2">
                  {item.name}
                </td>
                <td className="border border-black p-1 bg-[#d1e7dd]">
                  {item.daysWorked}
                </td>
                <td className="border border-black p-1 bg-yellow-200">
                  {formatMoney(item.dailyRate)}
                </td>
                <td className="border border-black p-1 bg-yellow-200">
                  {formatMoney(item.grossTotal)}
                </td>
                <td className="border border-black p-1 text-red-600">
                  {(item.discount || 0) > 0
                    ? `(${formatMoney(item.discount)})`
                    : '-'}
                </td>
                <td className="border border-black p-1 text-blue-600">
                  {(item.bonus || 0) > 0 ? formatMoney(item.bonus) : '-'}
                </td>
                <td className="border border-black p-1 text-blue-600">
                  {(item.overtime || 0) > 0 ? formatMoney(item.overtime) : '-'}
                </td>
                <td className="border border-black p-1 bg-yellow-400 font-bold text-base">
                  {formatMoney(item.netTotal)}
                </td>
                <td className="border border-black p-1 text-[10px] text-left break-all">
                  {item.pix}
                </td>
              </tr>
            ))}
            <tr className="bg-black text-white font-bold uppercase">
              <td colSpan="7" className="p-2 text-right pr-4">
                Total Geral:
              </td>
              <td className="p-2 bg-yellow-400 text-black border border-black">
                {formatMoney(totalLiquidoGeral)}
              </td>
              <td className="bg-white border border-black"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5. Holerite
function HoleriteView({ data, onBack }) {
  const [companyName, setCompanyName] = useState('SUA EMPRESA AQUI LTDA');
  const [companyCNPJ, setCompanyCNPJ] = useState('00.000.000/0001-00');
  const formatDate = (d) => (d ? d.split('-').reverse().join('/') : '');
  const periodStr = `${formatDate(data.startDate)} a ${formatDate(
    data.endDate
  )}`;
  // CORREÇÃO: Função segura também aqui
  const formatMoney = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg mb-8 print:hidden flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:text-blue-300 font-bold"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 px-6 py-2 rounded-lg font-bold shadow flex gap-2"
        >
          <Printer size={20} /> Imprimir
        </button>
      </div>

      <div className="print:w-full">
        {data.items.map((item, index) => {
          const totalAdvances = (item.advancesIncluded || []).reduce(
            (acc, curr) => acc + (curr.value || 0),
            0
          );
          const genericDiscount = (item.discount || 0) - totalAdvances;

          return (
            <div
              key={index}
              className="bg-white text-black font-sans text-xs mb-10 print:mb-4 print:break-inside-avoid max-w-[21cm] mx-auto border-2 border-black"
            >
              <div className="flex">
                <div className="flex-1">
                  <div className="border-b border-black p-2 flex justify-between items-end">
                    <div>
                      <h1 className="font-bold text-sm uppercase">
                        {companyName}
                      </h1>
                      <p className="text-[10px]">CNPJ: {companyCNPJ}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="font-bold text-sm uppercase">
                        Recibo de Pagamento
                      </h2>
                      <p className="text-[10px]">Período: {periodStr}</p>
                    </div>
                  </div>
                  <div className="border-b border-black p-1 grid grid-cols-12 gap-1 bg-gray-50">
                    <div className="col-span-1 font-bold">Cód.</div>
                    <div className="col-span-6 font-bold">Nome</div>
                    <div className="col-span-5 font-bold">Função</div>
                    <div className="col-span-1">00{index + 1}</div>
                    <div className="col-span-6 uppercase">{item.name}</div>
                    <div className="col-span-5 uppercase">{item.role}</div>
                  </div>
                  <div className="relative min-h-[250px]">
                    <div className="grid grid-cols-[50px_1fr_60px_80px_80px] border-b border-black font-bold bg-gray-100 text-[10px] text-center">
                      <div className="border-r border-black p-1">Cód</div>
                      <div className="border-r border-black p-1 text-left pl-2">
                        Descrição
                      </div>
                      <div className="border-r border-black p-1">Ref</div>
                      <div className="border-r border-black p-1">
                        Vencimentos
                      </div>
                      <div className="p-1">Descontos</div>
                    </div>
                    <div className="text-[11px]">
                      <div className="grid grid-cols-[50px_1fr_60px_80px_80px]">
                        <div className="text-center border-r border-dashed border-gray-300">
                          001
                        </div>
                        <div className="pl-2 border-r border-dashed border-gray-300 uppercase">
                          Salário / Diárias
                        </div>
                        <div className="text-center border-r border-dashed border-gray-300">
                          {item.daysWorked}d
                        </div>
                        <div className="text-right border-r border-dashed border-gray-300 pr-2">
                          {formatMoney(item.grossTotal)}
                        </div>
                        <div className="text-right pr-2">0,00</div>
                      </div>
                      {(item.overtime || 0) > 0 && (
                        <div className="grid grid-cols-[50px_1fr_60px_80px_80px]">
                          <div className="text-center border-r border-dashed border-gray-300">
                            002
                          </div>
                          <div className="pl-2 border-r border-dashed border-gray-300 uppercase">
                            Horas Extras
                          </div>
                          <div className="text-center border-r border-dashed border-gray-300">
                            -
                          </div>
                          <div className="text-right border-r border-dashed border-gray-300 pr-2">
                            {formatMoney(item.overtime)}
                          </div>
                          <div className="text-right pr-2">0,00</div>
                        </div>
                      )}
                      {(item.bonus || 0) > 0 && (
                        <div className="grid grid-cols-[50px_1fr_60px_80px_80px]">
                          <div className="text-center border-r border-dashed border-gray-300">
                            003
                          </div>
                          <div className="pl-2 border-r border-dashed border-gray-300 uppercase">
                            Acréscimos / Bônus
                          </div>
                          <div className="text-center border-r border-dashed border-gray-300">
                            -
                          </div>
                          <div className="text-right border-r border-dashed border-gray-300 pr-2">
                            {formatMoney(item.bonus)}
                          </div>
                          <div className="text-right pr-2">0,00</div>
                        </div>
                      )}

                      {(item.advancesIncluded || []).map((adv, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[50px_1fr_60px_80px_80px]"
                        >
                          <div className="text-center border-r border-dashed border-gray-300">
                            05{i}
                          </div>
                          <div className="pl-2 border-r border-dashed border-gray-300 uppercase text-red-800">
                            Vale: {adv.description || 'Adiantamento'}
                          </div>
                          <div className="text-center border-r border-dashed border-gray-300">
                            -
                          </div>
                          <div className="text-right border-r border-dashed border-gray-300 pr-2">
                            0,00
                          </div>
                          <div className="text-right pr-2">
                            {formatMoney(adv.value)}
                          </div>
                        </div>
                      ))}

                      {genericDiscount > 0 && (
                        <div className="grid grid-cols-[50px_1fr_60px_80px_80px]">
                          <div className="text-center border-r border-dashed border-gray-300">
                            099
                          </div>
                          <div className="pl-2 border-r border-dashed border-gray-300 uppercase">
                            Outros Descontos
                          </div>
                          <div className="text-center border-r border-dashed border-gray-300">
                            -
                          </div>
                          <div className="text-right border-r border-dashed border-gray-300 pr-2">
                            0,00
                          </div>
                          <div className="text-right pr-2">
                            {formatMoney(genericDiscount)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-0 bottom-0 left-[50px] w-px bg-black opacity-20"></div>
                    <div className="absolute top-0 bottom-0 right-[220px] w-px bg-black opacity-20"></div>
                    <div className="absolute top-0 bottom-0 right-[160px] w-px bg-black opacity-20"></div>
                    <div className="absolute top-0 bottom-0 right-[80px] w-px bg-black opacity-20"></div>
                  </div>
                  <div className="border-t border-black bg-gray-100 p-2 flex justify-between items-center border-b border-black">
                    <div className="text-[10px]">
                      PIX: <b>{item.pix || 'Não informado'}</b>
                    </div>
                    <div className="flex items-center gap-2 border border-black px-2 py-1 bg-white">
                      <span className="uppercase font-bold text-xs">
                        Líquido ⇨
                      </span>
                      <span className="font-bold text-lg">
                        {formatMoney(item.netTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 text-[9px] text-justify leading-tight">
                    DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DESTE RECIBO PARA
                    PLENA QUITAÇÃO DO PERÍODO.
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-4 px-4 pb-2 items-end">
                    <div className="text-center">
                      <p className="border-t border-black pt-1">
                        {new Date().toLocaleDateString()}
                      </p>
                      <p className="text-[9px] uppercase">Data</p>
                    </div>
                    <div className="text-center">
                      <p className="border-t border-black pt-1">{item.name}</p>
                      <p className="text-[9px] uppercase">Assinatura</p>
                    </div>
                  </div>
                </div>
                <div className="w-10 border-l-2 border-dashed border-black flex flex-col items-center justify-center relative bg-gray-50">
                  <div
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    <p className="text-[8px] uppercase font-bold tracking-widest text-gray-400">
                      VIA CONTABILIDADE
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
