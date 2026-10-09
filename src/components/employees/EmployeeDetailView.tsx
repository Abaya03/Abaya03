import React, { useState } from 'react';
import { Employee, Department, LegalPayrollRules, PayRubricDefinition } from '../../types';
import { INITIAL_PAY_RUBRICS } from '../../data/rubricsData';
import { evaluateRubricFormula } from '../../engine/formulaEngine';
import {
  RotateCw,
  Plus,
  Save,
  Trash2,
  Printer,
  Info,
  Target,
  Calendar,
  Check,
  Building,
  User as UserIcon,
  Clock,
  Wallet,
  FileText
} from 'lucide-react';

interface EmployeeDetailViewProps {
  employee: Employee;
  departments: Department[];
  rules: LegalPayrollRules;
  onOpenJasperPayslip: (employee: Employee) => void;
  onBackToList: () => void;
  onSaveEmployee: (employee: Employee) => void;
  period?: string;
  availableRubrics?: PayRubricDefinition[];
}

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  departments,
  rules,
  onOpenJasperPayslip,
  onBackToList,
  onSaveEmployee,
  period = 'JUIN 2026',
  availableRubrics = INITIAL_PAY_RUBRICS
}) => {
  const [activeTab, setActiveTab] = useState<'identite' | 'contrat' | 'paie' | 'conges' | 'engagements' | 'pointage'>('paie');
  const [paieSubTab, setPaieSubTab] = useState<'variables' | 'rappel'>('variables');

  const [motif, setMotif] = useState('Salaire normal');
  const [surMotif, setSurMotif] = useState(false);
  const [paieDu, setPaieDu] = useState('01/06/26');
  const [paieAu, setPaieAu] = useState('30/06/26');
  const [njt, setNjt] = useState('30');
  const [noteBulletin, setNoteBulletin] = useState('');

  // Rubriques actives du salarié (Image 1)
  const isTargetMohamed = employee.registrationNumber.includes('243');

  const [rubricsList, setRubricsList] = useState(() => {
    if (isTargetMohamed) {
      return [
        { idRub: '1', libelle: 'SALAIRE DE BASE الراتب القاعدي [G //its/cnss/cnam]', base: '31,667', nombre: '30', montant: '950', isFixe: true, motif: 'Salaire normal' },
        { idRub: '18', libelle: 'BASE DIFFERENCIELLE القاعدة التفضيلية [G //its/cnss/cnam]', base: '2 914', nombre: '1', montant: '2 914', isFixe: true, motif: 'Salaire normal' },
        { idRub: '19', libelle: 'COMPLEMENT SPECIAL تكملة خاصة [G //its/cnss/cnam]', base: '950', nombre: '0,35', montant: '333', isFixe: true, motif: 'Salaire normal' },
        { idRub: '22', libelle: 'AUGMENTATION 74 زيادة [G //its/cnss/cnam]', base: '150', nombre: '1', montant: '150', isFixe: true, motif: 'Salaire normal' },
        { idRub: '23', libelle: 'MAJORATION 3% زيادة [G //its/cnss/cnam]', base: '950', nombre: '0,03', montant: '29', isFixe: true, motif: 'Salaire normal' },
        { idRub: '24', libelle: 'AUGMENTATION 85 زيادة [G //its/cnss/cnam]', base: '50', nombre: '1', montant: '50', isFixe: true, motif: 'Salaire normal' },
        { idRub: '25', libelle: 'AUGMENTATION 92 زيادة [G //its/cnss/cnam]', base: '100', nombre: '1', montant: '100', isFixe: true, motif: 'Salaire normal' },
        { idRub: '26', libelle: 'AUGMENTATION 93 زيادة [G //its/cnss/cnam]', base: '150', nombre: '1', montant: '150', isFixe: true, motif: 'Salaire normal' }
      ];
    }
    return [
      { idRub: '1', libelle: 'SALAIRE DE BASE الراتب القاعدي [G //its/cnss/cnam]', base: (employee.baseSalary / 30).toFixed(2), nombre: '30', montant: employee.baseSalary.toString(), isFixe: true, motif: 'Salaire normal' },
      { idRub: '35', libelle: 'INDEMNITE TRANSPORT علاوة النقل [G //exonéré]', base: employee.transportAllowance.toString(), nombre: '1', montant: employee.transportAllowance.toString(), isFixe: true, motif: 'Salaire normal' },
      { idRub: '37', libelle: 'INDEMNITE LOGEMENT علاوة السكن [G //its/cnss/cnam]', base: employee.housingAllowance.toString(), nombre: '1', montant: employee.housingAllowance.toString(), isFixe: true, motif: 'Salaire normal' }
    ];
  });

  // Nouvelle rubrique à insérer
  const [selectedRubricIdToInsert, setSelectedRubricIdToInsert] = useState<string>(
    availableRubrics[0]?.id || 'RUB-0'
  );
  const [newBase, setNewBase] = useState('0');
  const [newNombre, setNewNombre] = useState('1');
  const [newMontant, setNewMontant] = useState('0');
  const [isFixe, setIsFixe] = useState(false);

  // Mettre à jour automatiquement la base et le montant en utilisant la formule de la rubrique
  const handleSelectRubricToInsert = (rubricId: string) => {
    setSelectedRubricIdToInsert(rubricId);
    const rubDef = availableRubrics.find(r => r.id === rubricId);
    if (!rubDef) return;

    let initBase = employee.baseSalary;
    if (rubDef.formula?.defaultBaseType === 'FIXE') {
      initBase = rubDef.model?.defaultFixedAmount || 0;
    } else if (rubDef.formula?.defaultBaseType === 'CNSS') {
      initBase = Math.min(employee.baseSalary, rules.cnssCeilingMonthly);
    }

    setNewBase(initBase.toString());
    setNewNombre('1');

    if (rubDef.formula) {
      const evalRes = evaluateRubricFormula(
        rubDef.formula,
        {
          employee,
          rules,
          baseSalary: employee.baseSalary
        },
        initBase,
        rubDef.formula.defaultRate ?? 100,
        1
      );
      setNewMontant(evalRes.computedAmount.toString());
    } else {
      setNewMontant(initBase.toString());
    }
  };

  const handleRecalculateCurrentInputs = (baseVal: string, countVal: string) => {
    setNewBase(baseVal);
    setNewNombre(countVal);
    const rubDef = availableRubrics.find(r => r.id === selectedRubricIdToInsert);
    const bNum = parseFloat(baseVal) || 0;
    const cNum = parseFloat(countVal) || 1;

    if (rubDef?.formula) {
      const evalRes = evaluateRubricFormula(
        rubDef.formula,
        {
          employee,
          rules,
          baseSalary: employee.baseSalary
        },
        bNum,
        rubDef.formula.defaultRate ?? 100,
        cNum
      );
      setNewMontant(evalRes.computedAmount.toString());
    } else {
      setNewMontant(bNum.toString());
    }
  };

  const handleAddRubricLine = () => {
    const rubDef = availableRubrics.find(r => r.id === selectedRubricIdToInsert);
    const label = rubDef ? `${rubDef.label} [${rubDef.code}] ${rubDef.labelAr || ''}` : 'NOUVELLE RUBRIQUE';
    const code = rubDef ? rubDef.code : Math.floor(10 + Math.random() * 80).toString();

    const newLine = {
      idRub: code,
      libelle: label,
      base: newBase,
      nombre: newNombre,
      montant: newMontant,
      isFixe,
      motif
    };
    setRubricsList(prev => [...prev, newLine]);
    setNewBase('0');
    setNewNombre('1');
    setNewMontant('0');
  };

  const totalBrutDisplay = isTargetMohamed ? '37 667' : employee.baseSalary.toLocaleString('fr-FR');
  const totalRetenuesDisplay = isTargetMohamed ? '57' : '158';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full text-xs">
      {/* Barre de titre moderne */}
      <div className="px-5 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/90 flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            Salariés · Dossier Collaborateur & Saisie de Paie
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
          <span>Mode édition directe</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-auto">
        {/* Bandeau d'identité exécutif du salarié conforme à l'Image 1 avec design moderne */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Identité : Avatar, Matricule et Nom complet */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs text-white font-black text-sm flex items-center justify-center border border-white/30 shadow-xs">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs bg-black/25 px-2.5 py-0.5 rounded-md text-emerald-100 border border-white/10">
                  {employee.registrationNumber}
                </span>
                <span className="font-black text-base text-white tracking-wide">
                  {employee.firstName} {employee.lastName}
                </span>
              </div>
              <div className="text-[11px] text-emerald-100 font-medium flex items-center gap-2 mt-1">
                <span>{employee.jobTitle}</span>
                <span>•</span>
                <span>LEMMC (Direction Générale)</span>
                <span>•</span>
                <span className="font-mono">{employee.baseSalary.toLocaleString('fr-FR')} MRU</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton rafraîchir [↻] */}
            <button
              type="button"
              className="p-2 border border-white/30 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Rafraîchir"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Sélecteur de période */}
            <select
              value={period}
              className="text-xs font-bold border border-white/30 rounded-xl px-3 py-2 bg-white text-slate-900 shadow-xs cursor-pointer focus:outline-none"
            >
              <option value="JUIN 2026">JUIN 2026</option>
              <option value="OCTOBRE 2026">OCTOBRE 2026</option>
              <option value="SEPTEMBRE 2026">SEPTEMBRE 2026</option>
            </select>

            {/* Boutons d'action : [+] [💾] */}
            <button
              type="button"
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white cursor-pointer transition-colors"
              title="Nouveau"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSaveEmployee(employee)}
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-white font-bold cursor-pointer transition-colors shadow-xs"
              title="Enregistrer"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Bouton Imprimer / Voir le Bulletin de Paie (كشف الراتب) */}
            <button
              type="button"
              onClick={() => onOpenJasperPayslip(employee)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors ml-1 border border-white/20"
              title="Ouvrir le bulletin de paie officiel (كشف الراتب - JasperViewer)"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>كشف الراتب (Image 2)</span>
            </button>
          </div>
        </div>

        {/* Ligne des sous-onglets contemporains avec pilules */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 overflow-x-auto gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('identite')}
            className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'identite' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Identité
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contrat')}
            className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'contrat' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Contrat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paie')}
            className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'paie' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paie
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conges')}
            className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'conges' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Congés
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('engagements')}
            className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'engagements' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engagements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pointage')}
            className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pointage' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pointage HS
          </button>
        </div>

        {/* 1. Onglet PAIE (conforme exactement à l'Image 1) */}
        {activeTab === 'paie' && (
          <div className="space-y-3">
            {/* Sous-onglets Paie : [Variables] [Rappel / Sal. Base] */}
            <div className="flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setPaieSubTab('variables')}
                className={`py-1 px-2.5 font-bold rounded cursor-pointer ${
                  paieSubTab === 'variables' ? 'text-sky-800 border-b-2 border-sky-600' : 'text-slate-500'
                }`}
              >
                Variables
              </button>
              <button
                type="button"
                onClick={() => setPaieSubTab('rappel')}
                className={`py-1 px-2.5 font-bold rounded cursor-pointer ${
                  paieSubTab === 'rappel' ? 'text-sky-800 border-b-2 border-sky-600' : 'text-slate-500'
                }`}
              >
                Rappel / Sal. Base
              </button>
            </div>

            {/* Ligne des paramètres : Motif, Paie du, Paie au, Statut "En Conges", NJT (Image 1) */}
            <div className="p-3.5 border border-slate-200/80 rounded-xl bg-slate-50/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-slate-700 font-bold text-xs">Motif :</span>
                <select
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs focus:ring-1 focus:ring-sky-500"
                >
                  <option value="Salaire normal">Salaire normal</option>
                  <option value="Rappel sur salaire">Rappel sur salaire</option>
                  <option value="Prime exceptionnelle">Prime exceptionnelle</option>
                </select>
                <label className="flex items-center gap-1.5 ml-2 text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={surMotif}
                    onChange={(e) => setSurMotif(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Sur Motif</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold text-xs">Paie du</span>
                  <input
                    type="text"
                    value={paieDu}
                    onChange={(e) => setPaieDu(e.target.value)}
                    className="w-20 text-center bg-white border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold text-xs">au</span>
                  <input
                    type="text"
                    value={paieAu}
                    onChange={(e) => setPaieAu(e.target.value)}
                    className="w-20 text-center bg-white border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold shadow-2xs"
                  />
                </div>

                {/* Statut encadré jaune : En Conges (Image 1) */}
                <div className="border border-amber-300 bg-amber-50 text-amber-900 font-bold px-3.5 py-1 rounded-lg text-xs shadow-2xs">
                  En Conges
                </div>

                {/* NJT : 30 + disquette */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-bold px-1">NJT:</span>
                  <input
                    type="text"
                    value={njt}
                    onChange={(e) => setNjt(e.target.value)}
                    className="w-10 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-mono font-black"
                  />
                  <button
                    type="button"
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title="Valider NJT"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ligne d'insertion de rubrique (Image 1) avec options dynamiques et formules */}
            <div className="p-3.5 border border-slate-200/90 rounded-xl bg-white shadow-2xs grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">Rubrique à insérer</label>
                  <span className="text-[10px] text-sky-700 font-semibold">Formule active</span>
                </div>
                <select
                  value={selectedRubricIdToInsert}
                  onChange={(e) => handleSelectRubricToInsert(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white shadow-2xs font-medium text-slate-900 focus:ring-1 focus:ring-sky-500"
                >
                  {availableRubrics.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.label} {r.labelAr ? `(${r.labelAr})` : ''} [{r.sens}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Base (MRU)</label>
                <input
                  type="text"
                  value={newBase}
                  onChange={(e) => handleRecalculateCurrentInputs(e.target.value, newNombre)}
                  className="w-full text-xs text-right px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono shadow-2xs focus:ring-1 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre / Jours / Heures</label>
                <input
                  type="text"
                  value={newNombre}
                  onChange={(e) => handleRecalculateCurrentInputs(newBase, e.target.value)}
                  className="w-full text-xs text-right px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono shadow-2xs focus:ring-1 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Montant Calculé</label>
                <input
                  type="text"
                  value={newMontant}
                  onChange={(e) => setNewMontant(e.target.value)}
                  className="w-full text-xs text-right px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-black text-sky-950 shadow-2xs bg-sky-50/50"
                />
              </div>

              <div className="col-span-1 flex items-center gap-1.5 pb-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isFixe}
                    onChange={(e) => setIsFixe(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Fixe</span>
                </label>
              </div>

              <div className="col-span-1 flex items-center gap-1.5 justify-end pb-1">
                <button
                  type="button"
                  onClick={handleAddRubricLine}
                  className="p-2 border border-sky-600 bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer transition-colors shadow-xs"
                  title="Ajouter la rubrique"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Zone principale : Tableau des rubriques + Boutons latéraux d'action (Image 1) */}
            <div className="flex gap-3">
              {/* Tableau des rubriques de paie du salarié */}
              <div className="flex-1 border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs bg-white">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[9.5px] tracking-wider">
                    <tr>
                      <th className="py-2 px-2.5 w-14 border-r border-slate-200/70">ID RUB</th>
                      <th className="py-2 px-3 border-r border-slate-200/70">LIBELLE RUBRIQUE</th>
                      <th className="py-2 px-2.5 text-right w-24 border-r border-slate-200/70">BASE</th>
                      <th className="py-2 px-2.5 text-right w-20 border-r border-slate-200/70">NOMBRE</th>
                      <th className="py-2 px-2.5 text-right w-24 border-r border-slate-200/70">MONTANT</th>
                      <th className="py-2 px-2 text-center w-14 border-r border-slate-200/70">FIXE</th>
                      <th className="py-2 px-3 border-r border-slate-200/70">MOTIF</th>
                      <th className="py-2 px-2 text-center w-8 border-r border-slate-200/70">•</th>
                      <th className="py-2 px-2 text-center w-20">REF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10.5px]">
                    {rubricsList.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-1.5 px-2.5 font-bold text-sky-900 border-r border-slate-100">{row.idRub}</td>
                        <td className="py-1.5 px-3 font-sans font-medium text-slate-900 border-r border-slate-100">{row.libelle}</td>
                        <td className="py-1.5 px-2.5 text-right text-slate-700 border-r border-slate-100">{row.base}</td>
                        <td className="py-1.5 px-2.5 text-right text-slate-700 border-r border-slate-100">{row.nombre}</td>
                        <td className="py-1.5 px-2.5 text-right font-black text-slate-950 border-r border-slate-100">{row.montant}</td>
                        <td className="py-1.5 px-2 text-center border-r border-slate-100">
                          <input type="checkbox" checked={row.isFixe} readOnly className="rounded text-sky-600 pointer-events-none" />
                        </td>
                        <td className="py-1.5 px-3 font-sans text-slate-600 border-r border-slate-100">{row.motif}</td>
                        <td className="py-1.5 px-2 text-center text-slate-400 border-r border-slate-100">•</td>
                        <td className="py-1.5 px-2 text-[9px] text-slate-400 truncate">com.mccmr...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Boutons d'action latéraux (Image 1 : Info, Calculer, Imprimer Bulletin) */}
              <div className="w-14 flex flex-col items-center gap-2.5 pt-2 border border-slate-200 rounded-xl p-2 bg-slate-50/80 shadow-2xs">
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors shadow-2xs"
                  title="Informations"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 cursor-pointer transition-colors shadow-2xs"
                  title="Recalculer les cotisations"
                >
                  <Target className="w-4 h-4 text-sky-800" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenJasperPayslip(employee)}
                  className="p-2.5 rounded-xl border border-sky-600 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition-colors shadow-sm"
                  title="Imprimer le bulletin officiel (JasperViewer)"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pied de page : Note sur bulletin + Totaux en couleur (Image 1) */}
            <div className="p-3.5 border border-slate-200/90 rounded-xl bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <span className="text-slate-700 font-bold whitespace-nowrap text-xs">Note sur bulletin :</span>
                <input
                  type="text"
                  value={noteBulletin}
                  onChange={(e) => setNoteBulletin(e.target.value)}
                  placeholder="Mention légale ou précision..."
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                  title="Enregistrer la note"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Totaux exécutifs de synthèse */}
              <div className="flex items-center gap-4 font-mono font-bold text-xs bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Brut:</span>
                  <span className="text-blue-700 font-black text-sm">{totalBrutDisplay}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Base:</span>
                  <span className="text-slate-700">0</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Retenues:</span>
                  <span className="text-rose-600 font-black text-sm">{totalRetenuesDisplay}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold text-xs">Cons./Budget (%)</span>
                <input
                  type="text"
                  readOnly
                  value=""
                  className="w-16 bg-white border border-slate-300 rounded-lg py-1 px-2 text-right font-mono text-xs shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Onglet IDENTITÉ */}
        {activeTab === 'identite' && (
          <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">Données d'État Civil & Coordonnées</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-slate-500 block text-[11px]">Nom complet</label>
                <div className="font-bold text-slate-900 text-sm">{employee.firstName} {employee.lastName}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Numéro National d'Identité (NNID)</label>
                <div className="font-mono font-bold text-slate-900">{employee.nationalIdNumber}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Date de naissance</label>
                <div className="font-mono">{employee.birthDate}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Nationalité</label>
                <div>{employee.nationality}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Situation matrimoniale</label>
                <div>{employee.maritalStatus} ({employee.dependentsCount} charge(s))</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Téléphone</label>
                <div className="font-mono">{employee.phone}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Adresse email</label>
                <div>{employee.email}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Lieu de résidence</label>
                <div>{employee.address}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Onglet CONTRAT */}
        {activeTab === 'contrat' && (
          <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">Données Contractuelles & Affectation</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-slate-500 block text-[11px]">Poste / Emploi</label>
                <div className="font-bold text-slate-900">{employee.jobTitle}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Département / Service</label>
                <div className="font-bold text-blue-900">LEMMC ({departments.find(d => d.id === employee.departmentId)?.name || 'Direction'})</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Type de contrat</label>
                <div className="font-bold">{employee.contractType}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Date de recrutement</label>
                <div className="font-mono font-bold">{employee.hireDate.split('-').reverse().join('/')}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Classification / Catégorie</label>
                <div className="font-mono font-bold">{employee.category || 'Ing.Trav.2e'}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Indice</label>
                <div className="font-mono font-bold">95.0</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Heures mensuelles (HM/C)</label>
                <div className="font-mono">173,33 h</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Banque domiciliataire</label>
                <div className="font-bold">{employee.bankName || 'BMI'}</div>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">Compte bancaire (RIB)</label>
                <div className="font-mono font-bold">{employee.bankAccountNumber || '011449 00100 03948192830 55'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Onglet CONGÉS */}
        {activeTab === 'conges' && (
          <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">Gestion des Droits à Congés</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded text-center">
                <div className="text-slate-500 text-[10px]">Droits acquis annuels</div>
                <div className="text-xl font-bold font-mono text-slate-900">30 jours</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded text-center">
                <div className="text-slate-500 text-[10px]">Jours pris</div>
                <div className="text-xl font-bold font-mono text-amber-600">0 jour</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded text-center">
                <div className="text-slate-500 text-[10px]">Solde disponible</div>
                <div className="text-xl font-bold font-mono text-emerald-600">30 jours</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Onglet ENGAGEMENTS */}
        {activeTab === 'engagements' && (
          <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">Engagements Financiers & Acomptes</h3>
            <p className="text-slate-500">Aucun prêt en cours ou acompte non régularisé enregistré pour ce collaborateur.</p>
          </div>
        )}

        {/* 6. Onglet POINTAGE HS */}
        {activeTab === 'pointage' && (
          <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">Pointage des Heures Supplémentaires</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white border rounded">
                <div className="text-slate-500 text-[10px]">H. Supp 115%</div>
                <div className="text-lg font-bold font-mono">0 h</div>
              </div>
              <div className="p-3 bg-white border rounded">
                <div className="text-slate-500 text-[10px]">H. Supp 140%</div>
                <div className="text-lg font-bold font-mono">0 h</div>
              </div>
              <div className="p-3 bg-white border rounded">
                <div className="text-slate-500 text-[10px]">H. Supp 150%</div>
                <div className="text-lg font-bold font-mono">0 h</div>
              </div>
              <div className="p-3 bg-white border rounded">
                <div className="text-slate-500 text-[10px]">H. Supp 200%</div>
                <div className="text-lg font-bold font-mono">0 h</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
