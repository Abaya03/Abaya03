import React, { useState } from 'react';
import { Employee, PayrollInputLine, LegalPayrollRules, PayRubricDefinition } from '../../types';
import { calculateEmployeePayslip, roundCurrency } from '../../engine/mauritanianTaxEngine';
import { evaluateRubricFormula } from '../../engine/formulaEngine';
import { INITIAL_PAY_RUBRICS } from '../../data/rubricsData';
import { X, Save, Calculator, AlertCircle, Plus, Trash2, Sliders } from 'lucide-react';

interface PayrollAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  initialInput?: PayrollInputLine;
  period: string;
  rules: LegalPayrollRules;
  departmentName: string;
  onSaveInput: (employeeId: string, input: PayrollInputLine) => void;
  availableRubrics?: PayRubricDefinition[];
}

export const PayrollAdjustmentModal: React.FC<PayrollAdjustmentModalProps> = ({
  isOpen,
  onClose,
  employee,
  initialInput,
  period,
  rules,
  departmentName,
  onSaveInput,
  availableRubrics = INITIAL_PAY_RUBRICS
}) => {
  if (!isOpen || !employee) return null;

  const [input, setInput] = useState<PayrollInputLine>(() => {
    return initialInput || {
      employeeId: employee.id,
      overtimeHours115: 0,
      overtimeHours150: 0,
      overtimeHours200: 0,
      bonusExceptional: 0,
      absenceDays: 0,
      salaryAdvance: 0,
      retroactiveAdjustment: 0,
      notes: '',
      customRubricEntries: []
    };
  });

  const [selectedAddRubricId, setSelectedAddRubricId] = useState<string>(availableRubrics[0]?.id || 'RUB-0');
  const [rubricAddBase, setRubricAddBase] = useState<number>(employee.baseSalary);
  const [rubricAddCount, setRubricAddCount] = useState<number>(1);

  const handleAddCustomRubricToEmployee = () => {
    const rubDef = availableRubrics.find(r => r.id === selectedAddRubricId);
    if (!rubDef) return;

    let computedAmount = rubricAddBase;
    if (rubDef.formula) {
      const evalRes = evaluateRubricFormula(
        rubDef.formula,
        {
          employee,
          rules,
          baseSalary: employee.baseSalary
        },
        rubricAddBase,
        rubDef.formula.defaultRate ?? 100,
        rubricAddCount
      );
      computedAmount = evalRes.computedAmount;
    }

    const newEntry = {
      rubricId: rubDef.id,
      code: rubDef.code,
      label: `${rubDef.label} [${rubDef.code}]`,
      base: rubricAddBase,
      taux: rubDef.formula?.defaultRate ?? 100,
      montant: computedAmount,
      isGain: rubDef.sens === 'G'
    };

    const currentEntries = input.customRubricEntries || [];
    setInput({
      ...input,
      customRubricEntries: [...currentEntries, newEntry]
    });
  };

  const handleRemoveCustomRubric = (index: number) => {
    const currentEntries = input.customRubricEntries || [];
    setInput({
      ...input,
      customRubricEntries: currentEntries.filter((_, i) => i !== index)
    });
  };

  // Aperçu immédiat du calcul simulé
  const simulatedPayslip = calculateEmployeePayslip(
    employee,
    input,
    period,
    'SIMULATION',
    rules,
    departmentName
  );

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MRU';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInput(employee.id, input);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Saisie des Variables de Paie · {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-xs text-slate-500">
              Matricule : <span className="font-mono font-medium text-slate-700">{employee.registrationNumber}</span> · Période : {period}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
            {/* Colonne gauche : Saisie des variables du mois */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Éléments Variables du Mois
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">H. Supp 115%</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={input.overtimeHours115 || 0}
                    onChange={(e) => setInput({ ...input, overtimeHours115: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">H. Supp 150%</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={input.overtimeHours150 || 0}
                    onChange={(e) => setInput({ ...input, overtimeHours150: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">H. Supp 200%</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={input.overtimeHours200 || 0}
                    onChange={(e) => setInput({ ...input, overtimeHours200: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Prime exceptionnelle de performance (MRU)
                </label>
                <input
                  type="number"
                  step="100"
                  value={input.bonusExceptional || 0}
                  onChange={(e) => setInput({ ...input, bonusExceptional: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre de jours d'absence non rémunérés
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={input.absenceDays || 0}
                  onChange={(e) => setInput({ ...input, absenceDays: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Acompte / Avance sur salaire à déduire (MRU)
                </label>
                <input
                  type="number"
                  step="100"
                  value={input.salaryAdvance || 0}
                  onChange={(e) => setInput({ ...input, salaryAdvance: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Régularisation / Rappel sur salaire (+/- MRU)
                </label>
                <input
                  type="number"
                  step="50"
                  value={input.retroactiveAdjustment || 0}
                  onChange={(e) => setInput({ ...input, retroactiveAdjustment: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Bloc d'ajout de rubriques personnalisées avec formules */}
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-700" />
                    <span>Rubriques Personnalisées du Mois</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Formules dynamiques</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <label className="block text-[10px] text-slate-600 mb-0.5">Choisir la Rubrique</label>
                      <select
                        value={selectedAddRubricId}
                        onChange={(e) => setSelectedAddRubricId(e.target.value)}
                        className="w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded bg-white"
                      >
                        {availableRubrics.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.code} - {r.label} ({r.sens === 'G' ? 'Gain' : 'Retenue'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-600 mb-0.5">Base (MRU)</label>
                      <input
                        type="number"
                        value={rubricAddBase}
                        onChange={(e) => setRubricAddBase(parseFloat(e.target.value) || 0)}
                        className="w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-600 mb-0.5">Nombre/Qté</label>
                      <input
                        type="number"
                        value={rubricAddCount}
                        onChange={(e) => setRubricAddCount(parseFloat(e.target.value) || 1)}
                        className="w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>

                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={handleAddCustomRubricToEmployee}
                        className="p-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded cursor-pointer transition-colors w-full flex items-center justify-center"
                        title="Ajouter au calcul"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {input.customRubricEntries && input.customRubricEntries.length > 0 && (
                    <div className="mt-2 divide-y divide-slate-200 border-t border-slate-200 pt-1.5">
                      {input.customRubricEntries.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 text-[11px]">
                          <div>
                            <span className="font-semibold text-slate-800">{entry.label}</span>
                            <span className={`ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              entry.isGain ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {entry.isGain ? '+ GAIN' : '- RETENUE'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {entry.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomRubric(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Motif / Justification</label>
                <textarea
                  rows={2}
                  value={input.notes || ''}
                  onChange={(e) => setInput({ ...input, notes: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  placeholder="Précisez la justification pour l'audit..."
                />
              </div>
            </div>

            {/* Colonne droite : Simulation en temps réel du résultat */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Simulation en direct du calcul
                  </h3>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Salaire de Base</span>
                    <span className="font-mono font-medium">{formatCurrency(simulatedPayslip.baseSalary)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Indemnités & Variables</span>
                    <span className="font-mono font-medium">{formatCurrency(simulatedPayslip.totalAllowances)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Salaire Brut Global</span>
                    <span className="font-mono">{formatCurrency(simulatedPayslip.grossSalary)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Part Transport Exonérée</span>
                    <span className="font-mono">-{formatCurrency(simulatedPayslip.exemptAllowances)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Assiette CNSS (Plafond 70k)</span>
                    <span className="font-mono">{formatCurrency(simulatedPayslip.cnssBase)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Assiette CNAM (Déplafonnée)</span>
                    <span className="font-mono">{formatCurrency(simulatedPayslip.cnamBase)}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600 pt-1 border-t border-slate-200">
                    <span>CNSS Salariée (1%)</span>
                    <span className="font-mono">-{formatCurrency(simulatedPayslip.cnssEmployeeAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>CNAM Salariée (4%)</span>
                    <span className="font-mono">-{formatCurrency(simulatedPayslip.cnamEmployeeAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>Retenue ITS (Barème progressif)</span>
                    <span className="font-mono">-{formatCurrency(simulatedPayslip.itsTaxAmount)}</span>
                  </div>
                  {simulatedPayslip.salaryAdvanceAmount > 0 && (
                    <div className="flex items-center justify-between text-amber-700">
                      <span>Acompte déduit</span>
                      <span className="font-mono">-{formatCurrency(simulatedPayslip.salaryAdvanceAmount)}</span>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Net à payer simulé</div>
                      <div className="text-lg font-bold font-mono text-emerald-900 mt-0.5">
                        {formatCurrency(simulatedPayslip.netSalaryPayable)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Charges patronales (CNSS 12% + CNAM 5%) :</span>
                    <span className="font-mono font-medium">{formatCurrency(simulatedPayslip.totalEmployerContributions)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Coût global employeur :</span>
                    <span className="font-mono font-medium">{formatCurrency(simulatedPayslip.totalEmployerCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Appliquer les variables au calcul</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
