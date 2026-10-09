import React, { useState } from 'react';
import {
  ActiveTab,
  Sidebar
} from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { EmployeeListView } from './components/employees/EmployeeListView';
import { EmployeeModal } from './components/employees/EmployeeModal';
import { EmployeeDetailDrawer } from './components/employees/EmployeeDetailDrawer';
import { EmployeeWindowModal } from './components/employees/EmployeeWindowModal';
import { EmployeeImportModal } from './components/employees/EmployeeImportModal';
import { PayrollRunView } from './components/payroll/PayrollRunView';
import { PayrollAdjustmentModal } from './components/payroll/PayrollAdjustmentModal';
import { SalaryCalculatorModal } from './components/payroll/SalaryCalculatorModal';
import { PayslipPreviewModal } from './components/payslips/PayslipPreviewModal';
import { JasperPayslipModal } from './components/payslips/JasperPayslipModal';
import { ReportsView } from './components/reports/ReportsView';
import { AttendanceAnalyticsView } from './components/reports/AttendanceAnalyticsView';
import { AccountingView } from './components/accounting/AccountingView';
import { RubricsView } from './components/rubrics/RubricsView';
import { LegalSettingsView } from './components/settings/LegalSettingsView';
import { UserManagementView } from './components/settings/UserManagementView';
import { LoginDialog } from './components/auth/LoginDialog';

