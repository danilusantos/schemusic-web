import { useEffect, useMemo, useState } from 'react';
import type * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AccessPermissionCatalogItem, AccessPermissionGroup, AccessPermissionLink, AccessScreenCatalog, AdminRole, AdminUser } from '../../types/admin';
import { AdminButton } from '../../components/admin/AdminButton';
import { ChevronDownIcon } from '../../icons';

type AccessTarget = 'role' | 'user';
type ActionCode = 'CONSULTAR' | 'INCLUIR' | 'EDITAR' | 'EXCLUIR';

const ACTIONS: ActionCode[] = ['CONSULTAR', 'INCLUIR', 'EDITAR', 'EXCLUIR'];

const getGroupCode = (screen: AccessScreenCatalog) => {
  return screen.grupoCodigo || screen.telaCodigo.split('_')[0] || 'GERAL';
};

const getGroupLabel = (group: AccessPermissionGroup, t: (key: string) => string) => {
  if (group.grupoCodigo === 'ADMIN') {
    return t('access_control.context_admin');
  }
  return group.grupoNome || group.grupoCodigo;
};

export const AccessControlAssignmentsPage = () => {
  const { t } = useLabels();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [catalogGroups, setCatalogGroups] = useState<AccessPermissionGroup[]>([]);
  const [catalogScreens, setCatalogScreens] = useState<AccessScreenCatalog[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [openContexts, setOpenContexts] = useState<Record<string, boolean>>({ ADMIN: true });
  const [permissionLinks, setPermissionLinks] = useState<AccessPermissionLink[]>([]);
  const [selectedByPermissionId, setSelectedByPermissionId] = useState<Record<number, boolean>>({});

  const target: AccessTarget = searchParams.get('target') === 'user' ? 'user' : 'role';
  const selectedId = Number(searchParams.get('id') || 0);

  const selectedTargetLabel = target === 'user' ? t('access_control.target_user') : t('access_control.target_role');

  const loadBase = async () => {
    setLoading(true);
    setError('');

    try {
      const [catalogData, rolesData, usersData] = await Promise.all([
        adminService.listarCatalogoAcessos(),
        adminService.listarRoles(),
        adminService.listarUsuarios(),
      ]);

      setCatalogGroups(catalogData.grupos ?? []);
      setCatalogScreens(catalogData.telas ?? []);
      setRoles(rolesData);
      setUsers(usersData);

      const nextOpen: Record<string, boolean> = { ADMIN: true };
      (catalogData.grupos ?? []).forEach((group, index) => {
        nextOpen[group.grupoCodigo] = index === 0;
      });
      setOpenContexts(nextOpen);
    } catch {
      setError(t('access_control.error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBase();
  }, [t]);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!selectedId) {
        setPermissionLinks([]);
        setSelectedByPermissionId({});
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = target === 'role'
          ? await adminService.listarPermissoesRole(selectedId)
          : await adminService.listarPermissoesUsuario(selectedId);

        setPermissionLinks(response.permissoes);
        setSelectedByPermissionId(
          response.permissoes.reduce<Record<number, boolean>>((acc, item) => {
            acc[item.idPermissao] = target === 'user'
              ? Boolean(item.overrideUsuario === true)
              : Boolean(item.efetivo);
            return acc;
          }, {}),
        );
      } catch {
        setError(t('access_control.error_fetch'));
      } finally {
        setLoading(false);
      }
    };

    void loadAssignments();
  }, [selectedId, target, t]);

  const permissionsById = useMemo(
    () => permissionLinks.reduce<Record<number, AccessPermissionLink>>((acc, permission) => {
      acc[permission.idPermissao] = permission;
      return acc;
    }, {}),
    [permissionLinks],
  );

  const catalogByContext = useMemo(() => {
    if (catalogGroups.length > 0) {
      return catalogGroups.reduce<Record<string, AccessScreenCatalog[]>>((acc, group) => {
        acc[group.grupoCodigo] = group.telas ?? [];
        return acc;
      }, {});
    }

    return catalogScreens.reduce<Record<string, AccessScreenCatalog[]>>((acc, screen) => {
      const groupCode = getGroupCode(screen);
      if (!acc[groupCode]) {
        acc[groupCode] = [];
      }
      acc[groupCode].push(screen);
      return acc;
    }, {});
  }, [catalogGroups, catalogScreens]);

  const catalogGroupEntries = useMemo(() => {
    if (catalogGroups.length > 0) {
      return catalogGroups;
    }

    return Object.entries(catalogByContext).map(([groupCodigo, telas]) => ({
      grupoCodigo: groupCodigo,
      grupoNome: groupCodigo,
      descricao: '',
      telas,
    }));
  }, [catalogByContext, catalogGroups]);

  const screenActionPermission = (screen: AccessScreenCatalog, action: ActionCode): AccessPermissionCatalogItem | undefined => {
    return screen.permissoes.find((permission) => permission.acaoCodigo === action);
  };

  const isChecked = (permissionId?: number) => {
    if (!permissionId) {
      return false;
    }
    return Boolean(selectedByPermissionId[permissionId]);
  };

  const setChecked = (permissionId: number, value: boolean) => {
    setSelectedByPermissionId((current) => ({
      ...current,
      [permissionId]: value,
    }));
  };

  const handleToggleAction = (screen: AccessScreenCatalog, action: ActionCode, nextValue: boolean) => {
    const targetPermission = screenActionPermission(screen, action);
    if (!targetPermission) {
      return;
    }

    const consultPermission = screenActionPermission(screen, 'CONSULTAR');
    const incluirPermission = screenActionPermission(screen, 'INCLUIR');
    const editarPermission = screenActionPermission(screen, 'EDITAR');
    const excluirPermission = screenActionPermission(screen, 'EXCLUIR');

    if (action === 'CONSULTAR' && !nextValue) {
      [incluirPermission, editarPermission, excluirPermission].forEach((permission) => {
        if (permission) {
          setChecked(permission.idPermissao, false);
        }
      });
    }

    setChecked(targetPermission.idPermissao, nextValue);

    if (action !== 'CONSULTAR' && nextValue) {
      if (consultPermission) {
        setChecked(consultPermission.idPermissao, true);
      }
    }
  };

  const handleToggleContextColumn = (contextCode: string, action: ActionCode, nextValue: boolean) => {
    const screens = catalogByContext[contextCode] || [];

    screens.forEach((screen) => {
      const permission = screenActionPermission(screen, action);
      if (!permission) {
        return;
      }

      handleToggleAction(screen, action, nextValue);
    });
  };

  const isContextColumnFullyChecked = (contextCode: string, action: ActionCode) => {
    const screens = catalogByContext[contextCode] || [];
    const eligiblePermissions = screens
      .map((screen) => {
        const permission = screenActionPermission(screen, action);
        if (!permission) {
          return null;
        }
        return permission;
      })
      .filter((permission): permission is AccessPermissionCatalogItem => permission !== null);

    if (eligiblePermissions.length === 0) {
      return false;
    }

    return eligiblePermissions.every((permission) => isChecked(permission.idPermissao));
  };

  const toggleContextAccordion = (contextCode: string) => {
    setOpenContexts((current) => ({
      ...current,
      [contextCode]: !current[contextCode],
    }));
  };

  const handleTargetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTarget = event.target.value as AccessTarget;
    setSearchParams({ target: nextTarget, id: '' });
  };

  const handleTargetEntityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value;
    setSearchParams({ target, id: nextId });
  };

  const saveAssignments = async () => {
    if (!selectedId) {
      setError(target === 'role' ? t('access_control.select_role') : t('access_control.select_user'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (target === 'role') {
        const idsPermissao = Object.entries(selectedByPermissionId)
          .filter(([, checked]) => checked)
          .map(([id]) => Number(id));

        await adminService.salvarPermissoesRole(selectedId, idsPermissao);
      } else {
        const userPermissions = Object.entries(selectedByPermissionId)
          .filter(([, checked]) => checked)
          .map(([id]) => ({
            idPermissao: Number(id),
            permitido: true,
          }));

        await adminService.salvarPermissoesUsuario(selectedId, userPermissions);
      }

      navigate(target === 'role' ? '/admin/roles' : '/admin/users');
    } catch {
      setError(t('access_control.error_save'));
    } finally {
      setSaving(false);
    }
  };

  const targetOptions = target === 'role' ? roles : users;
  const sortedTargetOptions = useMemo(
    () => [...targetOptions].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')),
    [targetOptions],
  );

  const sortedContextEntries = useMemo(() => {
    return Object.entries(catalogByContext)
      .map(([contextCode, screens]) => [
        contextCode,
        [...screens].sort((a, b) => (a.telaNome || '').localeCompare(b.telaNome || '')),
      ] as [string, AccessScreenCatalog[]])
      .sort((a, b) => {
        const group1 = catalogGroupEntries.find((item) => item.grupoCodigo === a[0]);
        const group2 = catalogGroupEntries.find((item) => item.grupoCodigo === b[0]);
        const label1 = group1 ? getGroupLabel(group1, t) : a[0];
        const label2 = group2 ? getGroupLabel(group2, t) : b[0];
        return label1.localeCompare(label2);
      });
  }, [catalogByContext, catalogGroupEntries, t]);
  const renderActionHeader = (contextCode: string, action: ActionCode) => (
    <th key={action} className="px-3 py-3 text-center font-semibold text-gray-700">
      <div className="flex items-center justify-center gap-2">
        <input
          type="checkbox"
          checked={isContextColumnFullyChecked(contextCode, action)}
          onChange={(event) => handleToggleContextColumn(contextCode, action, event.target.checked)}
          className="h-4 w-4"
        />
        <span>{t(`access_control.column_${action.toLowerCase()}`)}</span>
      </div>
    </th>
  );

  const renderActionCell = (screen: AccessScreenCatalog, action: ActionCode) => {
    const permission = screenActionPermission(screen, action);
    const checked = isChecked(permission?.idPermissao);
    const permissionLink = permission ? permissionsById[permission.idPermissao] : undefined;
    const inheritedByRole = target === 'user' && Boolean(permissionLink?.porRole);
    const effective = target === 'user' ? (inheritedByRole || checked) : checked;

    return (
      <td key={`${screen.telaCodigo}-${action}`} className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            disabled={!permission || loading}
            onChange={(event) => handleToggleAction(screen, action, event.target.checked)}
            className="h-4 w-4"
          />
          {target === 'user' && inheritedByRole ? <span className="text-[10px] font-semibold text-blue-700">R</span> : null}
          {target === 'user' && !inheritedByRole && effective ? <span className="text-[10px] font-semibold text-emerald-700">U</span> : null}
        </div>
      </td>
    );
  };

  const renderScreenRow = (screen: AccessScreenCatalog) => {
    return (
      <tr key={screen.telaCodigo} className="border-b border-gray-100">
        <td className="px-3 py-3 font-medium text-gray-900">{screen.telaNome}</td>
        {ACTIONS.map((action) => renderActionCell(screen, action))}
      </tr>
    );
  };

  const renderContextBlock = ([contextCode, screens]: [string, AccessScreenCatalog[]]) => {
    const isOpen = Boolean(openContexts[contextCode]);
    const group = catalogGroupEntries.find((item) => item.grupoCodigo === contextCode);

    return (
      <div key={contextCode} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => toggleContextAccordion(contextCode)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            {group ? getGroupLabel(group, t) : contextCode}
          </span>
          <ChevronDownIcon className={["h-4 w-4 text-gray-500 transition-transform", isOpen ? 'rotate-180' : ''].join(' ')} />
        </button>

        {isOpen ? (
          <div className="border-t border-gray-200 p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-3 py-3 font-semibold text-gray-700">{t('access_control.column_screen')}</th>
                    {ACTIONS.map((action) => renderActionHeader(contextCode, action))}
                  </tr>
                </thead>
                <tbody>
                  {screens.map(renderScreenRow)}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('access_control.page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('access_control.page_subtitle')}</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="access-target" className="ds-label">{t('access_control.target_label')}</label>
            <select id="access-target" className="ds-select" value={target} onChange={handleTargetChange}>
              <option value="role">{t('access_control.target_role')}</option>
              <option value="user">{t('access_control.target_user')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="access-target-id" className="ds-label">{selectedTargetLabel}</label>
            <select id="access-target-id" className="ds-select" value={selectedId || ''} onChange={handleTargetEntityChange}>
              <option value="">{target === 'role' ? t('access_control.select_role') : t('access_control.select_user')}</option>
              {sortedTargetOptions.map((item) => (
                <option
                  key={target === 'role' ? (item as AdminRole).idRole : (item as AdminUser).idUsuario}
                  value={target === 'role' ? (item as AdminRole).idRole : (item as AdminUser).idUsuario}
                >
                  {target === 'role' ? (item as AdminRole).nome : (item as AdminUser).nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedContextEntries.map(renderContextBlock)}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <AdminButton type="button" variant="outline" onClick={() => navigate(target === 'role' ? '/admin/roles' : '/admin/users')}>
          {t('common.cancel')}
        </AdminButton>
        <AdminButton type="button" isLoading={saving || loading} onClick={() => void saveAssignments()}>
          {saving ? t('common.loading') : t('common.save')}
        </AdminButton>
      </div>
    </section>
  );
};
