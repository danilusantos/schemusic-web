import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminSystemConfig } from '../../types/admin';
import { ListIcon, PlusIcon, TrashIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const SystemConfigsPage = () => {
  const { t, tf } = useLabels();
  const [configs, setConfigs] = useState<AdminSystemConfig[]>([]);
  const [chave, setChave] = useState('');
  const [valor, setValor] = useState('');
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
      const data = await adminService.listarConfigs();
      setConfigs(data);
    } catch {
      setError(t('configs.error_fetch'));
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarConfig = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');
    setIsCreateLoading(true);

    try {
      await adminService.criarConfig({ chave, valor, descricao, ativo });
      setChave('');
      setValor('');
      setDescricao('');
      setAtivo(true);
      setIsCreateModalOpen(false);
      await carregar();
    } catch {
      setCreateError(t('configs.error_create'));
    } finally {
      setIsCreateLoading(false);
    }
  };

  const excluirConfig = async (idConfig: number) => {
    try {
      await adminService.excluirConfig(idConfig);
      await carregar();
    } catch {
      setError(t('configs.error_delete'));
    }
  };

  const filteredConfigs = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return configs.filter((config) => {
      let byStatus = true;
      if (statusFilter === 'ATIVAS') {
        byStatus = config.ativo;
      } else if (statusFilter === 'INATIVAS') {
        byStatus = !config.ativo;
      }

      const bySearch = termo
        ? config.chave.toLowerCase().includes(termo) || config.valor.toLowerCase().includes(termo)
        : true;

      return byStatus && bySearch;
    });
  }, [configs, search, statusFilter]);

  let configsContent;
  if (filteredConfigs.length === 0) {
    configsContent = (
      <div className="py-xl text-center"><p className="text-warm-700">{t('configs.no_configs')}</p></div>
    );
  } else {
    configsContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('configs.chave_label')}</th>
              <th>{t('configs.valor_label')}</th>
              <th>{t('configs.descricao_label')}</th>
              <th className="text-center">{t('common.actions_label')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.map((config) => (
              <tr key={config.idConfig}>
                <td className="font-mono text-xs">{config.idConfig}</td>
                <td className="font-semibold text-warm-900">{config.chave}</td>
                <td className="max-w-xs truncate font-mono text-xs text-warm-700">{config.valor}</td>
                <td className="text-xs text-warm-700">{config.descricao || '-'}</td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => excluirConfig(config.idConfig)}
                    className="inline-flex items-center gap-1 rounded-md bg-burnt px-md py-xs text-xs font-semibold text-white transition-colors hover:bg-burnt-dark"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {t('configs.button_delete')}
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{t('configs.page_title')}</p>
        <h2 className="ds-page-title mt-2 text-2xl">{t('configs.page_title')}</h2>
        <p className="ds-page-subtitle mt-2 max-w-3xl">{t('configs.page_subtitle')}</p>
      </div>

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <div>
              <h2 className="ds-card-title">{t('configs.list_title')}</h2>
              <p className="text-sm text-warm-600">{t('configs.page_subtitle')}</p>
            </div>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: t('configs.create_form_title'),
                icon: <PlusIcon className="h-4 w-4 text-burnt" />,
                onClick: () => setIsCreateModalOpen(true),
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="grid w-full gap-md sm:w-auto sm:grid-cols-2">
            <div>
              <label htmlFor="configs-status-filter" className="ds-label">{t('configs.status_filter_label')}</label>
              <select
                id="configs-status-filter"
                className="ds-select min-w-[180px]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODAS' | 'ATIVAS' | 'INATIVAS')}
              >
                <option value="TODAS">{t('configs.status_todas')}</option>
                <option value="ATIVAS">{t('configs.status_ativas')}</option>
                <option value="INATIVAS">{t('configs.status_inativas')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="configs-search-filter" className="ds-label">{t('configs.search_filter_label')}</label>
              <input
                id="configs-search-filter"
                type="text"
                className="ds-input min-w-[220px]"
                placeholder={t('configs.search_filter_placeholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <p className="w-full text-sm text-warm-600 sm:w-auto">{tf('configs.total_configs', { count: filteredConfigs.length })}</p>
        </div>

        {configsContent}
      </div>

      <AdminModal
        isOpen={isCreateModalOpen}
        title={t('configs.create_form_title')}
        subtitle={t('configs.create_form_subtitle')}
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isCreateLoading}
        error={createError}
      >
        <form onSubmit={criarConfig} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="config-chave" className="ds-label">{t('configs.chave_label')}</label>
              <input
                id="config-chave"
                type="text"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('configs.chave_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="config-valor" className="ds-label">{t('configs.valor_label')}</label>
              <input
                id="config-valor"
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('configs.valor_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="config-descricao" className="ds-label">{t('configs.descricao_label')}</label>
              <input
                id="config-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('configs.descricao_placeholder')}
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
              <span className="text-sm font-semibold text-warm-800">{t('configs.ativo_label')}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isCreateLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
              {isCreateLoading ? t('common.loading') : t('configs.create_button')}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
