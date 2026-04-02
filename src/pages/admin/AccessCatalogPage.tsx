import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useAccessControl } from '../../context/AccessControlContext';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AccessPermissionGroup } from '../../types/admin';
import { AdminButton } from '../../components/admin/AdminButton';

export const AccessCatalogPage = () => {
  const { can } = useAccessControl();
  const { t } = useLabels();

  const [groups, setGroups] = useState<AccessPermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [groupCodigo, setGroupCodigo] = useState('');
  const [groupNome, setGroupNome] = useState('');
  const [groupDescricao, setGroupDescricao] = useState('');
  const [screenGrupoCodigo, setScreenGrupoCodigo] = useState('');
  const [screenCodigo, setScreenCodigo] = useState('');
  const [screenNome, setScreenNome] = useState('');
  const [screenDescricao, setScreenDescricao] = useState('');

  const loadCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const catalog = await adminService.listarCatalogoAcessos();
      const nextGroups = catalog.grupos ?? [];
      setGroups(nextGroups);
      if (!screenGrupoCodigo && nextGroups.length > 0) {
        setScreenGrupoCodigo(nextGroups[0].grupoCodigo);
      }
    } catch {
      setError(t('access_control.error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, [t]);

  const totalScreens = useMemo(
    () => groups.reduce((acc, group) => acc + (group.telas?.length ?? 0), 0),
    [groups],
  );

  const handleCreateGroup = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupCodigo.trim() || !groupNome.trim()) {
      setError(t('access_control.error_save'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminService.criarGrupoAcessos({
        codigoGrupo: groupCodigo,
        nomeGrupo: groupNome,
        descricao: groupDescricao,
      });
      setGroupCodigo('');
      setGroupNome('');
      setGroupDescricao('');
      await loadCatalog();
    } catch {
      setError(t('access_control.error_save'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateScreen = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!screenGrupoCodigo.trim() || !screenCodigo.trim() || !screenNome.trim()) {
      setError(t('access_control.error_save'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminService.criarTelaAcessos({
        codigoGrupo: screenGrupoCodigo,
        telaCodigo: screenCodigo,
        telaNome: screenNome,
        descricao: screenDescricao,
      });
      setScreenCodigo('');
      setScreenNome('');
      setScreenDescricao('');
      await loadCatalog();
    } catch {
      setError(t('access_control.error_save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('access_control.catalog_page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('access_control.catalog_page_subtitle')}</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('access_control.catalog_title')}</h2>
            <p className="mt-1 text-sm text-gray-600">{t('access_control.catalog_subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {t('access_control.catalog_total_groups')}: {groups.length}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {t('access_control.catalog_total_screens')}: {totalScreens}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">{t('common.loading')}</div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-600">
            {t('access_control.catalog_empty')}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <div key={group.grupoCodigo} className="rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{group.grupoNome}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{group.grupoCodigo}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {group.telas?.length ?? 0}
                  </span>
                </div>
                {group.descricao ? <p className="mt-3 text-xs text-gray-600">{group.descricao}</p> : null}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={handleCreateGroup} className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{t('access_control.group_form_title')}</h3>
              <p className="mt-1 text-sm text-gray-600">{t('access_control.catalog_group_hint')}</p>
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-group-code">{t('access_control.group_code_label')}</label>
              <input id="catalog-group-code" className="ds-input" value={groupCodigo} onChange={(event) => setGroupCodigo(event.target.value)} required disabled={saving} />
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-group-name">{t('access_control.group_name_label')}</label>
              <input id="catalog-group-name" className="ds-input" value={groupNome} onChange={(event) => setGroupNome(event.target.value)} required disabled={saving} />
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-group-desc">{t('access_control.group_description_label')}</label>
              <input id="catalog-group-desc" className="ds-input" value={groupDescricao} onChange={(event) => setGroupDescricao(event.target.value)} disabled={saving} />
            </div>

            <AdminButton type="submit" disabled={!can('INCLUIR')} isLoading={saving} className="w-full">
              {t('access_control.group_create_button')}
            </AdminButton>
          </form>

          <form onSubmit={handleCreateScreen} className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{t('access_control.screen_form_title')}</h3>
              <p className="mt-1 text-sm text-gray-600">{t('access_control.catalog_group_hint')}</p>
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-screen-group">{t('access_control.screen_group_label')}</label>
              <select id="catalog-screen-group" className="ds-select" value={screenGrupoCodigo} onChange={(event) => setScreenGrupoCodigo(event.target.value)} required disabled={saving}>
                <option value="">{t('access_control.screen_group_label')}</option>
                {groups.map((group) => (
                  <option key={group.grupoCodigo} value={group.grupoCodigo}>
                    {`${group.grupoNome} (${group.grupoCodigo}) - ${group.telas?.length ?? 0}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-screen-code">{t('access_control.screen_code_label')}</label>
              <input id="catalog-screen-code" className="ds-input" value={screenCodigo} onChange={(event) => setScreenCodigo(event.target.value)} required disabled={saving} />
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-screen-name">{t('access_control.screen_name_label')}</label>
              <input id="catalog-screen-name" className="ds-input" value={screenNome} onChange={(event) => setScreenNome(event.target.value)} required disabled={saving} />
            </div>

            <div>
              <label className="ds-label" htmlFor="catalog-screen-desc">{t('access_control.screen_description_label')}</label>
              <input id="catalog-screen-desc" className="ds-input" value={screenDescricao} onChange={(event) => setScreenDescricao(event.target.value)} disabled={saving} />
            </div>

            <AdminButton type="submit" disabled={!can('INCLUIR')} isLoading={saving} className="w-full">
              {t('access_control.screen_create_button')}
            </AdminButton>
          </form>
        </div>
      </div>
    </section>
  );
};