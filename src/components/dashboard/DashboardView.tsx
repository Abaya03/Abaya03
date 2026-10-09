import React from 'react';
import { PayrollRun, Employee, Department, AuditLog, User } from '../../types';
import { ActiveTab } from '../common/Sidebar';
import {
  Users,
  Wallet,
  TrendingUp,
  ShieldAlert,
  FileCheck2,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  Calculator,
  UserPlus,
  BookOpen
} from 'lucide-react';

interface DashboardViewProps {
  currentRun: PayrollRun | undefined;
  employees: Employee[];
  departments: Department[];
  recentLogs: AuditLog[];
  currentUser: User;
  onNavigate: (tab: ActiveTab) => void;
  onRunPayroll: () => void;
  onOpenEmployeeWindow?: (employee: Employee) => void;
  onOpenJasperPayslip?: (employee: Employee) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRun,
  employees,
  departments,
  recentLogs,
  currentUser,
  onNavigate,
  onRunPayroll,
  onOpenEmployeeWindow,
  onOpenJasperPayslip
}) => {
  const activeEmployees = employees.filter(e => e.status === 'ACTIF');
  const onLeaveEmployees = employees.filter(e => e.status === 'CONGE');

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '0,00';
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Répartition de la masse salariale par département
  const deptStats = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.departmentId === dept.id && e.status === 'ACTIF');
    const deptGross = currentRun?.payslips
      ? currentRun.payslips
          .filter(p => employees.find(e => e.id === p.employeeId)?.departmentId === dept.id)
          .reduce((sum, p) => sum + p.grossSalary, 0)
      : deptEmployees.reduce((sum, e) => sum + e.baseSalary, 0);

    return {
      department: dept,
      count: deptEmployees.length,
      gross: deptGross
    };
  });

  const totalGross = currentRun?.totalGross || 0;

  return (
    <div className="space-y-6">
      {/* Kicker & Titre de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tableau de Bord Exécutif · Paie & Ressources Humaines
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Synthèse de la Paie {currentRun?.label ? `— ${currentRun.label}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRunPayroll}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Recalculer la période</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('employees')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Nouveau salarié</span>
          </button>
        </div>
      </div>

      {/* Bandeau d'état du cycle de paie */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base ${
            currentRun?.status === 'CLOTURE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : currentRun?.status === 'APPROUVE'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Période active</span>
              <span aria-hidden="true">·</span>
              <span>Échéance de versement : <strong className="text-slate-800">{currentRun?.paymentDate || 'Fin de mois'}</strong></span>
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2.5 mt-0.5">
              <span>{currentRun?.label}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                currentRun?.status === 'CLOTURE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentRun?.status === 'APPROUVE'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Statut : {currentRun?.status === 'CLOTURE' ? 'Clôturée & Verrouillée' : currentRun?.status === 'APPROUVE' ? 'Validée par la direction' : 'En cours de préparation'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('payroll')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
          >
            <span>Consulter les {currentRun?.employeesCount || employees.length} fiches de paie</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grille d'indicateurs financiers et de paie (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Masse Salariale Brute */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">Masse Salariale Brute</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {formatCurrency(currentRun?.totalGross)} <span className="text-xs font-sans text-slate-400 font-semibold">MRU</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Imposable ITS : <span className="font-mono font-bold text-slate-800">{formatCurrency(currentRun?.totalTaxable)} MRU</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Net à Payer */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">Net Total à Verser</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-emerald-700 tracking-tight">
              {formatCurrency(currentRun?.totalNetPayable)} <span className="text-xs font-sans text-emerald-600 font-semibold">MRU</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Sur comptes bancaires : <span className="font-mono font-bold text-slate-800">{activeEmployees.length} virements</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Charges Sociales (CNSS + CNAM) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">Cotisations Sociales</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {formatCurrency((currentRun?.totalCnssEmployee || 0) + (currentRun?.totalCnssEmployer || 0) + (currentRun?.totalCnamEmployee || 0) + (currentRun?.totalCnamEmployer || 0))} <span className="text-xs font-sans text-slate-400 font-semibold">MRU</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
              <span>CNSS : <strong className="font-mono text-slate-700">{formatCurrency((currentRun?.totalCnssEmployee || 0) + (currentRun?.totalCnssEmployer || 0))}</strong></span>
              <span>CNAM : <strong className="font-mono text-slate-700">{formatCurrency((currentRun?.totalCnamEmployee || 0) + (currentRun?.totalCnamEmployer || 0))}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Retenue Fiscale ITS & Coût Employeur */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">Retenue ITS & Coût Total</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-purple-700 tracking-tight">
              {formatCurrency(currentRun?.totalIts)} <span className="text-xs font-sans text-purple-600 font-semibold">MRU</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Coût Total Entreprise : <span className="font-mono font-bold text-slate-900">{formatCurrency(currentRun?.totalEmployerCost)} MRU</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Centrale : Répartition par Département & Activités Récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1 & 2 : Répartition analytique par Direction / Département */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Masse Salariale par Direction</h2>
              <p className="text-xs text-slate-500">Ventilation de la charge salariale pour le mois en cours</p>
            </div>
            <div className="text-xs text-slate-500">
              Total effectif : <strong className="text-slate-800">{activeEmployees.length} salariés actifs</strong>
            </div>
          </div>

          <div className="space-y-3.5">
            {deptStats.map(item => {
              const percentage = totalGross > 0 ? (item.gross / totalGross) * 100 : 0;

              return (
                <div key={item.department.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{item.department.name}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({item.count} salariés)</span>
                    </div>
                    <div className="font-mono font-semibold text-slate-900">
                      {formatCurrency(item.gross)} MRU <span className="text-slate-400 font-normal">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne 3 : Journal des Actions & Sécurité Récente */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Activité Récente</h2>
                <p className="text-xs text-slate-500">Traçabilité & Journal d'Audit</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('security')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Tout voir
              </button>
            </div>

            <div className="space-y-3">
              {recentLogs.slice(0, 4).map(log => (
                <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-700">{log.userName}</span>
                    <span className="font-mono">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-slate-800 font-medium mt-1 leading-snug">{log.details}</p>
                  <div className="mt-1 text-[10px] text-slate-400 uppercase font-mono">
                    Action : {log.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('accounting')}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Consulter l'écriture comptable (OD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accès Rapide : Collaborateurs & Fiches Salariés (Cliquez sur un nom pour ouvrir sa fenêtre) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-800" />
              <h2 className="text-sm font-bold text-slate-900">Salariés & Collaborateurs</h2>
              <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium" dir="rtl">
                إضغط على أي اسم لفتح نافذة الموظف وكشف الراتب
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliquez sur un nom pour ouvrir la fenêtre complète du salarié (Image 1) ou son bulletin Jasper (Image 2)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('employees')}
            className="text-xs text-sky-700 hover:text-sky-900 font-semibold cursor-pointer flex items-center gap-1"
          >
            <span>Voir toute la liste ({employees.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {employees.slice(0, 8).map(emp => (
            <div
              key={emp.id}
              onClick={() => {
                if (onOpenEmployeeWindow) onOpenEmployeeWindow(emp);
              }}
              className="p-3 border border-slate-200 rounded-lg hover:border-sky-500 hover:bg-sky-50/50 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              title="Cliquer pour ouvrir la fenêtre Salarié (نافذة معلومات الموظف)"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700">{emp.registrationNumber}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    emp.status === 'ACTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {emp.status}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs mt-1.5 group-hover:text-sky-900 group-hover:underline">
                  {emp.firstName} {emp.lastName}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {emp.jobTitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-mono font-semibold text-slate-700">
                  {emp.baseSalary.toLocaleString('fr-FR')} MRU
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenJasperPayslip) onOpenJasperPayslip(emp);
                  }}
                  className="text-sky-800 hover:text-sky-950 font-bold hover:underline"
                  title="Ouvrir le bulletin Jasper (كشف الراتب)"
                >
                  كشف الراتب
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
