export interface AdminAuthResponse {
  id: number;
  nome: string;
  perfil: string;
  token: string;
}

export interface AdminUser {
  idUsuario: number;
  nome: string;
  email: string;
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
