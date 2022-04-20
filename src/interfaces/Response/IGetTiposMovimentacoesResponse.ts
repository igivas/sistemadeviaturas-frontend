import { IFase } from '../IFase';

export type IGetTiposMovimentacoesResponse = {
  id_tipo_movimentacao: number;
  tipo_movimentacao: string;
  fases: IFase;
}[];
