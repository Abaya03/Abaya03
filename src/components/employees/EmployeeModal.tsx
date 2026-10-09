import React, { useState } from 'react';
import { Employee, Department, ContractType, MaritalStatus, EmployeeStatus } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  departments: Department[];
  employeeToEdit?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  employeeToEdit
}) => {
  const [activeTab, setActiveTab] = useState<'civil' | 'contract' | 'salary' | 'bank'>('civil');

  const [formData, setFormData] = useState<Partial<Employee>>(() => {
    if (employeeToEdit) {
      return { ...employeeToEdit };
    }
    return {
      registrationNumber: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: '',
      lastName: '',
      birthDate: '1990-01-01',
      nationality: 'Mauritanienne',
      nationalIdNumber: '',
      socialSecurityNumber: '',
      healthInsuranceNumber: '',
      maritalStatus: 'MARIE' as MaritalStatus,
      dependentsCount: 0,
      departmentId: departments[0]?.id || 'DEP-DG',
      jobTitle: '',
      hireDate: new Date().toISOString().split('T')[0],
      contractType: 'CDI' as ContractType,
      status: 'ACTIF' as EmployeeStatus,
      category: 'Cadre C1',
      baseSalary: 30000,
      transportAllowance: 2500,
      housingAllowance: 0,
      functionAllowance: 0,
      phoneAllowance: 0,
      paymentMethod: 'VIREMENT',
      bankName: 'BMCI',
      bankBranch: 'Agence Centrale Nouakchott',
      bankAccountNumber: '',
      phone: '',
      email: '',
      address: ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.firstName?.trim()) errs.firstName = 'Le prénom est requis';
    if (!formData.lastName?.trim()) errs.lastName = 'Le nom est requis';
    if (!formData.registrationNumber?.trim()) errs.registrationNumber = 'Le matricule est requis';
    if (!formData.baseSalary || formData.baseSalary <= 0) errs.baseSalary = 'Le salaire de base doit être supérieur à 0';
    if (!formData.nationalIdNumber?.trim()) errs.nationalIdNumber = 'Le N° d\'identité national est requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalEmployee: Employee = {
      id: employeeToEdit?.id || `EMP-${Date.now()}`,
      registrationNumber: formData.registrationNumber || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      birthDate: formData.birthDate || '1990-01-01',
      nationality: formData.nationality || 'Mauritanienne',
      nationalIdNumber: formData.nationalIdNumber || '',
      socialSecurityNumber: formData.socialSecurityNumber || '',
      healthInsuranceNumber: formData.healthInsuranceNumber || '',
      maritalStatus: formData.maritalStatus || 'CELIBATAIRE',
      dependentsCount: Number(formData.dependentsCount) || 0,
      departmentId: formData.departmentId || departments[0]?.id,
      jobTitle: formData.jobTitle || 'Employé',
      hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
      contractType: formData.contractType || 'CDI',
      status: formData.status || 'ACTIF',
      category: formData.category || 'Cadre C1',
      baseSalary: Number(formData.baseSalary) || 0,
      transportAllowance: Number(formData.transportAllowance) || 0,
      housingAllowance: Number(formData.housingAllowance) || 0,
      functionAllowance: Number(formData.functionAllowance) || 0,
      phoneAllowance: Number(formData.phoneAllowance) || 0,
      paymentMethod: formData.paymentMethod || 'VIREMENT',
      bankName: formData.bankName || 'BMCI',
      bankBranch: formData.bankBranch || 'Nouakchott',
      bankAccountNumber: formData.bankAccountNumber || '',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || ''
    };

    onSave(finalEmployee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* En-tête modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {employeeToEdit ? `Modifier la fiche : ${employeeToEdit.firstName} ${employeeToEdit.lastName}` : 'Nouveau Dossier Salarié'}
            </h2>
            <p className="text-xs text-slate-500">
              {employeeToEdit ? `Matricule ${employeeToEdit.registrationNumber}` : 'Enregistrement dans le personnel de l\'entreprise'}
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

        {/* Onglets thématiques */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('civil')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'civil'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. État Civil & Identité
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'contract'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Contrat & Affectation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'salary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Salaire & Primes (MRU)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Banque & Sécurité Sociale
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {/* Onglet 1: État Civil */}
            {activeTab === 'civil' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Matricule interne *</label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="M-0109"
                  />
                  {errors.registrationNumber && <p className="text-[11px] text-red-600 mt-1">{errors.registrationNumber}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">N° National d'Identité (NNID) *</label>
                  <input
                    type="text"
                    value={formData.nationalIdNumber || ''}
                    onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    placeholder="0982103948"
                  />
                  {errors.nationalIdNumber && <p className="text-[11px] text-red-600 mt-1">{errors.nationalIdNumber}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="Ahmed"
                  />
                  {errors.firstName && <p className="text-[11px] text-red-600 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nom de famille *</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="Ould Mahmoud"
                  />
                  {errors.lastName && <p className="text-[11px] text-red-600 mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nationalité</label>
                  <input
                    type="text"
                    value={formData.nationality || 'Mauritanienne'}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Situation familiale</label>
                  <select
                    value={formData.maritalStatus || 'CELIBATAIRE'}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as MaritalStatus })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="CELIBATAIRE">Célibataire</option>
                    <option value="MARIE">Marié(e)</option>
                    <option value="DIVORCE">Divorcé(e)</option>
                    <option value="VEUF">Veuf(ve)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Personnes à charge (enfants/conjoint)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={formData.dependentsCount || 0}
                    onChange={(e) => setFormData({ ...formData, dependentsCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone portable</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="+222 45 00 00 00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="salarie@smis-rim.com"
                  />
                </div>
              </div>
            )}

            {/* Onglet 2: Contrat & Affectation */}
            {activeTab === 'contract' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Département d'affectation *</label>
                  <select
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Poste / Intitulé de l'emploi *</label>
                  <input
                    type="text"
                    value={formData.jobTitle || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="Ingénieur d'études"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Classification conventionnelle</label>
                  <input
                    type="text"
                    value={formData.category || 'Cadre C1'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="Cadre C1, Maîtrise M2..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type de contrat</label>
                  <select
                    value={formData.contractType || 'CDI'}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                    <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                    <option value="STAGE">Stage Professionnel</option>
                    <option value="PRESTATION">Prestation / Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Statut d'activité</label>
                  <select
                    value={formData.status || 'ACTIF'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="ACTIF">Actif (en poste)</option>
                    <option value="CONGE">En congé payé</option>
                    <option value="SUSPENDU">Suspendu</option>
                    <option value="DEMISSIONNE">Démissionné / Sorti</option>
                    <option value="RETRAITE">Retraité</option>
                  </select>
                </div>
              </div>
            )}

            {/* Onglet 3: Salaire & Primes */}
            {activeTab === 'salary' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  Tous les montants sont exprimés en Ouguiyas (MRU). L'indemnité de transport bénéficie d'une exonération légale plafonnée à 2 500 MRU/mois.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Salaire de base mensuel (MRU) *</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.baseSalary || 0}
                      onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono font-semibold"
                    />
                    {errors.baseSalary && <p className="text-[11px] text-red-600 mt-1">{errors.baseSalary}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Indemnité de transport (MRU)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.transportAllowance || 0}
                      onChange={(e) => setFormData({ ...formData, transportAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Exonérée jusqu'à 2 500 MRU</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Indemnité de logement (MRU)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.housingAllowance || 0}
                      onChange={(e) => setFormData({ ...formData, housingAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Indemnité de fonction / responsabilité (MRU)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.functionAllowance || 0}
                      onChange={(e) => setFormData({ ...formData, functionAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Indemnité de communication (MRU)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.phoneAllowance || 0}
                      onChange={(e) => setFormData({ ...formData, phoneAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Onglet 4: Banque & Sécurité Sociale */}
            {activeTab === 'bank' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Numéro CNSS (Sécurité Sociale)</label>
                  <input
                    type="text"
                    value={formData.socialSecurityNumber || ''}
                    onChange={(e) => setFormData({ ...formData, socialSecurityNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    placeholder="482910-09"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Numéro CNAM (Assurance Maladie)</label>
                  <input
                    type="text"
                    value={formData.healthInsuranceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, healthInsuranceNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    placeholder="CNAM-94829"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mode de règlement</label>
                  <select
                    value={formData.paymentMethod || 'VIREMENT'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="VIREMENT">Virement bancaire</option>
                    <option value="CHEQUE">Chèque de paie</option>
                    <option value="ESPECES">Espèces (caisse)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Banque domiciliataire</label>
                  <select
                    value={formData.bankName || 'BMCI'}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="BMCI">BMCI (Banque Mauritanienne pour le Commerce International)</option>
                    <option value="Attijariwafa Bank Mauritanie">Attijariwafa Bank Mauritanie</option>
                    <option value="BIM (Banque Islamique de Mauritanie)">BIM (Banque Islamique de Mauritanie)</option>
                    <option value="Société Générale Mauritanie">Société Générale Mauritanie</option>
                    <option value="BCM">Banque Centrale de Mauritanie</option>
                    <option value="Autre Banque">Autre établissement bancaire</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Relevé d'Identité Bancaire (RIB 27 caractères)</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    placeholder="00001 00100 01234567890 45"
                  />
                  <span className="text-[10px] text-slate-500">Format : Code Banque (5) - Code Guichet (5) - N° Compte (11) - Clé RIB (2)</span>
                </div>
              </div>
            )}
          </div>

          {/* Pied de modal avec boutons d'action */}
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
              <span>{employeeToEdit ? 'Enregistrer les modifications' : 'Créer le salarié'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
