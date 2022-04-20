import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { IVeiculoCores } from '../interfaces/IVeiculosCores';
import api from '../services/api';
import { IOptionFormat } from '../interfaces/IOptionFormat';

type IVeiculosCoresContextData = {
  cores: IVeiculoCores[];
  coresFormated: IOptionFormat[];
  loadCores(): Promise<void>;
};

const VeiculosCoresContext = createContext<IVeiculosCoresContextData>(
  {} as IVeiculosCoresContextData,
);

export const VeiculosCoresProvider: React.FC = ({ children }) => {
  const [cores, setCores] = useState<IVeiculoCores[]>([]);

  const loadCores = useCallback(async () => {
    const veiculosCores = await api.get<IVeiculoCores[]>('veiculos_cores');
    setCores(veiculosCores.data);
  }, []);

  const coresFormated = useMemo(
    () =>
      cores.map((corAtual) => {
        return {
          value: corAtual.id_cor.toString(),
          label: corAtual.nome,
        };
      }),
    [cores],
  );

  return (
    <VeiculosCoresContext.Provider value={{ cores, loadCores, coresFormated }}>
      {children}
    </VeiculosCoresContext.Provider>
  );
};

export function useVeiculosCores(): IVeiculosCoresContextData {
  const context = useContext(VeiculosCoresContext);

  if (!context) {
    throw new Error(
      'useVeiculosCores precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
