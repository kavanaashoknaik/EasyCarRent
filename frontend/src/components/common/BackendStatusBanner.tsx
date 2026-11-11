import React, { useState } from 'react';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { Server, Wifi, WifiOff, HelpCircle, X } from 'lucide-react';

export const BackendStatusBanner: React.FC = () => {
  const { isBackendConnected, setShowGuide, mode, backendUrl } = useBackendStatus();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-4 text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          {isBackendConnected ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              Connected to Spring Boot ({backendUrl})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <WifiOff className="w-3.5 h-3.5" />
              Spring Boot Offline • Interactive Demo Active
            </span>
          )}
          <span className="hidden md:inline text-slate-400">
            • EasyCarRent React Frontend ready for Java backend
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowGuide(true)}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-blue-400" />
            Backend Setup Guide
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-0.5"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
