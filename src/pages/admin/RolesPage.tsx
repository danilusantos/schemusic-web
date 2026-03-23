import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminRole } from '../../types/admin';

export const RolesPage = () => {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listarRoles();
      setRoles(data);
    } catch {
      setError('Falha ao carregar roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const criarRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await adminService.criarRole({ nome, descricao, ativo });
      setNome('');
      setDescricao('');
      setAtivo(true);
      await carregar();
    } catch {
      setError('Nao foi possivel criar role.');
    }
  };

  const excluirRole = async (idRole: number) => {
    try {
      await adminService.excluirRole(idRole);
      await carregar();
    } catch {
      setError('Nao foi possivel excluir role. Verifique vinculacoes.');
    }
  };

  return (
    <section className="ds-page">
      {/* Header */}
      <div className="space-y-md">
        <h1 className="ds-page-title">
          Roles e Permissoes
        </h1>
        <p className="ds-page-subtitle">
          Defina perfis e niveis de acesso administrativo no painel.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="ds-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Create Role Form */}
      <div className="ds-card space-y-lg max-w-2xl">
        <div>
          <h2 className="ds-card-title">
            Criar Nova Role
          </h2>
          <p className="ds-card-subtitle">
            Defina um novo perfil de acesso
          </p>
        </div>

        <form onSubmit={criarRole} className="space-y-lg">
          <div className="space-y-md">
            <div>
              <label htmlFor="role-nome" className="ds-label">
                Nome da Role
              </label>
              <input
                id="role-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="ds-input"
                placeholder="Ex: Gerenciador de Usuarios"
              />
            </div>

            <div>
              <label htmlFor="role-descricao" className="ds-label">
                Descricao
              </label>
              <input
                id="role-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="ds-input"
                placeholder="Ex: Pode gerenciar usuarios e roles"
              />
            </div>

            <label className="flex items-center gap-md cursor-pointer">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 accent-burnt"
              />
              <span className="text-sm font-semibold text-warm-800">
                Role ativa
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="ds-btn-primary w-full"
          >
            Criar Role
          </button>
        </form>
      </div>

      {/* Roles Table */}
      <div className="ds-card space-y-lg">
        <div>
          <h2 className="ds-card-title">
            Lista de Roles
          </h2>
          <p className="text-sm text-warm-600 mt-xs">
            {loading ? 'Carregando...' : `Total: ${roles.length} role(s)`}
          </p>
        </div>

        {loading ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Carregando dados...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="py-xl text-center">
            <p className="text-warm-700">Nenhuma role encontrada</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr className="border-b-2 border-warm-300 bg-warm-50">
                  <th className="px-lg py-md text-left font-semibold text-warm-800">ID</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Nome</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Descricao</th>
                  <th className="px-lg py-md text-left font-semibold text-warm-800">Status</th>
                  <th className="px-lg py-md text-center font-semibold text-warm-800">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-300">
                {roles.map((role) => (
                  <tr key={role.idRole} className="hover:bg-warm-50 transition-colors">
                    <td className="px-lg py-md text-warm-900 font-mono text-xs">{role.idRole}</td>
                    <td className="px-lg py-md text-warm-900 font-semibold">{role.nome}</td>
                    <td className="px-lg py-md text-warm-700 text-xs">{role.descricao || '-'}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-block px-md py-xs rounded-full text-xs font-semibold ${
                        role.ativo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {role.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-lg py-md text-center">
                      <button
                        type="button"
                        onClick={() => excluirRole(role.idRole)}
                        className="px-md py-xs bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Excluir
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
