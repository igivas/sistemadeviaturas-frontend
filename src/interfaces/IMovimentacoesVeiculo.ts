import ETipoMovimentacao from '../enums/ETipoMovimentacao';

export type IMovimentacoesVeiculo = {
  id_movimentacao: number;
  opm_origem: any;
  opm_destino: any;
  tipoMovimentacao: any;
  fases: any;
  data_movimentacao: Date;

  assinado_origem: '0' | '1';
  assinado_devolucao_origem?: '0' | '1';

  id_tipo_movimentacao: ETipoMovimentacao;

  assinado_destino: '0' | '1';
  assinado_devolucao_destino?: '0' | '1';
};
