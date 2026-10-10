// Formato devolvido pela API (snake_case, igual às colunas do banco).
export interface Motor {
  id: number;
  codigo: string;
  modelo: string;
  fabricante_id: number;
  fabricante_nome: string;
  potencia_cv: number;
  tensao: string;
  frequencia_hz: number;
  polos: number;
  rotacao_rpm: number;
  carcaca: string | null;
  grau_protecao: string | null;
  preco: number | null;
  criado_em: string;
}

// Dados enviados na criação/edição (sem campos gerados pelo servidor).
export type MotorInput = Omit<Motor, 'id' | 'fabricante_nome' | 'criado_em'>;

export const FREQUENCIAS = [50, 60] as const;
export const POLOS = [2, 4, 6, 8] as const;

// Corpo de erro padrão da API: { error, details? }.
export interface ApiError {
  error: string;
  details?: string[];
}
