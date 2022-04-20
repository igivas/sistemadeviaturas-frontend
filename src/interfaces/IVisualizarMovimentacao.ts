import EFase from '../enums/EFase';
import ETipoMovimentacao from '../enums/ETipoMovimentacao';

export type IVisualizarMovimentacao = {
  chassi: string;
  placa: string;
  renavam: string;
  tipo_movimentacao: ETipoMovimentacao;
  data_movimentacao: Date;
  fases: {
    criado_em: Date;
    id_movimentacao_fase: number;
    id_tipo_fase: EFase;
    assinado_por: string;
    assinado_devolucao_destino_por?: string;
  }[];
  localizacoes?: string[];
  url_documento_sga?: string;
  url_documento_devolucao_sga?: string;
  identificador: string;
};
