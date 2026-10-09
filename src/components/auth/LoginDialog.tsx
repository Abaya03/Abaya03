import React, { useState } from 'react';
import { User, CompanyProfile } from '../../types';
import { User as UserIcon, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  company: CompanyProfile;
  onLogin: (user: User) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  currentUser,
  company,
  onLogin
}) => {
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(currentUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300 relative flex flex-col">
        {/* Bouton fermer en haut à droite */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête de l'application (Image 2) */}
        <div className="p-8 pb-4">
          <div className="flex items-baseline justify-between">
            <h1 className="text-3xl font-black text-sky-800 tracking-wider">
              ASI_Paie
            </h1>
            <span className="font-mono text-xs font-bold text-slate-900">26.03.100</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Gestion simplifiée de paie et GA de RH
          </p>
        </div>

        {/* Formulaire de connexion (Image 2) */}
        <form onSubmit={handleSubmit} className="px-10 py-6 space-y-6">
          <div className="space-y-4">
            {/* Utilisateur */}
            <div className="flex items-center gap-3 border-b border-slate-300 pb-1.5 focus-within:border-sky-600 transition-colors">
              <UserIcon className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm text-slate-900 focus:outline-none bg-transparent font-medium"
                placeholder="Nom d'utilisateur"
              />
            </div>

            {/* Mot de passe avec œil */}
            <div className="flex items-center gap-3 border-b border-slate-300 pb-1.5 focus-within:border-sky-600 transition-colors">
              <Lock className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm text-slate-900 focus:outline-none bg-transparent font-medium"
                placeholder="Mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bouton Entrer */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-slate-700" />
              <span>Entrer</span>
            </button>
          </div>
        </form>

        {/* Barre de progression 0 % (Image 2) */}
        <div className="h-4 bg-slate-100 border-t border-slate-200 flex items-center justify-center text-[10px] font-mono text-sky-800">
          0 %
        </div>

        {/* Pied de page bleu foncé conforme à l'Image 2 */}
        <div className="bg-sky-950 text-white px-6 py-3 text-[11px] flex items-center justify-between">
          <div className="text-[10px] text-slate-300 leading-tight">
            <div>© 2026 MC-Consulting Tout droits réservés.</div>
            <div className="text-sky-300">www.mccmr.com</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white text-xs" dir="rtl">
              المعهد الموريتاني لبحوث المحيطات والصيد
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Contrat de licence</div>
          </div>
        </div>
      </div>
    </div>
  );
};
