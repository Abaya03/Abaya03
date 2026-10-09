import React from 'react';
import { Employee, Department } from '../../types';
import { X, Edit2, Building2, CreditCard, Shield, Phone, Mail, MapPin } from 'lucide-react';

interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  department?: Department;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  employee,
  department,
  onClose,
  onEdit
}) => {
  if (!employee) return null;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MRU';
  };

  const totalAllowances = employee.transportAllowance + employee.housingAllowance + employee.functionAllowance + employee.phoneAllowance;
  const totalContractualGross = employee.baseSalary + totalAllowances;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{employee.firstName} {employee.lastName}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-700">{employee.registrationNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{employee.jobTitle}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(employee)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            title="Modifier la fiche"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statut & Contrat */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Statut administratif</span>
            <span className="font-semibold text-slate-800">{employee.status}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Département</span>
            <span className="font-semibold text-slate-900">{department?.name || 'Général'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Contrat</span>
            <span className="font-semibold text-slate-800">{employee.contractType} · Embauche le {employee.hireDate}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Classification</span>
            <span className="font-semibold text-slate-800">{employee.category}</span>
          </div>
        </div>

        {/* Détail Rémunération contractuelle */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Rémunération Contractuelle</h3>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
            <div className="p-3 flex items-center justify-between bg-slate-50/50">
              <span className="font-medium text-slate-700">Salaire de Base</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(employee.baseSalary)}</span>
            </div>
            {employee.transportAllowance > 0 && (
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-600">Indemnité de Transport</span>
                  <span className="text-[10px] text-slate-400 ml-1">(exonérée à hauteur de 2 500)</span>
                </div>
                <span className="font-mono text-slate-800">{formatCurrency(employee.transportAllowance)}</span>
              </div>
            )}
            {employee.housingAllowance > 0 && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-600">Indemnité de Logement</span>
                <span className="font-mono text-slate-800">{formatCurrency(employee.housingAllowance)}</span>
              </div>
            )}
            {employee.functionAllowance > 0 && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-600">Indemnité de Fonction</span>
                <span className="font-mono text-slate-800">{formatCurrency(employee.functionAllowance)}</span>
              </div>
            )}
            {employee.phoneAllowance > 0 && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-600">Indemnité de Communication</span>
                <span className="font-mono text-slate-800">{formatCurrency(employee.phoneAllowance)}</span>
              </div>
            )}
            <div className="p-3 flex items-center justify-between bg-blue-50/60 font-semibold text-blue-900">
              <span>Total Brut Contractuel</span>
              <span className="font-mono">{formatCurrency(totalContractualGross)}</span>
            </div>
          </div>
        </div>

        {/* Sécurité sociale & Fiscalité */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Affiliation & Fiscalité</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">N° National Identité (NNID)</span>
              <span className="font-mono font-semibold text-slate-800">{employee.nationalIdNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">N° CNSS (Sécurité Sociale)</span>
              <span className="font-mono font-semibold text-slate-800">{employee.socialSecurityNumber || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">N° CNAM (Assurance Maladie)</span>
              <span className="font-mono font-semibold text-slate-800">{employee.healthInsuranceNumber || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Charges familiales</span>
              <span className="font-semibold text-slate-800">{employee.dependentsCount} personne(s) à charge</span>
            </div>
          </div>
        </div>

        {/* Coordonnées bancaires */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Règlement des Rémunérations</h3>
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mode de paiement</span>
              <span className="font-semibold text-slate-900">{employee.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Banque domiciliataire</span>
              <span className="font-semibold text-slate-800">{employee.bankName}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Relevé d'Identité Bancaire (RIB)</div>
              <div className="font-mono font-semibold text-slate-900 text-xs mt-0.5 tracking-wider bg-slate-50 p-2 rounded border border-slate-200">
                {employee.bankAccountNumber || 'Aucun compte bancaire renseigné'}
              </div>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Coordonnées</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.phone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.email || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.address || 'Nouakchott'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
