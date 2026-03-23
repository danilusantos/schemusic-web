import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminAccessLog } from '../../types/admin';

const formatDate = (value: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR');
};

export const AccessLogsPage = () => {
  const [logs, setLogs] = useState<AdminAccessLog[]>([]);
  const [limite, setLimite] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = async (limit = limite) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listarLogs(limit);
      setLogs(data);
    } catch {
      setError('Falha ao carregar logs de acesso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar(50);
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800',
      NAVIGATE: 'bg-purple-100 text-purple-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  return (
    <section className="ds-page">
      {/* Header */}
      <div className="space-y-md">
        <h1 className="ds-page-title">
          Logs de Acesso
        </h1>
        <p className="ds-page-subtitle">
          Auditoria completa de requisicoes HTTP e navegacao frontend em tempo real.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="ds-card flex gap-md items-end">
        <div className="flex-1 max-w-xs">
          <label htmlFor="limite" className="ds-label">
            Mostrar ultimos
          </label>
          <div className="flex gap-md">
            <input
              id="limite"
              type="number"
              min={1}
              max={500}
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="ds-input flex-1"
            />
            <button
              type="button"
              onClick={() => void carregar()}
              className="ds-btn-primary"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="ds-card space-y-lg">
        <div>
          <h2 className="ds-card-title">
            Ultimos Acessos
          </h2>
          <p className="text-sm text-warm-600 mt-xs">
            {loading ? 'Carregando...' : `Exibindo ${logs.length} registro(s)`}
          </p>
        </div>

        {loading ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Carregando dados...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr className="border-b-2 border-warm-300 bg-warm-50">
                  <th className="px-lg py-md text-left font-semibold text-warm-800">ID</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Metodo</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Caminho</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">IP</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">User ID</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Status</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-300">
                {logs.map((log) => (
                  <tr key={log.idAcesso} className="hover:bg-warm-50 transition-colors">
                    <td className="px-lg py-md text-warm-900 font-mono text-xs">{log.idAcesso}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${getMethodColor(log.metodo)}`}>
                        {log.metodo}
                      </span>
                    </td>
                    <td className="px-lg py-md text-warm-700 font-mono text-xs truncate max-w-xs" title={log.caminho}>
                      {log.caminho}
                    </td>
                    <td className="px-lg py-md text-warm-900 font-mono text-xs">{log.ip}</td>
                    <td className="px-lg py-md text-warm-700 font-mono text-xs">{log.userId || '-'}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${getStatusColor(log.statusHttp)}`}>
                        {log.statusHttp}
                      </span>
                    </td>
                    <td className="px-lg py-md text-warm-700 text-xs whitespace-nowrap">
                      {formatDate(log.dataAcesso)}
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
