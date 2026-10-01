import React from 'react';
import { Link } from 'react-router-dom';
import { FiCompass, FiHome, FiArrowLeft } from 'react-icons/fi';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center max-w-md w-full space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
          <FiCompass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            HTTP 404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The page you are searching for does not exist or has been moved to another URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 text-sm"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/posts"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition border border-slate-700 text-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            Browse Posts
          </Link>
        </div>
      </div>
    </div>
  );
};
