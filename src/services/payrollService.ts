import { Employee, Department, LegalPayrollRules, PayrollRun, PayrollInputLine, CalculatedPayslip } from '../types';
import { calculateEmployeePayslip, roundCurrency } from '../engine/mauritanianTaxEngine';

export interface ValidationIssue {
  severity: 'WARNING' | 'ERROR';
  employeeId: string;
  registrationNumber: string;
  employeeName: string;
  message: string;
}

export class PayrollService {
  /**
   * Exécute le calcul de l'ensemble des bulletins pour une période donnée.
   */
  static processPayrollRun(
    period: string,
    label: string,
    employees: Employee[],
    departments: Department[],
    inputs: Record<string, PayrollInputLine>,
    rules: LegalPayrollRules,
    preparedBy: string,
    existingRun?: Partial<PayrollRun>
  ): PayrollRun {
    const runId = existingRun?.id || `RUN-${period}`;
    const payslips: CalculatedPayslip[] = [];
    
    // Associer le nom de département
    const deptMap = new Map(departments.map(d => [d.id, d.name]));

    // Traiter les salariés actifs ou en congé payé
    const eligibleEmployees = employees.filter(e => e.status === 'ACTIF' || e.status === 'CONGE');

    for (const emp of eligibleEmployees) {
      const deptName = deptMap.get(emp.departmentId) || 'Département Inconnu';
      const inputLine = inputs[emp.id];
      const payslip = calculateEmployeePayslip(emp, inputLine, period, runId, rules, deptName);
      payslips.push(payslip);
    }

    // Agréger les montants
    const totalGross = roundCurrency(payslips.reduce((acc, p) => acc + p.grossSalary, 0));
    const totalTaxable = roundCurrency(payslips.reduce((acc, p) => acc + p.taxableGrossSalary, 0));
    const totalNetPayable = roundCurrency(payslips.reduce((acc, p) => acc + p.netSalaryPayable, 0));
    const totalCnssEmployee = roundCurrency(payslips.reduce((acc, p) => acc + p.cnssEmployeeAmount, 0));
    const totalCnssEmployer = roundCurrency(payslips.reduce((acc, p) => acc + p.cnssEmployerTotalAmount, 0));
    const totalCnamEmployee = roundCurrency(payslips.reduce((acc, p) => acc + p.cnamEmployeeAmount, 0));
    const totalCnamEmployer = roundCurrency(payslips.reduce((acc, p) => acc + p.cnamEmployerAmount, 0));
    const totalIts = roundCurrency(payslips.reduce((acc, p) => acc + p.itsTaxAmount, 0));
    const totalEmployerCost = roundCurrency(payslips.reduce((acc, p) => acc + p.totalEmployerCost, 0));

    // Déterminer la date de versement (dernier jour ouvré du mois)
    const [year, month] = period.split('-').map(Number);
    const lastDayOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

    return {
      id: runId,
      period,
      label: label || `Paie du mois ${period}`,
      status: existingRun?.status || 'CALCULE',
      startDate: `${period}-01`,
      endDate: lastDayOfMonth,
      paymentDate: lastDayOfMonth,
      employeesCount: payslips.length,
      totalGross,
      totalTaxable,
      totalNetPayable,
      totalCnssEmployee,
      totalCnssEmployer,
      totalCnamEmployee,
      totalCnamEmployer,
      totalIts,
      totalEmployerCost,
      payslips,
      preparedBy: existingRun?.preparedBy || preparedBy,
      preparedAt: existingRun?.preparedAt || new Date().toISOString(),
      approvedBy: existingRun?.approvedBy,
      approvedAt: existingRun?.approvedAt,
      lockedBy: existingRun?.lockedBy,
      lockedAt: existingRun?.lockedAt
    };
  }

  /**
   * Analyse et validation des anomalies de paie avant approbation.
   */
  static validatePayrollRun(run: PayrollRun, employees: Employee[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const empMap = new Map(employees.map(e => [e.id, e]));

    for (const slip of run.payslips) {
      const emp = empMap.get(slip.employeeId);
      const name = slip.employeeSnapshot.fullName;
      const reg = slip.employeeSnapshot.registrationNumber;

      if (slip.netSalaryPayable <= 0) {
        issues.push({
          severity: 'ERROR',
          employeeId: slip.employeeId,
          registrationNumber: reg,
          employeeName: name,
          message: `Le salaire net à payer est nul ou négatif (${slip.netSalaryPayable} MRU). Vérifiez les retenues et avances.`
        });
      }

      if (emp?.paymentMethod === 'VIREMENT' && (!emp.bankAccountNumber || emp.bankAccountNumber.trim().length < 10)) {
        issues.push({
          severity: 'WARNING',
          employeeId: slip.employeeId,
          registrationNumber: reg,
          employeeName: name,
          message: 'Mode de paiement par virement sélectionné mais le RIB bancaire est incomplet ou absent.'
        });
      }

      if (!slip.employeeSnapshot.cnssNumber) {
        issues.push({
          severity: 'WARNING',
          employeeId: slip.employeeId,
          registrationNumber: reg,
          employeeName: name,
          message: 'Numéro d\'immatriculation CNSS non renseigné sur la fiche salarié.'
        });
      }

      if (slip.salaryAdvanceAmount > slip.grossSalary * 0.5) {
        issues.push({
          severity: 'WARNING',
          employeeId: slip.employeeId,
          registrationNumber: reg,
          employeeName: name,
          message: `L'acompte/avance déduit (${slip.salaryAdvanceAmount} MRU) excède 50% du salaire brut (${slip.grossSalary} MRU).`
        });
      }
    }

    return issues;
  }
}
