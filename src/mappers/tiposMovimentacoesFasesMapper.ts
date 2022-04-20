import ETipoMovimentacao from '../enums/ETipoMovimentacao';
import EFase from '../enums/EFase';

// eslint-disable-next-line import/prefer-default-export
export const movimentacoesFasesMapper = {
  [ETipoMovimentacao.Transferência]: [
    EFase.Oferta,
    EFase.Recusado,
    EFase.Entrega,
  ],
  [ETipoMovimentacao['Em Manutenção']]: [EFase.Entrega],

  [ETipoMovimentacao.Empréstimo]: [
    EFase.Oferta,
    EFase.Recusado,
    EFase.Recebimento,
    EFase.Devolução,
  ],
};
