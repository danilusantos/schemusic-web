export interface AdminAuthResponse {
  id: number;
  nome: string;
  perfil: string;
  token: string;
  idiomaPadrao: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface AdminUser {
  idUsuario: number;
  nome: string;
  email: string;
  idiomaPadrao: 'pt-BR' | 'en-US' | 'es-ES';
  ativo: boolean;
  dataCadastro?: string;
  roles: string[];
}

export interface AdminRole {
  idRole: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

export interface AdminSystemConfig {
  idConfig: number;
  chave: string;
  valor: string;
  descricao: string;
  ativo: boolean;
}

export interface AdminAccessList {
  idListaAcesso: number;
  tipoLista: string;
  tipoAlvo: string;
  valorAlvo: string;
  observacao: string;
  ativo: boolean;
}

export interface AdminAccessLog {
  idAcesso: number;
  metodo: string;
  caminho: string;
  ip: string;
  userId: string;
  statusHttp: number;
  dataAcesso: string;
}

export interface AdminDashboardSummary {
  totalUsuarios: number;
  totalRoles: number;
  totalListasAcesso: number;
  totalLogs: number;
  totalLogsUltimas24h: number;
  totalConfigs: number;
}

export interface AdminAccessSeriesPoint {
  referencia: string;
  label: string;
  total: number;
}

export interface AdminAccessSeriesResponse {
  periodo: 'week' | 'month' | 'year';
  pontos: AdminAccessSeriesPoint[];
}
