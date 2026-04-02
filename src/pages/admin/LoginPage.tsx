import { useState } from 'react';
import type * as React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminButton } from '../../components/admin/AdminButton';
import { LockIcon } from '../../icons';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated } = useAdminAuth();
  const { t, tf } = useLabels();
  const [email, setEmail] = useState('admin@schemusic.com');
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [showNoAccessModal, setShowNoAccessModal] = useState(false);
  const [erro, setErro] = useState('');

  if (isAuthenticated && !isCheckingAccess && !showNoAccessModal) {
    return <Navigate to="/admin" replace />;
  }

  const hasAtLeastOneConsultarAccess = async () => {
    try {
      const catalog = await adminService.listarCatalogoAcessos();

      const settled = await Promise.allSettled(
        catalog.telas.map((screen) => adminService.obterAcessoTelaAtual({ telaCodigo: screen.telaCodigo })),
      );

      return settled.some((result) => result.status === 'fulfilled' && Boolean(result.value.podeConsultar));
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');
    setLoading(true);
    setIsCheckingAccess(true);

    try {
      await login(email, senha);

      const hasAccess = await hasAtLeastOneConsultarAccess();
      if (!hasAccess) {
        logout();
        setShowNoAccessModal(true);
        return;
      }

      navigate('/admin', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiErro = (error.response?.data as { erro?: string } | undefined)?.erro;

        if (!error.response) {
          setErro(t('login.error_no_connection'));
        } else if (status === 401) {
          setErro(apiErro ?? t('login.error_invalid_credentials'));
        } else {
          setErro(apiErro ?? tf('login.error_auth_failed', { status: status ?? 'Unknown' }));
        }
      } else if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(t('login.error_generic'));
      }
    } finally {
      setLoading(false);
      setIsCheckingAccess(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card w-full max-w-md" onSubmit={handleSubmit}>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-burnt text-lg font-bold text-white">SM</div>
          <div>
            <h1 className="text-2xl font-bold text-warm-900">{t('login.title')}</h1>
            <p className="text-sm text-warm-600">{t('login.subtitle')}</p>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="ds-label">{t('login.email_label')}</label>
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
          <label htmlFor="senha" className="ds-label">{t('login.senha_label')}</label>
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

        <button type="submit" className="ds-btn-primary w-full inline-flex items-center justify-center gap-2" disabled={loading || isCheckingAccess}>
          {loading || isCheckingAccess ? null : <LockIcon className="h-4 w-4" />}
          {loading || isCheckingAccess ? t('login.submit_loading') : t('login.submit_button')}
        </button>
      </form>

      <AdminModal
        isOpen={showNoAccessModal}
        title={t('login.no_access_title')}
        subtitle={t('login.no_access_message')}
        onClose={() => setShowNoAccessModal(false)}
      >
        <AdminButton type="button" className="w-full" onClick={() => setShowNoAccessModal(false)}>
          {t('login.no_access_close')}
        </AdminButton>
      </AdminModal>
    </div>
  );
};
