import { useEffect, useState } from 'react';
import type * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessControl } from '../../context/AccessControlContext';
import { useLabels } from '../../context/LabelsContext';
import type { LanguageCode } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminRole, AdminUser } from '../../types/admin';
import { CheckLineIcon, CloseLineIcon, LockIcon, PlusIcon, UserCircleIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const UsersPage = () => {
  const navigate = useNavigate();
  const { can } = useAccessControl();
  const { t, tf } = useLabels();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [idiomaPadrao, setIdiomaPadrao] = useState<LanguageCode>('pt-BR');

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [rolesError, setRolesError] = useState('');

  const languageOptions: Array<{ value: LanguageCode; label: string }> = [
    { value: 'pt-BR', label: t('users.language_pt') },
    { value: 'en-US', label: t('users.language_en') },
    { value: 'es-ES', label: t('users.language_es') },
  ];

  const carregar = async () => {
    setError('');

    try {
      const [usuariosData, rolesData] = await Promise.all([
        adminService.listarUsuarios(),
        adminService.listarRoles(),
      ]);
      setUsers(usuariosData);
      setRoles(rolesData);
    } catch {
      setError(t('users.error_fetch'));
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const openCreateModal = () => {
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const openRolesModal = () => {
    setRolesError('');
    setIsRolesModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError('');
  };

  const closeRolesModal = () => {
    setIsRolesModalOpen(false);
    setRolesError('');
    setSelectedUserId('');
    setSelectedRoleIds([]);
  };

  const criarUsuario = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!can('INCLUIR')) {
      setCreateError(t('access_control.action_denied'));
      return;
    }

    setCreateError('');
    setIsCreateLoading(true);

    try {
      await adminService.criarUsuario({ nome, email, senha, idiomaPadrao });
      setNome('');
      setEmail('');
      setSenha('');
      setIdiomaPadrao('pt-BR');
      closeCreateModal();
      await carregar();
    } catch {
      setCreateError(t('users.error_create'));
    } finally {
      setIsCreateLoading(false);
    }
  };

  const vincularRoles = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!can('EDITAR')) {
      setRolesError(t('access_control.action_denied'));
      return;
    }

    if (!selectedUserId) {
      setRolesError(t('users.error_select_user'));
      return;
    }

    setRolesError('');
    setIsRolesLoading(true);

    try {
      await adminService.vincularRoles(selectedUserId, selectedRoleIds);
      closeRolesModal();
      await carregar();
    } catch {
      setRolesError(t('users.error_assign_roles'));
    } finally {
      setIsRolesLoading(false);
    }
  };

  const toggleRoleSelection = (roleId: number) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  };

  const getLanguageLabel = (language: string) => {
    if (language === 'en-US') {
      return t('users.language_en');
    }
    if (language === 'es-ES') {
      return t('users.language_es');
    }
    return t('users.language_pt');
  };

  const getLanguageFlag = (language: string) => {
    if (language === 'en-US') {
      return '🇺🇸';
    }
    if (language === 'es-ES') {
      return '🇪🇸';
    }
    return '🇧🇷';
  };

  const inativarUsuario = async (idUsuario: number) => {
    if (!can('EDITAR')) {
      setError(t('access_control.action_denied'));
      return;
    }

    try {
      await adminService.inativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError(t('users.error_inativar'));
    }
  };

  const ativarUsuario = async (idUsuario: number) => {
    if (!can('EDITAR')) {
      setError(t('access_control.action_denied'));
      return;
    }

    try {
      await adminService.ativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError(t('users.error_ativar'));
    }
  };

  const abrirTelaPermissoes = (idUsuario?: number) => {
    if (!can('EDITAR')) {
      setError(t('access_control.action_denied'));
      return;
    }

    if (idUsuario) {
      navigate(`/admin/access-control?target=user&id=${idUsuario}`);
      return;
    }

    navigate('/admin/access-control?target=user');
  };

  return (
    <section className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('users.page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('users.page_subtitle')}</p>
      </div>

      {/* Users Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('users.list_title')}</h2>
            <p className="mt-1 text-sm text-gray-600">{tf('users.total_users', { count: users.length })}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <AdminButton type="button" onClick={openCreateModal} disabled={!can('INCLUIR')} icon={<PlusIcon className="h-4 w-4" />}>
              {t('users.create_form_title')}
            </AdminButton>
            <AdminCardContextMenu
              items={[
                {
                  label: t('users.assign_form_title'),
                  icon: <UserCircleIcon className="h-4 w-4" />,
                  onClick: openRolesModal,
                  disabled: !can('EDITAR'),
                },
                {
                  label: t('access_control.user_permissions_button'),
                  icon: <LockIcon className="h-4 w-4" />,
                  onClick: () => abrirTelaPermissoes(),
                  disabled: !can('EDITAR'),
                },
              ]}
            />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">{t('users.no_users')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.nome_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.email_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.column_language')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.roles_label')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('users.status_filter_label')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">{t('common.actions_label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.idUsuario} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{user.idUsuario}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{user.nome}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        <span className="text-sm">{getLanguageFlag(user.idiomaPadrao)}</span>
                        {getLanguageLabel(user.idiomaPadrao)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-block rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-block rounded-full px-3 py-1 text-xs font-semibold',
                        user.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ].join(' ')}>
                        {user.ativo ? t('users.status_ativos') : t('users.status_inativos')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <AdminCardContextMenu
                          hideWhenAllDisabled
                          items={[
                            {
                              label: t('access_control.manage_button'),
                              icon: <LockIcon className="h-4 w-4" />,
                              onClick: () => abrirTelaPermissoes(user.idUsuario),
                              disabled: !can('EDITAR'),
                            },
                            {
                              label: user.ativo ? t('users.button_inativar') : t('users.button_ativar'),
                              icon: user.ativo ? <CloseLineIcon className="h-4 w-4" /> : <CheckLineIcon className="h-4 w-4" />,
                              onClick: () => (user.ativo ? inativarUsuario(user.idUsuario) : ativarUsuario(user.idUsuario)),
                              disabled: !can('EDITAR'),
                              tone: user.ativo ? 'danger' : 'default',
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isCreateModalOpen}
        title={t('users.create_form_title')}
        subtitle={t('users.create_form_subtitle')}
        onClose={closeCreateModal}
        isLoading={isCreateLoading}
        error={createError}
      >
        <form onSubmit={criarUsuario} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="user-nome" className="ds-label">{t('users.nome_label')}</label>
              <input
                id="user-nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('users.nome_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="user-email" className="ds-label">{t('users.email_label')}</label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('users.email_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="user-senha" className="ds-label">{t('users.senha_label')}</label>
              <input
                id="user-senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={t('users.senha_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="user-idioma" className="ds-label">{t('users.idioma_label')}</label>
              <select
                id="user-idioma"
                value={idiomaPadrao}
                onChange={(event) => setIdiomaPadrao(event.target.value as LanguageCode)}
                disabled={isCreateLoading}
                className="ds-select disabled:cursor-not-allowed disabled:opacity-60"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AdminButton type="submit" isLoading={isCreateLoading} disabled={!can('INCLUIR')} icon={<PlusIcon className="h-4 w-4" />} className="w-full">
            {isCreateLoading ? t('common.loading') : t('users.create_button')}
          </AdminButton>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isRolesModalOpen}
        title={t('users.assign_form_title')}
        subtitle={t('users.assign_form_subtitle')}
        onClose={closeRolesModal}
        isLoading={isRolesLoading}
        error={rolesError}
      >
        <form onSubmit={vincularRoles} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="user-select" className="ds-label">{t('users.select_usuario_label')}</label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value ? Number(event.target.value) : '')}
                disabled={isRolesLoading}
                className="ds-select disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">{t('users.select_default')}</option>
                {users.map((user) => (
                  <option key={user.idUsuario} value={user.idUsuario}>
                    {user.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="roles-list" className="block text-sm font-semibold text-warm-800">{t('users.roles_label')}</label>
              <div className="max-h-48 space-y-sm overflow-y-auto rounded-md border border-warm-300 bg-warm-50 p-md">
                {roles.length === 0 ? (
                  <p className="text-sm text-warm-600">{t('users.no_roles')}</p>
                ) : (
                  roles.map((role) => (
                    <label
                      key={role.idRole}
                      htmlFor={`role-${role.idRole}`}
                      className="flex cursor-pointer items-center gap-md rounded p-xs transition hover:bg-warm-100"
                    >
                      <input
                        id={`role-${role.idRole}`}
                        type="checkbox"
                        checked={selectedRoleIds.includes(role.idRole)}
                        onChange={() => toggleRoleSelection(role.idRole)}
                        disabled={isRolesLoading}
                        className="h-4 w-4 accent-burnt disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-warm-800">{role.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <AdminButton type="submit" isLoading={isRolesLoading} disabled={!selectedUserId || !can('EDITAR')} icon={<CheckLineIcon className="h-4 w-4" />} className="w-full">
            {isRolesLoading ? t('common.loading') : t('users.save_roles_button')}
          </AdminButton>
        </form>
      </AdminModal>

    </section>
  );
};
