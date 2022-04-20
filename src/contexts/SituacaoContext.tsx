import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useToast } from '@chakra-ui/react';

import { orderBy } from 'lodash';
import { IOptionFormat } from '../interfaces/IOptionFormat';
import api from '../services/api';
import { useVeiculo } from './VeiculoContext';
import { IGetSituacoesResponse } from '../interfaces/Response/IGetSituacoesResponse';

interface ISituacaoTipo {
  id_situacao_tipo: number;
  nome: string;
  motivos: {
    especificacao: string;
    id_situacao_especificacao: number;
  }[];
  localizacoes: string[];
}

interface ISituacaoContextData {
  createSituacao(
    novaSituacao: object,
    nome: string,
  ): Promise<object | undefined>;

  loadSituacoesVeiculo(id: string): Promise<void>;

  loadSituacoesTipos(): Promise<void>;
  situacoesTipos: ISituacaoTipo[];
  situacoesFormated: IOptionFormat[];
}

const SituacaoContext = createContext<ISituacaoContextData>(
  {} as ISituacaoContextData,
);

export const SituacaoProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { veiculo, updateVeiculoData } = useVeiculo();

  const [situacoesTipos, setSituacoesTipos] = useState<ISituacaoTipo[]>([]);

  const loadSituacoesTipos = useCallback(async () => {
    const { data } = await api.get<ISituacaoTipo[]>('situacoes_tipos');

    setSituacoesTipos(data);
  }, []);

  const situacoesFormated = useMemo(() => {
    return situacoesTipos.map<IOptionFormat>((situacaoTipo) => ({
      label: situacaoTipo.nome,
      value: situacaoTipo.id_situacao_tipo.toString(),
    }));
  }, [situacoesTipos]);

  const createSituacao = useCallback(
    async (novaSituacao, nome: string): Promise<object | undefined> => {
      try {
        const response = await api.post(
          `veiculos/${veiculo.id_veiculo}/situacoes`,
          novaSituacao,
        );

        const { body } = novaSituacao;

        const [newNome, motivo] = nome.includes(' - ')
          ? nome.split(' - ')
          : [nome, undefined];

        const addedSituacao = [
          {
            ...body,
            criado_em: response.data.criado_em,
            data_situacao: response.data.data_situacao,
            nome: newNome,
            motivo,
          },
          ...veiculo.situacoes,
        ];

        updateVeiculoData({
          situacoes: orderBy(
            addedSituacao,
            ['data_situacao', 'km'],
            ['desc', 'desc'],
          ),
        });
        toast({
          title: 'Sucesso!',
          description: 'Situação cadastrada.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return response.data;
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description:
            error.response.data.message ||
            'Ocorreu um erro ao cadastrar a situação.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [toast, veiculo.id_veiculo, updateVeiculoData, veiculo.situacoes],
  );

  const loadSituacoesVeiculo = useCallback(
    async (id: string) => {
      const situacoes = await api.get<IGetSituacoesResponse>(
        `veiculos/${id}/situacoes`,
      );

      updateVeiculoData({
        situacoes: situacoes.data.situacoes,
      });
    },
    [updateVeiculoData],
  );

  return (
    <SituacaoContext.Provider
      value={{
        createSituacao,
        loadSituacoesVeiculo,

        loadSituacoesTipos,
        situacoesTipos,
        situacoesFormated,
      }}
    >
      {children}
    </SituacaoContext.Provider>
  );
};

export function useSituacao(): ISituacaoContextData {
  const context = useContext(SituacaoContext);

  if (!context) {
    throw new Error(
      'useSituacao precisa estar dentro de SituaçãoContext provider',
    );
  }
  return context;
}
