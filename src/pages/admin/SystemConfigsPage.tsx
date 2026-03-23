import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminSystemConfig } from '../../types/admin';

export const SystemConfigsPage = () => {
  const [configs, setConfigs] = useState<AdminSystemConfig[]>([]);
  const [chave, setChave] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listarConfigs();
      setConfigs(data);
    } catch {
      setError('Falha ao carregar configuracoes do sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await adminService.criarConfig({ chave, valor, descricao, ativo });
      setChave('');
      setValor('');
      setDescricao('');
      setAtivo(true);
      await carregar();
    } catch {
      setError('Nao foi possivel criar configuracao.');
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

  return (
    <section className="ds-page">
      {/* Header */}
      <div className="space-y-md">
        <h1 className="ds-page-title">
          Configuracoes do Sistema
        </h1>
        <p className="ds-page-subtitle">
          Gerencie parametros tecnicos e operacionais do backend.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Create Config Form */}
      <div className="ds-card space-y-lg max-w-2xl">
        <div>
          <h2 className="ds-card-title">
            Nova Configuracao
          </h2>
          <p className="ds-card-subtitle">
            Adicione novo parametro ao sistema
          </p>
        </div>

        <form onSubmit={criarConfig} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="config-chave" className="ds-label">
                Chave
              </label>
              <input
                id="config-chave"
                type="text"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                required
                className="ds-input"
                placeholder="Ex: MAX_UPLOAD_SIZE"
              />
            </div>

            <div>
              <label htmlFor="config-valor" className="ds-label">
                Valor
              </label>
              <input
                id="config-valor"
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="ds-input"
                placeholder="Ex: 5242880"
              />
            </div>

            <div>
              <label htmlFor="config-descricao" className="ds-label">
                Descricao
              </label>
              <input
                id="config-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="ds-input"
                placeholder="Ex: Tamanho maximo de upload em bytes"
              />
            </div>

            <label className="flex items-center gap-md cursor-pointer">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 accent-burnt"
              />
              <span className="text-sm font-semibold text-warm-800">
                Configuracao ativa
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="ds-btn-primary w-full"
          >
            Criar Configuracao
          </button>
        </form>
      </div>

      {/* Configs Table */}
      <div className="ds-card space-y-lg">
        <div>
          <h2 className="ds-card-title">
            Configuracoes Ativas
          </h2>
          <p className="text-sm text-warm-600 mt-xs">
            {loading ? 'Carregando...' : `Total: ${configs.length} config(s)`}
          </p>
        </div>

        {loading ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Carregando dados...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Nenhuma configuracao encontrada</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr className="border-b-2 border-warm-300 bg-warm-50">
                  <th className="px-lg py-md text-left font-semibold text-warm-800">ID</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Chave</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Valor</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Descricao</th>
                  <th className="px-lg py-md text-center font-semibold text-warm-800">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-300">
                {configs.map((config) => (
                  <tr key={config.idConfig} className="hover:bg-warm-50 transition-colors">
                    <td className="px-lg py-md text-warm-900 font-mono text-xs">{config.idConfig}</td>
                    <td className="px-lg py-md text-warm-900 font-semibold">{config.chave}</td>
                    <td className="px-lg py-md text-warm-700 font-mono text-xs truncate max-w-xs">{config.valor}</td>
                    <td className="px-lg py-md text-warm-700 text-xs">{config.descricao || '-'}</td>
                    <td className="px-lg py-md text-center">
                      <button
                        type="button"
                        onClick={() => excluirConfig(config.idConfig)}
                        className="px-md py-xs bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
