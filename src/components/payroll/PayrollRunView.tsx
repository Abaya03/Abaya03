import React, { useState, useMemo } from 'react';
import { PayrollRun, Employee, Department, CalculatedPayslip, User } from '../../types';
import { PayrollService, ValidationIssue } from '../../services/payrollService';
import {
  Calculator,
  CheckCircle,
  Lock,
  Unlock,
  AlertTriangle,
  Search,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';

interface PayrollRunViewProps {
  currentRun: PayrollRun | undefined;
  employees: Employee[];
  departments: Department[];
  currentUser: User;
  onRecalculateAll: () => void;
  onApproveRun: () => void;
  onLockRun: () => void;
  onReopenRun: () => void;
  onOpenAdjustment: (employee: Employee) => void;
  onViewPayslip: (payslip: CalculatedPayslip) => void;
  onOpenEmployeeWindow?: (employee: Employee) => void;
}

export const PayrollRunView: React.FC<PayrollRunViewProps> = ({
  currentRun,
  employees,
  departments,
  currentUser,
  onRecalculateAll,
  onApproveRun,
  onLockRun,
  onReopenRun,
  onOpenAdjustment,
  onViewPayslip,
  onOpenEmployeeWindow
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const deptMap = useMemo(() => new Map(departments.map(d => [d.id, d.name])), [departments]);
  const empMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

  // Validation des anomalies
  const validationIssues: ValidationIssue[] = useMemo(() => {
    if (!currentRun) return [];
    return PayrollService.validatePayrollRun(currentRun, employees);
  }, [currentRun, employees]);

  const filteredPayslips = useMemo(() => {
    if (!currentRun) return [];
    return currentRun.payslips.filter(slip => {
      const emp = empMap.get(slip.employeeId);
      const matchesSearch =
        searchQuery === '' ||
        slip.employeeSnapshot.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slip.employeeSnapshot.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slip.employeeSnapshot.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || (emp && emp.departmentId === selectedDept);

      return matchesSearch && matchesDept;
    });
  }, [currentRun, searchQuery, selectedDept, empMap]);

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '0,00';
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isLocked = currentRun?.status === 'CLOTURE';
  const isApproved = currentRun?.status === 'APPROUVE';

  // Permissions simulation
  const canApprove = currentUser.roleId === 'ROLE-APPROVER' || currentUser.roleId === 'ROLE-ADMIN';
  const canLock = currentUser.roleId === 'ROLE-APPROVER' || currentUser.roleId === 'ROLE-ADMIN';

  const handleExportLivrePaieCSV = () => {
    if (!currentRun) return;
    const headers = [
      'Matricule',
      'Salarié',
      'Département',
      'Salaire Base',
      'Total Primes',
      'Brut Global',
      'Brut Imposable',
      'Assiette CNSS (Plafond 70k)',
      'CNSS Salariale (1%)',
      'CNAM Salariale (4%)',
      'Retenue ITS',
      'Acomptes',
      'Net à Payer (MRU)',
      'CNSS Patronale (12%)',
      'CNAM Patronale (5%)',
      'Total Charges Patronales',
      'Coût Global Employeur'
    ];

    const rows = currentRun.payslips.map(p => [
      p.employeeSnapshot.registrationNumber,
      `"${p.employeeSnapshot.fullName}"`,
      `"${p.employeeSnapshot.departmentName}"`,
      p.baseSalary,
      p.totalAllowances,
      p.grossSalary,
      p.taxableGrossSalary,
      p.cnssBase,
      p.cnssEmployeeAmount,
      p.cnamEmployeeAmount,
      p.itsTaxAmount,
      p.salaryAdvanceAmount,
      p.netSalaryPayable,
      p.cnssEmployerTotalAmount,
      p.cnamEmployerAmount,
      p.totalEmployerContributions,
      p.totalEmployerCost
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `livre_paie_${currentRun.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Kicker et barre de commandes de cycle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cycle Mensuel de Traitement de la Paie
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {currentRun?.label || 'Traitement de la Paie'}
            </h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
              isLocked
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isApproved
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isLocked ? 'Verrouillée (Clôture effectuée)' : isApproved ? 'Approuvée par Direction' : 'Calcul en cours'}
            </span>
          </div>
        </div>

        {/* Boutons d'action workflow selon statut et habilitations */}
        <div className="flex flex-wrap items-center gap-2">
          {!isLocked && (
            <button
              type="button"
              onClick={onRecalculateAll}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Recalculer tout le personnel</span>
            </button>
          )}

          {!isLocked && !isApproved && canApprove && (
            <button
              type="button"
              onClick={onApproveRun}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Valider & Approuver la paie</span>
            </button>
          )}

          {!isLocked && isApproved && canLock && (
            <button
              type="button"
              onClick={onLockRun}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Clôturer & Verrouiller la période</span>
            </button>
          )}

          {isLocked && canLock && (
            <button
              type="button"
              onClick={onReopenRun}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Déverrouiller pour régularisation</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportLivrePaieCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exporter Livre de Paie</span>
          </button>
        </div>
      </div>

      {/* Avertissement si période verrouillée */}
      {isLocked && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <strong>Cette période de paie est officiellement clôturée et verrouillée.</strong> Les fiches de paie et montants sont immuables. Tout ajustement nécessite une régularisation sur la période suivante ou un déverrouillage autorisé.
            </div>
          </div>
          <span className="font-mono text-[11px] text-emerald-700">Audit: {currentRun?.lockedBy || 'DG'}</span>
        </div>
      )}

      {/* Alerte des anomalies détectées */}
      {validationIssues.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Contrôle qualité de paie : {validationIssues.length} point(s) d'attention détecté(s)</span>
          </div>
          <div className="space-y-1.5 pl-6">
            {validationIssues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-mono font-semibold text-amber-800 shrink-0">{issue.registrationNumber}</span>
                <span>{issue.employeeName} : {issue.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bandeau de synthèse des montants calculés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Masse Brute Globale</div>
          <div className="text-lg font-black font-mono text-slate-900 mt-1">
            {formatCurrency(currentRun?.totalGross)} <span className="text-xs font-sans text-slate-400 font-semibold">MRU</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Retenues ITS</div>
          <div className="text-lg font-black font-mono text-purple-700 mt-1">
            {formatCurrency(currentRun?.totalIts)} <span className="text-xs font-sans text-purple-400 font-semibold">MRU</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Net à Verser</div>
          <div className="text-lg font-black font-mono text-emerald-700 mt-1">
            {formatCurrency(currentRun?.totalNetPayable)} <span className="text-xs font-sans text-emerald-600 font-semibold">MRU</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Charges Patronales (17%)</div>
          <div className="text-lg font-black font-mono text-slate-900 mt-1">
            {formatCurrency((currentRun?.totalCnssEmployer || 0) + (currentRun?.totalCnamEmployer || 0))} <span className="text-xs font-sans text-slate-400 font-semibold">MRU</span>
          </div>
        </div>
      </div>

      {/* Filtres de la table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un salarié calculé..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Direction :</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"
          >
            <option value="ALL">Toutes les directions</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille détaillée des fiches de paie calculées */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3">Salarié</th>
                <th className="px-4 py-3 text-right">Salaire Brut</th>
                <th className="px-4 py-3 text-right">Brut Imposable</th>
                <th className="px-4 py-3 text-right">CNSS 1%</th>
                <th className="px-4 py-3 text-right">CNAM 4%</th>
                <th className="px-4 py-3 text-right">ITS Impôt</th>
                <th className="px-4 py-3 text-right">Net à Payer</th>
                <th className="px-4 py-3 text-right">Charges Patr.</th>
                <th className="px-4 py-3 text-right">Coût Total</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    Aucun bulletin calculé ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredPayslips.map(slip => {
                  const emp = empMap.get(slip.employeeId);

                  return (
                    <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                      <td
                        onClick={() => {
                          if (emp && onOpenEmployeeWindow) onOpenEmployeeWindow(emp);
                        }}
                        className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap hover:text-sky-700 hover:underline cursor-pointer"
                        title="Cliquer pour ouvrir la fenêtre Salarié (معلومات الموظف)"
                      >
                        {slip.employeeSnapshot.registrationNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div
                          onClick={() => {
                            if (emp && onOpenEmployeeWindow) onOpenEmployeeWindow(emp);
                          }}
                          className="font-semibold text-slate-900 hover:text-sky-700 hover:underline cursor-pointer"
                          title="Cliquer pour ouvrir la fenêtre Salarié (معلومات الموظف)"
                        >
                          {slip.employeeSnapshot.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">{slip.employeeSnapshot.departmentName}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                        {formatCurrency(slip.grossSalary)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatCurrency(slip.taxableGrossSalary)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatCurrency(slip.cnssEmployeeAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatCurrency(slip.cnamEmployeeAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-purple-700 whitespace-nowrap">
                        {formatCurrency(slip.itsTaxAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/40 whitespace-nowrap">
                        {formatCurrency(slip.netSalaryPayable)} <span className="text-[10px] font-sans font-normal">MRU</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatCurrency(slip.totalEmployerContributions)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                        {formatCurrency(slip.totalEmployerCost)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewPayslip(slip)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            title="Consulter et Imprimer le Bulletin A4"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Bulletin</span>
                          </button>
                          {!isLocked && emp && (
                            <button
                              type="button"
                              onClick={() => onOpenAdjustment(emp)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Saisir variables (primes, h. supp, absences)"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
