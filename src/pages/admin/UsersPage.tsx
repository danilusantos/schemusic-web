import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminRole, AdminUser } from '../../types/admin';

export const UsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const carregar = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      await adminService.criarUsuario({ nome, email, senha });
      setNome('');
      setEmail('');
      setSenha('');
      await carregar();
    } catch {
      setError('Nao foi possivel criar usuario.');
    }
  };

  const vincularRoles = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) {
      setError('Selecione um usuario para vincular roles.');
      return;
    }

    try {
      await adminService.vincularRoles(selectedUserId, selectedRoleIds);
      setSelectedRoleIds([]);
      await carregar();
    } catch {
      setError('Falha ao vincular roles ao usuario.');
    }
  };

  const toggleRoleSelection = (roleId: number) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  };

  const inativarUsuario = async (idUsuario: number) => {
    try {
      await adminService.inativarUsuario(idUsuario);
      await carregar();
    } catch {
      setError('Nao foi possivel inativar o usuario.');
    }
  };

  return (
    <section className="ds-page">
      {/* Header */}
      <div className="space-y-md">
        <h1 className="ds-page-title">
          Usuarios Administrativos
        </h1>
        <p className="ds-page-subtitle">
          Crie contas, ajuste perfis e controle a atividade de administradores.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Forms Grid */}
      <div className="ds-grid-2">
        {/* Create User Form */}
        <form
          onSubmit={criarUsuario}
          className="ds-card space-y-lg"
        >
          <div>
            <h2 className="ds-card-title">
              Criar Usuario
            </h2>
            <p className="ds-card-subtitle">
              Adicione uma nova conta administrativa
            </p>
          </div>

          <div className="space-y-md">
            <div>
              <label htmlFor="user-nome" className="ds-label">
                Nome
              </label>
              <input
                id="user-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="ds-input"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label htmlFor="user-email" className="ds-label">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ds-input"
                placeholder="joao@schemusic.com"
              />
            </div>

            <div>
              <label htmlFor="user-senha" className="ds-label">
                Senha
              </label>
              <input
                id="user-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="ds-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="ds-btn-primary w-full"
          >
            Criar Usuario
          </button>
        </form>

        {/* Assign Roles Form */}
        <form
          onSubmit={vincularRoles}
          className="ds-card space-y-lg"
        >
          <div>
            <h2 className="ds-card-title">
              Vincular Roles
            </h2>
            <p className="ds-card-subtitle">
              Assign permissões a usuarios existentes
            </p>
          </div>

          <div className="space-y-md">
            <div>
              <label htmlFor="user-select" className="ds-label">
                Selecionar Usuario
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                className="ds-select"
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
              <label className="block text-sm font-semibold text-warm-800 mb-md">
                Roles
              </label>
              <div className="space-y-sm max-h-48 overflow-y-auto p-md bg-warm-50 border border-warm-300 rounded-md">
                {roles.length === 0 ? (
                  <p className="text-sm text-warm-600">Nenhuma role disponivel</p>
                ) : (
                  roles.map((role) => (
                    <label key={role.idRole} className="flex items-center gap-md cursor-pointer hover:bg-warm-100 p-xs rounded transition">
                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(role.idRole)}
                        onChange={() => toggleRoleSelection(role.idRole)}
                        className="w-4 h-4 accent-burnt"
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
            disabled={!selectedUserId}
            className="ds-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Roles
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="ds-card space-y-lg">
        <div>
          <h2 className="ds-card-title">
            Lista de Usuarios
          </h2>
          <p className="text-sm text-warm-600 mt-xs">
            {loading ? 'Carregando...' : `Total: ${users.length} usuario(s)`}
          </p>
        </div>

        {loading ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Carregando dados...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Nenhum usuario encontrado</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr className="border-b-2 border-warm-300 bg-warm-50">
                  <th className="px-lg py-md text-left font-semibold text-warm-800">ID</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Nome</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Email</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Roles</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Status</th>
                  <th className="px-lg py-md text-center font-semibold text-warm-800">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-300">
                {users.map((user) => (
                  <tr key={user.idUsuario} className="hover:bg-warm-50 transition-colors">
                    <td className="px-lg py-md text-warm-900 font-mono text-xs">{user.idUsuario}</td>
                    <td className="px-lg py-md text-warm-900 font-semibold">{user.nome}</td>
                    <td className="px-lg py-md text-warm-700 font-mono text-xs">{user.email}</td>
                    <td className="px-lg py-md">
                      {user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-xs">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-block px-xs py-xs bg-teal-light/20 text-teal-dark text-xs font-semibold rounded-full"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-warm-500">-</span>
                      )}
                    </td>
                    <td className="px-lg py-md">
                      <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${
                        user.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-lg py-md text-center">
                      <button
                        type="button"
                        onClick={() => inativarUsuario(user.idUsuario)}
                        disabled={!user.ativo}
                        className="px-md py-xs bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Inativar
                      </button>
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
