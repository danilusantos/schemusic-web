import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useAccessControl } from '../../context/AccessControlContext';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminAccessList } from '../../types/admin';
import { PlusIcon, TrashIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const AccessListsPage = () => {
  const { can } = useAccessControl();
  const { t, tf } = useLabels();
  const [listas, setListas] = useState<AdminAccessList[]>([]);
  const [tipoLista, setTipoLista] = useState('WHITELIST');
  const [tipoAlvo, setTipoAlvo] = useState('IP');
  const [valorAlvo, setValorAlvo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [search, setSearch] = useState('');
  const [listaFilter, setListaFilter] = useState<'TODAS' | 'WHITELIST' | 'BLACKLIST'>('TODAS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');

  const [error, setError] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const carregar = async () => {
    setError('');

    const tipoListaParam = listaFilter === 'TODAS' ? undefined : listaFilter;
    const ativoParam =
      statusFilter === 'TODOS'
        ? undefined
        : statusFilter === 'ATIVOS';

    try {
      const data = await adminService.listarListasAcesso({
        tipoLista: tipoListaParam,
        ativo: ativoParam,
      });
      setListas(data);
    } catch {
      setError(t('access_lists.error_fetch'));
    }
  };

  useEffect(() => {
    void carregar();
  }, [listaFilter, statusFilter]);

  const criarItem = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!can('INCLUIR')) {
      setCreateError(t('access_control.action_denied'));
      return;
    }

    setCreateError('');
    setIsCreateLoading(true);

    try {
      await adminService.criarListaAcesso({
        tipoLista,
        tipoAlvo,
        valorAlvo,
        observacao,
        ativo,
      });
      setValorAlvo('');
      setObservacao('');
      setAtivo(true);
      setIsCreateModalOpen(false);
      await carregar();
    } catch {
      setCreateError(t('access_lists.error_create'));
    } finally {
      setIsCreateLoading(false);
    }
  };

  const inativarItem = async (idListaAcesso: number) => {
    if (!can('EXCLUIR')) {
      setError(t('access_control.action_denied'));
      return;
    }

    try {
      await adminService.inativarListaAcesso(idListaAcesso);
      await carregar();
    } catch {
      setError(t('access_lists.error_inativar'));
    }
  };

  const filteredListas = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) {
      return listas;
    }

    return listas.filter((item) =>
      item.valorAlvo.toLowerCase().includes(termo)
      || (item.observacao ?? '').toLowerCase().includes(termo)
      || item.tipoAlvo.toLowerCase().includes(termo),
    );
  }, [listas, search]);

  return (
    <section className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('access_lists.page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('access_lists.page_subtitle')}</p>
      </div>

      {/* Lists Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Header with filters and actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('access_lists.list_title')}</h2>
              <p className="mt-1 text-sm text-gray-600">{tf('access_lists.total_items', { count: filteredListas.length })}</p>
            </div>

            <AdminButton type="button" onClick={() => setIsCreateModalOpen(true)} disabled={!can('INCLUIR')} icon={<PlusIcon className="h-4 w-4" />}>
              {t('access_lists.create_form_title')}
            </AdminButton>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="listas-lista-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('access_lists.lista_filter_label')}
              </label>
              <select
                id="listas-lista-filter"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={listaFilter}
                onChange={(event) => setListaFilter(event.target.value as 'TODAS' | 'WHITELIST' | 'BLACKLIST')}
              >
                <option value="TODAS">{t('access_lists.lista_filter_todas')}</option>
                <option value="WHITELIST">{t('access_lists.lista_filter_whitelist')}</option>
                <option value="BLACKLIST">{t('access_lists.lista_filter_blacklist')}</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="listas-status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('access_lists.status_filter_label')}
              </label>
              <select
                id="listas-status-filter"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODOS' | 'ATIVOS' | 'INATIVOS')}
              >
                <option value="TODOS">{t('access_lists.status_todos')}</option>
                <option value="ATIVOS">{t('access_lists.status_ativos')}</option>
                <option value="INATIVOS">{t('access_lists.status_inativos')}</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="listas-search-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('access_lists.search_filter_label')}
              </label>
              <input
                id="listas-search-filter"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('access_lists.search_placeholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredListas.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">{t('access_lists.no_items')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('access_lists.lista_filter_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('access_lists.tipo_alvo_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('access_lists.valor_alvo_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('access_lists.observacao_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.status_filter_label')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">{t('common.actions_label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListas.map((item) => (
                  <tr key={item.idListaAcesso} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.idListaAcesso}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        item.tipoLista === 'WHITELIST'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.tipoLista}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.tipoAlvo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-xs truncate" title={item.valorAlvo}>{item.valorAlvo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.observacao || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        item.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.ativo ? t('access_lists.status_ativos') : t('access_lists.status_inativos')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <AdminCardContextMenu
                          hideWhenAllDisabled
                          items={[
                            {
                              label: t('access_lists.button_inativar'),
                              icon: <TrashIcon className="h-4 w-4" />,
                              onClick: () => inativarItem(item.idListaAcesso),
                              disabled: !item.ativo || !can('EXCLUIR'),
                              tone: 'danger',
                            },
                          ]}
                        />
                      </div>
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
        title={t('access_lists.create_form_title')}
        subtitle={t('access_lists.create_form_subtitle')}
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isCreateLoading}
        error={createError}
      >
        <form onSubmit={criarItem} className="space-y-lg">
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label htmlFor="lista-tipo" className="ds-label">{t('access_lists.tipo_lista_label')}</label>
              <select
                id="lista-tipo"
                value={tipoLista}
                onChange={(e) => setTipoLista(e.target.value)}
                disabled={isCreateLoading}
                className="ds-select disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="WHITELIST">{t('access_lists.lista_filter_whitelist')}</option>
                <option value="BLACKLIST">{t('access_lists.lista_filter_blacklist')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="lista-alvo" className="ds-label">{t('access_lists.tipo_alvo_label')}</label>
              <select
                id="lista-alvo"
                value={tipoAlvo}
                onChange={(e) => setTipoAlvo(e.target.value)}
                disabled={isCreateLoading}
                className="ds-select disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="IP">{t('access_lists.tipo_alvo_ip')}</option>
                <option value="EMAIL">{t('access_lists.tipo_alvo_email')}</option>
                <option value="DOMINIO">{t('access_lists.tipo_alvo_dominio')}</option>
                <option value="USUARIO">{t('access_lists.tipo_alvo_usuario')}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="lista-valor" className="ds-label">{t('access_lists.valor_alvo_label')}</label>
            <input
              id="lista-valor"
              type="text"
              value={valorAlvo}
              onChange={(e) => setValorAlvo(e.target.value)}
              required
              disabled={isCreateLoading}
              className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={tipoAlvo === 'IP' ? t('access_lists.valor_placeholder_ip') : t('access_lists.valor_placeholder_generic')}
            />
          </div>

          <div>
            <label htmlFor="lista-obs" className="ds-label">{t('access_lists.observacao_label')}</label>
            <input
              id="lista-obs"
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              disabled={isCreateLoading}
              className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={t('access_lists.observacao_placeholder')}
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
            <span className="text-sm font-semibold text-warm-800">{t('access_lists.ativo_label')}</span>
          </label>

          <AdminButton type="submit" isLoading={isCreateLoading} disabled={!can('INCLUIR')} icon={<PlusIcon className="h-4 w-4" />} className="w-full">
            {isCreateLoading ? t('common.loading') : t('access_lists.create_button')}
          </AdminButton>
        </form>
      </AdminModal>
    </section>
  );
};
