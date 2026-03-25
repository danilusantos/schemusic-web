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
    <section className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.main_title')} 👋
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          {t('dashboard.main_subtitle')}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users KPI */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.kpi_usuarios_label')}</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900">{summary?.totalUsuarios ?? '--'}</h3>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.kpi_usuarios_desc')}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m0 0H8.646m3.354 0H16m0 0a4 4 0 110-5.292m0 0H8m0 0H4.354m0 0a4 4 0 110 5.292" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Roles KPI */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.kpi_roles_label')}</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900">{summary?.totalRoles ?? '--'}</h3>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.kpi_roles_desc')}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Access Lists KPI */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.kpi_listas_label')}</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900">{summary?.totalListasAcesso ?? '--'}</h3>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.kpi_listas_desc')}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Logs KPI */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.kpi_logs_label')}</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900">{summary?.totalLogs ?? '--'}</h3>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.kpi_logs_desc')}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Access Trend Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.access_trend_title')}</h2>
            <p className="mt-1 text-sm text-gray-600">{t('dashboard.access_trend_subtitle')}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {(['week', 'month', 'year'] as SeriePeriodo[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSeriesPeriod(period)}
                className={[
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  seriesPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900',
                ].join(' ')}
              >
                {t(`dashboard.filter_${period}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[300px] flex items-center justify-center">
          {renderChartContent()}
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recent_logs_title')}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {loading ? t('dashboard.loading') : `${summary?.totalLogsUltimas24h ?? 0} ${t('dashboard.recent_logs_24h')}`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('dashboard.table_method')}</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('dashboard.table_path')}</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('dashboard.table_status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {renderRecentLogsRows()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="group rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">{card.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{card.text}</p>
            <p className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wide text-blue-600 group-hover:text-blue-700">
              {t('dashboard.card_cta')} →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
