import { PayrollRun, AccountingJournalEntry } from '../types';
import { roundCurrency } from '../engine/mauritanianTaxEngine';

export class AccountingService {
  /**
   * Génère l'écriture de journal d'opérations diverses (OD de paie) équilibrée.
   */
  static generatePayrollJournalEntry(run: PayrollRun): AccountingJournalEntry {
    const lines: Array<{
      accountNumber: string;
      accountLabel: string;
      label: string;
      debit: number;
      credit: number;
      costCenter?: string;
    }> = [];

    // Décomposition des charges salariales brutes
    let totalBaseSalary = 0;
    let totalAllowances = 0;
    let totalAdvances = 0;

    for (const p of run.payslips) {
      totalBaseSalary += p.baseSalary;
      totalAllowances += p.totalAllowances;
      totalAdvances += p.salaryAdvanceAmount;
    }

    totalBaseSalary = roundCurrency(totalBaseSalary);
    totalAllowances = roundCurrency(totalAllowances);
    totalAdvances = roundCurrency(totalAdvances);

    // DÉBITS (Charges de personnel - Classe 6)
    // 641100 - Salaires de base
    if (totalBaseSalary > 0) {
      lines.push({
        accountNumber: '641100',
        accountLabel: 'Salaires de base du personnel national',
        label: `Salaires de base - ${run.label}`,
        debit: totalBaseSalary,
        credit: 0
      });
    }

    // 641200 - Primes, indemnités et heures supplémentaires
    if (totalAllowances > 0) {
      lines.push({
        accountNumber: '641200',
        accountLabel: 'Primes, indemnités et avantages au personnel',
        label: `Indemnités et primes - ${run.label}`,
        debit: totalAllowances,
        credit: 0
      });
    }

    // 645100 - Cotisations patronales CNSS
    if (run.totalCnssEmployer > 0) {
      lines.push({
        accountNumber: '645100',
        accountLabel: 'Cotisations de sécurité sociale (CNSS patronale)',
        label: `Charges patronales CNSS (12%) - ${run.label}`,
        debit: run.totalCnssEmployer,
        credit: 0
      });
    }

    // 645200 - Cotisations patronales CNAM
    if (run.totalCnamEmployer > 0) {
      lines.push({
        accountNumber: '645200',
        accountLabel: 'Cotisations assurance maladie (CNAM patronale)',
        label: `Charges patronales CNAM (5%) - ${run.label}`,
        debit: run.totalCnamEmployer,
        credit: 0
      });
    }

    // CRÉDITS (Dettes et retenues - Classe 4)
    // 421000 - Personnel - Rémunérations nettes dues
    if (run.totalNetPayable > 0) {
      lines.push({
        accountNumber: '421000',
        accountLabel: 'Personnel - Rémunérations dues (Net à payer)',
        label: `Net à payer aux salariés - ${run.label}`,
        debit: 0,
        credit: run.totalNetPayable
      });
    }

    // 431100 - Organismes sociaux - CNSS (Part salariale 1% + Part patronale 12%)
    const totalCnssDue = roundCurrency(run.totalCnssEmployee + run.totalCnssEmployer);
    if (totalCnssDue > 0) {
      lines.push({
        accountNumber: '431100',
        accountLabel: 'Sécurité Sociale (CNSS) - Cotisations dues',
        label: `CNSS globale due (salariale + patronale) - ${run.label}`,
        debit: 0,
        credit: totalCnssDue
      });
    }

    // 431200 - Organismes sociaux - CNAM (Part salariale 4% + Part patronale 5%)
    const totalCnamDue = roundCurrency(run.totalCnamEmployee + run.totalCnamEmployer);
    if (totalCnamDue > 0) {
      lines.push({
        accountNumber: '431200',
        accountLabel: 'Assurance Maladie (CNAM) - Cotisations dues',
        label: `CNAM globale due (salariale + patronale) - ${run.label}`,
        debit: 0,
        credit: totalCnamDue
      });
    }

    // 447100 - État - Impôt sur les Traitements et Salaires (ITS)
    if (run.totalIts > 0) {
      lines.push({
        accountNumber: '447100',
        accountLabel: 'État - Impôts retenus à la source (ITS)',
        label: `Retenue fiscale ITS - ${run.label}`,
        debit: 0,
        credit: run.totalIts
      });
    }

    // 425000 - Personnel - Avances et acomptes récupérés
    if (totalAdvances > 0) {
      lines.push({
        accountNumber: '425000',
        accountLabel: 'Personnel - Avances et acomptes récupérés',
        label: `Récupération acomptes sur salaire - ${run.label}`,
        debit: 0,
        credit: totalAdvances
      });
    }

    const totalDebit = roundCurrency(lines.reduce((sum, l) => sum + l.debit, 0));
    const totalCredit = roundCurrency(lines.reduce((sum, l) => sum + l.credit, 0));
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.05;

    return {
      id: `OD-PAIE-${run.period}`,
      period: run.period,
      date: run.paymentDate,
      journalCode: 'OD',
      reference: `PAIE-${run.period}`,
      lines,
      totalDebit,
      totalCredit,
      isBalanced
    };
  }

  /**
   * Export CSV formaté pour import direct dans logiciels comptables (Sage 100, etc.)
   */
  static exportJournalToCSV(entry: AccountingJournalEntry): string {
    const headers = ['Journal', 'Date', 'N° Compte', 'Intitulé Compte', 'Libellé Écriture', 'Référence', 'Débit (MRU)', 'Crédit (MRU)'];
    const rows = entry.lines.map(line => [
      entry.journalCode,
      entry.date,
      line.accountNumber,
      `"${line.accountLabel}"`,
      `"${line.label}"`,
      entry.reference,
      line.debit > 0 ? line.debit.toFixed(2) : '',
      line.credit > 0 ? line.credit.toFixed(2) : ''
    ]);

    return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  }
}
