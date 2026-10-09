import React, { useState, useMemo } from 'react';
import { Employee, Department, LegalPayrollRules } from '../../types';
import { EmployeeDetailView } from './EmployeeDetailView';
import {
  Search,
  Plus,
  RotateCw,
  Eye,
  Edit2,
  Trash2,
  Check,
  FileSpreadsheet,
  Download,
  Upload,
  Printer
} from 'lucide-react';

interface EmployeeListViewProps {
  employees: Employee[];
  departments: Department[];
  rules: LegalPayrollRules;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onViewEmployee: (employee: Employee) => void;
  onOpenImport: () => void;
  onOpenJasperPayslip: (employee: Employee) => void;
  onSaveEmployee: (employee: Employee) => void;
  initialSelectedEmployee?: Employee | null;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  departments,
  rules,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployee,
  onOpenImport,
  onOpenJasperPayslip,
  onSaveEmployee,
  initialSelectedEmployee
}) => {
  const [activeTab, setActiveTab] = useState<'liste' | 'detail'>('liste');
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState<Employee>(() => {
    return initialSelectedEmployee || employees.find(e => e.registrationNumber.includes('243')) || employees[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deptMap = useMemo(() => new Map(departments.map(d => [d.id, d.code || d.name])), [departments]);

  const activeCount = useMemo(() => employees.filter(e => e.status === 'ACTIF').length, [employees]);
  const totalCount = employees.length;
  const sortieCount = useMemo(() => employees.filter(e => e.status === 'DEMISSIONNE' || e.status === 'RETRAITE').length, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        searchQuery === '' ||
        emp.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.socialSecurityNumber.includes(searchQuery);

      const matchActive = !onlyActive || emp.status === 'ACTIF';

      return matchSearch && matchActive;
    });
  }, [employees, searchQuery, onlyActive]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  // Clic sur un employé -> ouvre immédiatement la fenêtre Salarié avec toutes ses informations
  const handleSelectEmployeeRow = (emp: Employee) => {
    setSelectedDetailEmployee(emp);
    onViewEmployee(emp);
  };

  // Si l'onglet Détail est actif, afficher directement la vue détaillée exacte de l'Image 1
  if (activeTab === 'detail' && selectedDetailEmployee) {
    return (
      <EmployeeDetailView
        employee={selectedDetailEmployee}
        departments={departments}
        rules={rules}
        onOpenJasperPayslip={onOpenJasperPayslip}
        onBackToList={() => setActiveTab('liste')}
        onSaveEmployee={onSaveEmployee}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full text-xs">
      {/* Barre de titre moderne avec onglets de vue */}
      <div className="px-5 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-600"></div>
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Répertoire des Salariés
            </h2>
          </div>
          <span className="text-slate-300">|</span>
          {/* Onglets : [Liste] [Détail] */}
          <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('liste')}
              className={`py-1 px-3.5 font-bold text-xs rounded-md transition-all cursor-pointer ${
                activeTab === 'liste'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue Liste
            </button>
            <button
              type="button"
              onClick={() => {
                if (employees.length > 0) setActiveTab('detail');
              }}
              className={`py-1 px-3.5 font-bold text-xs rounded-md transition-all cursor-pointer ${
                activeTab === 'detail'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fiche Détaillée
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>Affichage temps réel</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Barre d'outils supérieure moderne */}
      <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Recherche avec loupe moderne */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, matricule, poste..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Compteur filtré */}
          <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
            {filteredEmployees.length} / {totalCount}
          </span>

          {/* Case à cocher : ☑ Salariés actifs */}
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Actifs uniquement</span>
          </label>
        </div>

        {/* Badges de compteurs colorés et boutons d'action */}
        <div className="flex items-center gap-2">
          {/* Badges statut épurés */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 font-mono text-xs">
            <span className="px-2.5 py-0.5 font-bold text-slate-700 rounded-md">
              Total: {totalCount}
            </span>
            <span className="px-2.5 py-0.5 font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md">
              Actifs: {activeCount}
            </span>
            <span className="px-2.5 py-0.5 font-bold bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">
              Sorties: {sortieCount}
            </span>
          </div>

          <span className="text-slate-300 mx-1">|</span>

          {/* Bouton Ajouter [+] */}
          <button
            type="button"
            onClick={onAddEmployee}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
            title="Ajouter un nouveau salarié"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau</span>
          </button>

          {/* Bouton Actualiser [↻] */}
          <button
            type="button"
            onClick={() => {}}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Actualiser la liste"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Bouton Import Excel / CSV */}
          <button
            type="button"
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Importer</span>
          </button>
        </div>
      </div>

      {/* Tableau détaillé avec les colonnes exactes */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-slate-50/90 backdrop-blur-xs sticky top-0 border-b border-slate-200 text-slate-600 uppercase font-bold text-[9.5px] tracking-wider z-10 shadow-xs">
            <tr>
              <th className="py-2.5 px-2 text-center w-8 border-r border-slate-200/70">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded text-sky-600 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-2 text-center w-6 border-r border-slate-200/70">C</th>
              <th className="py-2.5 px-3 border-r border-slate-200/70 font-mono">ID SAL.</th>
              <th className="py-2.5 px-3 border-r border-slate-200/70">PRENOM</th>
              <th className="py-2.5 px-3 border-r border-slate-200/70">NOM</th>
              <th className="py-2.5 px-2.5 border-r border-slate-200/70 text-center">CONTRAT</th>
              <th className="py-2.5 px-2.5 border-r border-slate-200/70 text-center">DEPARTEMENT</th>
              <th className="py-2.5 px-2 border-r border-slate-200/70 text-center">SRV</th>
              <th className="py-2.5 px-3 border-r border-slate-200/70">POSTE</th>
              <th className="py-2.5 px-2.5 border-r border-slate-200/70 text-center">EMBAUCHE</th>
              <th className="py-2.5 px-2.5 border-r border-slate-200/70 text-center">CATEGORIE</th>
              <th className="py-2.5 px-2.5 border-r border-slate-200/70 text-center">N°CNSS</th>
              <th className="py-2.5 px-2.5 border-r border-slate-200/70 text-center">N°CNAM</th>
              <th className="py-2.5 px-2 border-r border-slate-200/70 text-center">STATUT</th>
              <th className="py-2.5 px-3 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-slate-400">
                  Aucun salarié ne correspond aux critères.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => {
                const isSelected = selectedIds.has(emp.id);

                return (
                  <tr
                    key={emp.id}
                    onClick={() => handleSelectEmployeeRow(emp)}
                    className={`hover:bg-sky-100/70 transition-colors cursor-pointer select-none ${
                      isSelected ? 'bg-sky-50 font-medium' : ''
                    }`}
                  >
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => toggleSelect(emp.id, e)}
                        onChange={() => {}}
                        className="rounded text-sky-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono text-[10px] text-slate-400">
                      •
                    </td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {emp.registrationNumber}
                    </td>
                    <td className="py-1.5 px-2.5 font-bold text-sky-950 hover:underline border-r border-slate-200 whitespace-nowrap">
                      {emp.firstName}
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      {emp.lastName}
                    </td>
                    <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {emp.contractType}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-blue-900 border-r border-slate-200 whitespace-nowrap">
                      {deptMap.get(emp.departmentId) || 'LEMMC'}
                    </td>
                    <td className="py-1.5 px-2 text-center text-slate-500 border-r border-slate-200">
                      A
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-800 font-medium border-r border-slate-200 whitespace-nowrap">
                      {emp.jobTitle}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {emp.hireDate.split('-').reverse().join('/')}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-mono text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {emp.category}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-mono font-medium text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {emp.socialSecurityNumber || '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-mono text-[10px] text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {emp.healthInsuranceNumber || '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-center text-slate-400 border-r border-slate-200">
                      -
                    </td>
                    <td className="py-1.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenJasperPayslip(emp)}
                          className="p-1 text-sky-700 hover:bg-sky-100 rounded"
                          title="Imprimer le Bulletin de Paie (JasperViewer)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectEmployeeRow(emp)}
                          className="p-1 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded"
                          title="Fiche détaillée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditEmployee(emp)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-slate-100 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
