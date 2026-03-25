import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminAccessList } from '../../types/admin';
import { ListIcon, PlusIcon, TrashIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const AccessListsPage = () => {
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

  let listasContent;
  if (filteredListas.length === 0) {
    listasContent = (
      <div className="py-xl text-center"><p className="text-warm-700">{t('access_lists.no_items')}</p></div>
    );
  } else {
    listasContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('access_lists.lista_filter_label')}</th>
              <th>{t('access_lists.tipo_alvo_label')}</th>
              <th>{t('access_lists.valor_alvo_label')}</th>
              <th>{t('access_lists.observacao_label')}</th>
              <th>{t('users.status_filter_label')}</th>
              <th className="text-center">{t('common.actions_label')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredListas.map((item) => (
              <tr key={item.idListaAcesso}>
                <td className="font-mono text-xs">{item.idListaAcesso}</td>
                <td>
                  <span className={[
                    'inline-block rounded-full px-md py-xs text-xs font-semibold',
                    item.tipoLista === 'WHITELIST' ? 'bg-burnt/15 text-burnt-dark' : 'bg-warm-100 text-warm-800',
                  ].join(' ')}>
                    {item.tipoLista}
                  </span>
                </td>
                <td className="font-semibold text-warm-900">{item.tipoAlvo}</td>
                <td className="max-w-xs truncate font-mono text-xs text-warm-700">{item.valorAlvo}</td>
                <td className="text-xs text-warm-700">{item.observacao || '-'}</td>
                <td>
                  <span className={[
                    'inline-block rounded-full px-md py-xs text-xs font-semibold',
                    item.ativo ? 'bg-burnt/15 text-burnt-dark' : 'bg-warm-100 text-warm-700',
                  ].join(' ')}>
                    {item.ativo ? t('access_lists.status_ativos') : t('access_lists.status_inativos')}
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => inativarItem(item.idListaAcesso)}
                    disabled={!item.ativo}
                    className="inline-flex items-center gap-1 rounded-md bg-burnt px-md py-xs text-xs font-semibold text-white transition-colors hover:bg-burnt-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {t('access_lists.button_inativar')}
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{t('access_lists.page_title')}</p>
        <h2 className="ds-page-title mt-2 text-2xl">{t('access_lists.page_title')}</h2>
        <p className="ds-page-subtitle mt-2 max-w-3xl">{t('access_lists.page_subtitle')}</p>
      </div>

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <div>
              <h2 className="ds-card-title">{t('access_lists.list_title')}</h2>
              <p className="text-sm text-warm-600">{t('access_lists.page_subtitle')}</p>
            </div>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: t('access_lists.create_form_title'),
                icon: <PlusIcon className="h-4 w-4 text-burnt" />,
                onClick: () => setIsCreateModalOpen(true),
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="grid w-full gap-md sm:w-auto sm:grid-cols-3">
            <div>
              <label htmlFor="listas-lista-filter" className="ds-label">{t('access_lists.lista_filter_label')}</label>
              <select
                id="listas-lista-filter"
                className="ds-select min-w-[160px]"
                value={listaFilter}
                onChange={(event) => setListaFilter(event.target.value as 'TODAS' | 'WHITELIST' | 'BLACKLIST')}
              >
                <option value="TODAS">{t('access_lists.lista_filter_todas')}</option>
                <option value="WHITELIST">{t('access_lists.lista_filter_whitelist')}</option>
                <option value="BLACKLIST">{t('access_lists.lista_filter_blacklist')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="listas-status-filter" className="ds-label">{t('access_lists.status_filter_label')}</label>
              <select
                id="listas-status-filter"
                className="ds-select min-w-[160px]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODOS' | 'ATIVOS' | 'INATIVOS')}
              >
                <option value="TODOS">{t('access_lists.status_todos')}</option>
                <option value="ATIVOS">{t('access_lists.status_ativos')}</option>
                <option value="INATIVOS">{t('access_lists.status_inativos')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="listas-search-filter" className="ds-label">{t('access_lists.search_filter_label')}</label>
              <input
                id="listas-search-filter"
                type="text"
                className="ds-input min-w-[220px]"
                placeholder={t('access_lists.search_placeholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <p className="w-full text-sm text-warm-600 sm:w-auto">{tf('access_lists.total_items', { count: filteredListas.length })}</p>
        </div>

        {listasContent}
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

          <button
            type="submit"
            disabled={isCreateLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
              {isCreateLoading ? t('common.loading') : t('access_lists.create_button')}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