import {
  DEFAULT_MAURITANIAN_RULES,
  DEFAULT_COMPANY_PROFILE
} from './data/legalRules';
import { INITIAL_PAY_RUBRICS } from './data/rubricsData';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from './data/initialData';
import { PayrollService } from './services/payrollService';
import {
  Employee,
  PayrollRun,
  PayrollInputLine,
  CalculatedPayslip,
  User,
  LegalPayrollRules,
  CompanyProfile,
  AuditLog,
  PayRubricDefinition
} from './types';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('employees');

  // Entreprise & Paramètres
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [legalRules, setLegalRules] = useState<LegalPayrollRules>(DEFAULT_MAURITANIAN_RULES);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [payRubrics, setPayRubrics] = useState<PayRubricDefinition[]>(INITIAL_PAY_RUBRICS);

  // Utilisateurs & Sécurité
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [roles] = useState(INITIAL_ROLES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Gestion des périodes
  const availablePeriods = ['2026-10', '2026-06', '2026-09'];
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');

  // Variables mensuelles (saisies d'heures supp, primes, absences)
  const [payrollInputs, setPayrollInputs] = useState<Record<string, Record<string, PayrollInputLine>>>({
    '2026-10': {
      'EMP-221': {
        employeeId: 'EMP-221',
        overtimeHours115: 14,
        overtimeHours150: 6,
        bonusExceptional: 2500,
        notes: 'Missions transport maritime port Nouakchott'
      },
      'EMP-231': {
        employeeId: 'EMP-231',
        bonusExceptional: 5000,
        notes: 'Prime d\'encadrement scientifique IMROP'
      }
    }
  });

  // Fiches de paie et cycles de paie
  const [payrollRuns, setPayrollRuns] = useState<Record<string, PayrollRun>>(() => {
    const octRun = PayrollService.processPayrollRun(
      '2026-10',
      'Paie du mois d\'Octobre 2026',
      INITIAL_EMPLOYEES,
      INITIAL_DEPARTMENTS,
      {
        'EMP-221': {
          employeeId: 'EMP-221',
          overtimeHours115: 14,
          overtimeHours150: 6,
          bonusExceptional: 2500
        },
        'EMP-231': {
          employeeId: 'EMP-231',
          bonusExceptional: 5000
        }
      },
      DEFAULT_MAURITANIAN_RULES,
      'root'
    );

    return {
      '2026-10': octRun
    };
  });

  // Modals & Tiroirs
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [employeeForAdjustment, setEmployeeForAdjustment] = useState<Employee | null>(null);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslipForPreview, setSelectedPayslipForPreview] = useState<CalculatedPayslip | null>(null);

  const [isJasperModalOpen, setIsJasperModalOpen] = useState(false);
  const [jasperEmployee, setJasperEmployee] = useState<Employee | null>(null);

  // Fenêtre Salarié MDI complète (Image 1)
  const [selectedEmployeeForWindow, setSelectedEmployeeForWindow] = useState<Employee | null>(null);
  const [isEmployeeWindowOpen, setIsEmployeeWindowOpen] = useState(false);

  const handleOpenEmployeeWindow = (emp: Employee) => {
    setSelectedEmployeeForWindow(emp);
    setIsEmployeeWindowOpen(true);
  };

  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const currentRun = payrollRuns[selectedPeriod];

  const handleOpenJasperPayslip = (emp: Employee) => {
    setJasperEmployee(emp);
    setIsJasperModalOpen(true);
  };

  // Helper d'audit
  const logAudit = (action: string, targetEntity: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      targetEntity,
      targetId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleRecalculateCurrentRun = () => {
    const inputsForPeriod = payrollInputs[selectedPeriod] || {};
    const updatedRun = PayrollService.processPayrollRun(
      selectedPeriod,
      `Paie du mois ${selectedPeriod}`,
      employees,
      departments,
      inputsForPeriod,
      legalRules,
      currentUser.fullName,
      currentRun
    );

    setPayrollRuns(prev => ({
      ...prev,
      [selectedPeriod]: updatedRun
    }));

    logAudit(
      'CALCUL_PAIE',
      'PAYROLL_RUN',
      updatedRun.id,
      `Recalcul complet exécuté pour ${updatedRun.employeesCount} salariés avec les taux légaux ${legalRules.version}.`
    );
  };

  const handleApproveRun = () => {
    if (!currentRun) return;
    const updatedRun: PayrollRun = {
      ...currentRun,
      status: 'APPROUVE',
      approvedBy: currentUser.fullName,
      approvedAt: new Date().toISOString()
    };
    setPayrollRuns(prev => ({
      ...prev,
      [selectedPeriod]: updatedRun
    }));
    logAudit(
      'APPROBATION_PAIE',
      'PAYROLL_RUN',
      updatedRun.id,
      `Période ${selectedPeriod} validée par ${currentUser.fullName}.`
    );
  };

  const handleLockRun = () => {
    if (!currentRun) return;
    const updatedRun: PayrollRun = {
      ...currentRun,
      status: 'CLOTURE',
      lockedBy: currentUser.fullName,
      lockedAt: new Date().toISOString()
    };
    setPayrollRuns(prev => ({
      ...prev,
      [selectedPeriod]: updatedRun
    }));
    logAudit(
      'CLOTURE_PAIE',
      'PAYROLL_RUN',
      updatedRun.id,
      `Clôture définitive et verrouillage de la période ${selectedPeriod}.`
    );
  };

  const handleReopenRun = () => {
    if (!currentRun) return;
    const updatedRun: PayrollRun = {
      ...currentRun,
      status: 'CALCULE',
      lockedBy: undefined,
      lockedAt: undefined
    };
    setPayrollRuns(prev => ({
      ...prev,
      [selectedPeriod]: updatedRun
    }));
    logAudit(
      'DEVERROUILLAGE_PAIE',
      'PAYROLL_RUN',
      updatedRun.id,
      `Période ${selectedPeriod} rouverte par ${currentUser.fullName}.`
    );
  };

  const handleSavePayrollInput = (employeeId: string, input: PayrollInputLine) => {
    setPayrollInputs(prev => {
      const periodInputs = { ...(prev[selectedPeriod] || {}) };
      periodInputs[employeeId] = input;
      return { ...prev, [selectedPeriod]: periodInputs };
    });

    setTimeout(() => {
      const currentPeriodInputs = { ...(payrollInputs[selectedPeriod] || {}), [employeeId]: input };
      const updatedRun = PayrollService.processPayrollRun(
        selectedPeriod,
        `Paie du mois ${selectedPeriod}`,
        employees,
        departments,
        currentPeriodInputs,
        legalRules,
        currentUser.fullName,
        currentRun
      );
      setPayrollRuns(p => ({ ...p, [selectedPeriod]: updatedRun }));
    }, 50);

    const emp = employees.find(e => e.id === employeeId);
    logAudit(
      'SAISIE_VARIABLES',
      'EMPLOYEE_PAYROLL',
      employeeId,
      `Variables de paie modifiées pour ${emp?.firstName} ${emp?.lastName}.`
    );
  };

  const handleSaveEmployee = (empToSave: Employee) => {
    const isEdit = employees.some(e => e.id === empToSave.id);
    let updatedList: Employee[];
    if (isEdit) {
      updatedList = employees.map(e => (e.id === empToSave.id ? empToSave : e));
      logAudit('MODIFICATION_SALARIE', 'EMPLOYEE', empToSave.id, `Fiche mise à jour pour ${empToSave.firstName} ${empToSave.lastName}.`);
    } else {
      updatedList = [...employees, empToSave];
      logAudit('CREATION_SALARIE', 'EMPLOYEE', empToSave.id, `Nouveau salarié enregistré : ${empToSave.firstName} ${empToSave.lastName} (${empToSave.registrationNumber}).`);
    }
    setEmployees(updatedList);

    if (currentRun && currentRun.status !== 'CLOTURE') {
      const inputs = payrollInputs[selectedPeriod] || {};
      const updatedRun = PayrollService.processPayrollRun(
        selectedPeriod,
        currentRun.label,
        updatedList,
        departments,
        inputs,
        legalRules,
        currentUser.fullName,
        currentRun
      );
      setPayrollRuns(prev => ({ ...prev, [selectedPeriod]: updatedRun }));
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    if (window.confirm(`Confirmez-vous la suppression de ${emp.firstName} ${emp.lastName} ?`)) {
      const updatedList = employees.filter(e => e.id !== employeeId);
      setEmployees(updatedList);
      logAudit('SUPPRESSION_SALARIE', 'EMPLOYEE', employeeId, `Salarié retiré : ${emp.firstName} ${emp.lastName}.`);
    }
  };

  const handleBatchImport = (newBatch: Employee[]) => {
    const updatedList = [...employees, ...newBatch];
    setEmployees(updatedList);
    logAudit('IMPORT_SALARIES', 'EMPLOYEES_BATCH', `LOT-${Date.now()}`, `Importation de ${newBatch.length} salariés.`);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (!payrollRuns[newPeriod]) {
      const newRun = PayrollService.processPayrollRun(
        newPeriod,
        `Paie du mois ${newPeriod}`,
        employees,
        departments,
        {},
        legalRules,
        currentUser.fullName
      );
      setPayrollRuns(prev => ({ ...prev, [newPeriod]: newRun }));
    }
  };

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'calculette') {
      setIsCalculatorModalOpen(true);
    } else if (tab === 'importation') {
      setIsImportModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 select-none antialiased">
      {/* Barre latérale gauche conforme à l'Image 3 */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabClick}
        username={currentUser.username}
        onLockSession={() => setIsLoginDialogOpen(true)}
        unprocessedCount={currentRun?.status === 'BROUILLON' || currentRun?.status === 'CALCULE' ? 1 : 0}
      />

      {/* Zone centrale principale */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-sky-900/10">
        {/* En-tête supérieur blanc & bandeau d'état noir conforme à l'Image 3 & 4 */}
        <Header
          company={company}
          currentUser={currentUser}
          users={users}
          onSwitchUser={setCurrentUser}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          availablePeriods={availablePeriods}
          onLockSession={() => setIsLoginDialogOpen(true)}
          totalEmployeesCount={employees.length}
        />

        {/* Espace de travail de l'application (MDI Desktop Container) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full mx-auto">
          {activeTab === 'employees' && (
            <EmployeeListView
              employees={employees}
              departments={departments}
              rules={legalRules}
              onAddEmployee={() => {
                setEmployeeToEdit(null);
                setIsEmployeeModalOpen(true);
              }}
              onEditEmployee={(emp) => {
                setEmployeeToEdit(emp);
                setIsEmployeeModalOpen(true);
              }}
              onDeleteEmployee={handleDeleteEmployee}
              onViewEmployee={handleOpenEmployeeWindow}
              onOpenImport={() => setIsImportModalOpen(true)}
              onOpenJasperPayslip={handleOpenJasperPayslip}
              onSaveEmployee={handleSaveEmployee}
            />
          )}

          {activeTab === 'rubriques' && (
            <RubricsView
              rubrics={payRubrics}
              onSaveRubrics={(newRubrics) => setPayRubrics(newRubrics)}
            />
          )}

          {activeTab === 'analytics-reports' && (
            <ReportsView
              currentRun={currentRun}
              company={company}
              departments={departments}
              employees={employees}
              onOpenEmployeeWindow={handleOpenEmployeeWindow}
            />
          )}

          {(activeTab === 'pointage' || activeTab === 'planning') && (
            <AttendanceAnalyticsView
              employees={employees}
              departments={departments}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollRunView
              currentRun={currentRun}
              employees={employees}
              departments={departments}
              currentUser={currentUser}
              onRecalculateAll={handleRecalculateCurrentRun}
              onApproveRun={handleApproveRun}
              onLockRun={handleLockRun}
              onReopenRun={handleReopenRun}
              onOpenEmployeeWindow={handleOpenEmployeeWindow}
              onOpenAdjustment={(emp) => {
                setEmployeeForAdjustment(emp);
                setIsAdjustmentModalOpen(true);
              }}
              onViewPayslip={(slip) => {
                setSelectedPayslipForPreview(slip);
                setIsPayslipModalOpen(true);
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              currentRun={currentRun}
              employees={employees}
              departments={departments}
              recentLogs={auditLogs}
              currentUser={currentUser}
              onNavigate={setActiveTab}
              onRunPayroll={handleRecalculateCurrentRun}
              onOpenEmployeeWindow={handleOpenEmployeeWindow}
              onOpenJasperPayslip={handleOpenJasperPayslip}
            />
          )}

          {activeTab === 'payslips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Documents de Paie · Consultation & Impression des Bulletins A4
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Édition des Bulletins de Paie ({currentRun?.payslips.length || 0} fiches)
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentRun?.payslips.map(slip => (
                  <div
                    key={slip.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-sky-500 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-700">{slip.employeeSnapshot.registrationNumber}</span>
                        <span>{slip.employeeSnapshot.departmentName}</span>
                      </div>
                      <div
                        onClick={() => {
                          const emp = employees.find(e => e.id === slip.employeeId);
                          if (emp) handleOpenEmployeeWindow(emp);
                        }}
                        className="text-sm font-bold text-slate-900 mt-1 hover:text-sky-700 hover:underline cursor-pointer"
                        title="Cliquer pour ouvrir la fenêtre Salarié (معلومات الموظف)"
                      >
                        {slip.employeeSnapshot.fullName}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {slip.employeeSnapshot.jobTitle}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Net à payer :</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {slip.netSalaryPayable.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Période: {slip.period}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const emp = employees.find(e => e.id === slip.employeeId);
                          if (emp) handleOpenJasperPayslip(emp);
                          else {
                            setSelectedPayslipForPreview(slip);
                            setIsPayslipModalOpen(true);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Voir Bulletin (Jasper)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cloture' && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto space-y-5 text-center">
              <h2 className="text-xl font-bold text-slate-900">Procédure de Clôture Mensuelle de Paie</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                La clôture de la période scelle définitivement les bulletins de paie et fige les déclarations fiscales et sociales (CNSS, CNAM, ITS). Aucune modification directe ne sera permise après le verrouillage.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 text-left font-medium">
                Période active : <strong>{selectedPeriod}</strong> · Effectif calculé : <strong>{employees.length} salariés</strong> · Statut : <strong>{currentRun?.status}</strong>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                {currentRun?.status !== 'CLOTURE' ? (
                  <button
                    type="button"
                    onClick={handleLockRun}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm cursor-pointer"
                  >
                    Exécuter la clôture définitive & Verrouiller
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReopenRun}
                    className="px-5 py-2.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg cursor-pointer"
                  >
                    Déverrouiller pour régularisation exceptionnelle
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'accounting' && (
            <AccountingView currentRun={currentRun} />
          )}

          {activeTab === 'settings' && (
            <LegalSettingsView
              rules={legalRules}
              company={company}
              onSaveRules={setLegalRules}
              onSaveCompany={setCompany}
            />
          )}

          {activeTab === 'security' && (
            <UserManagementView
              users={users}
              roles={roles}
              auditLogs={auditLogs}
              currentUser={currentUser}
              onToggleUserStatus={(uId) => setUsers(prev => prev.map(u => u.id === uId ? { ...u, isActive: !u.isActive } : u))}
              onSwitchUser={setCurrentUser}
            />
          )}
        </main>
      </div>

      {/* Dialog Connexion / Verrouillage conforme à l'Image 2 */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        currentUser={currentUser}
        company={company}
        onLogin={(u) => setCurrentUser(u)}
      />

      {/* Modal Salarié (Création / Modification) */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        departments={departments}
        employeeToEdit={employeeToEdit}
      />

      {/* Tiroir Fiche Salarié Détaillée */}
      <EmployeeDetailDrawer
        employee={selectedEmployeeForDetail}
        department={departments.find(d => d.id === selectedEmployeeForDetail?.departmentId)}
        onClose={() => setSelectedEmployeeForDetail(null)}
        onEdit={(emp) => {
          setSelectedEmployeeForDetail(null);
          setEmployeeToEdit(emp);
          setIsEmployeeModalOpen(true);
        }}
      />

      {/* Modal Import Salariés CSV/Excel */}
      <EmployeeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBatchImport}
        departments={departments}
        existingEmployees={employees}
      />

      {/* Modal Ajustement Variables Mensuelles */}
      <PayrollAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        employee={employeeForAdjustment}
        initialInput={employeeForAdjustment ? payrollInputs[selectedPeriod]?.[employeeForAdjustment.id] : undefined}
        period={selectedPeriod}
        rules={legalRules}
        departmentName={departments.find(d => d.id === employeeForAdjustment?.departmentId)?.name || 'Direction'}
        onSaveInput={handleSavePayrollInput}
        availableRubrics={payRubrics}
      />

      {/* Modal Calculette Rapide de Salaire (Sigma) */}
      <SalaryCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        rules={legalRules}
      />

      {/* Modal Aperçu & Impression du Bulletin A4 (Standard) */}
      <PayslipPreviewModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={selectedPayslipForPreview}
        company={company}
      />

      {/* Modal Officiel JasperViewer (Capture d'écran 2026-10-09 190326.png) */}
      <JasperPayslipModal
        isOpen={isJasperModalOpen}
        onClose={() => setIsJasperModalOpen(false)}
        employee={jasperEmployee}
        payslip={jasperEmployee ? currentRun?.payslips.find(p => p.employeeId === jasperEmployee.id) : null}
        period={selectedPeriod}
        company={company}
      />

      {/* Fenêtre Salarié MDI complète (Image 1) avec toutes les informations et accès au bulletin (Image 2) */}
      <EmployeeWindowModal
        isOpen={isEmployeeWindowOpen}
        onClose={() => setIsEmployeeWindowOpen(false)}
        employee={selectedEmployeeForWindow}
        employees={employees}
        departments={departments}
        rules={legalRules}
        onSelectEmployee={(emp) => setSelectedEmployeeForWindow(emp)}
        onOpenJasperPayslip={(emp) => handleOpenJasperPayslip(emp)}
        onSaveEmployee={handleSaveEmployee}
        period={selectedPeriod === '2026-10' ? 'OCTOBRE 2026' : selectedPeriod === '2026-06' ? 'JUIN 2026' : 'SEPTEMBRE 2026'}
        availableRubrics={payRubrics}
      />
    </div>
  );
}
