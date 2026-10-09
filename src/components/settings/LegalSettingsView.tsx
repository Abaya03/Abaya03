import React, { useState } from 'react';
import { LegalPayrollRules, CompanyProfile } from '../../types';
import { Sliders, Building2, Save, ShieldCheck, Scale, Check } from 'lucide-react';

interface LegalSettingsViewProps {
  rules: LegalPayrollRules;
  company: CompanyProfile;
  onSaveRules: (newRules: LegalPayrollRules) => void;
  onSaveCompany: (newCompany: CompanyProfile) => void;
}

export const LegalSettingsView: React.FC<LegalSettingsViewProps> = ({
  rules,
  company,
  onSaveRules,
  onSaveCompany
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'company'>('rules');

  const [editableRules, setEditableRules] = useState<LegalPayrollRules>({ ...rules });
  const [editableCompany, setEditableCompany] = useState<CompanyProfile>({ ...company });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRulesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules(editableRules);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(editableCompany);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Kicker et en-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Administration du Système & Conformité Réglementaire
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Paramètres Légaux & Dossier Entreprise
          </h1>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Paramètres enregistrés avec succès</span>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Barèmes Légaux Mauritanie (CNSS, CNAM, ITS)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Fiche Dossier Entreprise & Identifiants</span>
        </button>
      </div>

      {/* Onglet 1: Règles Légales Mauritaniennes */}
      {activeTab === 'rules' && (
        <form onSubmit={handleRulesSubmit} className="space-y-6">
          {/* Bloc CNSS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                1. Caisse Nationale de Sécurité Sociale (CNSS de Mauritanie)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Plafond d'assiette mensuelle (MRU)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={editableRules.cnssCeilingMonthly}
                  onChange={(e) => setEditableRules({ ...editableRules, cnssCeilingMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                />
                <span className="text-[10px] text-slate-500">Plafond légal : 70 000 MRU</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Vieillesse Salariale (Régime Pensions)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={editableRules.cnssPensionEmployeeRate * 100}
                    onChange={(e) => setEditableRules({ ...editableRules, cnssPensionEmployeeRate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Vieillesse Patronale (Régime Pensions)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={editableRules.cnssPensionEmployerRate * 100}
                    onChange={(e) => setEditableRules({ ...editableRules, cnssPensionEmployerRate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Prestations Familiales (Patronale)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={editableRules.cnssFamilyAllowanceRate * 100}
                    onChange={(e) => setEditableRules({ ...editableRules, cnssFamilyAllowanceRate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span>Total cotisations CNSS : <strong>1% Salarié</strong> + <strong>12% Patronal</strong> (Plafonné à {editableRules.cnssCeilingMonthly.toLocaleString('fr-FR')} MRU).</span>
              <span className="font-semibold text-slate-700">Conforme Loi n° 67-039 modifiée</span>
            </div>
          </div>

          {/* Bloc CNAM */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                2. Caisse Nationale d'Assurance Maladie (CNAM Mauritanie)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cotisation Salariale Maladie (Déplafonnée)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={editableRules.cnamEmployeeRate * 100}
                    onChange={(e) => setEditableRules({ ...editableRules, cnamEmployeeRate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
                <span className="text-[10px] text-slate-500">Taux légal obligatoire : 4,00%</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cotisation Patronale Maladie (Déplafonnée)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={editableRules.cnamEmployerRate * 100}
                    onChange={(e) => setEditableRules({ ...editableRules, cnamEmployerRate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
                <span className="text-[10px] text-slate-500">Taux légal obligatoire : 5,00%</span>
              </div>
            </div>
          </div>

          {/* Bloc Barème Progressif ITS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Scale className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">
                3. Barème Mensuel de l'Impôt sur les Traitements et Salaires (ITS - Code Général des Impôts)
              </h2>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Tranche de Revenu Mensuel Imposable</th>
                    <th className="px-4 py-2.5">Taux d'Imposition Applicable</th>
                    <th className="px-4 py-2.5">Observation Légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">De 0 à 6 000 MRU</td>
                    <td className="px-4 py-2 font-bold text-emerald-700">0,00 %</td>
                    <td className="px-4 py-2 font-sans text-slate-500">Tranche non imposable de solidarité</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">De 6 001 à 21 000 MRU</td>
                    <td className="px-4 py-2 font-bold text-blue-700">15,00 %</td>
                    <td className="px-4 py-2 font-sans text-slate-500">Deuxième tranche</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">De 21 001 à 40 000 MRU</td>
                    <td className="px-4 py-2 font-bold text-purple-700">25,00 %</td>
                    <td className="px-4 py-2 font-sans text-slate-500">Troisième tranche</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">Au-delà de 40 000 MRU</td>
                    <td className="px-4 py-2 font-bold text-red-700">40,00 %</td>
                    <td className="px-4 py-2 font-sans text-slate-500">Tranche marginale supérieure</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>
                Plafond d'exonération de l'indemnité de transport : <strong className="font-mono text-slate-800">{editableRules.transportAllowanceExemptLimit} MRU</strong> / mois
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                Version des règles : {editableRules.version} (Date d'effet : {editableRules.effectiveDate})
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer et appliquer les paramètres de calcul</span>
            </button>
          </div>
        </form>
      )}

      {/* Onglet 2: Fiche Entreprise */}
      {activeTab === 'company' && (
        <form onSubmit={handleCompanySubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Identité Juridique et Coordonnées de l'Entreprise
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Raison Sociale *</label>
                <input
                  type="text"
                  value={editableCompany.name}
                  onChange={(e) => setEditableCompany({ ...editableCompany, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Forme Juridique</label>
                <input
                  type="text"
                  value={editableCompany.legalForm}
                  onChange={(e) => setEditableCompany({ ...editableCompany, legalForm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Numéro d'Identification Fiscale (NIF) *</label>
                <input
                  type="text"
                  value={editableCompany.taxId}
                  onChange={(e) => setEditableCompany({ ...editableCompany, taxId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Registre de Commerce (RC)</label>
                <input
                  type="text"
                  value={editableCompany.commercialRegister}
                  onChange={(e) => setEditableCompany({ ...editableCompany, commercialRegister: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">N° d'Affiliation CNSS</label>
                <input
                  type="text"
                  value={editableCompany.cnssNumber}
                  onChange={(e) => setEditableCompany({ ...editableCompany, cnssNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">N° d'Affiliation CNAM</label>
                <input
                  type="text"
                  value={editableCompany.cnamNumber}
                  onChange={(e) => setEditableCompany({ ...editableCompany, cnamNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Adresse du Siège</label>
                <input
                  type="text"
                  value={editableCompany.address}
                  onChange={(e) => setEditableCompany({ ...editableCompany, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Ville et Pays</label>
                <input
                  type="text"
                  value={`${editableCompany.city}, ${editableCompany.country}`}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Téléphone de l'Entreprise</label>
                <input
                  type="text"
                  value={editableCompany.phone}
                  onChange={(e) => setEditableCompany({ ...editableCompany, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Compte Bancaire Principal (RIB Débiteur)</label>
                <input
                  type="text"
                  value={editableCompany.bankAccountRIB}
                  onChange={(e) => setEditableCompany({ ...editableCompany, bankAccountRIB: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les coordonnées de l'entreprise</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
