import React, { createContext, useCallback, useContext } from 'react';
import { useToast } from '@chakra-ui/react';
import { orderBy } from 'lodash';
import { ICreateIdentificadoresResponse } from '../interfaces/Response/ICreateIdentificadoresResponse';
import { IGetIdentificadoresResponse } from '../interfaces/Response/IGetIdentificadoresResponse';
import { IIdentificador } from '../interfaces/IIdentificador';
import api from '../services/api';
import { useVeiculo } from './VeiculoContext';

type IValidateIdentificador = {
  nome: string;
  data_identificador?: Date;
};

type IIdentificadorContextData = {
  loadIdentificadores(id: string): Promise<void>;
  createIdentificador(
    id_veiculo: number,
    novoIdentificador: object,
  ): Promise<IIdentificador | undefined>;
  validateIdentificador(
    identificador: IValidateIdentificador,
  ): Promise<boolean>;
};

const IdentificadorContext = createContext<IIdentificadorContextData>(
  {} as IIdentificadorContextData,
);

export const IdentificadorProvider: React.FC = ({ children }) => {
  const { veiculo, updateVeiculoData } = useVeiculo();

  const toast = useToast();

  const loadIdentificadores = useCallback(
    async (id: string) => {
      const identificadores = await api.get<IGetIdentificadoresResponse>(
        `veiculos/${id}/identificadores`,
      );

      updateVeiculoData({
        identificadores: identificadores.data.items || [],
      });
    },
    [updateVeiculoData],
  );

  const createIdentificador = useCallback(
    async (
      id_veiculo,
      novoIdentificador,
    ): Promise<IIdentificador | undefined> => {
      try {
        const response = await api.post<ICreateIdentificadoresResponse>(
          `veiculos/${id_veiculo}/identificadores`,
          { body: novoIdentificador },
        );

        const {
          data_identificador,
          warning,
          success,
          ...resetResponse
        } = response.data;

        const ano = novoIdentificador.data_identificador.getFullYear();
        const mes = novoIdentificador.data_identificador.getMonth() + 1;
        const dia = novoIdentificador.data_identificador.getDate();

        if (resetResponse.ativo === '1') {
          const indexAtivoIdentificador = veiculo.identificadores.findIndex(
            (identificador) => identificador.ativo === '1',
          );

          if (indexAtivoIdentificador > -1) {
            veiculo.identificadores[indexAtivoIdentificador] = {
              ...veiculo.identificadores[indexAtivoIdentificador],
              ativo: '0',
            };
          }
        }

        const addIdentificador = [
          ...veiculo.identificadores,
          {
            ...resetResponse,
            identificador: novoIdentificador.identificador,
            data_identificador: `${ano}-${mes < 10 ? '0' : ''}${mes}-${
              dia < 10 ? '0' : ''
            }${dia}`,
          },
        ];

        updateVeiculoData({
          identificadores: orderBy(
            addIdentificador,
            ['ativo', 'data_identificador'],
            ['asc', 'desc'],
          ),
        });

        toast({
          title: 'Sucesso!',
          description:
            warning ||
            success ||
            'Identificador atualizado. Houve um erro no servidor de envio de email.',
          status: warning ? 'warning' : 'success',
          duration: 8000,
          isClosable: true,
          position: 'top-right',
        });

        return response.data;
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description:
            error.response.data.message ||
            'Ocorreu um error ao tentar cadastrar o identificador.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [toast, veiculo, updateVeiculoData],
  );

  const validateIdentificador = useCallback(
    async (identificador: IValidateIdentificador) => {
      try {
        await api.get(`/check`, {
          params: {
            query: { identificador },
          },
        });

        return true;
      } catch (error) {
        switch (error.response.status) {
          case 400: {
            toast({
              title: 'Erro',
              description: 'Identificador já existente',
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
        return false;
      }
    },
    [toast],
  );
  return (
    <IdentificadorContext.Provider
      value={{
        loadIdentificadores,
        createIdentificador,
        validateIdentificador,
      }}
    >
      {children}
    </IdentificadorContext.Provider>
  );
};

export function useIdentificador(): IIdentificadorContextData {
  const context = useContext(IdentificadorContext);

  if (!context) {
    throw new Error(
      'useIdentificador precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
