import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';

export const RouteAccessMiddleware = () => {
  const location = useLocation();
  const ultimaRotaRef = useRef<string>('');

  useEffect(() => {
    const rotaAtual = `${location.pathname}${location.search}${location.hash}`;

    // Evita duplicidade quando o React remonta componentes sem mudanca de rota.
    if (rotaAtual === ultimaRotaRef.current) {
      return;
    }
    ultimaRotaRef.current = rotaAtual;

    void adminService.registrarNavegacaoFrontend({
      rota: rotaAtual,
      origem: globalThis.location.origin,
      userAgent: navigator.userAgent,
    }).catch(() => {
      // O middleware nao deve quebrar a navegacao caso o log falhe.
    });
  }, [location.hash, location.pathname, location.search]);

  return null;
};
