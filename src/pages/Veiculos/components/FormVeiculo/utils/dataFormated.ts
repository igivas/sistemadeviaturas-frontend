type OptionsReferenciasPneus = { value: string; label: string };

export const formatReferenciasPneus = (
  referenciasPneus: OptionsReferenciasPneus[],
): Array<{ id_pneu: number }> => {
  return referenciasPneus.map<{ id_pneu: number }>((referenciaPneu) => ({
    id_pneu: Number(referenciaPneu.value),
  }));
};
