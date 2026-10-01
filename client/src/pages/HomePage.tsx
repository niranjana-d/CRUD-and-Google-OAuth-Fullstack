import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiFileText, 
  FiShield, 
  FiLock, 
  FiDatabase, 
  FiArrowRight, 
  FiCheckCircle, 
  FiCode 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs font-semibold animate-pulse">
          <FiShield className="w-3.5 h-3.5" />
          Enterprise-Ready RBAC & Google OAuth 2.0
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Modern Post Management <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            With Controlled REST Integration
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          A production-quality full-stack application connecting JSONPlaceholder's REST API with PostgreSQL
          for robust local user authentication, Google Sign-In, and strict Role-Based Access Control.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition"
            >
              Go to Dashboard
              <FiArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition"
              >
                Get Started
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:scale-[1.02] transition"
              >
                Sign In
              </Link>
            </>
          )}

          <Link
            to="/posts"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-indigo-300 glass-panel border border-indigo-500/30 hover:bg-indigo-950/40 hover:scale-[1.02] transition"
          >
            <FiFileText className="w-4 h-4" />
            Explore Posts
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 lg:mt-24">
        {/* Card 1 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FiLock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Dual Authentication</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Secure email/password login using salted bcrypt hashing alongside one-click Google OAuth 2.0 / OpenID Connect authentication.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
            <li className="flex items-center gap-1.5 text-emerald-400">
              <FiCheckCircle className="w-3.5 h-3.5" /> HTTP-only cookie + Bearer JWT
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <FiCheckCircle className="w-3.5 h-3.5" /> Rate limiting on auth routes
            </li>
          </ul>
        </div>

        {/* Card 2 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FiShield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Role-Based Access Control</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Clear separation between <span className="font-semibold text-purple-400">ADMIN</span> and{' '}
            <span className="font-semibold text-indigo-400">USER</span> roles with server-side authorization middleware protecting every endpoint.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
            <li className="flex items-center gap-1.5 text-emerald-400">
              <FiCheckCircle className="w-3.5 h-3.5" /> Granular post ownership tracking
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <FiCheckCircle className="w-3.5 h-3.5" /> Admin-only user management panel
            </li>
          </ul>
        </div>

        {/* Card 3 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <FiDatabase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Clean API Abstraction</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            The frontend never calls JSONPlaceholder directly. The Express backend handles all requests, maps ownership, and validates incoming data.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
            <li className="flex items-center gap-1.5 text-emerald-400">
              <FiCheckCircle className="w-3.5 h-3.5" /> Full CRUD with simulated persistence awareness
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <FiCheckCircle className="w-3.5 h-3.5" /> Interactive Swagger / OpenAPI documentation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
