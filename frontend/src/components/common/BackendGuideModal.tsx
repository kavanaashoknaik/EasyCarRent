import React from 'react';
import { Modal } from './Modal';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { Server, Database, Key, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export const BackendGuideModal: React.FC = () => {
  const {
    showGuide,
    setShowGuide,
    isBackendConnected,
    isChecking,
    checkConnection,
    mode,
    changeMode,
    backendUrl,
  } = useBackendStatus();

  return (
    <Modal
      isOpen={showGuide}
      onClose={() => setShowGuide(false)}
      title="Backend Integration & Setup Guide"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-slate-700">
        {/* Status card */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            isBackendConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div>
              <div className="font-bold text-sm">
                Status:{' '}
                {isBackendConnected
                  ? `Connected to Spring Boot at ${backendUrl}`
                  : `Spring Boot offline (Interactive Fallback Active)`}
              </div>
              <div className="text-xs opacity-80">
                Target endpoint: <code className="font-mono">{backendUrl}</code>
              </div>
            </div>
          </div>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Ping Server'}
          </button>
        </div>

        {/* Mode Selector */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Environment Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => changeMode('auto')}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                mode === 'auto'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Auto-Detect (Recommended)
            </button>
            <button
              onClick={() => changeMode('live')}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                mode === 'live'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Force Live Backend
            </button>
            <button
              onClick={() => changeMode('mock')}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                mode === 'mock'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Force Offline Demo
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Auto-Detect calls your live Spring Boot backend first. If it cannot reach port 8080 (such as in this cloud browser preview), it seamlessly runs with local mock data so every page, button, and dashboard works without crashing.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            How to run with your Spring Boot Backend
          </h4>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex gap-3 items-start bg-white p-3 rounded-xl border border-slate-200">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-900">Start MySQL Database</p>
                <p className="text-slate-600 mt-0.5">
                  Create database <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-600">car_rental_db</code> on port 3306.
                </p>
                <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-2 rounded mt-1.5">
                  CREATE DATABASE car_rental_db;
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-white p-3 rounded-xl border border-slate-200">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-900">Run Spring Boot Application</p>
                <p className="text-slate-600 mt-0.5">
                  From your backend project root, start the server:
                </p>
                <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-2 rounded mt-1.5">
                  ./mvnw spring-boot:run
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Server will listen on <code className="font-mono">http://localhost:8080</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-white p-3 rounded-xl border border-slate-200">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-900">Default Credentials Configured in Backend</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      Admin Account
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 mt-1">
                      Email: admin@carrental.com<br />
                      Password: Admin@123
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      Sample Customer
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 mt-1">
                      Email: customer@carrental.com<br />
                      Password: Password@123
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setShowGuide(false)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </Modal>
  );
};
