import { IIdentificador } from 'interfaces/IIdentificador';

export type ICreateIdentificadoresResponse = IIdentificador & {
  warning?: string;
  success?: string;
};
