import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { adminService } from '../services/adminService';
import type { CurrentScreenAccess } from '../types/admin';

export type ScreenAction = 'CONSULTAR' | 'INCLUIR' | 'EDITAR' | 'EXCLUIR';

interface AccessControlContextType {
  access: CurrentScreenAccess | null;
  loading: boolean;
  error: string;
  canConsult: boolean;
  can: (action: ScreenAction) => boolean;
  canAccessRoute: (route: string) => boolean;
  refreshAccess: () => Promise<void>;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

const ADMIN_SCREEN_ROUTES = [
  { route: '/admin', telaCodigo: 'ADMIN_DASHBOARD' },
  { route: '/admin/users', telaCodigo: 'ADMIN_USERS' },
  { route: '/admin/roles', telaCodigo: 'ADMIN_ROLES' },
  { route: '/admin/configs', telaCodigo: 'ADMIN_CONFIGS' },
  { route: '/admin/access-lists', telaCodigo: 'ADMIN_ACCESS_LISTS' },
  { route: '/admin/logs', telaCodigo: 'ADMIN_ACCESS_LOGS' },
  { route: '/admin/access-control', telaCodigo: 'ADMIN_ACCESS_CONTROL' },
];

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  const [access, setAccess] = useState<CurrentScreenAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeAccessMap, setRouteAccessMap] = useState<Record<string, boolean>>({});

  const fetchAccess = useCallback(async () => {
    if (!isAuthenticated) {
      setAccess(null);
      setError('');
      return;
    }

    if (!location.pathname.startsWith('/admin')) {
      setAccess(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = await adminService.obterAcessoTelaAtual({
        rota: location.pathname,
      });

      const settledMenuAccess = await Promise.allSettled(
        ADMIN_SCREEN_ROUTES.map(async (item) => {
          const menuPayload = await adminService.obterAcessoTelaAtual({ telaCodigo: item.telaCodigo });
          return {
            route: item.route,
            podeConsultar: Boolean(menuPayload.podeConsultar),
          };
        }),
      );

      setAccess(payload);
      setRouteAccessMap(
        settledMenuAccess.reduce<Record<string, boolean>>((acc, current, index) => {
          const fallbackRoute = ADMIN_SCREEN_ROUTES[index]?.route;
          if (!fallbackRoute) {
            return acc;
          }

          if (current.status === 'fulfilled') {
            acc[current.value.route] = current.value.podeConsultar;
          } else {
            acc[fallbackRoute] = false;
          }
          return acc;
        }, {}),
      );
    } catch {
      setAccess(null);
      setRouteAccessMap({});
      setError('access_unavailable');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    void fetchAccess();
  }, [fetchAccess]);

  const can = useCallback(
    (action: ScreenAction) => {
      if (!access) {
        return false;
      }
      return Boolean(access.acoes?.[action]);
    },
    [access],
  );

  const canAccessRoute = useCallback(
    (route: string) => {
      if (!isAuthenticated) {
        return false;
      }

      return Boolean(routeAccessMap[route]);
    },
    [isAuthenticated, routeAccessMap],
  );

  const value = useMemo<AccessControlContextType>(
    () => ({
      access,
      loading,
      error,
      canConsult: Boolean(access?.podeConsultar),
      can,
      canAccessRoute,
      refreshAccess: fetchAccess,
    }),
    [access, can, canAccessRoute, error, fetchAccess, loading],
  );

  return <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>;
};

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within AccessControlProvider');
  }
  return context;
};
