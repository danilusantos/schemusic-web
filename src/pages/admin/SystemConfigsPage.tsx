import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminSystemConfig } from '../../types/admin';
import { PlusIcon, TrashIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';

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

  return (
    <section className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('configs.page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('configs.page_subtitle')}</p>
      </div>

      {/* Configs Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Header with filters and actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('configs.list_title')}</h2>
              <p className="mt-1 text-sm text-gray-600">{tf('configs.total_configs', { count: filteredConfigs.length })}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              {t('configs.create_form_title')}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="configs-search-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('configs.search_filter_label')}
              </label>
              <input
                id="configs-search-filter"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('configs.search_filter_placeholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex-1">
              <label htmlFor="configs-status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('configs.status_filter_label')}
              </label>
              <select
                id="configs-status-filter"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODAS' | 'ATIVAS' | 'INATIVAS')}
              >
                <option value="TODAS">{t('configs.status_todas')}</option>
                <option value="ATIVAS">{t('configs.status_ativas')}</option>
                <option value="INATIVAS">{t('configs.status_inativas')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredConfigs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">{t('configs.no_configs')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('configs.chave_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('configs.valor_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('configs.descricao_label')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">{t('common.actions_label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConfigs.map((config) => (
                  <tr key={config.idConfig} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{config.idConfig}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{config.chave}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-xs truncate" title={config.valor}>{config.valor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{config.descricao || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => excluirConfig(config.idConfig)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                        {t('configs.button_delete')}
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
