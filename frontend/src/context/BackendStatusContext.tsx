import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAppMode, setAppMode, MODE_STORAGE_KEY } from '../services/api';

interface BackendStatusContextType {
  isBackendConnected: boolean;
  isChecking: boolean;
  mode: 'live' | 'mock' | 'auto';
  changeMode: (newMode: 'live' | 'mock' | 'auto') => void;
  checkConnection: () => Promise<boolean>;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  backendUrl: string;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [mode, setModeState] = useState<'live' | 'mock' | 'auto'>(getAppMode());
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/public/ping`, { timeout: 3000 });
      if (res.status === 200) {
        setIsBackendConnected(true);
        setIsChecking(false);
        return true;
      }
    } catch {
      // Backend not running on localhost:8080 or CORS error
    }
    setIsBackendConnected(false);
    setIsChecking(false);
    return false;
  }, []);

  useEffect(() => {
    checkConnection();
    // Re-check periodically
    const timer = setInterval(() => {
      checkConnection();
    }, 20000);
    return () => clearInterval(timer);
  }, [checkConnection]);

  const changeMode = (newMode: 'live' | 'mock' | 'auto') => {
    setModeState(newMode);
    setAppMode(newMode);
  };

  useEffect(() => {
    const handler = () => {
      setModeState(getAppMode());
    };
    window.addEventListener('easycarrent_mode_changed', handler);
    return () => window.removeEventListener('easycarrent_mode_changed', handler);
  }, []);

  return (
    <BackendStatusContext.Provider
      value={{
        isBackendConnected,
        isChecking,
        mode,
        changeMode,
        checkConnection,
        showGuide,
        setShowGuide,
        backendUrl: API_BASE_URL,
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = (): BackendStatusContextType => {
  const ctx = useContext(BackendStatusContext);
  if (!ctx) throw new Error('useBackendStatus must be used within BackendStatusProvider');
  return ctx;
};
