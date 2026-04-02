import api from './api';
import type {
  AdminAccessList,
  AdminAccessLog,
  AdminAccessSeriesResponse,
  AdminAuthResponse,
  AdminDashboardSummary,
  AdminRole,
  AdminSystemConfig,
  AdminUser,
  AccessCatalogResponse,
  AccessLinkResponse,
  CurrentScreenAccess,
  DirectUserPermissionsResponse,
} from '../types/admin';

export interface AdminUserPayload {
  nome: string;
  email: string;
  senha: string;
  idiomaPadrao?: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface AdminRolePayload {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface AdminSystemConfigPayload {
  chave: string;
  valor: string;
  descricao?: string;
  ativo?: boolean;
}

export interface AdminAccessListPayload {
  tipoLista: string;
  tipoAlvo: string;
  valorAlvo: string;
  observacao?: string;
  ativo?: boolean;
}

export interface UserPermissionOverridePayload {
  idPermissao: number;
  permitido: boolean;
}

export const adminService = {
  login: async (email: string, senha: string) => {
    const response = await api.post<AdminAuthResponse>('/administration/login', {
      email,
      senha,
    });

    const payload = response.data as AdminAuthResponse & {
      token_jwt?: string;
      accessToken?: string;
    };

    const token = payload.token ?? payload.token_jwt ?? payload.accessToken;
    if (!token) {
      throw new Error('Resposta de login sem token');
    }

    return {
      ...payload,
      token,
    };
  },

  listarUsuarios: async (ativo?: boolean, termo?: string) => {
    const response = await api.get<AdminUser[]>('/administration/users', {
      params: {
        ativo,
        termo,
      },
    });
    return response.data;
  },

  criarUsuario: async (payload: AdminUserPayload) => {
    const response = await api.post<AdminUser>('/administration/users', payload);
    return response.data;
  },

  vincularRoles: async (idUsuario: number, roleIds: number[]) => {
    const response = await api.put<AdminUser>(`/administration/users/${idUsuario}/roles`, { roleIds });
    return response.data;
  },

  inativarUsuario: async (idUsuario: number) => {
    await api.put(`/administration/users/${idUsuario}/inativar`);
  },

  ativarUsuario: async (idUsuario: number) => {
    await api.put(`/administration/users/${idUsuario}/ativar`);
  },

  atualizarIdiomaPadraoUsuario: async (idUsuario: number, idiomaPadrao: 'pt-BR' | 'en-US' | 'es-ES') => {
    const response = await api.put<AdminUser>(`/administration/users/${idUsuario}/idioma-padrao`, {
      idiomaPadrao,
    });
    return response.data;
  },

  listarRoles: async () => {
    const response = await api.get<AdminRole[]>('/administration/roles');
    return response.data;
  },

  criarRole: async (payload: AdminRolePayload) => {
    const response = await api.post<AdminRole>('/administration/roles', payload);
    return response.data;
  },

  excluirRole: async (idRole: number) => {
    await api.delete(`/administration/roles/${idRole}`);
  },

  listarConfigs: async () => {
    const response = await api.get<AdminSystemConfig[]>('/administration/system-configs');
    return response.data;
  },

  criarConfig: async (payload: AdminSystemConfigPayload) => {
    const response = await api.post<AdminSystemConfig>('/administration/system-configs', payload);
    return response.data;
  },

  excluirConfig: async (idConfig: number) => {
    await api.delete(`/administration/system-configs/${idConfig}`);
  },

  listarListasAcesso: async (params?: { tipoLista?: string; ativo?: boolean }) => {
    const response = await api.get<AdminAccessList[]>('/administration/access-lists', {
      params,
    });
    return response.data;
  },

  criarListaAcesso: async (payload: AdminAccessListPayload) => {
    const response = await api.post<AdminAccessList>('/administration/access-lists', payload);
    return response.data;
  },

  inativarListaAcesso: async (idListaAcesso: number) => {
    await api.put(`/administration/access-lists/${idListaAcesso}/inativar`);
  },

  listarLogs: async (limite = 50) => {
    const response = await api.get<AdminAccessLog[]>('/administration/access-logs', {
      params: { limite },
    });
    return response.data;
  },

  obterSerieAcessos: async (periodo: 'week' | 'month' | 'year') => {
    const response = await api.get<AdminAccessSeriesResponse>('/administration/access-logs/series', {
      params: { periodo },
    });
    return response.data;
  },

  obterResumoDashboard: async () => {
    const response = await api.get<AdminDashboardSummary>('/administration/dashboard/summary');
    return response.data;
  },

  registrarNavegacaoFrontend: async (payload: {
    rota: string;
    origem: string;
    userAgent: string;
  }) => {
    await api.post('/administration/access-logs/frontend-navigation', payload);
  },

  listarCatalogoAcessos: async () => {
    const response = await api.get<AccessCatalogResponse>('/administration/access-control/catalog');
    return response.data;
  },

  listarPermissoesRole: async (idRole: number) => {
    const response = await api.get<AccessLinkResponse>(`/administration/access-control/roles/${idRole}`);
    return response.data;
  },

  salvarPermissoesRole: async (idRole: number, idsPermissao: number[]) => {
    const response = await api.put<AccessLinkResponse>(`/administration/access-control/roles/${idRole}`, {
      idsPermissao,
    });
    return response.data;
  },

  listarPermissoesUsuario: async (idUsuario: number) => {
    const response = await api.get<AccessLinkResponse>(`/administration/access-control/users/${idUsuario}`);
    return response.data;
  },

  consultarPermissoesDiretasUsuario: async (idUsuario: number) => {
    const response = await api.get<DirectUserPermissionsResponse>(`/administration/access-control/users/${idUsuario}/direct`);
    return response.data;
  },

  consultarPermissoesDiretasUsuarioPorEmail: async (email: string) => {
    const response = await api.get<DirectUserPermissionsResponse>('/administration/access-control/users/direct', {
      params: { email },
    });
    return response.data;
  },

  salvarPermissoesUsuario: async (idUsuario: number, overrides: UserPermissionOverridePayload[]) => {
    const response = await api.put<AccessLinkResponse>(`/administration/access-control/users/${idUsuario}`, {
      overrides,
    });
    return response.data;
  },

  obterAcessoTelaAtual: async (params: { telaCodigo?: string; rota?: string }) => {
    const response = await api.get<CurrentScreenAccess>('/administration/access-control/me', {
      params,
    });
    return response.data;
  },
};
