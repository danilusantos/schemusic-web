import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { adminService } from '../../services/adminService';
import type { AdminSystemConfig } from '../../types/admin';
import { ListIcon, PlusIcon, TrashIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const SystemConfigsPage = () => {
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
      setError('Falha ao carregar configuracoes do sistema.');
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
      setCreateError('Nao foi possivel criar configuracao.');
    } finally {
      setIsCreateLoading(false);
    }
  };

  const excluirConfig = async (idConfig: number) => {
    try {
      await adminService.excluirConfig(idConfig);
      await carregar();
    } catch {
      setError('Nao foi possivel excluir configuracao.');
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
      <div className="py-xl text-center"><p className="text-warm-700">Nenhuma configuracao encontrada</p></div>
    );
  } else {
    configsContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Chave</th>
              <th>Valor</th>
              <th>Descricao</th>
              <th className="text-center">Acoes</th>
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
                    Excluir
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

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <h2 className="ds-card-title">Configuracoes Ativas</h2>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: 'Nova Configuracao',
                icon: <PlusIcon className="h-4 w-4 text-burnt" />,
                onClick: () => setIsCreateModalOpen(true),
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="grid w-full gap-md sm:w-auto sm:grid-cols-2">
            <div>
              <label htmlFor="configs-status-filter" className="ds-label">Status</label>
              <select
                id="configs-status-filter"
                className="ds-select min-w-[180px]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'TODAS' | 'ATIVAS' | 'INATIVAS')}
              >
                <option value="TODAS">Todas</option>
                <option value="ATIVAS">Ativas</option>
                <option value="INATIVAS">Inativas</option>
              </select>
            </div>
            <div>
              <label htmlFor="configs-search-filter" className="ds-label">Buscar</label>
              <input
                id="configs-search-filter"
                type="text"
                className="ds-input min-w-[220px]"
                placeholder="Buscar por chave ou valor"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <p className="w-full text-sm text-warm-600 sm:w-auto">Total: {filteredConfigs.length} config(s)</p>
        </div>

        {configsContent}
      </div>

      <AdminModal
        isOpen={isCreateModalOpen}
        title="Nova Configuracao"
        subtitle="Adicione novo parametro ao sistema"
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isCreateLoading}
        error={createError}
      >
        <form onSubmit={criarConfig} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="config-chave" className="ds-label">Chave</label>
              <input
                id="config-chave"
                type="text"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: MAX_UPLOAD_SIZE"
              />
            </div>

            <div>
              <label htmlFor="config-valor" className="ds-label">Valor</label>
              <input
                id="config-valor"
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: 5242880"
              />
            </div>

            <div>
              <label htmlFor="config-descricao" className="ds-label">Descricao</label>
              <input
                id="config-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: Tamanho maximo de upload em bytes"
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
              <span className="text-sm font-semibold text-warm-800">Configuracao ativa</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isCreateLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreateLoading ? 'Carregando...' : 'Criar Configuracao'}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
