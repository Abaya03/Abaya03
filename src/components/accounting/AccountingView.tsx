import React from 'react';
import { PayrollRun } from '../../types';
import { AccountingService } from '../../services/accountingService';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

interface AccountingViewProps {
  currentRun: PayrollRun | undefined;
}

export const AccountingView: React.FC<AccountingViewProps> = ({ currentRun }) => {
  if (!currentRun) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Veuillez sélectionner ou calculer une période de paie pour générer l'écriture comptable d'OD.
      </div>
    );
  }

  const journalEntry = AccountingService.generatePayrollJournalEntry(currentRun);

  const formatCurrency = (val: number) => {
    return val > 0 ? val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
  };

  const handleExportCSV = () => {
    const csvData = AccountingService.exportJournalToCSV(journalEntry);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `od_paie_${currentRun.period}_sage.csv`);
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
            Intégration Comptable & Plan Général des Comptes
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Journal d'Opérations Diverses (OD de Paie) · {currentRun.label}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer la pièce comptable</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter format Sage 100 / CSV</span>
          </button>
        </div>
      </div>

      {/* Cartouche de contrôle d'équilibre de la pièce comptable */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        journalEntry.isBalanced
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-red-50 border-red-200 text-red-900'
      }`}>
        <div className="flex items-center gap-3">
          {journalEntry.isBalanced ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-xs uppercase tracking-wider">
              {journalEntry.isBalanced ? 'Écriture Comptable Rigoureusement Équilibrée' : 'Déséquilibre Débit / Crédit Détecté'}
            </div>
            <div className="text-xs mt-0.5 opacity-90">
              Journal : <strong className="font-mono">{journalEntry.journalCode}</strong> · Référence Pièce : <strong className="font-mono">{journalEntry.reference}</strong> · Date valeur : <strong className="font-mono">{journalEntry.date}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div>
            <span className="text-[10px] uppercase font-sans font-normal opacity-80 block">Total Débit :</span>
            <span>{journalEntry.totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-sans font-normal opacity-80 block">Total Crédit :</span>
            <span>{journalEntry.totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU</span>
          </div>
        </div>
      </div>

      {/* Grille des écritures comptables (Double partie) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 w-28">N° de Compte</th>
                <th className="px-4 py-3">Intitulé du Compte Général</th>
                <th className="px-4 py-3">Libellé de l'Écriture de Paie</th>
                <th className="px-4 py-3 text-right w-36">Débit (MRU)</th>
                <th className="px-4 py-3 text-right w-36">Crédit (MRU)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {journalEntry.lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-blue-900 bg-slate-50/50">
                    {line.accountNumber}
                  </td>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-800">
                    {line.accountLabel}
                  </td>
                  <td className="px-4 py-2.5 font-sans text-slate-600">
                    {line.label}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                    {formatCurrency(line.debit)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                    {formatCurrency(line.credit)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-xs">
              <tr>
                <td colSpan={3} className="px-4 py-3 font-sans uppercase">
                  TOTAL DE LA PIÈCE D'OPÉRATIONS DIVERSES
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-950">
                  {journalEntry.totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-950">
                  {journalEntry.totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
