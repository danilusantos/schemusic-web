import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminAccessList } from '../../types/admin';

export const AccessListsPage = () => {
  const [listas, setListas] = useState<AdminAccessList[]>([]);
  const [tipoLista, setTipoLista] = useState('WHITELIST');
  const [tipoAlvo, setTipoAlvo] = useState('IP');
  const [valorAlvo, setValorAlvo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listarListasAcesso();
      setListas(data);
    } catch {
      setError('Falha ao carregar listas de acesso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
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
      await carregar();
    } catch {
      setError('Nao foi possivel criar item de lista de acesso.');
    }
  };

  const inativarItem = async (idListaAcesso: number) => {
    try {
      await adminService.inativarListaAcesso(idListaAcesso);
      await carregar();
    } catch {
      setError('Falha ao inativar item da lista.');
    }
  };

  return (
    <section className="ds-page">
      {/* Header */}
      <div className="space-y-md">
        <h1 className="ds-page-title">
          Listas de Acesso
        </h1>
        <p className="ds-page-subtitle">
          Controle regras de whitelist e blacklist para IP, email, dominio e usuarios.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Create Access List Form */}
      <div className="ds-card space-y-lg max-w-2xl">
        <div>
          <h2 className="ds-card-title">
            Novo Item de Acesso
          </h2>
          <p className="ds-card-subtitle">
            Adicione regra de whitelist ou blacklist
          </p>
        </div>

        <form onSubmit={criarItem} className="space-y-lg">
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label htmlFor="lista-tipo" className="ds-label">
                Tipo de Lista
              </label>
              <select
                id="lista-tipo"
                value={tipoLista}
                onChange={(e) => setTipoLista(e.target.value)}
                className="ds-select"
              >
                <option value="WHITELIST">WHITELIST</option>
                <option value="BLACKLIST">BLACKLIST</option>
              </select>
            </div>

            <div>
              <label htmlFor="lista-alvo" className="ds-label">
                Tipo Alvo
              </label>
              <select
                id="lista-alvo"
                value={tipoAlvo}
                onChange={(e) => setTipoAlvo(e.target.value)}
                className="ds-select"
              >
                <option value="IP">IP</option>
                <option value="EMAIL">EMAIL</option>
                <option value="DOMINIO">DOMINIO</option>
                <option value="USUARIO">USUARIO</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="lista-valor" className="ds-label">
              Valor Alvo
            </label>
            <input
              id="lista-valor"
              type="text"
              value={valorAlvo}
              onChange={(e) => setValorAlvo(e.target.value)}
              required
              className="ds-input"
              placeholder={tipoAlvo === 'IP' ? 'Ex: 192.168.1.1' : 'Ex: usuario@exemplo.com'}
            />
          </div>

          <div>
            <label htmlFor="lista-obs" className="ds-label">
              Observacao
            </label>
            <input
              id="lista-obs"
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="ds-input"
              placeholder="Ex: Api externa de teste"
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
              Item ativo
            </span>
          </label>

          <button
            type="submit"
            className="ds-btn-primary w-full"
          >
            Criar Item
          </button>
        </form>
      </div>

      {/* Access Lists Table */}
      <div className="ds-card space-y-lg">
        <div>
          <h2 className="ds-card-title">
            Itens Cadastrados
          </h2>
          <p className="text-sm text-warm-600 mt-xs">
            {loading ? 'Carregando...' : `Total: ${listas.length} item(s)`}
          </p>
        </div>

        {loading ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Carregando dados...</p>
          </div>
        ) : listas.length === 0 ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr className="border-b-2 border-warm-300 bg-warm-50">
                  <th className="px-lg py-md text-left font-semibold text-warm-800">ID</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Lista</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Tipo</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Valor</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Observacao</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Status</th>
                  <th className="px-lg py-md text-center font-semibold text-warm-800">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-300">
                {listas.map((item) => (
                  <tr key={item.idListaAcesso} className="hover:bg-warm-50 transition-colors">
                    <td className="px-lg py-md text-warm-900 font-mono text-xs">{item.idListaAcesso}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${
                        item.tipoLista === 'WHITELIST'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.tipoLista}
                      </span>
                    </td>
                    <td className="px-lg py-md text-warm-900 font-semibold">{item.tipoAlvo}</td>
                    <td className="px-lg py-md text-warm-700 font-mono text-xs truncate max-w-xs">{item.valorAlvo}</td>
                    <td className="px-lg py-md text-warm-700 text-xs">{item.observacao || '-'}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${
                        item.ativo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-lg py-md text-center">
                      <button
                        type="button"
                        onClick={() => inativarItem(item.idListaAcesso)}
                        disabled={!item.ativo}
                        className="px-md py-xs bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Inativar
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
