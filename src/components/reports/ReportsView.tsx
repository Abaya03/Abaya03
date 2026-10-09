import React, { useState } from 'react';
import { PayrollRun, CompanyProfile, Department, Employee } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Building,
  CreditCard,
  FileText,
  Filter
} from 'lucide-react';

interface ReportsViewProps {
  currentRun: PayrollRun | undefined;
  company: CompanyProfile;
  departments: Department[];
  employees: Employee[];
  onOpenEmployeeWindow?: (employee: Employee) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentRun,
  company,
  departments,
  employees,
  onOpenEmployeeWindow
}) => {
  const [selectedReport, setSelectedReport] = useState<'livre' | 'cnss' | 'cnam' | 'its' | 'virement'>('livre');

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '0,00';
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const payslips = currentRun?.payslips || [];

  // Exporter en CSV selon l'état sélectionné
  const handleExportCSV = () => {
    if (!currentRun) return;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `${selectedReport}_${currentRun.period}.csv`;

    if (selectedReport === 'livre') {
      headers = ['Matricule', 'Salarié', 'Département', 'Salaire Base', 'Indemnités', 'Brut Global', 'Assiette CNSS', 'Assiette CNAM', 'CNSS Sal.', 'CNAM Sal.', 'ITS', 'Acomptes', 'Net à Payer (MRU)', 'Charges Patr.', 'Coût Total'];
      rows = payslips.map(p => [
        p.employeeSnapshot.registrationNumber,
        `"${p.employeeSnapshot.fullName}"`,
        `"${p.employeeSnapshot.departmentName}"`,
        p.baseSalary,
        p.totalAllowances,
        p.grossSalary,
        p.cnssBase,
        p.cnamBase,
        p.cnssEmployeeAmount,
        p.cnamEmployeeAmount,
        p.itsTaxAmount,
        p.salaryAdvanceAmount,
        p.netSalaryPayable,
        p.totalEmployerContributions,
        p.totalEmployerCost
      ]);
    } else if (selectedReport === 'cnss') {
      headers = ['N° CNSS', 'Matricule', 'Salarié', 'Salaire Brut', 'Assiette Plafonnée (70k MRU)', 'Vieillesse Sal. (1%)', 'Vieillesse Patr. (2%)', 'Allocations Fam. (8%)', 'Risques Pro (2%)', 'Total CNSS (13%)'];
      rows = payslips.map(p => [
        `"${p.employeeSnapshot.cnssNumber}"`,
        p.employeeSnapshot.registrationNumber,
        `"${p.employeeSnapshot.fullName}"`,
        p.grossSalary,
        p.cnssBase,
        p.cnssEmployeeAmount,
        p.cnssEmployerPensionAmount,
        p.cnssEmployerFamilyAmount,
        p.cnssEmployerInjuryAmount,
        p.cnssEmployeeAmount + p.cnssEmployerTotalAmount
      ]);
    } else if (selectedReport === 'cnam') {
      headers = ['N° CNAM', 'Matricule', 'Salarié', 'Assiette Déplafonnée', 'Part Salariale (4%)', 'Part Patronale (5%)', 'Total CNAM Dû (9%)'];
      rows = payslips.map(p => [
        `"${p.employeeSnapshot.cnamNumber}"`,
        p.employeeSnapshot.registrationNumber,
        `"${p.employeeSnapshot.fullName}"`,
        p.cnamBase,
        p.cnamEmployeeAmount,
        p.cnamEmployerAmount,
        p.cnamEmployeeAmount + p.cnamEmployerAmount
      ]);
    } else if (selectedReport === 'its') {
      headers = ['N° NNID', 'Matricule', 'Salarié', 'Brut Global', 'Exonérations', 'Cotisations Déductibles', 'Brut Imposable', 'Montant Retenue ITS (MRU)'];
      rows = payslips.map(p => [
        `"${p.employeeSnapshot.nationalId}"`,
        p.employeeSnapshot.registrationNumber,
        `"${p.employeeSnapshot.fullName}"`,
        p.grossSalary,
        p.exemptAllowances,
        p.cnssEmployeeAmount + p.cnamEmployeeAmount,
        p.taxableGrossSalary,
        p.itsTaxAmount
      ]);
    } else if (selectedReport === 'virement') {
      headers = ['Banque', 'RIB Bénéficiaire', 'Matricule', 'Nom du Bénéficiaire', 'Montant Virement (MRU)', 'Référence Paiement'];
      rows = payslips.map(p => [
        `"${p.employeeSnapshot.bankName}"`,
        `"${p.employeeSnapshot.bankAccountNumber}"`,
        p.employeeSnapshot.registrationNumber,
        `"${p.employeeSnapshot.fullName}"`,
        p.netSalaryPayable,
        `"SALAIRE-${currentRun.period}-${p.employeeSnapshot.registrationNumber}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Kicker et en-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Éditions Officielles & Déclarations Fiscales & Sociales
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            États et Rapports de Paie · {currentRun?.label || 'Période en cours'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer l'état</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter au format CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Onglets de sélection des états légaux */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setSelectedReport('livre')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedReport === 'livre'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Livre de Paie Mensuel</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('cnss')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedReport === 'cnss'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bordereau Déclaration CNSS</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('cnam')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedReport === 'cnam'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Bordereau Déclaration CNAM</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('its')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedReport === 'its'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Déclaration Fiscale ITS (DGI)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('virement')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedReport === 'virement'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Ordre de Virement Bancaire</span>
        </button>
      </div>

      {/* Contenu de l'état sélectionné */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Entête du rapport */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-900 uppercase text-sm">
              {selectedReport === 'livre' && 'Livre de Paie Récapitulatif Mensuel'}
              {selectedReport === 'cnss' && `Bordereau de Déclaration Trimestrielle / Mensuelle CNSS · N° Affiliation : ${company.cnssNumber}`}
              {selectedReport === 'cnam' && `Bordereau de Cotisations Assurance Maladie CNAM · N° Affiliation : ${company.cnamNumber}`}
              {selectedReport === 'its' && `État Nominatif de Retenue à la Source ITS · NIF Entreprise : ${company.taxId}`}
              {selectedReport === 'virement' && `Bordereau d'Ordre de Virement aux Établissements Bancaires`}
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Entreprise : {company.name} · Échéance : {currentRun?.paymentDate || 'Fin de mois'} · Devise : {company.currency}
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">{payslips.length} salariés</span> sur l'état
          </div>
        </div>

        {/* 1. LIVRE DE PAIE */}
        {selectedReport === 'livre' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[9.5px]">
                <tr>
                  <th className="px-3 py-2.5">Matricule</th>
                  <th className="px-3 py-2.5">Salarié</th>
                  <th className="px-3 py-2.5 text-right">Salaire Base</th>
                  <th className="px-3 py-2.5 text-right">Primes</th>
                  <th className="px-3 py-2.5 text-right">Brut Global</th>
                  <th className="px-3 py-2.5 text-right">Assiette CNSS</th>
                  <th className="px-3 py-2.5 text-right">CNSS Sal.</th>
                  <th className="px-3 py-2.5 text-right">CNAM Sal.</th>
                  <th className="px-3 py-2.5 text-right">ITS Impôt</th>
                  <th className="px-3 py-2.5 text-right">Net à Payer</th>
                  <th className="px-3 py-2.5 text-right">Charges Patr.</th>
                  <th className="px-3 py-2.5 text-right">Coût Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payslips.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td
                      onClick={() => {
                        const emp = employees.find(e => e.id === p.employeeId);
                        if (emp && onOpenEmployeeWindow) onOpenEmployeeWindow(emp);
                      }}
                      className="px-3 py-2 font-semibold text-slate-900 hover:text-sky-700 hover:underline cursor-pointer"
                      title="Cliquer pour ouvrir la fenêtre Salarié (معلومات الموظف)"
                    >
                      {p.employeeSnapshot.registrationNumber}
                    </td>
                    <td
                      onClick={() => {
                        const emp = employees.find(e => e.id === p.employeeId);
                        if (emp && onOpenEmployeeWindow) onOpenEmployeeWindow(emp);
                      }}
                      className="px-3 py-2 font-sans font-medium text-slate-800 hover:text-sky-700 hover:underline cursor-pointer"
                      title="Cliquer pour ouvrir la fenêtre Salarié (معلومات الموظف)"
                    >
                      {p.employeeSnapshot.fullName}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(p.baseSalary)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(p.totalAllowances)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(p.grossSalary)}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(p.cnssBase)}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(p.cnssEmployeeAmount)}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(p.cnamEmployeeAmount)}</td>
                    <td className="px-3 py-2 text-right text-purple-700 font-semibold">{formatCurrency(p.itsTaxAmount)}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700 bg-emerald-50/30">{formatCurrency(p.netSalaryPayable)}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(p.totalEmployerContributions)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(p.totalEmployerCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                <tr>
                  <td colSpan={2} className="px-3 py-2.5 font-sans uppercase">TOTAUX GÉNÉRAUX</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.baseSalary, 0))}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.totalAllowances, 0))}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(currentRun?.totalGross)}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.cnssBase, 0))}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(currentRun?.totalCnssEmployee)}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(currentRun?.totalCnamEmployee)}</td>
                  <td className="px-3 py-2.5 text-right text-purple-700">{formatCurrency(currentRun?.totalIts)}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-800 font-black">{formatCurrency(currentRun?.totalNetPayable)}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency((currentRun?.totalCnssEmployer || 0) + (currentRun?.totalCnamEmployer || 0))}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(currentRun?.totalEmployerCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 2. DÉCLARATION CNSS */}
        {selectedReport === 'cnss' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[9.5px]">
                <tr>
                  <th className="px-4 py-2.5">N° CNSS</th>
                  <th className="px-4 py-2.5">Matricule</th>
                  <th className="px-4 py-2.5">Salarié</th>
                  <th className="px-4 py-2.5 text-right">Salaire Brut</th>
                  <th className="px-4 py-2.5 text-right">Assiette Plafonnée (70k)</th>
                  <th className="px-4 py-2.5 text-right">Vieillesse Sal. (1%)</th>
                  <th className="px-4 py-2.5 text-right">Vieillesse Patr. (2%)</th>
                  <th className="px-4 py-2.5 text-right">Prestations Fam. (8%)</th>
                  <th className="px-4 py-2.5 text-right">Risques Pro (2%)</th>
                  <th className="px-4 py-2.5 text-right">Total CNSS Dû</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payslips.map(p => {
                  const totalLine = p.cnssEmployeeAmount + p.cnssEmployerTotalAmount;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2 font-semibold text-slate-900">{p.employeeSnapshot.cnssNumber || 'N/A'}</td>
                      <td className="px-4 py-2 text-slate-500">{p.employeeSnapshot.registrationNumber}</td>
                      <td className="px-4 py-2 font-sans font-medium text-slate-800">{p.employeeSnapshot.fullName}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(p.grossSalary)}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(p.cnssBase)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(p.cnssEmployeeAmount)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(p.cnssEmployerPensionAmount)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(p.cnssEmployerFamilyAmount)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(p.cnssEmployerInjuryAmount)}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-900">{formatCurrency(totalLine)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 font-sans uppercase">TOTAL BORDEREAU CNSS</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(currentRun?.totalGross)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.cnssBase, 0))}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(currentRun?.totalCnssEmployee)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.cnssEmployerPensionAmount, 0))}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.cnssEmployerFamilyAmount, 0))}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.cnssEmployerInjuryAmount, 0))}</td>
                  <td className="px-4 py-2.5 text-right font-black text-blue-900">
                    {formatCurrency((currentRun?.totalCnssEmployee || 0) + (currentRun?.totalCnssEmployer || 0))} MRU
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 3. DÉCLARATION CNAM */}
        {selectedReport === 'cnam' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[9.5px]">
                <tr>
                  <th className="px-4 py-2.5">N° CNAM</th>
                  <th className="px-4 py-2.5">Matricule</th>
                  <th className="px-4 py-2.5">Salarié</th>
                  <th className="px-4 py-2.5 text-right">Assiette Déplafonnée</th>
                  <th className="px-4 py-2.5 text-right">Part Salariale (4.00%)</th>
                  <th className="px-4 py-2.5 text-right">Part Patronale (5.00%)</th>
                  <th className="px-4 py-2.5 text-right">Total Cotisation (9.00%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payslips.map(p => {
                  const lineTotal = p.cnamEmployeeAmount + p.cnamEmployerAmount;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2 font-semibold text-slate-900">{p.employeeSnapshot.cnamNumber || 'N/A'}</td>
                      <td className="px-4 py-2 text-slate-500">{p.employeeSnapshot.registrationNumber}</td>
                      <td className="px-4 py-2 font-sans font-medium text-slate-800">{p.employeeSnapshot.fullName}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(p.cnamBase)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(p.cnamEmployeeAmount)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(p.cnamEmployerAmount)}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-900">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 font-sans uppercase">TOTAL BORDEREAU CNAM</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(payslips.reduce((s, p) => s + p.cnamBase, 0))}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(currentRun?.totalCnamEmployee)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(currentRun?.totalCnamEmployer)}</td>
                  <td className="px-4 py-2.5 text-right font-black text-indigo-900">
                    {formatCurrency((currentRun?.totalCnamEmployee || 0) + (currentRun?.totalCnamEmployer || 0))} MRU
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 4. DÉCLARATION ITS */}
        {selectedReport === 'its' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[9.5px]">
                <tr>
                  <th className="px-4 py-2.5">N° NNID</th>
                  <th className="px-4 py-2.5">Matricule</th>
                  <th className="px-4 py-2.5">Salarié</th>
                  <th className="px-4 py-2.5 text-right">Salaire Brut Global</th>
                  <th className="px-4 py-2.5 text-right">Exonérations (Transport)</th>
                  <th className="px-4 py-2.5 text-right">Cotisations Sociales Déductibles</th>
                  <th className="px-4 py-2.5 text-right">Brut Fiscal Imposable</th>
                  <th className="px-4 py-2.5 text-right">Impôt ITS Retenu (MRU)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payslips.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-600">{p.employeeSnapshot.nationalId}</td>
                    <td className="px-4 py-2 text-slate-500">{p.employeeSnapshot.registrationNumber}</td>
                    <td className="px-4 py-2 font-sans font-medium text-slate-800">{p.employeeSnapshot.fullName}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(p.grossSalary)}</td>
                    <td className="px-4 py-2 text-right text-slate-500">-{formatCurrency(p.exemptAllowances)}</td>
                    <td className="px-4 py-2 text-right text-slate-500">-{formatCurrency(p.cnssEmployeeAmount + p.cnamEmployeeAmount)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900">{formatCurrency(p.taxableGrossSalary)}</td>
                    <td className="px-4 py-2 text-right font-bold text-purple-700 bg-purple-50/30">{formatCurrency(p.itsTaxAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 font-sans uppercase">TOTAL RETENUES FISCALES ITS</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(currentRun?.totalGross)}</td>
                  <td className="px-4 py-2.5 text-right">-{formatCurrency(payslips.reduce((s, p) => s + p.exemptAllowances, 0))}</td>
                  <td className="px-4 py-2.5 text-right">-{formatCurrency((currentRun?.totalCnssEmployee || 0) + (currentRun?.totalCnamEmployee || 0))}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(currentRun?.totalTaxable)}</td>
                  <td className="px-4 py-2.5 text-right font-black text-purple-900">{formatCurrency(currentRun?.totalIts)} MRU</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 5. VIREMENT BANCAIRE */}
        {selectedReport === 'virement' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[9.5px]">
                <tr>
                  <th className="px-4 py-2.5">Matricule</th>
                  <th className="px-4 py-2.5">Bénéficiaire</th>
                  <th className="px-4 py-2.5">Établissement Bancaire</th>
                  <th className="px-4 py-2.5">Numéro de Compte (RIB)</th>
                  <th className="px-4 py-2.5 text-right">Montant à Verser</th>
                  <th className="px-4 py-2.5">Référence Virement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payslips.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-600">{p.employeeSnapshot.registrationNumber}</td>
                    <td className="px-4 py-2 font-sans font-medium text-slate-800">{p.employeeSnapshot.fullName}</td>
                    <td className="px-4 py-2 font-sans text-slate-700">{p.employeeSnapshot.bankName}</td>
                    <td className="px-4 py-2 text-slate-900 font-semibold">{p.employeeSnapshot.bankAccountNumber || 'Pas de RIB renseigné'}</td>
                    <td className="px-4 py-2 text-right font-bold text-emerald-800">{formatCurrency(p.netSalaryPayable)} MRU</td>
                    <td className="px-4 py-2 text-slate-500 text-[10px]">SALAIRE-{p.period}-{p.employeeSnapshot.registrationNumber}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 font-sans uppercase">TOTAL DE L'ORDRE DE VIREMENT</td>
                  <td className="px-4 py-2.5 text-right font-black text-emerald-900">{formatCurrency(currentRun?.totalNetPayable)} MRU</td>
                  <td className="px-4 py-2.5 text-[10px] text-slate-500 font-normal">Compte émetteur SMIS SA ({company.bankAccountRIB})</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
