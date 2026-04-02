import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { LoginPage } from './pages/admin/LoginPage';

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import('./pages/admin/UsersPage').then(m => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('./pages/admin/RolesPage').then(m => ({ default: m.RolesPage })));
const SystemConfigsPage = lazy(() => import('./pages/admin/SystemConfigsPage').then(m => ({ default: m.SystemConfigsPage })));
const AccessListsPage = lazy(() => import('./pages/admin/AccessListsPage').then(m => ({ default: m.AccessListsPage })));
const AccessLogsPage = lazy(() => import('./pages/admin/AccessLogsPage').then(m => ({ default: m.AccessLogsPage })));

const routeFallback = (
  <div className="mx-auto flex min-h-[40vh] max-w-screen-2xl items-center justify-center p-6">
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
      Carregando módulo...
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="configs" element={<SystemConfigsPage />} />
            <Route path="access-lists" element={<AccessListsPage />} />
            <Route path="logs" element={<AccessLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
