import React from 'react';
import { CalculatedPayslip, CompanyProfile } from '../../types';
import { X, Printer, Download, Building2 } from 'lucide-react';

interface PayslipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: CalculatedPayslip | null;
  company: CompanyProfile;
}

export const PayslipPreviewModal: React.FC<PayslipPreviewModalProps> = ({
  isOpen,
  onClose,
  payslip,
  company
}) => {
  if (!isOpen || !payslip) return null;

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '0,00';
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };

  // Séparer les rubriques de gain et les déductions
  const earningsRubrics = payslip.rubrics.filter(r => r.type === 'EARNING');
  const deductionRubrics = payslip.rubrics.filter(r => r.type === 'EMPLOYEE_DEDUCTION');
  const adjustmentRubrics = payslip.rubrics.filter(r => r.type === 'NET_ADJUSTMENT');
  const employerRubrics = payslip.rubrics.filter(r => r.type === 'EMPLOYER_CONTRIBUTION');

  const [year, month] = payslip.period.split('-');
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-300 flex flex-col max-h-[95vh]">
        {/* Barre d'outils supérieure (non imprimable) */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Édition du Bulletin de Paie · Format Normalisé A4</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">{payslip.employeeSnapshot.registrationNumber} - {payslip.employeeSnapshot.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer (A4) / Enregistrer PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zone imprimable du bulletin A4 officiel */}
        <div className="flex-1 overflow-y-auto p-8 bg-white" id="printable-payslip">
          <div className="border border-slate-300 rounded-none p-6 text-slate-900 font-sans space-y-4 max-w-[210mm] mx-auto text-xs bg-white">
            {/* 1. Entête Société & Titre Bulletin */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-900">
              <div>
                <div className="text-sm font-bold uppercase tracking-tight text-slate-900">{company.name}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{company.legalForm} · {company.address}</div>
                <div className="text-[11px] text-slate-600">{company.city}, {company.country} · Tél: {company.phone}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 space-x-2">
                  <span>NIF : <strong>{company.taxId}</strong></span>
                  <span>·</span>
                  <span>CNSS : <strong>{company.cnssNumber}</strong></span>
                  <span>·</span>
                  <span>CNAM : <strong>{company.cnamNumber}</strong></span>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between">
                <div>
                  <div className="text-base font-black tracking-tight uppercase text-slate-900">
                    BULLETIN DE PAIE
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    PÉRIODE DE {monthLabel.toUpperCase()}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Paiement le {payslip.calculationDate.split('T')[0]} · Monnaie : {company.currency}
                </div>
              </div>
            </div>

            {/* 2. Bloc Salarié & Contrat */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-200 rounded-none text-[11px]">
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500">Matricule : </span>
                  <strong className="font-mono text-slate-900">{payslip.employeeSnapshot.registrationNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nom & Prénom : </span>
                  <strong className="text-slate-900 text-xs">{payslip.employeeSnapshot.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Emploi / Poste : </span>
                  <span className="font-medium text-slate-800">{payslip.employeeSnapshot.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500">Département : </span>
                  <span className="text-slate-700">{payslip.employeeSnapshot.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Classification : </span>
                  <span className="text-slate-700">{payslip.employeeSnapshot.category}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-slate-500">N° CNSS : </span>
                  <span className="font-mono font-medium text-slate-900">{payslip.employeeSnapshot.cnssNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">N° CNAM : </span>
                  <span className="font-mono font-medium text-slate-900">{payslip.employeeSnapshot.cnamNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date d'embauche : </span>
                  <span className="font-mono text-slate-700">{payslip.employeeSnapshot.hireDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">Règlement : </span>
                  <span className="text-slate-800">{payslip.employeeSnapshot.paymentMethod} ({payslip.employeeSnapshot.bankName})</span>
                </div>
                <div>
                  <span className="text-slate-500">RIB : </span>
                  <span className="font-mono text-[10px] text-slate-700">{payslip.employeeSnapshot.bankAccountNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* 3. Tableau détaillé des rubriques de paie */}
            <div className="border border-slate-300">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="py-2 px-2.5 border-r border-slate-300 w-14">Code</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Désignation de la Rubrique</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-right w-20">Base</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-right w-14">Taux Sal.</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-right w-20">Gains (MRU)</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-right w-20">Retenues (MRU)</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-right w-14">Taux Patr.</th>
                    <th className="py-2 px-2.5 text-right w-20">Charges Patr.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[10.5px]">
                  {/* Rubriques de gains */}
                  {earningsRubrics.map((r, i) => (
                    <tr key={`earn-${i}`} className="hover:bg-slate-50/50">
                      <td className="py-1 px-2.5 border-r border-slate-200 text-slate-500">{r.code}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 font-sans text-slate-800 font-medium">{r.label}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{formatCurrency(r.base)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-900 font-semibold">{formatCurrency(r.employeeAmount)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 text-right text-slate-400">-</td>
                    </tr>
                  ))}

                  {/* Ligne sous-total Brut */}
                  <tr className="bg-slate-50 font-semibold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-1.5 px-2.5 border-r border-slate-300 font-sans uppercase text-[10px]">
                      TOTAL SALAIRE BRUT
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-300 text-right">{formatCurrency(payslip.grossSalary)}</td>
                    <td className="py-1.5 px-2.5 border-r border-slate-300"></td>
                    <td className="py-1.5 px-2.5 border-r border-slate-300 text-right font-bold text-slate-900">{formatCurrency(payslip.grossSalary)}</td>
                    <td colSpan={3}></td>
                  </tr>

                  {/* Rubriques de déductions salariales & patronales (CNSS, CNAM, ITS) */}
                  {deductionRubrics.map((r, i) => (
                    <tr key={`ded-${i}`} className="hover:bg-slate-50/50">
                      <td className="py-1 px-2.5 border-r border-slate-200 text-slate-500">{r.code}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 font-sans text-slate-800">{r.label}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{formatCurrency(r.base)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{r.employeeRate ? `${r.employeeRate.toFixed(2)}%` : '-'}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-red-700 font-medium">{formatCurrency(r.employeeAmount)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{r.employerRate ? `${r.employerRate.toFixed(2)}%` : '-'}</td>
                      <td className="py-1 px-2.5 text-right text-slate-800">{r.employerAmount ? formatCurrency(r.employerAmount) : '-'}</td>
                    </tr>
                  ))}

                  {/* Charges patronales supplémentaires (Allocations familiales 8% & Risques pro 2%) */}
                  {employerRubrics.map((r, i) => (
                    <tr key={`emp-${i}`} className="hover:bg-slate-50/50">
                      <td className="py-1 px-2.5 border-r border-slate-200 text-slate-500">{r.code}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 font-sans text-slate-700 italic">{r.label}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{formatCurrency(r.base)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{r.employerRate ? `${r.employerRate.toFixed(2)}%` : '-'}</td>
                      <td className="py-1 px-2.5 text-right text-slate-800">{formatCurrency(r.employerAmount)}</td>
                    </tr>
                  ))}

                  {/* Acomptes ou ajustements */}
                  {adjustmentRubrics.map((r, i) => (
                    <tr key={`adj-${i}`} className="hover:bg-slate-50/50">
                      <td className="py-1 px-2.5 border-r border-slate-200 text-slate-500">{r.code}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 font-sans text-amber-800">{r.label}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-600">{formatCurrency(r.base)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-amber-800 font-medium">{formatCurrency(r.employeeAmount)}</td>
                      <td className="py-1 px-2.5 border-r border-slate-200 text-right text-slate-400">-</td>
                      <td className="py-1 px-2.5 text-right text-slate-400">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Récapitulatif Assiettes et Cumuls */}
            <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2.5 border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 font-sans">Brut fiscal imposable : </span>
                <strong className="text-slate-900">{formatCurrency(payslip.taxableGrossSalary)} MRU</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Plafond CNSS appliqué : </span>
                <strong className="text-slate-900">{formatCurrency(payslip.cnssBase)} MRU</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Assiette CNAM soumise : </span>
                <strong className="text-slate-900">{formatCurrency(payslip.cnamBase)} MRU</strong>
              </div>
            </div>

            {/* 5. Bloc Total Déductions & NET À PAYER */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-300 p-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Cotisations Salariales :</span>
                  <span className="font-mono font-medium">{formatCurrency(payslip.cnssEmployeeAmount + payslip.cnamEmployeeAmount)} MRU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Impôt ITS Retenu :</span>
                  <span className="font-mono font-medium text-purple-700">{formatCurrency(payslip.itsTaxAmount)} MRU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Charges Patronales (17%) :</span>
                  <span className="font-mono font-medium">{formatCurrency(payslip.totalEmployerContributions)} MRU</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold text-slate-900">
                  <span>Coût Total Employeur :</span>
                  <span className="font-mono">{formatCurrency(payslip.totalEmployerCost)} MRU</span>
                </div>
              </div>

              {/* Encadré Net à Payer */}
              <div className="border-2 border-slate-900 bg-slate-50 p-4 flex flex-col justify-between text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                  NET À PAYER AU SALARIÉ (MRU)
                </div>
                <div className="text-2xl font-black font-mono tracking-tight text-slate-950 my-1">
                  {formatCurrency(payslip.netSalaryPayable)} <span className="text-xs font-sans font-bold">MRU</span>
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  Virement sur compte : {payslip.employeeSnapshot.bankAccountNumber || 'Guichet'}
                </div>
              </div>
            </div>

            {/* 6. Mentions légales et signature */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 text-[10px] text-slate-500">
              <div>
                <p>Pour faire valoir ce que de droit.</p>
                <p className="mt-1">Ce bulletin doit être conservé sans limitation de durée conformément à la législation du travail mauritanienne.</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span>Visa de la Direction / Signature & Cachet</span>
                <div className="w-36 h-12 border-b border-dashed border-slate-400 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
