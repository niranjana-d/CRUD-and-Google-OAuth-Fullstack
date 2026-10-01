import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiCalendar, 
  FiKey, 
  FiCheckCircle, 
  FiInfo 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export const ProfilePage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">User Profile</h1>
        <p className="text-sm text-slate-400">
          Account identity and authorization credentials stored in PostgreSQL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 md:col-span-1 flex flex-col items-center text-center space-y-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full border-2 border-indigo-500/40 object-cover shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-600/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400 break-all">{user.email}</p>
          </div>

          <Badge variant={user.role === 'ADMIN' ? 'admin' : 'primary'} size="md">
            {user.role} Role
          </Badge>
        </div>

        {/* Identity Details */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Account & Security Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                User ID
              </span>
              <p className="text-xs font-mono text-slate-300 break-all">{user.id}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-purple-400" />
                Auth Provider
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                {user.provider === 'GOOGLE' ? (
                  <>
                    <FcGoogle className="w-4 h-4" />
                    <span className="text-xs font-semibold text-slate-200">Google OAuth 2.0</span>
                  </>
                ) : (
                  <>
                    <FiKey className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-200">Local (Bcrypt Hash)</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Permissions Assigned
              </span>
              <div className="pt-1 text-xs text-slate-300 space-y-1">
                {isAdmin ? (
                  <ul className="list-disc list-inside space-y-1 text-purple-300">
                    <li>Create, edit, and delete all posts (any owner)</li>
                    <li>Access Admin panel and inspect all registered users</li>
                    <li>Update roles between USER and ADMIN</li>
                    <li>Delete user records</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Create new posts on JSONPlaceholder</li>
                    <li>Edit and delete posts owned by this account</li>
                    <li>View all posts in the public and private catalog</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
