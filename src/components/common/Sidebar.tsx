import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  Calculator,
  FileText,
  Archive,
  ArrowUpDown,
  PieChart,
  FileSpreadsheet,
  Sigma,
  Network,
  Sliders,
  Shield,
  Settings,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'employees'
  | 'pointage'
  | 'planning'
  | 'payroll'
  | 'payslips'
  | 'cloture'
  | 'importation'
  | 'analytics-reports'
  | 'calculette'
  | 'accounting'
  | 'rubriques'
  | 'security'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  username?: string;
  onLockSession: () => void;
  unprocessedCount?: number;
}

interface MenuItemDef {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  hint?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  username = 'root',
  onLockSession,
  unprocessedCount = 0
}) => {
  const sections: Array<{
    title: string;
    items: MenuItemDef[];
  }> = [
    {
      title: 'RH & Personnel',
      items: [
        { id: 'employees', label: 'Employés', icon: Users, hint: 'Dossiers & Salariés' },
        { id: 'pointage', label: 'Pointage', icon: Clock, hint: 'Suivi des présences' },
        { id: 'planning', label: 'Planning', icon: Calendar, hint: 'Horaires & Congés' }
      ]
    },
    {
      title: 'Traitement de la Paie',
      items: [
        { id: 'payroll', label: 'Calcul de paie', icon: Calculator, badge: unprocessedCount, hint: 'Cycles mensuels' },
        { id: 'payslips', label: 'Documents de paie', icon: FileText, hint: 'Édition & Bulletins' },
        { id: 'cloture', label: 'Clôture de paie', icon: Archive, hint: 'Scellement officiel' },
        { id: 'importation', label: 'Importation', icon: ArrowUpDown, hint: 'Excel / CSV' }
      ]
    },
    {
      title: 'Analytique & États',
      items: [
        { id: 'dashboard', label: 'Statistiques', icon: PieChart, hint: 'Indicateurs clés' },
        { id: 'analytics-reports', label: 'Rapports Analytiques', icon: FileSpreadsheet, hint: 'Livre de paie, CNSS' },
        { id: 'calculette', label: 'Calculette salaires', icon: Sigma, hint: 'Simulateur rapide' },
        { id: 'accounting', label: 'Journal comptable', icon: Network, hint: 'Écritures OD SYSCO' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'rubriques', label: 'Rubriques de paie', icon: Sliders, hint: 'Barème & Formules' },
        { id: 'security', label: 'Sécurité & Accès', icon: Shield, hint: 'Rôles & Audit' },
        { id: 'settings', label: 'Paramètres légaux', icon: Settings, hint: 'Taux & CNSS/CNAM' }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none text-xs shadow-xl relative z-30">
      {/* Profil de session en haut : Élégant bandeau d'authentification */}
      <div className="p-3.5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-sky-950">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Session active</span>
              <span className="font-bold text-white text-xs font-mono">{username}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLockSession}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Verrouiller la session"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation principale par sections */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer relative ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white font-semibold shadow-md shadow-sky-950/50'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-sky-300 rounded-r-full"></span>
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pied de menu élégant avec badge de conformité RIM */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-300">RIM-OHADA</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">v26.03 Pro</span>
      </div>
    </aside>
  );
};
