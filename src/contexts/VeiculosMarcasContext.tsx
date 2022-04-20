import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
  useEffect,
} from 'react';
import { IVeiculoMarca } from '../interfaces/IVeiculosMarcas';
import api from '../services/api';
import { IOptionFormat } from '../interfaces/IOptionFormat';
import { useAuth } from './auth';
import { useVeiculosEspecies } from './VeiculosEspeciesContext';
import { useVeiculo } from './VeiculoContext';
import { useSituacao } from './SituacaoContext';
import { useVeiculosCores } from './VeiculosCoresContext';

type IVeiculosMarcasContextData = {
  marcas: IVeiculoMarca[];
  loadMarcas(): Promise<void>;

  marcasFormated: IOptionFormat[];
};

const VeiculosMarcasContext = createContext<IVeiculosMarcasContextData>(
  {} as IVeiculosMarcasContextData,
);

export const VeiculosMarcasProvider: React.FC = ({ children }) => {
  const [marcas, setMarcas] = useState<IVeiculoMarca[]>([]);
  const { user } = useAuth();
  const { loadUfs } = useVeiculo();
  const { loadEspecies } = useVeiculosEspecies();
  const { loadSituacoesTipos } = useSituacao();
  const { loadCores } = useVeiculosCores();

  const loadMarcas = useCallback(async () => {
    const veiculosMarcas = await api.get<IVeiculoMarca[]>('marcas');
    setMarcas(veiculosMarcas.data);
  }, []);

  const marcasFormated = useMemo(
    () =>
      marcas.map((marcaAtual) => {
        return {
          value: marcaAtual.id_veiculo_marca.toString(),
          label: marcaAtual.nome,
        };
      }),
    [marcas],
  );

  useEffect((): (() => void) | undefined => {
    const timer = setTimeout(async () => {
      if (user) {
        await Promise.all([
          loadEspecies(),
          loadSituacoesTipos(),
          loadUfs(),
          loadMarcas(),
          loadCores(),
        ]);
      }
    }, 25);

    return () => clearTimeout(timer);
  }, [loadEspecies, loadSituacoesTipos, loadUfs, loadMarcas, loadCores, user]);

  return (
    <VeiculosMarcasContext.Provider
      value={{ marcas, loadMarcas, marcasFormated }}
    >
      {children}
    </VeiculosMarcasContext.Provider>
  );
};

export function useVeiculosMarcas(): IVeiculosMarcasContextData {
  const context = useContext(VeiculosMarcasContext);

  if (!context) {
    throw new Error(
      'useVeiculosCores precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
