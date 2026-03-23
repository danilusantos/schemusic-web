import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { adminService } from '../services/adminService';
import type { AdminAuthResponse } from '../types/admin';

interface AdminAuthContextType {
  session: AdminAuthResponse | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'schemusic_admin_session';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const getStoredSession = (): AdminAuthResponse | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminAuthResponse;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AdminAuthResponse | null>(getStoredSession());

  const login = useCallback(async (email: string, senha: string) => {
    const response = await adminService.login(email, senha);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    localStorage.setItem('token', response.token);
    setSession(response);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('token');
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [login, logout, session],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider');
  }
  return context;
};
