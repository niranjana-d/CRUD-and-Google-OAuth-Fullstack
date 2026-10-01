import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User, Role } from '../types';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  FiShield, 
  FiUser, 
  FiTrash2, 
  FiAlertCircle, 
  FiRefreshCw, 
  FiCheck 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal and action states
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUser: User, newRole: Role) => {
    if (targetUser.id === currentUser?.id) {
      setFeedback({ type: 'error', message: 'You cannot change your own role.' });
      return;
    }

    setUpdatingRoleId(targetUser.id);
    setFeedback(null);
    try {
      const updated = await userService.updateUserRole(targetUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      setFeedback({
        type: 'success',
        message: `Updated ${targetUser.name}'s role to ${newRole}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update user role.',
      });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id) {
      setFeedback({ type: 'error', message: 'You cannot delete your own account from here.' });
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setFeedback({
        type: 'success',
        message: `User ${userToDelete.name} has been deleted.`,
      });
      setUserToDelete(null);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete user.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Management
            </h1>
            <Badge variant="admin">Admin Only</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage application users, assign roles (RBAC), and review identity providers
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition border border-slate-700 self-start sm:self-auto"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Users
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold uppercase hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" text="Loading users from database..." />
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-4">
          <FiAlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Error Loading Users</h2>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">User</th>
                  <th scope="col" className="px-6 py-4">Provider</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Created At</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isUpdating = updatingRoleId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-xs text-indigo-400">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          {u.provider === 'GOOGLE' ? (
                            <>
                              <FcGoogle className="w-4 h-4" />
                              <span>Google</span>
                            </>
                          ) : (
                            <span>Local Email</span>
                          )}
                        </div>
                      </td>

                      {/* Role selection */}
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          disabled={isSelf || isUpdating}
                          onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                          className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setUserToDelete(u)}
                          disabled={isSelf}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none"
                          title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})? This action will permanently remove their application data.`}
        confirmLabel="Delete User"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
