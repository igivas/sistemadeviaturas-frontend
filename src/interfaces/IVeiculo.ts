export default interface IVeiculoObject {
  id_veiculo: number;
  id_marca: string;
  id_modelo: string;
  id_cor: string;
  ano_fabricacao: string;
  ano_modelo: string;
  placa: string;
  numero_motor: string;
  renavam: string;
  chassi: string;
  tipo_doc_carga: string;
  data_doc_carga: string;
  data_operacao: string;
  numero_doc_carga: string;
  opm_carga: string;
  opm_carga_lob: string;
  opm_carga_sigla: string;
  combustivel: string;
  id_veiculo_especie: string;
  valor_fipe: string;
  uf: string;
  orgao_tombo: string;
  tombo: string;
  adesivado: string;
  numero_crv: string;
  codigo_seguranca_crv: string;
  observacao: string;
  referenciasPneus: any[];
  veiculoEspecie: { id_veiculo_especie: number; nome: string };
  veiculoMarca: { id_veiculo_marca: number; nome: string };
  veiculoModelo: { id_veiculo_modelo: number; nome: string };
  id_situacao_tipo: string;
}

export type IVeiculoModelo = {
  id_veiculo_modelo: number;
  id_veiculo_marca: number;
  nome: string;
};
