import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import { 
  FiFileText, 
  FiHome, 
  FiShield, 
  FiUser, 
  FiLogOut, 
  FiLogIn, 
  FiUserPlus, 
  FiMenu, 
  FiX 
} from 'react-icons/fi';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                  PostFlow
                  <span className="text-[10px] tracking-wider uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    RBAC
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  JSONPlaceholder CRUD API
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <FiHome className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/posts" className={navLinkClass}>
                  <FiFileText className="w-4 h-4" />
                  Posts
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin/users" className={navLinkClass}>
                    <FiShield className="w-4 h-4 text-purple-400" />
                    Admin
                  </NavLink>
                )}
                <NavLink to="/profile" className={navLinkClass}>
                  <FiUser className="w-4 h-4" />
                  Profile
                </NavLink>
              </>
            ) : (
              <NavLink to="/posts" className={navLinkClass}>
                <FiFileText className="w-4 h-4" />
                Browse Posts
              </NavLink>
            )}
          </nav>

          {/* User Profile & Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-700/60">
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </span>
                    <Badge variant={user.role === 'ADMIN' ? 'admin' : 'neutral'} size="sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <FiLogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <Badge variant={user?.role === 'ADMIN' ? 'admin' : 'neutral'}>
                  {user?.role}
                </Badge>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm"
              >
                <FiHome className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                to="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm"
              >
                <FiFileText className="w-4 h-4" /> Posts
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-purple-300 hover:bg-slate-800 text-sm"
                >
                  <FiShield className="w-4 h-4" /> Admin Users
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm"
              >
                <FiUser className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm"
              >
                <FiLogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm"
              >
                <FiFileText className="w-4 h-4" /> Browse Posts
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                <FiLogIn className="w-4 h-4" /> Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
              >
                <FiUserPlus className="w-4 h-4" /> Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
