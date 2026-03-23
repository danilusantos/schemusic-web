import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState('admin@schemusic.com');
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await login(email, senha);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiErro = (error.response?.data as { erro?: string } | undefined)?.erro;

        if (!error.response) {
          setErro('Falha de conexao com a API. Se estiver local, verifique CORS/proxy e backend ativo.');
        } else if (status === 401) {
          setErro(apiErro ?? 'Credenciais invalidas para o administrador.');
        } else {
          setErro(apiErro ?? `Erro ao autenticar (HTTP ${status}).`);
        }
      } else if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro('Nao foi possivel autenticar. Verifique credenciais e API.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-warm-100 p-6 grid place-items-center">
      <form className="ds-card w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <div>
          <h1 className="ds-page-title text-2xl">SCHEMUSIC ADMIN</h1>
          <p className="ds-page-subtitle mt-1">Acesso administrativo para operacao do sistema.</p>
        </div>

        <div>
          <label htmlFor="email" className="ds-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="ds-input"
          />
        </div>

        <div>
          <label htmlFor="senha" className="ds-label">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
            className="ds-input"
          />
        </div>

        {erro && <div className="ds-alert-error">{erro}</div>}

        <button type="submit" className="ds-btn-primary w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar no painel'}
        </button>
      </form>
    </div>
  );
};
