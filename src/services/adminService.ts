import api from './api';
import type {
  AdminAccessList,
  AdminAccessLog,
  AdminAuthResponse,
  AdminRole,
  AdminSystemConfig,
  AdminUser,
} from '../types/admin';

export interface AdminUserPayload {
  nome: string;
  email: string;
  senha: string;
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

  listarUsuarios: async () => {
    const response = await api.get<AdminUser[]>('/administration/users');
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

  listarListasAcesso: async () => {
    const response = await api.get<AdminAccessList[]>('/administration/access-lists');
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

  registrarNavegacaoFrontend: async (payload: {
    rota: string;
    origem: string;
    userAgent: string;
  }) => {
    await api.post('/administration/access-logs/frontend-navigation', payload);
  },
};
