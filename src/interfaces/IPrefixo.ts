import { EEmprego, EPrefixoTipo } from '../enums/EPrefixo';

export type IPrefixo = {
  emprego: EEmprego;
  prefixo_sequencia: string;
  prefixo_tipo: EPrefixoTipo;
  data_prefixo: string;
};
