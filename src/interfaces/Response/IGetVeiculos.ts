import { EOrigemDeAquisicao } from '../../enums/EAquisicao';
import { IPaginationResponse } from './IPaginationResponse';

type IVeiculo = {
  id_veiculo: number;
  ano_fabricacao: string;
  aquisicao: EOrigemDeAquisicao;
  identificador: string;
  marca: string;
  modelo: string;
  motivo: string;
  opm: string;
  opm_sigla: string;
  placa: string;
  situacao: string;
};

export type IGetVeiculos = IPaginationResponse<IVeiculo>;
