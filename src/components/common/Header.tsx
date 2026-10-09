import React, { useState } from 'react';
import { User, CompanyProfile } from '../../types';
import {
  Menu,
  RotateCcw,
  LayoutGrid,
  X,
  ChevronDown,
  Calendar,
  Lock,
  Building2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface HeaderProps {
  company: CompanyProfile;
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  availablePeriods: string[];
  onLockSession: () => void;
  totalEmployeesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  currentUser,
  users,
  onSwitchUser,
  selectedPeriod,
  onPeriodChange,
  availablePeriods,
  onLockSession,
  totalEmployeesCount = 249
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [year, month] = selectedPeriod.split('-');
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

  return (
    <div className="shrink-0 flex flex-col z-20 select-none shadow-xs">
      {/* 1. Barre supérieure principale blanche épurée */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Zone gauche : Marque & Branding ASI_Paie */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-700 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-700/20">
              <span className="font-black text-sm tracking-tighter">ASI</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  ASI_Paie
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  v26.03 Pro
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                Système Professionnel de Gestion des Ressources Humaines & de la Paie
              </p>
            </div>
          </div>
        </div>

        {/* Zone centrale : Sélecteur de période contemporain */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-semibold text-slate-700">Période :</span>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-white text-slate-900 text-xs font-bold font-mono px-3 py-1 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {availablePeriods.map(p => {
              const [y, m] = p.split('-');
              const lbl = `${monthNames[parseInt(m, 10) - 1].toUpperCase()} ${y}`;
              return <option key={p} value={p}>{lbl}</option>;
            })}
          </select>
        </div>

        {/* Zone droite : Profil utilisateur, notifications, verrouillage */}
        <div className="flex items-center gap-3">
          {/* Badge Notification */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Historique des opérations"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-600 rounded-full ring-2 ring-white"></span>
          </button>

          <span className="h-5 w-px bg-slate-200"></span>

          {/* Profil utilisateur & Sélecteur de rôle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-900 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  {currentUser.roleName}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Changer de profil actif
                  </span>
                </div>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      u.id === currentUser.id ? 'bg-sky-50/70 text-sky-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500">{u.roleName}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                        Actif
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onLockSession}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Verrouiller la session"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Bandeau d'état inférieur de prestige (Dark Executive Marine) */}
      <div className="bg-slate-900 text-white px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Licence officielle */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Licence :</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-slate-100" dir="rtl">
                المعهد الموريتاني لبحوث المحيطات والصيد (IMROP)
              </span>
            </div>
          </div>

          <span className="hidden sm:inline text-slate-700">|</span>

          {/* Devise & Norme */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-300 text-[11px]">
            <span>Norme :</span>
            <strong className="text-white font-mono">SYSCOHADA / RIM-PAIE</strong>
            <span className="text-slate-400">(MRU Ouguiya)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          {/* Effectif total */}
          <div className="flex items-center gap-1 text-slate-300">
            <span>Effectif géré :</span>
            <strong className="text-emerald-400 font-mono font-bold text-xs">
              {totalEmployeesCount}
            </strong>
            <span className="text-slate-500 font-mono">/ 500 max</span>
          </div>

          <span className="hidden sm:inline text-slate-700">|</span>

          {/* Statut serveur */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 text-[11px]">Système opérationnel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
