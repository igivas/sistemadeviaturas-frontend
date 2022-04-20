import { EFormaDeAquisicao, EOrigemDeAquisicao } from '../enums/EAquisicao';

export type IAquisicao = {
  id_aquisicao: number;
  id_veiculo: number;
  origem_aquisicao: EOrigemDeAquisicao;
  forma_aquisicao: EFormaDeAquisicao;
  data_aquisicao: string;
  doc_aquisicao: string;
  valor_aquisicao: string;
  criado_por: string;
  criado_em: string;
  id_orgao_aquisicao: number;
  file_path: string;
};
