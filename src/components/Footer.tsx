import React from 'react';
import { AppPage } from '../types/disposal';

interface FooterProps {
  onNavigate: (page: AppPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full px-6 md:px-12 lg:px-16 py-10 border-t border-white/20 bg-black relative z-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-2xl font-semibold tracking-tight text-white hover:text-gray-300 transition-colors cursor-pointer"
          >
            SmartDisposal
          </button>
          <p className="text-sm text-gray-300">Built as an Innovative Biology Project</p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => onNavigate('checker')}
            className="text-white hover:text-gray-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Check
          </button>
          <button
            type="button"
            onClick={() => onNavigate('database')}
            className="text-white hover:text-gray-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Database
          </button>
          <button
            type="button"
            onClick={() => onNavigate('alternatives')}
            className="text-white hover:text-gray-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Alternatives
          </button>
          <button
            type="button"
            onClick={() => onNavigate('how-it-works')}
            className="text-white hover:text-gray-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className="text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Admin
          </button>
        </nav>
      </div>
    </footer>
  );
};
