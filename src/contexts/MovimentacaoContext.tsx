import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useRef } from 'react';
import { IFieldsTableMovimentacao } from '../interfaces/IFieldsTableMovimentacao';
import ETipoMovimentacao from '../enums/ETipoMovimentacao';
import { IOptionFormat } from '../interfaces/IOptionFormat';
import EFase from '../enums/EFase';
import api from '../services/api';
import { useAuth } from './auth';
import { IGetMovimentacoesVeiculoResponse } from '../interfaces/Response/IGetMovimentacoesVeiculoResponse';
import { IMovimentacoesVeiculo } from '../interfaces/IMovimentacoesVeiculo';
import { useVeiculo } from './VeiculoContext';

interface IMovimentacao {
  id_veiculo: number;
  id_opm_origem: string;
  autoridade_origem: string;
  id_opm_destino: string;
  tipo_movimentacao: string;
  observacao: string;
  data_movimentacao: Date;
  movimentacao_file: File;
}

interface IMovimentacaoContextData {
  loadMovimentacoesVeiculo(
    id: string,
  ): Promise<IMovimentacoesVeiculo[] | undefined>;

  createMovimentacao(
    novaMovimentacao: object,
    id_veiculo: number,
  ): Promise<
    | (IMovimentacao & { url_documento_sga: string; id_movimentacao: number })
    | undefined
  >;
  handleFaseMovimentacao(row: IFieldsTableMovimentacao): boolean;

  tiposMovimentacoes: IOptionFormat[];
  fases: IOptionFormat[];
}

const MovimentacaoContext = createContext<IMovimentacaoContextData>(
  {} as IMovimentacaoContextData,
);

