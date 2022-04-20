import EFase from 'enums/EFase';
import ETipoMovimentacao from '../enums/ETipoMovimentacao';

type OpmFormat = {
  id_opm: number;
  nome: string;
  sigla: string;
};

export type IFieldsTableMovimentacao = {
  identificador?: string;
  url_documento_sga: string;
  url_documento_devolucao_sga: string;
  id_veiculo: number;
  placa?: string;
  chassi?: string;
  renavam?: string;
  id_movimentacao: number;
  id_tipo_movimentacao: ETipoMovimentacao;
  data_movimentacao: Date;
  justificativa: string;
  opm_origem?: OpmFormat;
  assinado_origem: '0' | '1';
  assinado_devolucao_origem: '0' | '1';
  opm_destino?: OpmFormat;
  assinado_destino?: '0' | '1';
  assinado_devolucao_destino: '0' | '1';

  fases?: {
    criado_em: Date;
    id_movimentacao_fase: EFase;
  }[];
  localizacoes: string[];
  oficina?: string;
  observacao: string;
};
