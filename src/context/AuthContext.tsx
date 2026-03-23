import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  user: Record<string, unknown> | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string, tipo: 'artista' | 'empresa') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Record<string, unknown> | null>(
    authService.getUser() as Record<string, unknown> | null,
  );

  const login = async (email: string, senha: string, tipo: 'artista' | 'empresa') => {
    try {
      const data = tipo === 'artista'
        ? await authService.loginArtista(email, senha)
        : await authService.loginEmpresa(email, senha);
      setUser(data as Record<string, unknown>);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};