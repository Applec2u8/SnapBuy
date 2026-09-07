import React from 'react';
import { Shield, Store, User, Check } from 'lucide-react';
import type { UserProfile } from './types';

interface UserRoleCardProps {
  user: UserProfile;
  isSavingRole: boolean;
  onUpdateRole: (role: string) => void;
}

const ROLE_OPTIONS = [
  {
    id: 'customer',
    label: 'Customer',
    desc: 'Standard buyer permissions. Can browse products, chat, and place orders.',
    icon: User,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'vendor',
    label: 'Vendor',
    desc: 'Seller permissions. Can manage shops, products, and process vendor orders.',
    icon: Store,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Full administrative access. Can manage users, shops, system statistics, and configurations.',
    icon: Shield,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
];

export const UserRoleCard: React.FC<UserRoleCardProps> = ({ user, isSavingRole, onUpdateRole }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-[4rem]" />

      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 sm:mb-6 flex items-center gap-3 relative">
        <Shield size={20} className="text-primary-500" />
        Role Configuration
      </h4>

      <div className="space-y-3 relative">
        {ROLE_OPTIONS.map((roleOption) => {
          const Icon = roleOption.icon;
          const isSelected = user.role === roleOption.id;

          return (
            <button
              key={roleOption.id}
              disabled={isSavingRole}
              onClick={() => onUpdateRole(roleOption.id)}
              className={`w-full p-4 rounded-2xl border text-left flex gap-4 transition-all relative group hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                isSelected
                  ? 'border-primary-500 bg-primary-500/[0.03] shadow-md shadow-primary-500/5'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-3 rounded-xl flex-shrink-0 self-start ${roleOption.color}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-black uppercase tracking-widest ${
                    isSelected ? 'text-primary-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {roleOption.label}
                  </p>
                  {isSelected && (
                    <span className="p-1 bg-primary-500 text-white rounded-full">
                      <Check size={8} strokeWidth={4} />
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide leading-relaxed">
                  {roleOption.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