export const MovimentacaoProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { signOut, user } = useAuth();
  const { updateVeiculoData } = useVeiculo();
  const toastWarningId = useRef<string | number>();

  const tiposMovimentacoes = useMemo(
    () =>
      Object.entries(ETipoMovimentacao).reduce(
        (objectTipoMovimentacao: IOptionFormat[], tipoMovimentacao) => {
          return typeof tipoMovimentacao[1] === 'string'
            ? [
                ...objectTipoMovimentacao,
                {
                  value: tipoMovimentacao[0],
                  label: tipoMovimentacao[1],
                },
              ]
            : [...objectTipoMovimentacao];
        },
        [] as IOptionFormat[],
      ),
    [],
  );

  const fases = useMemo(
    () =>
      Object.entries(EFase).reduce(
        (objectTipoMovimentacao: IOptionFormat[], tipoMovimentacao) => {
          return typeof tipoMovimentacao[1] === 'string'
            ? [
                ...objectTipoMovimentacao,
                {
                  value: tipoMovimentacao[0],
                  label: tipoMovimentacao[1],
                },
              ]
            : [...objectTipoMovimentacao];
        },
        [] as IOptionFormat[],
      ),
    [],
  );

  const loadMovimentacoesVeiculo = useCallback(
    async (id: string) => {
      const movimentacoes = await api.get<IGetMovimentacoesVeiculoResponse>(
        `veiculos/${id}/movimentacoes`,
      );
      updateVeiculoData({ movimentacoes: movimentacoes.data.items });

      return movimentacoes.data.items;
    },
    [updateVeiculoData],
  );

  const createMovimentacao = useCallback(
    async (
      novaMovimentacao,
      id_veiculo: number,
    ): Promise<
      | (IMovimentacao & { url_documento_sga: string; id_movimentacao: number })
      | undefined
    > => {
      if (user)
        try {
          const {
            movimentacao_file,
            id_tipo_movimentacao_fase,
            ...restNewMovimentacao
          } = novaMovimentacao;
          let response;

          toastWarningId.current = toast({
            title: 'Aviso!',
            description: 'Processando movimentacao...',
            status: 'warning',
            duration: 15000,
            isClosable: true,
            position: 'top-right',
          });

          if (movimentacao_file) {
            const formData = new FormData();
            formData.append('movimentacao_file', movimentacao_file);
            formData.append(
              'body',
              JSON.stringify({
                ...restNewMovimentacao,
                id_tipo_movimentacao_fase: EFase.Recebimento,
                opms: user.opmBusca.value
                  .split(',')
                  .map((opm) => Number.parseInt(opm, 10)),
              }),
            );
            response = await api.post(
              `veiculos/${id_veiculo}/movimentacoes`,
              formData,
            );
          } else {
            response = await api.post(`veiculos/${id_veiculo}/movimentacoes`, {
              body: {
                ...restNewMovimentacao,
                id_tipo_movimentacao_fase,
                opms: user.opmBusca.value
                  .split(',')
                  .map((opm) => Number.parseInt(opm, 10)),
              },
            });
          }

          toast.close(toastWarningId.current as number | string);

          toast({
            title: 'Sucesso!',
            description: 'Movimentação cadastrada.',
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });

          return response.data;
        } catch (error) {
          toast.close(toastWarningId.current as number | string);
          if (error.response && error.response?.status === 401) signOut();

          toast({
            title: 'Ocorreu um erro.',
            description:
              error.response?.data.message ||
              'Ocorreu um erro ao cadastrar a movimentação.',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
          return undefined;
        }
    },
    [toast, signOut, user],
  );

  const handleFaseMovimentacao = useCallback(
    (row: IFieldsTableMovimentacao): boolean => {
      if (row.fases?.[0].id_movimentacao_fase === EFase.Recusado) {
        toast({
          title: 'Ocorreu um erro.',
          description: 'Não pode movimentar um veiculo já recusado',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return false;
      }

      switch (row.id_tipo_movimentacao) {
        case ETipoMovimentacao.Transferência:
          if (
            row.fases &&
            row.fases[0].id_movimentacao_fase === EFase.Recebimento &&
            row.assinado_origem === '1' &&
            row.assinado_destino === '1'
          ) {
            toast({
              title: 'Ocorreu um erro.',
              description: 'Documentos já assinados',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            return false;
          }

          return true;

        case ETipoMovimentacao.Empréstimo:
          if (
            row.fases &&
            row.fases[0].id_movimentacao_fase === EFase.Recebimento &&
            row.assinado_origem === '1' &&
            (row.assinado_destino === '1' ||
              row.opm_destino?.sigla === user.opm?.sigla) &&
            row.assinado_devolucao_origem === '1' &&
            (row.assinado_devolucao_destino === '1' ||
              row.opm_destino === user.opm?.sigla)
          ) {
            toast({
              title: 'Ocorreu um erro.',
              description: 'Documentos já assinados',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            return false;
          }

          if (
            row.fases?.[0].id_movimentacao_fase === EFase.Recebimento &&
            row.assinado_origem === '0' &&
            row.assinado_destino === '0'
          ) {
            toast({
              title: 'Ocorreu um erro.',
              description: 'Devolução só ocorre apos recebimento',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            return false;
          }

          return true;

        case ETipoMovimentacao['Em Manutenção']:
          if (
            row.fases?.[0].id_movimentacao_fase === EFase.Vistoria &&
            row.assinado_origem === '1'
          ) {
            toast({
              title: 'Ocorreu um erro.',
              description: 'Não Assinar uma manutenção que já foi assinado',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            return false;
          }

          return true;
        default:
          return false;
      }
    },
    [toast, user],
  );

  return (
    <MovimentacaoContext.Provider
      value={{
        createMovimentacao,
        loadMovimentacoesVeiculo,
        handleFaseMovimentacao,
        tiposMovimentacoes,
        fases,
      }}
    >
      {children}
    </MovimentacaoContext.Provider>
  );
};

export function useMovimentacao(): IMovimentacaoContextData {
  const context = useContext(MovimentacaoContext);

  if (!context) {
    throw new Error(
      'useMovimentacao precisa estar dentro de MovimentacaoContext provider',
    );
  }
  return context;
}
