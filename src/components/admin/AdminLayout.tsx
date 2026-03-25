import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLabels } from '../../context/LabelsContext';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { adminService } from '../../services/adminService';
import { RouteAccessMiddleware } from './RouteAccessMiddleware';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import {
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  MoreDotIcon,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
} from '../../icons';

const resolveSessionTimeoutSeconds = () => {
  const rawValue = import.meta.env.VITE_SESSION_TIMEOUT_SECONDS;
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 6 * 60;
};

const INACTIVITY_WINDOW_SECONDS = resolveSessionTimeoutSeconds();

type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

const parseExpFromToken = (token: string): number | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      return null;
    }
    const payloadJson = atob(payloadBase64.replaceAll('-', '+').replaceAll('_', '/'));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
};

const useSessionCountdown = () => {
  const [remainingSeconds, setRemainingSeconds] = useState(INACTIVITY_WINDOW_SECONDS);

  useEffect(() => {
    const tick = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setRemainingSeconds(0);
        return;
      }

      const exp = parseExpFromToken(token);
      if (!exp) {
        setRemainingSeconds(0);
        return;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      setRemainingSeconds(Math.max(0, exp - nowInSeconds));
    };

    tick();
    const intervalId = globalThis.setInterval(tick, 1000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  const sessionCountdown = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  const isSessionExpiringSoon = remainingSeconds > 0 && remainingSeconds <= 5 * 60;
  const isSessionCritical = remainingSeconds > 0 && remainingSeconds <= 60;

  return {
    sessionCountdown,
    isSessionExpiringSoon,
    isSessionCritical,
  };
};

const usePreferredLanguageSync = (
  idiomaPadrao: string | undefined,
  language: LanguageCode,
  setLanguage: (language: LanguageCode) => void,
) => {
  useEffect(() => {
    if (!idiomaPadrao || idiomaPadrao === language) {
      return;
    }

    setLanguage(idiomaPadrao as LanguageCode);
  }, [idiomaPadrao, language, setLanguage]);
};

type NavigationItem = {
  to: string;
  label: string;
  group: 'main' | 'admin';
  icon: ReactElement;
};

type AdminHeaderBarProps = {
  pathname: string;
  sessionName?: string;
  sessionCountdown: string;
  isSessionExpiringSoon: boolean;
  isSessionCritical: boolean;
  isMobileOpen: boolean;
  language: LanguageCode;
  onToggleSidebar: () => void;
  onChangeLanguage: (language: LanguageCode) => Promise<void>;
  onLogout: () => void;
  languageMenuOpen: boolean;
  setLanguageMenuOpen: Dispatch<SetStateAction<boolean>>;
  userMenuOpen: boolean;
  setUserMenuOpen: Dispatch<SetStateAction<boolean>>;
  t: (key: string) => string;
};

type AdminSidebarProps = {
  sidebarWidthClass: string;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  setIsHovered: (value: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  mainItems: NavigationItem[];
  adminItems: NavigationItem[];
  adminCollapsed: boolean;
  onToggleAdminCollapsed: () => void;
  renderNavItem: (item: NavigationItem) => ReactElement;
  t: (key: string) => string;
};

const AdminHeaderBar = ({
  pathname,
  sessionName,
  sessionCountdown,
  isSessionExpiringSoon,
  isSessionCritical,
  isMobileOpen,
  language,
  onToggleSidebar,
  onChangeLanguage,
  onLogout,
  languageMenuOpen,
  setLanguageMenuOpen,
  userMenuOpen,
  setUserMenuOpen,
  t,
}: AdminHeaderBarProps) => {
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [setUserMenuOpen]);

  return (
    <header className="sticky top-0 z-[60] flex w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="flex w-full flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isMobileOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-burnt/30 hover:bg-warm-50 hover:text-burnt-dark active:scale-95 lg:h-11 lg:w-11"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="hidden w-full max-w-md items-center md:flex">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                type="text"
                readOnly
                value={pathname}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 px-3 pb-3 md:gap-3 md:px-0 md:py-0">
          <div
            className={[
              'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[11px] font-semibold shadow-sm sm:hidden',
              isSessionExpiringSoon
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-gray-200 bg-white text-gray-700',
              isSessionCritical ? 'animate-pulse' : '',
            ].join(' ')}
          >
            <span className={['h-2 w-2 rounded-full', isSessionExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'].join(' ')} />
            {sessionCountdown}
          </div>
          <div
            className={[
              'hidden items-center gap-3 rounded-2xl border px-4 py-2 text-xs font-semibold shadow-sm sm:inline-flex',
              isSessionExpiringSoon
                ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-white text-amber-800'
                : 'border-gray-200 bg-gradient-to-r from-white to-gray-50 text-gray-700',
              isSessionCritical ? 'animate-pulse' : '',
            ].join(' ')}
          >
            <span className={['inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm', isSessionExpiringSoon ? 'border-amber-200 bg-amber-100 text-amber-700' : 'border-gray-200 bg-white text-burnt-dark'].join(' ')}>
              ⏱
            </span>
            <span className="leading-tight">
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                {isSessionExpiringSoon ? t('layout.session_expiring_prefix') : t('layout.session_prefix')}
              </span>
              <span className="block text-sm font-extrabold tracking-[0.08em] text-gray-900">{sessionCountdown}</span>
            </span>
          </div>

          <LanguageSwitcher
            value={language}
            onChange={onChangeLanguage}
            isOpen={languageMenuOpen}
            onOpenChange={(open) => {
              setLanguageMenuOpen(open);
              if (open) {
                setUserMenuOpen(false);
              }
            }}
            className="relative shrink-0"
          />

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setLanguageMenuOpen(false);
                setUserMenuOpen(!userMenuOpen);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:bg-warm-50 hover:text-gray-900"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-burnt/15 text-burnt-dark">
                {(sessionName ?? 'A').charAt(0)}
              </span>
              <span className="hidden sm:block font-semibold">{sessionName ?? t('layout.user_admin')}</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-1rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-md sm:w-56">
                <Link
                  to="/admin/users"
                  className="block rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {t('layout.user_manage')}
                </Link>
                <Link
                  to="/admin/configs"
                  className="block rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {t('layout.system_preferences')}
                </Link>
                <button
                  className="mt-1 w-full rounded-xl bg-burnt px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-burnt-dark"
                  type="button"
                  onClick={onLogout}
                >
                  {t('layout.logout_button')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminSidebar = ({
  sidebarWidthClass,
  isExpanded,
  isHovered,
  isMobileOpen,
  setIsHovered,
  search,
  onSearchChange,
  mainItems,
  adminItems,
  adminCollapsed,
  onToggleAdminCollapsed,
  renderNavItem,
  t,
}: AdminSidebarProps) => (
  <aside
    className={[
      'fixed left-0 top-0 z-[70] flex h-screen flex-col border-r border-gray-200 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out',
      sidebarWidthClass,
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ].join(' ')}
    onMouseEnter={() => {
      if (!isExpanded) {
        setIsHovered(true);
      }
    }}
    onMouseLeave={() => {
      setIsHovered(false);
    }}
  >
    <div className="flex h-full flex-col px-4 py-5">
      <div className={['flex items-center gap-3', !isExpanded && !isHovered && !isMobileOpen ? 'justify-center' : ''].join(' ')}>
        <Link to="/admin" className="flex items-center gap-3 text-gray-900">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-burnt text-sm font-bold text-white shadow-sm">SM</span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-semibold tracking-wide">SCHEMUSIC</span>
          )}
        </Link>
      </div>

      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="mt-5">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('common.search')}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 pl-10 text-sm text-gray-700 outline-none transition focus:border-burnt focus:bg-white focus:ring-2 focus:ring-burnt/15"
            />
          </div>
        </div>
      )}

      <nav className="mt-6 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-5">
          <div>
            {(isExpanded || isHovered || isMobileOpen) && (
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {t('layout.overview_title')}
              </h2>
            )}
            <div className="flex flex-col gap-2">
              {mainItems.map((item) => renderNavItem(item))}
            </div>
          </div>

          <div>
            {(isExpanded || isHovered || isMobileOpen) && (
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {t('layout.administration_title')}
              </h2>
            )}

            <button
              type="button"
              onClick={onToggleAdminCollapsed}
              className={[
                'mb-2 flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-warm-50 hover:text-gray-900',
                !isExpanded && !isHovered && !isMobileOpen ? 'justify-center px-2.5' : 'justify-between',
              ].join(' ')}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-burnt/10 text-burnt-dark">
                {!isExpanded && !isHovered && !isMobileOpen ? <MoreDotIcon className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="flex-1 text-left">{t('layout.admin_menu_button')}</span>
                  <ChevronDownIcon className={['h-4 w-4 transition-transform', adminCollapsed ? '' : 'rotate-180'].join(' ')} />
                </>
              )}
            </button>

            {!adminCollapsed && (
              <div className="flex flex-col gap-2">
                {adminItems.map((item) => renderNavItem(item))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  </aside>
);

const LayoutContent = () => {
  const { session, logout, updateSessionLanguage } = useAdminAuth();
  const { t, language, setLanguage } = useLabels();
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar, setIsHovered } = useSidebar();
  const location = useLocation();

  const [adminCollapsed, setAdminCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { sessionCountdown, isSessionExpiringSoon, isSessionCritical } = useSessionCountdown();

  usePreferredLanguageSync(session?.idiomaPadrao, language, setLanguage);

  const handleLanguageChange = async (selectedLanguage: LanguageCode) => {
    setLanguage(selectedLanguage);

    if (!session?.id) {
      return;
    }

    try {
      await adminService.atualizarIdiomaPadraoUsuario(session.id, selectedLanguage);
      updateSessionLanguage(selectedLanguage);
    } catch {
      // Keep local language selection for graceful fallback.
    }
  };

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, location.pathname]);

  const allItems = useMemo<NavigationItem[]>(() => ([
    { to: '/admin', label: t('layout.dashboard'), group: 'main', icon: <GridIcon className="h-5 w-5" /> },
    { to: '/admin/users', label: t('layout.usuarios'), group: 'admin', icon: <UserCircleIcon className="h-5 w-5" /> },
    { to: '/admin/roles', label: t('layout.roles'), group: 'admin', icon: <PageIcon className="h-5 w-5" /> },
    { to: '/admin/configs', label: t('layout.configuracoes'), group: 'admin', icon: <TableIcon className="h-5 w-5" /> },
    { to: '/admin/access-lists', label: t('layout.access_lists'), group: 'admin', icon: <ListIcon className="h-5 w-5" /> },
    { to: '/admin/logs', label: t('layout.access_logs'), group: 'admin', icon: <PieChartIcon className="h-5 w-5" /> },
  ]), [t]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? allItems.filter((item) => item.label.toLowerCase().includes(query)) : allItems;
  }, [allItems, search]);

  const mainItems = filteredItems.filter((item) => item.group === 'main');
  const adminItems = filteredItems.filter((item) => item.group === 'admin');

  const desktopLeftSpacing = isExpanded || isHovered ? 'lg:ml-[280px]' : 'lg:ml-[92px]';
  let sidebarWidthClass = 'w-[92px]';
  if (isExpanded || isHovered) {
    sidebarWidthClass = 'w-[280px]';
  }
  if (isMobileOpen) {
    sidebarWidthClass = 'w-[280px] max-w-[86vw]';
  }

  const handleSidebarToggle = () => {
    const hasMatchMedia = typeof globalThis.matchMedia === 'function';
    const windowWidth = typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : 0;
    const isDesktopFallback = windowWidth >= 1024;
    const isDesktop = hasMatchMedia ? globalThis.matchMedia('(min-width: 1024px)').matches : isDesktopFallback;
    (isDesktop ? toggleSidebar : toggleMobileSidebar)();
  };

  const renderNavItem = (item: NavigationItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/admin'}
      className={({ isActive }) => [
        'group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
        isActive
          ? 'bg-burnt/10 text-burnt-dark'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
        !isExpanded && !isHovered && !isMobileOpen ? 'justify-center px-2.5' : '',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
              isActive
                ? 'bg-burnt/15 text-burnt-dark'
                : 'bg-gray-50 text-gray-600 group-hover:bg-burnt/10 group-hover:text-burnt-dark',
            ].join(' ')}
          >
            {item.icon}
          </span>
          {(isExpanded || isHovered || isMobileOpen) && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-slate-100" data-session-timeout-seconds={INACTIVITY_WINDOW_SECONDS}>
      <RouteAccessMiddleware />

      {isMobileOpen && (
        <button
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Fechar menu"
          className="fixed inset-0 z-[50] bg-black/40 lg:hidden"
        />
      )}

      <AdminSidebar
        sidebarWidthClass={sidebarWidthClass}
        isExpanded={isExpanded}
        isHovered={isHovered}
        isMobileOpen={isMobileOpen}
        setIsHovered={setIsHovered}
        search={search}
        onSearchChange={setSearch}
        mainItems={mainItems}
        adminItems={adminItems}
        adminCollapsed={adminCollapsed}
        onToggleAdminCollapsed={() => setAdminCollapsed((current) => !current)}
        renderNavItem={renderNavItem}
        t={t}
      />

      <div className={['transition-all duration-300', desktopLeftSpacing].join(' ')}>
        <AdminHeaderBar
          pathname={location.pathname}
          sessionName={session?.nome}
          sessionCountdown={sessionCountdown}
          isSessionExpiringSoon={isSessionExpiringSoon}
          isSessionCritical={isSessionCritical}
          language={language}
          isMobileOpen={isMobileOpen}
          onToggleSidebar={handleSidebarToggle}
          onChangeLanguage={handleLanguageChange}
          onLogout={logout}
          languageMenuOpen={languageMenuOpen}
          setLanguageMenuOpen={setLanguageMenuOpen}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          t={t}
        />

        <main className="mx-auto max-w-screen-2xl p-4 md:p-6">
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};
