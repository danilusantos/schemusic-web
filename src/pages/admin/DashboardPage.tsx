import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminAccessLog, AdminAccessSeriesPoint, AdminDashboardSummary } from '../../types/admin';

const AccessLineChart = lazy(() =>
  import('../../components/admin/AccessLineChart').then((module) => ({ default: module.AccessLineChart })),
);

type SeriePeriodo = 'week' | 'month' | 'year';

export const DashboardPage = () => {
  const { t } = useLabels();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminAccessLog[]>([]);
  const [seriesPoints, setSeriesPoints] = useState<AdminAccessSeriesPoint[]>([]);
  const [seriesPeriod, setSeriesPeriod] = useState<SeriePeriodo>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingSeries, setLoadingSeries] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryData, logsData] = await Promise.all([
          adminService.obterResumoDashboard(),
          adminService.listarLogs(5),
        ]);
        setSummary(summaryData);
        setRecentLogs(logsData);
      } catch {
        setError(t('dashboard.error_fetch'));
      } finally {
        setLoading(false);
      }
    };

    void carregar();
  }, [t]);

  useEffect(() => {
    const carregarSerie = async () => {
      setLoadingSeries(true);
      try {
        const serie = await adminService.obterSerieAcessos(seriesPeriod);
        setSeriesPoints(serie.pontos ?? []);
      } catch {
        setSeriesPoints([]);
      } finally {
        setLoadingSeries(false);
      }
    };

    void carregarSerie();
  }, [seriesPeriod]);

  const cards = useMemo(() => [
    {
      title: t('dashboard.card_usuarios_title'),
      text: t('dashboard.card_usuarios_text'),
      to: '/admin/users',
      tone: 'border-warm-300 bg-white text-warm-900 hover:border-burnt/50 hover:bg-warm-50',
    },
    {
      title: t('dashboard.card_roles_title'),
      text: t('dashboard.card_roles_text'),
      to: '/admin/roles',
      tone: 'border-warm-300 bg-white text-warm-900 hover:border-burnt/50 hover:bg-warm-50',
    },
    {
      title: t('dashboard.card_configs_title'),
      text: t('dashboard.card_configs_text'),
      to: '/admin/configs',
      tone: 'border-warm-300 bg-white text-warm-900 hover:border-burnt/50 hover:bg-warm-50',
    },
    {
      title: t('dashboard.card_access_lists_title'),
      text: t('dashboard.card_access_lists_text'),
      to: '/admin/access-lists',
      tone: 'border-warm-300 bg-white text-warm-900 hover:border-burnt/50 hover:bg-warm-50',
    },
    {
      title: t('dashboard.card_logs_title'),
      text: t('dashboard.card_logs_text'),
      to: '/admin/logs',
      tone: 'border-warm-300 bg-white text-warm-900 hover:border-burnt/50 hover:bg-warm-50',
    },
  ], [t]);

  const renderRecentLogsRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3}>{t('dashboard.loading')}</td>
        </tr>
      );
    }

    if (recentLogs.length === 0) {
      return (
        <tr>
          <td colSpan={3}>{t('dashboard.no_logs')}</td>
        </tr>
      );
    }

    return recentLogs.map((log) => (
      <tr key={log.idAcesso}>
        <td>{log.metodo}</td>
        <td className="max-w-[420px] truncate" title={log.caminho}>{log.caminho}</td>
        <td>{log.statusHttp}</td>
      </tr>
    ));
  };

  const renderChartContent = () => {
    if (loadingSeries) {
      return <p className="text-sm text-warm-600">{t('dashboard.loading')}</p>;
    }

    if (seriesPoints.length === 0) {
      return <p className="text-sm text-warm-600">{t('dashboard.no_series_data')}</p>;
    }

    return (
      <Suspense fallback={<p className="text-sm text-warm-600">{t('dashboard.loading')}</p>}>
        <AccessLineChart points={seriesPoints} />
      </Suspense>
    );
  };

  return (
    <section className="ds-page">
      <div className="ds-card bg-gradient-to-r from-white to-warm-50/80">
        <p className="text-xs font-semibold uppercase tracking-widest text-burnt">{t('dashboard.section_title')}</p>
        <h1 className="ds-page-title mt-2">
          {t('dashboard.main_title')}
        </h1>
        <p className="ds-page-subtitle mt-2 max-w-3xl">
          {t('dashboard.main_subtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="ds-kpi">
          <p className="ds-kpi-label">{t('dashboard.kpi_usuarios_label')}</p>
          <p className="ds-kpi-value">{summary?.totalUsuarios ?? '--'}</p>
          <p className="ds-kpi-desc">{t('dashboard.kpi_usuarios_desc')}</p>
        </div>
        <div className="ds-kpi">
          <p className="ds-kpi-label">{t('dashboard.kpi_roles_label')}</p>
          <p className="ds-kpi-value">{summary?.totalRoles ?? '--'}</p>
          <p className="ds-kpi-desc">{t('dashboard.kpi_roles_desc')}</p>
        </div>
        <div className="ds-kpi">
          <p className="ds-kpi-label">{t('dashboard.kpi_listas_label')}</p>
          <p className="ds-kpi-value">{summary?.totalListasAcesso ?? '--'}</p>
          <p className="ds-kpi-desc">{t('dashboard.kpi_listas_desc')}</p>
        </div>
        <div className="ds-kpi">
          <p className="ds-kpi-label">{t('dashboard.kpi_logs_label')}</p>
          <p className="ds-kpi-value">{summary?.totalLogs ?? '--'}</p>
          <p className="ds-kpi-desc">{t('dashboard.kpi_logs_desc')}</p>
        </div>
      </div>

      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="ds-card overflow-hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="ds-card-title">{t('dashboard.access_trend_title')}</h2>
            <p className="mt-1 text-sm text-warm-600">{t('dashboard.access_trend_subtitle')}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {(['week', 'month', 'year'] as SeriePeriodo[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSeriesPeriod(period)}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                  seriesPeriod === period ? 'bg-burnt text-white' : 'text-gray-600 hover:bg-white',
                ].join(' ')}
              >
                {t(`dashboard.filter_${period}`)}
              </button>
            ))}
          </div>
        </div>

        {renderChartContent()}
      </div>

      <div className="ds-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="ds-card-title">{t('dashboard.recent_logs_title')}</h2>
          <span className="text-xs text-warm-600">
            {loading ? t('dashboard.loading') : `${summary?.totalLogsUltimas24h ?? 0} ${t('dashboard.recent_logs_24h')}`}
          </span>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>{t('dashboard.table_method')}</th>
                <th>{t('dashboard.table_path')}</th>
                <th>{t('dashboard.table_status')}</th>
              </tr>
            </thead>
            <tbody>
              {renderRecentLogsRows()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className={`group rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}
          >
            <div className="space-y-3">
              <h2 className="font-title text-xl font-bold">{card.title}</h2>
              <p className="text-sm leading-relaxed opacity-90">{card.text}</p>
              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-burnt">{t('dashboard.card_cta')}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
