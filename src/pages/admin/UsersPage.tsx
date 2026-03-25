import { useEffect, useState } from 'react';
import type * as React from 'react';
import { adminService } from '../../services/adminService';
import type { AdminRole, AdminUser } from '../../types/admin';
import { CheckLineIcon, CloseLineIcon, ListIcon, PlusIcon, UserCircleIcon } from '../../icons';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminCardContextMenu } from '../../components/admin/AdminCardContextMenu';

export const UsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [rolesError, setRolesError] = useState('');

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
      setError('Falha ao carregar usuarios administrativos.');
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarUsuario = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');
    setIsCreateLoading(true);

    try {
      await adminService.criarUsuario({ nome, email, senha });
      setNome('');
      setEmail('');
      setSenha('');
      setIsCreateModalOpen(false);
      await carregar();
    } catch {
      setCreateError('Nao foi possivel criar usuario.');
    } finally {
      setIsCreateLoading(false);
    }
  };

  const vincularRoles = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUserId) {
      setRolesError('Selecione um usuario para vincular roles.');
      return;
    }

    setRolesError('');
    setIsRolesLoading(true);

    try {
      await adminService.vincularRoles(selectedUserId, selectedRoleIds);
      setSelectedRoleIds([]);
      setIsRolesModalOpen(false);
      await carregar();
    } catch {
      setRolesError('Falha ao vincular roles ao usuario.');
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
      return 'Ingles';
    }
    if (language === 'es-ES') {
      return 'Espanhol';
    }
    return 'Portugues';
  };

  const inativarUsuario = async (idUsuario: number) => {
    try {
      await adminService.inativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError('Nao foi possivel inativar o usuario.');
    }
  };

  const ativarUsuario = async (idUsuario: number) => {
    try {
      await adminService.ativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError('Nao foi possivel ativar o usuario.');
    }
  };

  let usersContent;
  if (users.length === 0) {
    usersContent = (
      <div className="py-xl text-center">
        <p className="text-warm-700">Nenhum usuario encontrado</p>
      </div>
    );
  } else {
    usersContent = (
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Idioma</th>
              <th>Roles</th>
              <th>Status</th>
              <th className="text-center">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.idUsuario}>
                <td className="font-mono text-xs">{user.idUsuario}</td>
                <td className="font-semibold text-warm-900">{user.nome}</td>
                <td className="font-mono text-xs text-warm-700">{user.email}</td>
                <td className="text-sm text-warm-700">{getLanguageLabel(user.idiomaPadrao)}</td>
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
                    {user.ativo ? 'Ativo' : 'Inativo'}
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
                      Inativar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => ativarUsuario(user.idUsuario)}
                      className="inline-flex items-center gap-1 rounded-md bg-warm-800 px-md py-xs text-xs font-semibold text-white transition-colors hover:bg-warm-900"
                    >
                      <CheckLineIcon className="h-4 w-4" />
                      Ativar
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
    <section className="ds-page">
      {error && (
        <div className="ds-alert-error mb-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="ds-card space-y-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-burnt" />
            <h2 className="ds-card-title">Lista de Usuarios</h2>
          </div>

          <AdminCardContextMenu
            items={[
              {
                label: 'Criar Usuario',
                icon: <PlusIcon className="h-4 w-4 text-burnt" />,
                onClick: () => setIsCreateModalOpen(true),
              },
              {
                label: 'Vincular Roles',
                icon: <UserCircleIcon className="h-4 w-4 text-burnt" />,
                onClick: () => setIsRolesModalOpen(true),
              },
            ]}
          />
        </div>

        <p className="text-sm text-warm-600">Total: {users.length} usuario(s)</p>

        {usersContent}
      </div>

      <AdminModal
        isOpen={isCreateModalOpen}
        title="Criar Usuario"
        subtitle="Adicione uma nova conta administrativa"
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isCreateLoading}
        error={createError}
      >
        <form onSubmit={criarUsuario} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="user-nome" className="ds-label">Nome</label>
              <input
                id="user-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Joao Silva"
              />
            </div>

            <div>
              <label htmlFor="user-email" className="ds-label">Email</label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="joao@schemusic.com"
              />
            </div>

            <div>
              <label htmlFor="user-senha" className="ds-label">Senha</label>
              <input
                id="user-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={isCreateLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreateLoading}
            className="ds-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreateLoading ? 'Carregando...' : 'Criar Usuario'}
          </button>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isRolesModalOpen}
        title="Vincular Roles"
        subtitle="Associe permissoes aos usuarios"
        onClose={() => setIsRolesModalOpen(false)}
        isLoading={isRolesLoading}
        error={rolesError}
      >
        <form onSubmit={vincularRoles} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="user-select" className="ds-label">Selecionar Usuario</label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                disabled={isRolesLoading}
                className="ds-select disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">-- Selecione --</option>
                {users.map((user) => (
                  <option key={user.idUsuario} value={user.idUsuario}>
                    {user.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="roles-list" className="block text-sm font-semibold text-warm-800">Roles</label>
              <div className="max-h-48 space-y-sm overflow-y-auto rounded-md border border-warm-300 bg-warm-50 p-md">
                {roles.length === 0 ? (
                  <p className="text-sm text-warm-600">Nenhuma role disponivel</p>
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
            {isRolesLoading ? 'Carregando...' : 'Salvar Roles'}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
