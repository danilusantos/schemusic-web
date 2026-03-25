import { useEffect, useState } from 'react';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminAccessLog } from '../../types/admin';
import { ListIcon, ArrowUpIcon } from '../../icons';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

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
    if (status >= 200 && status < 300) return 'bg-burnt/15 text-burnt-dark';
    if (status >= 300 && status < 400) return 'bg-warm-100 text-warm-800';
    if (status >= 400 && status < 500) return 'bg-warm-200 text-warm-900';
    return 'bg-warm-300 text-warm-900';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-warm-100 text-warm-900',
      POST: 'bg-burnt/15 text-burnt-dark',
      PUT: 'bg-warm-200 text-warm-900',
      DELETE: 'bg-warm-300 text-warm-900',
      NAVIGATE: 'bg-burnt/20 text-burnt-dark',
    };
    return colors[method] || 'bg-warm-100 text-warm-700';
  };

  let logsContent;
  if (logs.length === 0) {
    logsContent = (
      <div className="py-xl text-center"><p className="text-warm-700">{t('access_logs.no_logs')}</p></div>
    );
  } else {
    logsContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('access_logs.metodo_label')}</th>
              <th>{t('dashboard.table_path')}</th>
              <th>IP</th>
              <th>User ID</th>
              <th>{t('access_logs.status_label')}</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.idAcesso}>
                <td className="font-mono text-xs">{log.idAcesso}</td>
                <td>
                  <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${getMethodColor(log.metodo)}`}>
                    {log.metodo}
                  </span>
                </td>
                <td className="max-w-xs truncate font-mono text-xs text-warm-700" title={log.caminho}>
                  {log.caminho}
                </td>
                <td className="font-mono text-xs text-warm-900">{log.ip}</td>
                <td className="font-mono text-xs text-warm-700">{log.userId || '-'}</td>
                <td>
                  <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${getStatusColor(log.statusHttp)}`}>
                    {log.statusHttp}
                  </span>
                </td>
                <td className="whitespace-nowrap text-xs text-warm-700">
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
    <section className="ds-page">
      {error && (
        <div className="ds-alert-error mb-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="ds-card bg-gradient-to-r from-white to-warm-50/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{t('access_logs.page_title')}</p>
        <h2 className="ds-page-title mt-2 text-2xl">{t('access_logs.page_title')}</h2>
        <p className="ds-page-subtitle mt-2 max-w-3xl">{t('access_logs.page_subtitle')}</p>
      </div>

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <div>
              <h2 className="ds-card-title">{t('access_logs.page_title')}</h2>
              <p className="text-sm text-warm-600">{t('access_logs.page_subtitle')}</p>
            </div>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: t('access_logs.limit_button'),
                icon: <ArrowUpIcon className="h-4 w-4 text-burnt" />,
                onClick: () => {
                  void carregar();
                },
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="w-full max-w-xs">
            <label htmlFor="limite" className="ds-label">{t('access_logs.limit_label')}</label>
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
                {t('access_logs.limit_button')}
              </button>
            </div>
          </div>
          <p className="w-full text-sm text-warm-600 sm:w-auto">{tf('access_logs.total_logs', { count: logs.length })}</p>
        </div>

        {logsContent}
      </div>
    </section>
  );
};
