import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { IVeiculoEspecie } from '../interfaces/IVeiculosEspecies';
import api from '../services/api';
import { IOptionFormat } from '../interfaces/IOptionFormat';

type IVeiculosEspeciesContextData = {
  especies: IVeiculoEspecie[];
  loadEspecies(): Promise<void>;
  especiesFormated: IOptionFormat[];
};

const VeiculosEspeciesContext = createContext<IVeiculosEspeciesContextData>(
  {} as IVeiculosEspeciesContextData,
);

export const VeiculosEspeciesProvider: React.FC = ({ children }) => {
  const [especies, setEspecies] = useState<IVeiculoEspecie[]>([]);

  const loadEspecies = useCallback(async (): Promise<void> => {
    const veiculosEspecies = await api.get<IVeiculoEspecie[]>(
      'veiculos_especies',
    );
    setEspecies(veiculosEspecies.data);
  }, []);

  const especiesFormated = useMemo(
    () =>
      especies.map((esp) => {
        return {
          value: esp.id_veiculo_especie.toString(),
          label: esp.nome,
        };
      }),
    [especies],
  );

  return (
    <VeiculosEspeciesContext.Provider
      value={{ especies, loadEspecies, especiesFormated }}
    >
      {children}
    </VeiculosEspeciesContext.Provider>
  );
};

export function useVeiculosEspecies(): IVeiculosEspeciesContextData {
  const context = useContext(VeiculosEspeciesContext);

  if (!context) {
    throw new Error(
      'useVeiculosEspecies precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
