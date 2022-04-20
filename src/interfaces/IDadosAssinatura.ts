export type IDadosAssinatura = {
  id_veiculo: number;
  id_movimentacao: number;
  tipo_movimentacao: number;
  placa: string;
  opm_origem: string;
  data_movimentacao: string;
  km_atual: number;
  assinado_origem: '0' | '1';
  assinado_devolucao_origem?: '0' | '1';

  url_documento_sga: string;

  // Transferencia
  opm_destino?: string;
  assinado_destino: '0' | '1';
  assinado_devolucao_destino?: '0' | '1';

  // Manutencao
  oficina?: string;
};
