import { IOptionFormat } from './IOptionFormat';

export default interface IVeiculoMovimentacao {
  id_veiculo: string;
  marca: string;
  modelo: string;
  placa: IOptionFormat;
  renavam: IOptionFormat;
  prefixo?: { prefixo_sequencia: string }[];
}
