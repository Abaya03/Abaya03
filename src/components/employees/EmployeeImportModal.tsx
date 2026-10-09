import React, { useState } from 'react';
import { Employee, Department } from '../../types';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface EmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newEmployees: Employee[]) => void;
  departments: Department[];
  existingEmployees: Employee[];
}

export const EmployeeImportModal: React.FC<EmployeeImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  departments,
  existingEmployees
}) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'completed'>('upload');
  const [importedRows, setImportedRows] = useState<Partial<Employee>[]>([]);
  const [duplicatesCount, setDuplicatesCount] = useState<number>(0);

  if (!isOpen) return null;

  // Modèle de simulation de données importées depuis un fichier RH Excel/CSV
  const handleLoadSampleCSV = () => {
    const nextMatriculeNumber = existingEmployees.length + 109;
    const sampleBatch: Partial<Employee>[] = [
      {
        registrationNumber: `M-0${nextMatriculeNumber}`,
        firstName: 'Sidi Mohamed',
        lastName: 'Ould Vall',
        jobTitle: 'Technicien Télécoms & Réseaux',
        departmentId: 'DEP-IT',
        category: 'Maîtrise M1',
        contractType: 'CDI',
        status: 'ACTIF',
        baseSalary: 31000,
        transportAllowance: 2500,
        housingAllowance: 2000,
        nationalIdNumber: '0981928301',
        socialSecurityNumber: '482910-12',
        healthInsuranceNumber: 'CNAM-94830',
        paymentMethod: 'VIREMENT',
        bankName: 'BMCI',
        bankAccountNumber: '00001 00100 09849201940 33'
      },
      {
        registrationNumber: `M-0${nextMatriculeNumber + 1}`,
        firstName: 'Zeinabou',
        lastName: 'Mint Samba',
        jobTitle: "Juriste d'Entreprise",
        departmentId: 'DEP-RH',
        category: 'Cadre C2',
        contractType: 'CDI',
        status: 'ACTIF',
        baseSalary: 55000,
        transportAllowance: 3500,
        housingAllowance: 8000,
        functionAllowance: 5000,
        nationalIdNumber: '0982837461',
        socialSecurityNumber: '482910-13',
        healthInsuranceNumber: 'CNAM-94831',
        paymentMethod: 'VIREMENT',
        bankName: 'Attijariwafa Bank Mauritanie',
        bankAccountNumber: '00004 00200 07482910293 88'
      },
      {
        registrationNumber: `M-0${nextMatriculeNumber + 2}`,
        firstName: 'Ousmane',
        lastName: 'Sy',
        jobTitle: 'Gestionnaire de Stock & Magasinier',
        departmentId: 'DEP-LOG',
        category: 'Employé E2',
        contractType: 'CDD',
        status: 'ACTIF',
        baseSalary: 22000,
        transportAllowance: 2500,
        housingAllowance: 1500,
        nationalIdNumber: '0983746592',
        socialSecurityNumber: '482910-14',
        healthInsuranceNumber: 'CNAM-94832',
        paymentMethod: 'VIREMENT',
        bankName: 'Société Générale Mauritanie',
        bankAccountNumber: '00002 00100 04829104920 12'
      }
    ];

    setImportedRows(sampleBatch);
    setDuplicatesCount(0);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const newEntities: Employee[] = importedRows.map((r, i) => ({
      id: `EMP-IMP-${Date.now()}-${i}`,
      registrationNumber: r.registrationNumber || `M-IMP-${i}`,
      firstName: r.firstName || '',
      lastName: r.lastName || '',
      birthDate: '1992-05-10',
      nationality: 'Mauritanienne',
      nationalIdNumber: r.nationalIdNumber || '0000000000',
      socialSecurityNumber: r.socialSecurityNumber || '',
      healthInsuranceNumber: r.healthInsuranceNumber || '',
      maritalStatus: 'CELIBATAIRE',
      dependentsCount: 1,
      departmentId: r.departmentId || departments[0]?.id || 'DEP-DG',
      jobTitle: r.jobTitle || 'Collaborateur',
      hireDate: new Date().toISOString().split('T')[0],
      contractType: r.contractType || 'CDI',
      status: r.status || 'ACTIF',
      category: r.category || 'Cadre',
      baseSalary: Number(r.baseSalary) || 25000,
      transportAllowance: Number(r.transportAllowance) || 2500,
      housingAllowance: Number(r.housingAllowance) || 0,
      functionAllowance: Number(r.functionAllowance) || 0,
      phoneAllowance: 0,
      paymentMethod: r.paymentMethod || 'VIREMENT',
      bankName: r.bankName || 'BMCI',
      bankBranch: 'Nouakchott',
      bankAccountNumber: r.bankAccountNumber || '',
      phone: '+222 45 00 00 00',
      email: `${(r.firstName || 'user').toLowerCase().replace(/\s+/g, '')}@smis-rim.com`,
      address: 'Nouakchott, Mauritanie'
    }));

    onImport(newEntities);
    setStep('completed');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Importation en Masse des Salariés (Excel / CSV)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Format standard compatible Sage Paie & SIRH Mauritanie
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

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Déposez votre fichier de personnel ou chargez un lot modèle
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Colonnes reconnues : Matricule, Nom, Prénom, Département, Poste, Salaire de base, Indemnités, RIB, N° CNSS.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadSampleCSV}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    Charger le lot de démonstration (3 salariés certifiés)
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div>
                  <strong className="text-slate-900 font-semibold">{importedRows.length} lignes valides</strong> détectées dans le fichier.
                </div>
                {duplicatesCount > 0 && (
                  <div className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{duplicatesCount} matricules déjà existants</span>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="px-3 py-2">Matricule</th>
                      <th className="px-3 py-2">Salarié</th>
                      <th className="px-3 py-2">Poste</th>
                      <th className="px-3 py-2 text-right">Salaire Base</th>
                      <th className="px-3 py-2">Banque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-medium text-slate-900">{r.registrationNumber}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{r.firstName} {r.lastName}</td>
                        <td className="px-3 py-2 text-slate-600">{r.jobTitle}</td>
                        <td className="px-3 py-2 font-mono text-right text-slate-900 font-semibold">{r.baseSalary?.toLocaleString('fr-FR')} MRU</td>
                        <td className="px-3 py-2 text-slate-600">{r.bankName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirmer et intégrer au personnel</span>
                </button>
              </div>
            </div>
          )}

          {step === 'completed' && (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Importation réussie avec succès</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Les fiches ont été ajoutées au registre du personnel et sont désormais éligibles pour le calcul de paie en cours.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
