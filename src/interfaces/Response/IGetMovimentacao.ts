import EFase from '../../enums/EFase';
import ETipoMovimentacao from '../../enums/ETipoMovimentacao';

export type IGetMovimentacao = {
  criado_por: string;
  data_movimentacao: Date;
  fases: {
    assinado_por: string;
    criado_em: Date;
    criado_por: string;
    id_tipo_fase: EFase;
    id_movimentacao_fase: number;
    assinado_devolucao_por?: string;
  }[];
  observacao?: string;
  tipo_movimentacao: ETipoMovimentacao;
  url_documento_sga: string;
  url_documento_devolucao_sga?: string;
  placa: string;
  chassi: string;
  renavam: string;
  identificador: string;
  localizacoes?: string[];
};
