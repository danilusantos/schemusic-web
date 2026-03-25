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

  let rolesContent;
  if (filteredRoles.length === 0) {
    rolesContent = (
      <div className="py-xl text-center"><p className="text-warm-700">{t('roles.no_roles')}</p></div>
    );
  } else {
    rolesContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('roles.nome_label')}</th>
              <th>{t('roles.descricao_label')}</th>
              <th>{t('users.status_filter_label')}</th>
              <th className="text-center">{t('common.actions_label')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role.idRole}>
                <td className="font-mono text-xs">{role.idRole}</td>
                <td className="font-semibold text-warm-900">{role.nome}</td>
                <td className="text-xs text-warm-700">{role.descricao || '-'}</td>
                <td>
                  <span className={[
                    'inline-block rounded-full px-md py-xs text-xs font-semibold',
                    role.ativo ? 'bg-burnt/15 text-burnt-dark' : 'bg-warm-100 text-warm-700',
                  ].join(' ')}>
                    {role.ativo ? t('roles.status_ativas') : t('roles.status_inativas')}
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => excluirRole(role.idRole)}
                    className="inline-flex items-center gap-1 rounded-md bg-burnt px-md py-xs text-xs font-semibold text-white transition-colors hover:bg-burnt-dark"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {t('roles.button_delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="ds-page">
      {error && (
        <div className="ds-alert-error mb-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="ds-card bg-gradient-to-r from-white to-warm-50/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{t('roles.page_title')}</p>
        <h2 className="ds-page-title mt-2 text-2xl">{t('roles.page_title')}</h2>
        <p className="ds-page-subtitle mt-2 max-w-3xl">{t('roles.page_subtitle')}</p>
      </div>

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <div>
              <h2 className="ds-card-title">{t('roles.list_title')}</h2>
              <p className="text-sm text-warm-600">{t('roles.page_subtitle')}</p>
            </div>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: t('roles.create_form_title'),
                icon: <PlusIcon className="h-4 w-4 text-burnt" />,
                onClick: () => setIsCreateModalOpen(true),
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="grid w-full gap-md sm:w-auto sm:grid-cols-2">
            <div>
              <label htmlFor="roles-status-filter" className="ds-label">{t('roles.status_filter_label')}</label>
              <select
                id="roles-status-filter"
                className="ds-select min-w-[180px]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODAS' | 'ATIVAS' | 'INATIVAS')}
              >
                <option value="TODAS">{t('roles.status_todas')}</option>
                <option value="ATIVAS">{t('roles.status_ativas')}</option>
                <option value="INATIVAS">{t('roles.status_inativas')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="roles-search-filter" className="ds-label">{t('roles.nome_filter_label')}</label>
              <input
                id="roles-search-filter"
                type="text"
                className="ds-input min-w-[220px]"
                placeholder={t('roles.nome_filter_placeholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <p className="w-full text-sm text-warm-600 sm:w-auto">{tf('roles.total_roles', { count: filteredRoles.length })}</p>
        </div>

        {rolesContent}
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
