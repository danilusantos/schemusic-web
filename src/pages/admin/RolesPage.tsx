import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminRole } from '../../types/admin';
import { ListIcon, PlusIcon, TrashIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const RolesPage = () => {
  const { t, tf } = useLabels();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'ATIVAS' | 'INATIVAS'>('TODAS');

  const [error, setError] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const carregar = async () => {
    setError('');
    try {
      const data = await adminService.listarRoles();
      setRoles(data);
    } catch {
      setError(t('roles.error_fetch'));
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarRole = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');
    setIsCreateLoading(true);

    try {
      await adminService.criarRole({ nome, descricao, ativo });
      setNome('');
      setDescricao('');
      setAtivo(true);
      setIsCreateModalOpen(false);
      await carregar();
    } catch {
      setCreateError(t('roles.error_create'));
    } finally {
      setIsCreateLoading(false);
    }
  };

  const excluirRole = async (idRole: number) => {
    try {
      await adminService.excluirRole(idRole);
      await carregar();
    } catch {
      setError(t('roles.error_delete'));
    }
  };

  const filteredRoles = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return roles.filter((role) => {
      let byStatus = true;
      if (statusFilter === 'ATIVAS') {
        byStatus = role.ativo;
      } else if (statusFilter === 'INATIVAS') {
        byStatus = !role.ativo;
      }

      const bySearch = termo
        ? role.nome.toLowerCase().includes(termo) || (role.descricao ?? '').toLowerCase().includes(termo)
        : true;

      return byStatus && bySearch;
    });
  }, [roles, search, statusFilter]);

  return (
    <section className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('roles.page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('roles.page_subtitle')}</p>
      </div>

      {/* Roles Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Header with filters and actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('roles.list_title')}</h2>
              <p className="mt-1 text-sm text-gray-600">{tf('roles.total_roles', { count: filteredRoles.length })}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              {t('roles.create_form_title')}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="roles-search-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('roles.nome_filter_label')}
              </label>
              <input
                id="roles-search-filter"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('roles.nome_filter_placeholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex-1">
              <label htmlFor="roles-status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('roles.status_filter_label')}
              </label>
              <select
                id="roles-status-filter"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODAS' | 'ATIVAS' | 'INATIVAS')}
              >
                <option value="TODAS">{t('roles.status_todas')}</option>
                <option value="ATIVAS">{t('roles.status_ativas')}</option>
                <option value="INATIVAS">{t('roles.status_inativas')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredRoles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">{t('roles.no_roles')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('roles.nome_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('roles.descricao_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.status_filter_label')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">{t('common.actions_label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoles.map((role) => (
                  <tr key={role.idRole} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{role.idRole}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{role.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{role.descricao || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-block rounded-full px-3 py-1 text-xs font-semibold',
                        role.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ].join(' ')}>
                        {role.ativo ? t('roles.status_ativas') : t('roles.status_inativas')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => excluirRole(role.idRole)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                        {t('roles.button_delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isCreateModalOpen}
        title={t('roles.create_form_title')}
        subtitle={t('roles.create_form_subtitle')}
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isCreateLoading}
        error={createError}
      >
        <form onSubmit={criarRole} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="role-nome" className="ds-label">{t('roles.nome_label')}</label>
              <input
                id="role-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('roles.nome_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="role-descricao" className="ds-label">{t('roles.descricao_label')}</label>
              <input
                id="role-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('roles.descricao_placeholder')}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-md">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                disabled={isCreateLoading}
                className="h-4 w-4 accent-burnt disabled:cursor-not-allowed"
              />
              <span className="text-sm font-semibold text-warm-800">{t('roles.ativo_label')}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isCreateLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
              {isCreateLoading ? t('common.loading') : t('roles.create_button')}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
