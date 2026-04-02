import { useEffect, useState } from 'react';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminAccessLog } from '../../types/admin';
import { RefreshIcon } from '../../icons';
import { AdminButton } from '../../components/admin/AdminButton';

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
  const { t, tf } = useLabels();
  const [logs, setLogs] = useState<AdminAccessLog[]>([]);
  const [limite, setLimite] = useState(50);
  const [error, setError] = useState('');

  const carregar = async (limit = limite) => {
    setError('');
    try {
      const data = await adminService.listarLogs(limit);
      setLogs(data);
    } catch {
      setError(t('access_logs.error_fetch'));
    }
  };

  useEffect(() => {
    void carregar(50);
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800';
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800';
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

  let logsContent;
  if (logs.length === 0) {
    logsContent = (
      <div className="py-12 text-center">
        <p className="text-gray-500">{t('access_logs.no_logs')}</p>
      </div>
    );
  } else {
    logsContent = (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('access_logs.metodo_label')}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('dashboard.table_path')}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">IP</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('access_logs.status_label')}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.idAcesso} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.idAcesso}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getMethodColor(log.metodo)}`}>
                    {log.metodo}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-xs truncate" title={log.caminho}>
                  {log.caminho}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-900">{log.ip}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.userId || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(log.statusHttp)}`}>
                    {log.statusHttp}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {formatDate(log.dataAcesso)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('access_logs.page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('access_logs.page_subtitle')}</p>
      </div>

      {/* Logs Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Header with limit control */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('access_logs.page_title')}</h2>
              <p className="mt-1 text-sm text-gray-600">{tf('access_logs.total_logs', { count: logs.length })}</p>
            </div>
          </div>

          {/* Limit control */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label htmlFor="limite" className="block text-sm font-medium text-gray-700 mb-2">
                {t('access_logs.limit_label')}
              </label>
              <div className="flex gap-2">
                <input
                  id="limite"
                  type="number"
                  min={1}
                  max={500}
                  value={limite}
                  onChange={(e) => setLimite(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <AdminButton type="button" variant="secondary" size="sm" onClick={() => void carregar()} icon={<RefreshIcon className="h-3 w-3" />}>
                  {t('access_logs.limit_button')}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {logsContent}
      </div>
    </section>
  );
};
