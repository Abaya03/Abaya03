import React, { useState } from 'react';
import { User, Role, AuditLog } from '../../types';
import {
  ShieldCheck,
  Users,
  History,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  UserCheck
} from 'lucide-react';

interface UserManagementViewProps {
  users: User[];
  roles: Role[];
  auditLogs: AuditLog[];
  currentUser: User;
  onToggleUserStatus: (userId: string) => void;
  onSwitchUser: (user: User) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  roles,
  auditLogs,
  currentUser,
  onToggleUserStatus,
  onSwitchUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');
  const [auditSearch, setAuditSearch] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    return (
      auditSearch === '' ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Kicker et en-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sécurité, Habilitations & Traçabilité (Audit Trail)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Gestion des Utilisateurs & Journal d'Audit
          </h1>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Comptes Utilisateurs ({users.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Rôles & Matrice des Habilitations</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Journal d'Audit ({auditLogs.length} événements)</span>
        </button>
      </div>

      {/* Onglet 1: Utilisateurs */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Identifiant & Email</th>
                  <th className="px-4 py-3">Rôle Assigné</th>
                  <th className="px-4 py-3">Dernière Connexion</th>
                  <th className="px-4 py-3 text-center">État du Compte</th>
                  <th className="px-4 py-3 text-right">Action Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-400">ID: {u.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-700">{u.username}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {u.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                      {u.lastLogin || 'Jamais'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleUserStatus(u.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                        title="Cliquer pour activer/désactiver le compte"
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Désactivé</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser.id ? (
                        <button
                          type="button"
                          onClick={() => onSwitchUser(u)}
                          className="px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Tester avec ce compte
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500">Session courante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet 2: Rôles & Permissions */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{role.name}</h3>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">{role.code}</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {role.description}
              </p>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Permissions accordées :
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map(perm => (
                    <span key={perm} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onglet 3: Journal d'Audit */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filtrer les événements d'audit..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div className="text-xs text-slate-500">
              Traçabilité inaltérable selon normes d'audit interne
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Horodatage</th>
                  <th className="px-4 py-3">Opérateur</th>
                  <th className="px-4 py-3">Nature de l'Action</th>
                  <th className="px-4 py-3">Cible</th>
                  <th className="px-4 py-3">Détail de l'Opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {log.targetEntity} ({log.targetId})
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
