import React from 'react';
import { FiExternalLink, FiGithub, FiCheckCircle } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">PostFlow</span>
          <span>•</span>
          <span>Full-Stack CRUD with JSONPlaceholder & Google OAuth</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://jsonplaceholder.typicode.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-indigo-400 transition"
          >
            <FiExternalLink className="w-3.5 h-3.5" />
            JSONPlaceholder Guide
          </a>
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-indigo-400 transition"
          >
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Swagger API Docs
          </a>
        </div>
      </div>
    </footer>
  );
};
