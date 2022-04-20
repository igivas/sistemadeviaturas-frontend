import React, { createContext, useCallback, useContext } from 'react';

import { useToast } from '@chakra-ui/react';
import { orderBy } from 'lodash';
import { IPrefixo } from '../interfaces/IPrefixo';
import api from '../services/api';
import { EPrefixoTipo, EEmprego } from '../enums/EPrefixo';
import { IOptionFormat } from '../interfaces/IOptionFormat';
import prefixoMapper from '../mappers/prefixo';
import { useVeiculo } from './VeiculoContext';

type IPrefixoContextData = {
  optionsEmpregos(prefixoTipo: EPrefixoTipo): IOptionFormat[];
  createPrefixo(
    id_veiculo: number,
    novoPrefixo: object,
  ): Promise<IPrefixo | undefined>;

  validatePrefixo(
    prefixoTipo: EPrefixoTipo,
    prefixoSequencia: string,
  ): Promise<boolean>;

  loadPrefixos(id: string): Promise<void>;
};

const PrefixoContext = createContext<IPrefixoContextData>(
  {} as IPrefixoContextData,
);

export const PrefixoProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { veiculo, updateVeiculoData } = useVeiculo();

  const loadPrefixos = useCallback(
    async (id: string) => {
      const situacoes = await api.get<IPrefixo[]>(`veiculos/${id}/prefixos`);

      updateVeiculoData({
        prefixos: situacoes.data,
      });
    },
    [updateVeiculoData],
  );

  const optionsEmpregos = useCallback((prefixoTipo: EPrefixoTipo) => {
    if (prefixoTipo) {
      const empregoArray = prefixoMapper[prefixoTipo];

      return empregoArray.map<IOptionFormat>((emprego) => {
        const result = Object.entries(EEmprego).filter(
          (tipoEmprego) => tipoEmprego[1] === emprego,
        );

        return {
          label: result[0][0],
          value: result[0][1],
        };
      });
    }

    return [];
  }, []);

  const createPrefixo = useCallback(
    async (id_veiculo, novoPrefixo): Promise<IPrefixo | undefined> => {
      try {
        const response = await api.post(
          `veiculos/${id_veiculo}/prefixos`,
          novoPrefixo,
        );

        /* const ano = novoPrefixo.data_prefixo.getFullYear();
        const mes = novoPrefixo.data_prefixo.getMonth() + 1;
        const dia = novoPrefixo.data_prefixo.getDate(); */

        const { body } = novoPrefixo;

        const addedPrefixo = [
          {
            ...body,
            criado_em: response.data.criado_em,
          },
          ...veiculo.prefixos,
          /* {
              ...novoPrefixo,
              data_prefixo: `${ano}-${mes < 10 ? '0' : ''}${mes}-${
                dia < 10 ? '0' : ''
              }${dia}`,
            }, */
        ];

        updateVeiculoData({
          prefixos: orderBy(addedPrefixo, ['criado_em'], ['desc']),
        });
        return response.data;
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description:
            error.response.data.message ||
            'Ocorreu um error ao tentar cadastrar o prefixo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [toast, veiculo.prefixos, updateVeiculoData],
  );

  const validatePrefixo = useCallback(
    async (prefixoTipo: EPrefixoTipo, prefixoSequencia: string) => {
      try {
        await api.get(`/check`, {
          params: {
            query: {
              prefixo: {
                prefixo_tipo: prefixoTipo,
                prefixo_sequencia: prefixoSequencia,
              },
            },
          },
        });

        return true;
      } catch (error) {
        switch (error.response.status) {
          case 400: {
            toast({
              title: 'Erro',
              description:
                error.response.data.message || 'Prefixo já existente',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });

            break;
          }

          default: {
            /* empty */
          }
        }
      }
      return false;
    },
    [toast],
  );

  return (
    <PrefixoContext.Provider
      value={{
        loadPrefixos,
        createPrefixo,
        validatePrefixo,
        optionsEmpregos,
      }}
    >
      {children}
    </PrefixoContext.Provider>
  );
};

export function usePrefixo(): IPrefixoContextData {
  const context = useContext(PrefixoContext);

  if (!context) {
    throw new Error(
      'usePrefixo precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
