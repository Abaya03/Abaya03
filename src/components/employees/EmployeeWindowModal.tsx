import React, { useState } from 'react';
import { Employee, Department, LegalPayrollRules, PayRubricDefinition } from '../../types';
import { EmployeeDetailView } from './EmployeeDetailView';
import { JasperPayslipModal } from '../payslips/JasperPayslipModal';
import {
  X,
  Maximize2,
  Minimize2,
  Printer,
  FileText,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface EmployeeWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  employees: Employee[];
  departments: Department[];
  rules: LegalPayrollRules;
  onSelectEmployee: (emp: Employee) => void;
  onOpenJasperPayslip: (emp: Employee) => void;
  onSaveEmployee: (emp: Employee) => void;
  period?: string;
  availableRubrics?: PayRubricDefinition[];
}

export const EmployeeWindowModal: React.FC<EmployeeWindowModalProps> = ({
  isOpen,
  onClose,
  employee,
  employees,
  departments,
  rules,
  onSelectEmployee,
  onOpenJasperPayslip,
  onSaveEmployee,
  period = 'JUIN 2026',
  availableRubrics
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeWindowTab, setActiveWindowTab] = useState<'detail' | 'payslip'>('detail');

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-300/80 flex flex-col transition-all duration-200 overflow-hidden ${
          isMaximized
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-6xl max-h-[96vh]'
        }`}
      >
        {/* Barre de titre de fenêtre type Bureau Moderne & Raffiné */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950 text-white border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold text-xs shadow-xs">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Fiche Collaborateur
              </span>
              <span className="text-slate-600 font-mono text-xs">•</span>
              <span className="text-xs font-mono font-bold text-sky-300">
                {employee.registrationNumber}
              </span>
              <span className="text-xs text-slate-200 font-medium">
                {employee.firstName} {employee.lastName}
              </span>
              <span className="hidden md:inline text-[11px] text-sky-200 bg-sky-900/60 border border-sky-700/50 px-2 py-0.5 rounded-full font-medium" dir="rtl">
                نافذة معلومات الموظف الرسمية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sélecteur rapide de salarié */}
            <div className="relative">
              <select
                value={employee.id}
                onChange={(e) => {
                  const target = employees.find(emp => emp.id === e.target.value);
                  if (target) onSelectEmployee(target);
                }}
                className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 pr-7 font-medium cursor-pointer hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.registrationNumber} — {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>

            <div className="h-4 w-px bg-slate-700"></div>

            {/* Agrandir / Réduire */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMaximized ? 'Restaurer' : 'Agrandir la fenêtre'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Fermer */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-red-600 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Fermer la fenêtre (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barre de navigation interne entre Fiche Salarié et كشف الراتب */}
        <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/80 px-4 py-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveWindowTab('detail')}
              className={`py-1.5 px-3.5 font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeWindowTab === 'detail'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>معلومات الموظف و عناصر الراتب (Image 1)</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenJasperPayslip(employee)}
              className="py-1.5 px-3.5 font-bold rounded-lg transition-all text-slate-700 hover:text-sky-950 hover:bg-white/60 cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5 text-sky-700" />
              <span>كشف الراتب الرسمي المعتمد (Image 2)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenJasperPayslip(employee)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>عرض كشف الراتب (JasperViewer)</span>
            </button>
          </div>
        </div>

        {/* Corps de la fenêtre : Vue détaillée conforme à l'Image 1 avec design soigné */}
        <div className="flex-1 overflow-auto bg-slate-100/60 p-2 sm:p-4">
          <EmployeeDetailView
            employee={employee}
            departments={departments}
            rules={rules}
            onOpenJasperPayslip={onOpenJasperPayslip}
            onBackToList={onClose}
            onSaveEmployee={onSaveEmployee}
            period={period}
            availableRubrics={availableRubrics}
          />
        </div>
      </div>
    </div>
  );
};
