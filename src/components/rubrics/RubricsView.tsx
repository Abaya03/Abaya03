import React, { useState } from 'react';
import { PayRubricDefinition, PayRubricFormula, PayRubricModelProfile } from '../../types';
import { INITIAL_PAY_RUBRICS } from '../../data/rubricsData';
import { evaluateRubricFormula } from '../../engine/formulaEngine';
import { DEFAULT_MAURITANIAN_RULES } from '../../data/legalRules';
import {
  Plus,
  Save,
  Trash2,
  Search,
  Check,
  Sliders,
  Calculator,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  Play
} from 'lucide-react';

interface RubricsViewProps {
  rubrics?: PayRubricDefinition[];
  onSaveRubrics?: (rubrics: PayRubricDefinition[]) => void;
}

export const RubricsView: React.FC<RubricsViewProps> = ({
  rubrics: initialRubricsProp,
  onSaveRubrics
}) => {
  const [activeTab, setActiveTab] = useState<'rubrique' | 'formule' | 'model'>('rubrique');
  const [rubrics, setRubrics] = useState<PayRubricDefinition[]>(
    initialRubricsProp && initialRubricsProp.length > 0 ? initialRubricsProp : INITIAL_PAY_RUBRICS
  );
  const [selectedRubricId, setSelectedRubricId] = useState<string>(
    initialRubricsProp?.[0]?.id || INITIAL_PAY_RUBRICS[0].id
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Rubrique sélectionnée
  const selectedRubric = rubrics.find(r => r.id === selectedRubricId) || rubrics[0];

  // État local d'édition de la rubrique
  const [formState, setFormState] = useState<PayRubricDefinition>({ ...selectedRubric });

  // État local de la formule
  const [formulaState, setFormulaState] = useState<PayRubricFormula>(() => {
    return selectedRubric.formula || {
      expression: '[BASE] * [TAUX] / 100',
      description: 'Calcul standard proportionnel',
      variables: ['BASE', 'TAUX'],
      defaultRate: 100,
      defaultBaseType: 'SALAIRE_BASE'
    };
  });

  // État local du modèle
  const [modelState, setModelState] = useState<PayRubricModelProfile>(() => {
    return selectedRubric.model || {
      appliedCategories: ['Tous'],
      appliedContractTypes: ['CDI', 'CDD'],
      defaultFixedAmount: 0,
      isMandatory: false,
      frequency: 'MENSUEL',
      appliesToAllByDefault: true
    };
  });

  // Testeur de formule en temps réel
  const [testBase, setTestBase] = useState<number>(50000);
  const [testRate, setTestRate] = useState<number>(100);
  const [testCount, setTestCount] = useState<number>(1);
  const [testSeniority, setTestSeniority] = useState<number>(3);
  const [testResult, setTestResult] = useState<number | null>(null);

  // Mettre à jour l'état quand on change de rubrique sélectionnée
  const handleSelectRow = (r: PayRubricDefinition) => {
    setSelectedRubricId(r.id);
    setFormState({ ...r });
    setFormulaState(r.formula || {
      expression: '[BASE] * [TAUX] / 100',
      description: 'Calcul proportionnel',
      variables: ['BASE', 'TAUX'],
      defaultRate: 100,
      defaultBaseType: 'SALAIRE_BASE'
    });
    setModelState(r.model || {
      appliedCategories: ['Tous'],
      appliedContractTypes: ['CDI', 'CDD'],
      defaultFixedAmount: 0,
      isMandatory: false,
      frequency: 'MENSUEL',
      appliesToAllByDefault: true
    });
    setTestResult(null);
  };

  const handleNewRubric = () => {
    // Calcul du prochain code numérique intelligent
    const numericCodes = rubrics.map(r => parseInt(r.code, 10)).filter(n => !isNaN(n));
    const nextCode = numericCodes.length > 0 ? (Math.max(...numericCodes) + 1).toString() : '100';

    const newRubric: PayRubricDefinition = {
      id: `RUB-${Date.now()}`,
      code: nextCode,
      label: 'NOUVELLE RUBRIQUE DE PAIE',
      labelAr: 'بند جديد للرواتب',
      sens: 'G',
      sur: 'Brut',
      chapter: '0',
      account: '641250',
      isIts: true,
      isCnss: true,
      isCnam: true,
      isPlafonne: false,
      isAvantageNature: false,
      isCumulable: true,
      baseAuto: false,
      nombreAuto: false,
      formula: {
        expression: '[BASE] * [TAUX] / 100',
        description: 'Calcul sur base et taux',
        variables: ['BASE', 'TAUX'],
        defaultRate: 100,
        defaultBaseType: 'SALAIRE_BASE'
      },
      model: {
        appliedCategories: ['Tous'],
        appliedContractTypes: ['CDI', 'CDD'],
        defaultFixedAmount: 0,
        isMandatory: false,
        frequency: 'MENSUEL',
        appliesToAllByDefault: true
      }
    };

    const updated = [...rubrics, newRubric];
    setRubrics(updated);
    setSelectedRubricId(newRubric.id);
    setFormState({ ...newRubric });
    setFormulaState({ ...newRubric.formula! });
    setModelState({ ...newRubric.model! });
    setTestResult(null);
    if (onSaveRubrics) onSaveRubrics(updated);

    showFlashMessage('Nouvelle rubrique créée avec succès !');
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedRubric: PayRubricDefinition = {
      ...formState,
      formula: { ...formulaState },
      model: { ...modelState }
    };

    const updatedList = rubrics.map(r => (r.id === updatedRubric.id ? updatedRubric : r));
    setRubrics(updatedList);
    setFormState(updatedRubric);
    if (onSaveRubrics) onSaveRubrics(updatedList);

    showFlashMessage(`Rubrique "${updatedRubric.code} - ${updatedRubric.label}" enregistrée !`);
  };

  const handleDeleteRubric = () => {
    if (rubrics.length <= 1) return;
    if (window.confirm(`Confirmez-vous la suppression de la rubrique ${formState.code} - ${formState.label} ?`)) {
      const remaining = rubrics.filter(r => r.id !== formState.id);
      setRubrics(remaining);
      setSelectedRubricId(remaining[0].id);
      setFormState({ ...remaining[0] });
      setFormulaState(remaining[0].formula || {
        expression: '[BASE]',
        variables: ['BASE'],
        defaultBaseType: 'SALAIRE_BASE'
      });
      setModelState(remaining[0].model || {
        appliedCategories: ['Tous'],
        appliedContractTypes: ['CDI'],
        isMandatory: false,
        frequency: 'MENSUEL',
        appliesToAllByDefault: true
      });
      if (onSaveRubrics) onSaveRubrics(remaining);
      showFlashMessage('Rubrique supprimée.');
    }
  };

  const showFlashMessage = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  // Exécution du test de formule
  const handleRunFormulaTest = () => {
    const dummyEmp: any = {
      id: 'TEST_EMP',
      firstName: 'Salarié',
      lastName: 'Test',
      baseSalary: testBase,
      hireDate: '2023-01-01',
      category: 'Cadre C1',
      contractType: 'CDI'
    };

    const evalResult = evaluateRubricFormula(
      formulaState,
      {
        employee: dummyEmp,
        rules: DEFAULT_MAURITANIAN_RULES,
        baseSalary: testBase,
        grossSalary: testBase * 1.25,
        taxableSalary: testBase * 0.95,
        cnssBase: Math.min(testBase, 70000),
        seniorityYears: testSeniority
      },
      testBase,
      testRate,
      testCount
    );

    setTestResult(evalResult.computedAmount);
  };

  const insertVariableIntoFormula = (varName: string) => {
    setFormulaState(prev => ({
      ...prev,
      expression: `${prev.expression} ${varName}`.trim()
    }));
  };

  const filteredRubrics = rubrics.filter(r => {
    return (
      searchQuery === '' ||
      r.code.includes(searchQuery) ||
      r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.labelAr && r.labelAr.includes(searchQuery)) ||
      (r.account && r.account.includes(searchQuery))
    );
  });

  return (
    <div className="bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden flex flex-col h-full text-xs">
      {/* Barre de titre MDI / Desktop (conforme à l'image 5) */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-100 via-sky-50 to-slate-200 border-b border-slate-300 flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-2.5 font-bold text-sm text-sky-900">
          <div className="p-1.5 bg-sky-700 text-white rounded-lg shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="tracking-wide">Rubriques de paie & Moteur de Calcul</span>
            <span className="ml-2 text-xs font-normal text-slate-500 font-sans">
              (Formules Mathématiques, Barèmes Légaux & Profils Modèles)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
              ✓ {saveSuccessMsg}
            </span>
          )}
          <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-600">
            {rubrics.length} Définitions
          </span>
        </div>
      </div>

      {/* Onglets interactifs activés : Rubrique, Formule, Model */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 pt-1.5">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('rubrique')}
            className={`flex items-center gap-1.5 py-2 px-4 font-bold text-xs border-b-2 cursor-pointer transition-all ${
              activeTab === 'rubrique'
                ? 'border-sky-700 text-sky-800 bg-white rounded-t-lg shadow-2xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-t'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rubrique (Propriétés)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formule')}
            className={`flex items-center gap-1.5 py-2 px-4 font-bold text-xs border-b-2 cursor-pointer transition-all ${
              activeTab === 'formule'
                ? 'border-sky-700 text-sky-800 bg-white rounded-t-lg shadow-2xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-t'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Formule (Calcul Automatique)</span>
            <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-sky-100 text-sky-800 rounded-full font-mono">
              f(x)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-1.5 py-2 px-4 font-bold text-xs border-b-2 cursor-pointer transition-all ${
              activeTab === 'model'
                ? 'border-sky-700 text-sky-800 bg-white rounded-t-lg shadow-2xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-t'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Model (Profil & Convention)</span>
            <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-emerald-100 text-emerald-800 rounded-full font-mono">
              RH
            </span>
          </button>
        </div>

        {/* Boutons d'action globale pour la rubrique courante */}
        <div className="flex items-center gap-1.5 pb-1.5">
          <button
            type="button"
            onClick={handleNewRubric}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 rounded cursor-pointer transition-colors shadow-2xs"
            title="Créer une nouvelle rubrique"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nouveau</span>
          </button>
          <button
            type="button"
            onClick={() => handleSaveAll()}
            className="flex items-center gap-1 px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded cursor-pointer transition-colors shadow-xs"
            title="Sauvegarder les modifications"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sauvegarder</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteRubric}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 font-semibold border border-rose-200 rounded cursor-pointer transition-colors"
            title="Supprimer la rubrique"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. ONGLET RUBRIQUE : Propriétés générales (Fidèle à l'Image 5)   */}
      {/* ============================================================== */}
      {activeTab === 'rubrique' && (
        <form onSubmit={handleSaveAll} className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Code Rubrique *</label>
              <input
                type="text"
                value={formState.code}
                onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-sky-950 focus:outline-none focus:ring-1 focus:ring-sky-600 shadow-2xs"
              />
            </div>

            <div className="col-span-4">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Libellé (Français & Arabe) *</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={formState.label}
                  onChange={(e) => setFormState({ ...formState, label: e.target.value })}
                  className="w-2/3 text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold uppercase focus:outline-none focus:ring-1 focus:ring-sky-600 shadow-2xs text-slate-900"
                  placeholder="LIBELLÉ"
                />
                <input
                  type="text"
                  value={formState.labelAr || ''}
                  onChange={(e) => setFormState({ ...formState, labelAr: e.target.value })}
                  dir="rtl"
                  className="w-1/3 text-xs px-2 py-1.5 border border-slate-300 rounded bg-white font-bold text-slate-900 shadow-2xs"
                  placeholder="البيان بالعربية"
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Sens *</label>
              <select
                value={formState.sens}
                onChange={(e) => setFormState({ ...formState, sens: e.target.value as 'G' | 'R' })}
                className={`w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white font-bold shadow-2xs ${
                  formState.sens === 'G' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                <option value="G">G (Gain)</option>
                <option value="R">R (Retenue)</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Sur</label>
              <select
                value={formState.sur}
                onChange={(e) => setFormState({ ...formState, sur: e.target.value as any })}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white font-medium shadow-2xs"
              >
                <option value="Brut">/ Brut</option>
                <option value="Net">/ Net</option>
                <option value="Base">/ Base</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Chapitre</label>
              <input
                type="text"
                value={formState.chapter}
                onChange={(e) => setFormState({ ...formState, chapter: e.target.value })}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-center shadow-2xs"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Compte Comptable</label>
              <input
                type="text"
                value={formState.account}
                onChange={(e) => setFormState({ ...formState, account: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-sky-900 shadow-2xs"
                placeholder="641... ou 431..."
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Clé</label>
              <input
                type="text"
                value={formState.cle || ''}
                onChange={(e) => setFormState({ ...formState, cle: e.target.value })}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-center shadow-2xs"
                placeholder="0"
              />
            </div>
          </div>

          {/* Ligne des cases à cocher exactes de l'Image 5 */}
          <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[11px] text-slate-700 select-none bg-white p-2.5 rounded-lg border border-slate-200">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.isIts}
                onChange={(e) => setFormState({ ...formState, isIts: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Assujetti ITS (Fiscal)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.isPlafonne}
                onChange={(e) => setFormState({ ...formState, isPlafonne: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Plafonné (CNSS 70k MRU)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.isCnss}
                onChange={(e) => setFormState({ ...formState, isCnss: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Cotisable CNSS</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.isCnam}
                onChange={(e) => setFormState({ ...formState, isCnam: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Cotisable CNAM</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.isAvantageNature}
                onChange={(e) => setFormState({ ...formState, isAvantageNature: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Avantage en nature</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.isCumulable}
                onChange={(e) => setFormState({ ...formState, isCumulable: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Cumulable</span>
            </label>

            <span className="text-slate-300">|</span>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.baseAuto}
                onChange={(e) => setFormState({ ...formState, baseAuto: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Base automatique</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-sky-800">
              <input
                type="checkbox"
                checked={formState.nombreAuto}
                onChange={(e) => setFormState({ ...formState, nombreAuto: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Nombre automatique</span>
            </label>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 2. ONGLET FORMULE : Éditeur mathématique & Définition de calcul */}
      {/* ============================================================== */}
      {activeTab === 'formule' && (
        <div className="p-4 border-b border-slate-200 bg-sky-50/30 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-900 text-xs">Formule mathématique de la rubrique :</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                {formState.code} - {formState.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <span>Les jetons entre crochets [VARIABLE] sont automatiquement substitués lors du calcul</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Expression et paramètres */}
            <div className="col-span-8 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Expression de Calcul Mathématique :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formulaState.expression}
                    onChange={(e) => setFormulaState({ ...formulaState, expression: e.target.value })}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-2xs text-sky-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ex: [NB_HEURES] * ([SALAIRE_BASE] / 173.33) * 1.50"
                  />
                </div>
              </div>

              {/* Barre de raccourcis pour insérer les variables */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Variables et Opérateurs disponibles (Cliquez pour insérer) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '[BASE]', desc: 'Assiette / Base contractuelle' },
                    { label: '[SALAIRE_BASE]', desc: 'Salaire de base du salarié' },
                    { label: '[TAUX]', desc: 'Taux ou pourcentage' },
                    { label: '[NB_HEURES]', desc: 'Nombre d\'heures travaillées' },
                    { label: '[NOMBRE]', desc: 'Quantité ou jours' },
                    { label: '[ANCIENNETE]', desc: 'Années d\'ancienneté calculées' },
                    { label: '[TAUX_HORAIRE]', desc: 'Taux horaire légal (Base / 173.33)' },
                    { label: '[BRUT]', desc: 'Salaire brut cumulé' },
                    { label: '[CNSS_BASE]', desc: 'Assiette CNSS' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => insertVariableIntoFormula(item.label)}
                      className="px-2 py-0.5 bg-white hover:bg-sky-100 border border-slate-300 rounded font-mono text-[10px] text-sky-800 font-semibold cursor-pointer transition-colors shadow-2xs"
                      title={item.desc}
                    >
                      + {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => insertVariableIntoFormula('*')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-mono text-[10px] font-bold"
                  >
                    *
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariableIntoFormula('/')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-mono text-[10px] font-bold"
                  >
                    /
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariableIntoFormula('+')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-mono text-[10px] font-bold"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariableIntoFormula('-')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-mono text-[10px] font-bold"
                  >
                    -
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Type d'assiette par défaut :
                  </label>
                  <select
                    value={formulaState.defaultBaseType || 'SALAIRE_BASE'}
                    onChange={(e) => setFormulaState({ ...formulaState, defaultBaseType: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium shadow-2xs"
                  >
                    <option value="SALAIRE_BASE">Salaire de Base Fixe</option>
                    <option value="BRUT">Salaire Brut Global</option>
                    <option value="IMPOSABLE">Brut Imposable (Assiette ITS)</option>
                    <option value="CNSS">Assiette CNSS (Plafond 70k)</option>
                    <option value="FIXE">Montant Forfaitaire Fixe</option>
                    <option value="CUSTOM">Saisie libre manuelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Taux / Coefficient par défaut :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formulaState.defaultRate ?? 100}
                    onChange={(e) => setFormulaState({ ...formulaState, defaultRate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-sky-900 shadow-2xs"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Condition d'application légale (Optionnelle) :
                </label>
                <input
                  type="text"
                  value={formulaState.condition || ''}
                  onChange={(e) => setFormulaState({ ...formulaState, condition: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono shadow-2xs"
                  placeholder="Ex: [ANCIENNETE] >= 2 (pour prime d'ancienneté)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Description comptable de la règle :
                </label>
                <input
                  type="text"
                  value={formulaState.description || ''}
                  onChange={(e) => setFormulaState({ ...formulaState, description: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white shadow-2xs"
                  placeholder="Description juridique ou conventionnelle..."
                />
              </div>
            </div>

            {/* Simulateur / Testeur de formule instantané */}
            <div className="col-span-4 bg-white p-3.5 rounded-xl border border-sky-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sky-800 font-bold mb-2 pb-1 border-b border-sky-100">
                  <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
                  <span>Simulateur & Testeur de Formule</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <label className="text-slate-600 block">Base test (MRU) :</label>
                    <input
                      type="number"
                      value={testBase}
                      onChange={(e) => setTestBase(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Taux test (%) :</label>
                    <input
                      type="number"
                      value={testRate}
                      onChange={(e) => setTestRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 block">Nb / Heures :</label>
                      <input
                        type="number"
                        value={testCount}
                        onChange={(e) => setTestCount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block">Ancienneté (ans) :</label>
                      <input
                        type="number"
                        value={testSeniority}
                        onChange={(e) => setTestSeniority(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunFormulaTest}
                  className="w-full mt-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calculer le résultat</span>
                </button>
              </div>

              {testResult !== null && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Résultat de la formule
                  </div>
                  <div className="text-lg font-mono font-black text-emerald-950 mt-0.5">
                    {testResult.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MRU
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ONGLET MODEL : Profil d'affectation conventionnel et RH      */}
      {/* ============================================================== */}
      {activeTab === 'model' && (
        <div className="p-4 border-b border-slate-200 bg-emerald-50/20 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-900 text-xs">Profil Modèle & Affectation :</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                {formState.code} - {formState.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Définir les critères d'attribution automatique par contrat, catégorie et fréquence
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Affectation générale aux salariés :
                </label>
                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appliesAll"
                      checked={modelState.appliesToAllByDefault}
                      onChange={() => setModelState({ ...modelState, appliesToAllByDefault: true })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-900">Applicable à tous les salariés de l'entreprise</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appliesAll"
                      checked={!modelState.appliesToAllByDefault}
                      onChange={() => setModelState({ ...modelState, appliesToAllByDefault: false })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-900">Restreint selon profil (Catégorie, Contrat)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Contrats éligibles :
                </label>
                <div className="flex gap-2">
                  {['CDI', 'CDD', 'STAGE', 'PRESTATION'].map((ctype) => {
                    const isChecked = modelState.appliedContractTypes?.includes(ctype);
                    return (
                      <label
                        key={ctype}
                        className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = modelState.appliedContractTypes || [];
                            const updated = e.target.checked
                              ? [...current, ctype]
                              : current.filter(c => c !== ctype);
                            setModelState({ ...modelState, appliedContractTypes: updated });
                          }}
                        />
                        <span>{ctype}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Catégories conventionnelles cibles (Séparées par virgules) :
                </label>
                <input
                  type="text"
                  value={modelState.appliedCategories?.join(', ') || 'Tous'}
                  onChange={(e) => {
                    const cats = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setModelState({ ...modelState, appliedCategories: cats });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white shadow-2xs font-medium"
                  placeholder="Ex: Tous ou Cadre C1, Maîtrise M2, Direction"
                />
              </div>
            </div>

            <div className="col-span-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Fréquence de calcul :
                  </label>
                  <select
                    value={modelState.frequency}
                    onChange={(e) => setModelState({ ...modelState, frequency: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold shadow-2xs"
                  >
                    <option value="MENSUEL">Mensuel (Tous les mois)</option>
                    <option value="TRIMESTRIEL">Trimestriel</option>
                    <option value="ANNUEL">Annuel (Prime de fin d'année)</option>
                    <option value="OCCASIONNEL">Occasionnel / Saisie libre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Montant fixe modèle (MRU) :
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={modelState.defaultFixedAmount || 0}
                    onChange={(e) => setModelState({ ...modelState, defaultFixedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-sky-900 shadow-2xs"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modelState.isMandatory}
                    onChange={(e) => setModelState({ ...modelState, isMandatory: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-900 text-xs">
                    Rubrique obligatoire par décret ou convention
                  </span>
                </label>
                <p className="text-[10px] text-slate-500 pl-6">
                  Si activé, le moteur refusera la validation d'un bulletin ne comportant pas ce barème pour les salariés éligibles.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Ce profil est synchronisé avec les fiches des salariés et pré-remplit les rubriques automatiques du bulletin.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche loupe */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une rubrique par code, libellé ou compte comptable..."
            className="w-full text-xs border-0 focus:outline-none placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {filteredRubrics.length} rubriques filtrées
        </div>
      </div>

      {/* Tableau détaillé des rubriques de paie (Zone inférieure de l'Image 5) */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-slate-100 sticky top-0 border-b border-slate-300 text-slate-700 uppercase font-semibold text-[9.5px]">
            <tr>
              <th className="py-2 px-3 w-12 border-r border-slate-200">ID</th>
              <th className="py-2 px-3 border-r border-slate-200">LIBELLÉ & DÉSIGNATION</th>
              <th className="py-2 px-2.5 text-center w-12 border-r border-slate-200">SENS</th>
              <th className="py-2 px-2 text-center w-14 border-r border-slate-200">CUMULÉ</th>
              <th className="py-2 px-2 text-center w-14 border-r border-slate-200">AV NAT</th>
              <th className="py-2 px-2 text-center w-12 border-r border-slate-200">ITS</th>
              <th className="py-2 px-2 text-center w-12 border-r border-slate-200">CNSS</th>
              <th className="py-2 px-2 text-center w-12 border-r border-slate-200">CNAM</th>
              <th className="py-2 px-2 text-center w-14 border-r border-slate-200">PLAFONNÉ</th>
              <th className="py-2 px-2.5 border-r border-slate-200">FORMULE</th>
              <th className="py-2 px-2.5 border-r border-slate-200">COMPTE</th>
              <th className="py-2 px-2 text-center w-14 border-r border-slate-200">B AUTO</th>
              <th className="py-2 px-2 text-center w-14">N AUTO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRubrics.map(r => {
              const isSelected = r.id === selectedRubricId;

              return (
                <tr
                  key={r.id}
                  onClick={() => handleSelectRow(r)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-100/80 font-bold text-sky-950 ring-1 ring-inset ring-sky-300' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <td className="py-1.5 px-3 font-mono text-slate-500 border-r border-slate-200">{r.code}</td>
                  <td className="py-1.5 px-3 border-r border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold uppercase">{r.code} {r.label}</span>
                      {r.labelAr && (
                        <span className="text-slate-500 font-normal font-sans" dir="rtl">{r.labelAr}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 px-2.5 text-center font-bold border-r border-slate-200">
                    <span className={r.sens === 'G' ? 'text-emerald-700' : 'text-rose-700'}>{r.sens}</span>
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.isCumulable ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.isAvantageNature ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.isIts ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.isCnss ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.isCnam ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.isPlafonne ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 font-mono text-[10px] text-sky-900 truncate max-w-[120px]">
                    {r.formula?.expression || r.sur}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-slate-700 border-r border-slate-200 font-semibold">{r.account}</td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    {r.baseAuto ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {r.nombreAuto ? <Check className="w-3.5 h-3.5 mx-auto text-sky-700" /> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
