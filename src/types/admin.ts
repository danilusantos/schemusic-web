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

export interface AccessPermissionCatalogItem {
  idPermissao: number;
  acaoCodigo: string;
  descricao: string;
}

export interface AccessScreenCatalog {
  grupoCodigo: string;
  grupoNome: string;
  telaCodigo: string;
  telaNome: string;
  permissoes: AccessPermissionCatalogItem[];
}

export interface AccessPermissionGroup {
  grupoCodigo: string;
  grupoNome: string;
  descricao?: string;
  telas: AccessScreenCatalog[];
}

export interface AccessCatalogResponse {
  grupos: AccessPermissionGroup[];
  telas: AccessScreenCatalog[];
}

export interface AccessPermissionGroupSummary {
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
  descricao?: string;
  ativo: boolean;
}

export interface AccessPermissionGroupPayload {
  codigoGrupo: string;
  nomeGrupo: string;
  descricao?: string;
}

export interface AccessPermissionScreenPayload {
  codigoGrupo: string;
  telaCodigo: string;
  telaNome: string;
  descricao?: string;
}

export interface AccessPermissionLink {
  idPermissao: number;
  telaCodigo: string;
  acaoCodigo: string;
  descricao: string;
  porRole: boolean;
  overrideUsuario?: boolean | null;
  efetivo: boolean;
}

export interface AccessLinkResponse {
  tipo: 'role' | 'usuario';
  id: number;
  permissoes: AccessPermissionLink[];
}

export interface CurrentScreenAccess {
  idUsuario: number;
  telaCodigo: string;
  telaNome: string;
  acoes: Record<string, boolean>;
  podeConsultar: boolean;
}

export interface DirectUserPermission {
  idPermissao: number;
  telaCodigo: string;
  telaNome: string;
  acaoCodigo: string;
  descricao: string;
  direta: boolean;
  porRole: boolean;
  efetivo: boolean;
}

export interface DirectUserPermissionsResponse {
  tipo: 'usuario_permissoes_diretas';
  usuario: {
    idUsuario: number;
    nome: string;
    email: string;
    ativo: boolean;
    roles: string[];
  };
  totalPermissoesDiretas: number;
  permissoes: DirectUserPermission[];
}
