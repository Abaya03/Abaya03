import React, { useState } from 'react';
import { LegalPayrollRules } from '../../types';
import { calculateMauritanianITS, roundCurrency } from '../../engine/mauritanianTaxEngine';
import { Sigma, X, Calculator, ArrowRight } from 'lucide-react';

interface SalaryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: LegalPayrollRules;
}

export const SalaryCalculatorModal: React.FC<SalaryCalculatorModalProps> = ({
  isOpen,
  onClose,
  rules
}) => {
  const [baseSalary, setBaseSalary] = useState<number>(45000);
  const [transportAllowance, setTransportAllowance] = useState<number>(3000);
  const [otherAllowances, setOtherAllowances] = useState<number>(5000);

  if (!isOpen) return null;

  // Calcul instantané
  const grossSalary = roundCurrency(baseSalary + transportAllowance + otherAllowances);
  const exemptTransport = Math.min(transportAllowance, rules.transportAllowanceExemptLimit);
  const cnamBase = Math.max(0, grossSalary - exemptTransport);
  const cnssBase = Math.min(cnamBase, rules.cnssCeilingMonthly);

  const cnssEmployee = roundCurrency(cnssBase * rules.cnssPensionEmployeeRate);
  const cnamEmployee = roundCurrency(cnamBase * rules.cnamEmployeeRate);
  const taxableBase = Math.max(0, cnamBase - cnssEmployee - cnamEmployee);
  const { tax: itsTax } = calculateMauritanianITS(taxableBase, rules);

  const netPayable = roundCurrency(grossSalary - (cnssEmployee + cnamEmployee + itsTax));

  const cnssEmployer = roundCurrency(cnssBase * (rules.cnssPensionEmployerRate + rules.cnssFamilyAllowanceRate + rules.cnssWorkInjuryRate));
  const cnamEmployer = roundCurrency(cnamBase * rules.cnamEmployerRate);
  const totalEmployerCost = roundCurrency(grossSalary + cnssEmployer + cnamEmployer);

  const formatCurrency = (val: number) => val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MRU';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-300">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sigma className="w-5 h-5 text-sky-800" />
            <h2 className="text-sm font-bold text-slate-900">
              Calculette Rapide de Salaires (Mauritanie)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Salaire de Base</label>
              <input
                type="number"
                step="500"
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Indemnité Transport</label>
              <input
                type="number"
                step="500"
                value={transportAllowance}
                onChange={(e) => setTransportAllowance(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded font-mono"
              />
              <span className="text-[10px] text-slate-400">Exonéré : 2 500 MRU</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Autres Primes</label>
              <input
                type="number"
                step="500"
                value={otherAllowances}
                onChange={(e) => setOtherAllowances(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between font-semibold text-slate-900 text-sm pb-2 border-b border-slate-200">
              <span>Salaire Brut Global :</span>
              <span className="font-mono text-sky-900">{formatCurrency(grossSalary)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Assiette CNSS (Plafonnée à 70 000 MRU) :</span>
              <span className="font-mono">{formatCurrency(cnssBase)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Assiette CNAM (Déplafonnée) :</span>
              <span className="font-mono">{formatCurrency(cnamBase)}</span>
            </div>
            <div className="flex justify-between text-red-700 pt-1 border-t border-slate-200">
              <span>Retenue CNSS (1,00%) :</span>
              <span className="font-mono font-medium">-{formatCurrency(cnssEmployee)}</span>
            </div>
            <div className="flex justify-between text-red-700">
              <span>Retenue CNAM (4,00%) :</span>
              <span className="font-mono font-medium">-{formatCurrency(cnamEmployee)}</span>
            </div>
            <div className="flex justify-between text-red-700">
              <span>Retenue ITS (Barème CGI) :</span>
              <span className="font-mono font-bold">-{formatCurrency(itsTax)}</span>
            </div>

            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between">
              <span className="font-bold text-emerald-900">SALAIRE NET À PAYER :</span>
              <span className="font-mono font-black text-emerald-900 text-base">{formatCurrency(netPayable)}</span>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Charges patronales (CNSS 12% + CNAM 5%) :</span>
              <span className="font-mono font-medium">{formatCurrency(cnssEmployer + cnamEmployer)}</span>
            </div>
            <div className="text-[11px] text-slate-700 font-semibold flex justify-between">
              <span>Coût global employeur :</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(totalEmployerCost)}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
