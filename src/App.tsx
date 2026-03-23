import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AccessListsPage } from './pages/admin/AccessListsPage';
import { AccessLogsPage } from './pages/admin/AccessLogsPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { LoginPage } from './pages/admin/LoginPage';
import { RolesPage } from './pages/admin/RolesPage';
import { SystemConfigsPage } from './pages/admin/SystemConfigsPage';
import { UsersPage } from './pages/admin/UsersPage';

function App() {
  return (
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
  );
}

export default App;
