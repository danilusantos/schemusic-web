import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { RouteAccessMiddleware } from './RouteAccessMiddleware';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', group: 'main' },
];

const adminItems = [
  { to: '/admin/users', label: 'Usuarios' },
  { to: '/admin/roles', label: 'Roles' },
  { to: '/admin/configs', label: 'Configuracoes do Sistema' },
  { to: '/admin/access-lists', label: 'Listas de Acesso' },
  { to: '/admin/logs', label: 'Logs de Acesso' },
];

export const AdminLayout = () => {
  const { session, logout } = useAdminAuth();
  const [adminCollapsed, setAdminCollapsed] = useState(false);

  const linkClass = (isActive: boolean) =>
    [
      'block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-burnt text-white shadow-sm'
        : 'text-warm-800 hover:bg-warm-100',
    ].join(' ');

  return (
    <div className="ds-shell">
      <RouteAccessMiddleware />

      {/* Topbar */}
      <header className="ds-topbar">
        <div className="ds-topbar-inner">
          <Link to="/admin" className="ds-brand">
            SCHEMUSIC ADMIN
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden rounded-full border border-teal-light/40 bg-teal-light/10 px-3 py-1 text-xs font-semibold text-teal-dark sm:block">
              {session?.nome ?? 'Administrador'}
            </div>
            <button 
              className="rounded-md bg-burnt px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-burnt-dark"
              type="button" 
              onClick={logout}
            >
              Sair
            </button>
          </div>
        </div>

        <div className="lg:hidden border-t border-warm-200 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {[...navItems, ...adminItems].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-burnt text-white'
                      : 'bg-warm-100 text-warm-800',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main body */}
      <div className="mx-auto flex max-w-screen-2xl gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <nav className="sticky top-24 rounded-xl border border-warm-300 bg-white/90 p-3 shadow-sm backdrop-blur">
            {/* Main items */}
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-warm-500">Visao Geral</p>
            <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) => linkClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
            </div>

            {/* Admin Section */}
            <div className="mt-3 border-t border-warm-300 pt-3">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-warm-500">Administracao</p>
              <button
                className="flex w-full items-center justify-between rounded-lg border border-warm-300 bg-warm-50 px-3 py-2 text-sm font-semibold text-warm-800 transition-colors hover:bg-warm-100"
                type="button"
                onClick={() => setAdminCollapsed(!adminCollapsed)}
              >
                <span>Menu Administrativo</span>
                <span className={`text-xs font-bold transition-transform ${adminCollapsed ? '' : 'rotate-180'}`}>
                  ▼
                </span>
              </button>

              {!adminCollapsed && (
                <div className="mt-2 space-y-1 animate-slideDown">
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => linkClass(isActive)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-warm-300 bg-white/95 p-4 shadow-sm md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
