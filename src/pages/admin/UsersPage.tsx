import { useEffect, useState } from 'react';
import type * as React from 'react';
import { useLabels } from '../../context/LabelsContext';
import type { LanguageCode } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AdminRole, AdminUser } from '../../types/admin';
import { CheckLineIcon, CloseLineIcon, ListIcon, PlusIcon, UserCircleIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const UsersPage = () => {
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
    try {
      await adminService.inativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError(t('users.error_inativar'));
    }
  };

  const ativarUsuario = async (idUsuario: number) => {
    try {
      await adminService.ativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError(t('users.error_ativar'));
    }
  };

  let usersContent;
  if (users.length === 0) {
    usersContent = (
      <div className="py-xl text-center">
        <p className="text-warm-700">{t('users.no_users')}</p>
      </div>
    );
  } else {
    usersContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('users.nome_label')}</th>
              <th>{t('users.email_label')}</th>
              <th>{t('users.column_language')}</th>
              <th>{t('users.roles_label')}</th>
              <th>{t('users.status_filter_label')}</th>
              <th className="text-center">{t('common.actions_label')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.idUsuario}>
                <td className="font-mono text-xs">{user.idUsuario}</td>
                <td className="font-semibold text-warm-900">{user.nome}</td>
                <td className="font-mono text-xs text-warm-700">{user.email}</td>
                <td>
                  <span className="inline-flex items-center gap-2 rounded-full bg-warm-100 px-3 py-1 text-xs font-semibold text-warm-800">
                    <span className="text-sm leading-none">{getLanguageFlag(user.idiomaPadrao)}</span>
                    {getLanguageLabel(user.idiomaPadrao)}
                  </span>
                </td>
                <td>
                  {user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-xs">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-block rounded-full bg-teal-light/20 px-xs py-xs text-xs font-semibold text-teal-dark"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-warm-500">-</span>
                  )}
                </td>
                <td>
                  <span className={[
                    'inline-block rounded-full px-md py-xs text-xs font-semibold',
                    user.ativo ? 'bg-burnt/15 text-burnt-dark' : 'bg-warm-100 text-warm-700',
                  ].join(' ')}>
                    {user.ativo ? t('users.status_ativos') : t('users.status_inativos')}
                  </span>
                </td>
                <td className="text-center">
                  {user.ativo ? (
                    <button
                      type="button"
                      onClick={() => inativarUsuario(user.idUsuario)}
                      className="inline-flex items-center gap-1 rounded-md bg-burnt px-md py-xs text-xs font-semibold text-white transition-colors hover:bg-burnt-dark"
                    >
                      <CloseLineIcon className="h-4 w-4" />
                      {t('users.button_inativar')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => ativarUsuario(user.idUsuario)}
                      className="inline-flex items-center gap-1 rounded-md bg-warm-800 px-md py-xs text-xs font-semibold text-white transition-colors hover:bg-warm-900"
                    >
                      <CheckLineIcon className="h-4 w-4" />
                      {t('users.button_ativar')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="ds-page space-y-lg">
      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="ds-card bg-gradient-to-r from-white to-warm-50/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{t('users.list_title')}</p>
        <h2 className="ds-page-title mt-2 text-2xl">{t('users.page_title')}</h2>
        <p className="ds-page-subtitle mt-2 max-w-3xl">{t('users.page_subtitle')}</p>
      </div>

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <div>
              <h2 className="ds-card-title">{t('users.list_title')}</h2>
              <p className="text-sm text-warm-600">{t('users.list_subtitle')}</p>
            </div>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: t('users.create_form_title'),
                icon: <PlusIcon className="h-4 w-4 text-burnt" />,
                onClick: openCreateModal,
              },
              {
                label: t('users.assign_form_title'),
                icon: <UserCircleIcon className="h-4 w-4 text-burnt" />,
                onClick: openRolesModal,
              },
            ]}
          />
        </div>

        <p className="text-sm text-warm-600">{tf('users.total_users', { count: users.length })}</p>

        {usersContent}
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

          <button
            type="submit"
            disabled={isCreateLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreateLoading ? t('common.loading') : t('users.create_button')}
          </button>
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

          <button
            type="submit"
            disabled={!selectedUserId || isRolesLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRolesLoading ? t('common.loading') : t('users.save_roles_button')}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
