import React, { useState, useMemo } from 'react';
import { Employee, Department } from '../../types';
import {
  FileText,
  FileSpreadsheet,
  FileCheck,
  RotateCw,
  Calendar,
  Users,
  Download,
  Filter
} from 'lucide-react';

interface AttendanceAnalyticsViewProps {
  employees: Employee[];
  departments: Department[];
}

export const AttendanceAnalyticsView: React.FC<AttendanceAnalyticsViewProps> = ({
  employees,
  departments
}) => {
  const [frequency, setFrequency] = useState<'jour' | 'semaine' | 'mois' | 'annee' | 'perso'>('mois');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [selectedEmpId, setSelectedEmpId] = useState('ALL');
  const [isGenerated, setIsGenerated] = useState(true);

  const deptMap = useMemo(() => new Map(departments.map(d => [d.id, d.name])), [departments]);

  // Génération des données de présence et ponctualité pour les salariés
  const attendanceRecords = useMemo(() => {
    return employees.map((emp, index) => {
      // Données synthétiques déterministes réalistes
      const workDays = 22;
      const absentDays = index === 2 ? 2 : index === 4 ? 1 : 0;
      const presentDays = workDays - absentDays;
      const delaysCount = (index % 3 === 0) ? 2 : (index % 5 === 0) ? 1 : 0;
      const totalHours = presentDays * 8 - (delaysCount * 0.5);

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        registrationNumber: emp.registrationNumber,
        departmentId: emp.departmentId,
        departmentName: deptMap.get(emp.departmentId) || 'Exploitation',
        workDays,
        presentDays,
        absentDays,
        delaysCount,
        totalHours
      };
    });
  }, [employees, deptMap]);

  const filteredRecords = useMemo(() => {
    if (!isGenerated) return [];
    return attendanceRecords.filter(r => {
      const matchDept = selectedDeptId === 'ALL' || r.departmentId === selectedDeptId;
      const matchEmp = selectedEmpId === 'ALL' || r.id === selectedEmpId;
      return matchDept && matchEmp;
    });
  }, [attendanceRecords, isGenerated, selectedDeptId, selectedEmpId]);

  const handleExportExcel = () => {
    const headers = ['Employé', 'Matricule', 'Département', 'Jours Travail', 'Présent', 'Absent', 'Retards', 'Total Heures'];
    const rows = filteredRecords.map(r => [
      `"${r.name}"`,
      r.registrationNumber,
      `"${r.departmentName}"`,
      r.workDays,
      r.presentDays,
      r.absentDays,
      r.delaysCount,
      r.totalHours
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rapport_presence_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* En-tête principal conforme à l'Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Rapports Analytiques
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyse détaillée de la présence et de la ponctualité du personnel. Générez des états pour la paie et le suivi RH.
            </p>
          </div>
        </div>

        {/* Boutons Excel & PDF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-800 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-red-600" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Carte : PARAMÈTRES DU RAPPORT (Image 1) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>PARAMÈTRES DU RAPPORT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          {/* FRÉQUENCE */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              FRÉQUENCE
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFrequency('jour')}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  frequency === 'jour' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Jour
              </button>
              <button
                type="button"
                onClick={() => setFrequency('semaine')}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  frequency === 'semaine' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semaine
              </button>
              <button
                type="button"
                onClick={() => setFrequency('mois')}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  frequency === 'mois' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Mois
              </button>
              <button
                type="button"
                onClick={() => setFrequency('annee')}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  frequency === 'annee' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Année
              </button>
              <button
                type="button"
                onClick={() => setFrequency('perso')}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer col-span-2 ${
                  frequency === 'perso' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Personnalisé
              </button>
            </div>
          </div>

          {/* DÉBUT */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DÉBUT
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* FIN */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              FIN
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* DÉPARTEMENT */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DÉPARTEMENT
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="ALL">Tous</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* EMPLOYÉ */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              EMPLOYÉ
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="ALL">Tous</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsGenerated(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-indigo-200 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Générer le rapport</span>
          </button>
        </div>
      </div>

      {/* Carte : Vue Mensuelle (Tableau conforme Image 1) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Vue Mensuelle</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Période du {startDate.split('-').reverse().join('/')} au {endDate.split('-').reverse().join('/')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{filteredRecords.length} enregistrements</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
              <tr>
                <th className="py-3 px-5">Employé</th>
                <th className="py-3 px-5">Département</th>
                <th className="py-3 px-5 text-center">Jours Travail</th>
                <th className="py-3 px-5 text-center">Présent</th>
                <th className="py-3 px-5 text-center">Absent</th>
                <th className="py-3 px-5 text-center">Retards</th>
                <th className="py-3 px-5 text-right">Total Heures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun enregistrement ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-900">{rec.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.registrationNumber}</div>
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-medium">
                      {rec.departmentName}
                    </td>
                    <td className="py-3 px-5 text-center font-mono font-medium text-slate-700">
                      {rec.workDays}
                    </td>
                    <td className="py-3 px-5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                      {rec.presentDays}
                    </td>
                    <td className="py-3 px-5 text-center font-mono text-red-700">
                      {rec.absentDays > 0 ? rec.absentDays : '-'}
                    </td>
                    <td className="py-3 px-5 text-center font-mono text-amber-700">
                      {rec.delaysCount > 0 ? rec.delaysCount : '-'}
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-bold text-slate-900">
                      {rec.totalHours} h
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
