import { IPaginationResponse } from './IPaginationResponse';
import { ISituacao } from '../ISituacao';

export type IGetSituacoesResponse = IPaginationResponse<ISituacao> & {
  situacoes: ISituacao[];
};
