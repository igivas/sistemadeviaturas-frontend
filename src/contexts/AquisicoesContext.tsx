import React, { createContext, useCallback, useContext, useState } from 'react';
import { IAquisicao } from 'interfaces/IAquisicao';
import { useToast } from '@chakra-ui/react';
import { orderBy } from 'lodash';
import api from '../services/api';
import { useVeiculo } from './VeiculoContext';
import { EOrigemDeAquisicao, EFormaDeAquisicao } from '../enums/EAquisicao';

type ICreateAquisicao = {
  origem_aquisicao: EOrigemDeAquisicao;
  id_orgao_aquisicao?: string;
  aquisicao_file?: any;
  data_aquisicao: Date;
  doc_aquisicao: string;
  forma_aquisicao: EFormaDeAquisicao;
  valor_aquisicao: string;
};

type IAquisicoesVeiculosContextData = {
  createAquisicao(
    data: ICreateAquisicao,
    id_veiculo?: number,
    id_aquisicao?: number,
  ): Promise<IAquisicao | undefined>;

  updateAquisicao(
    data: ICreateAquisicao,
    id_aquisicao: number,
  ): Promise<IAquisicao | undefined>;

  aquisicaoFile?: File;
  loadAquisicoes(id: string): Promise<void>;
};

const AquisicoesVeiculosContext = createContext<IAquisicoesVeiculosContextData>(
  {} as IAquisicoesVeiculosContextData,
);

export const AquisicoesVeiculosProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { updateVeiculoData, veiculo } = useVeiculo();
  const [aquisicaoFile, setAquisicaoFile] = useState<File>();

  const handleFormDataAquisicao = useCallback(
    (data: { aquisicao_file: File } & ICreateAquisicao) => {
      const { aquisicao_file, ...rest } = data;
      const formData = new FormData();
      formData.append('aquisicao_file', aquisicao_file);
      formData.append('body', JSON.stringify(rest));

      return formData;
    },
    [],
  );

  const loadAquisicoes = useCallback(
    async (id: string) => {
      const aquisicaoResponse = await api.get<IAquisicao[]>(
        `/veiculos/${id}/aquisicoes`,
      );

      const lastFileVeiculoAquisicao = aquisicaoResponse.data[0].file_path;

      const file_response = lastFileVeiculoAquisicao
        ? await api.get<Blob>(lastFileVeiculoAquisicao, {
            responseType: 'blob',
          })
        : undefined;

      const strippedFileName = lastFileVeiculoAquisicao?.split('aquisicao/');

      setAquisicaoFile(
        file_response
          ? new File([file_response.data], strippedFileName[1], {
              type: file_response.data.type,
            })
          : undefined,
      );

      updateVeiculoData({
        aquisicoes: aquisicaoResponse.data,
      });
    },
    [updateVeiculoData],
  );

  const updateAquisicao = useCallback(
    async (
      aquisicaoToUpdate: ICreateAquisicao,

      id_aquisicao: number,
    ): Promise<IAquisicao | undefined> => {
      const { aquisicao_file: newFile, ...restAquisicao } = aquisicaoToUpdate;
      let response;

      try {
        if (newFile && !!newFile.size) {
          const formData = handleFormDataAquisicao({
            ...aquisicaoToUpdate,
            aquisicao_file: aquisicaoToUpdate.aquisicao_file as File,
          });

          response = await api.put<IAquisicao>(
            `/aquisicoes/${id_aquisicao}`,
            formData,
          );
        } else {
          response = await api.put<IAquisicao>(`/aquisicoes/${id_aquisicao}`, {
            body: restAquisicao,
          });
        }

        const indexAtivoAquisicao = veiculo.aquisicoes.findIndex(
          (aquisicao) => aquisicao.id_aquisicao === id_aquisicao,
        );

        if (indexAtivoAquisicao > -1) {
          veiculo.aquisicoes[indexAtivoAquisicao] = response.data;
        }

        toast({
          title: 'Sucesso!',
          description: 'Aquisicao do veiculo atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        const updatedListAquisicao = [...veiculo.aquisicoes];
        updateVeiculoData({
          aquisicoes: orderBy(
            updatedListAquisicao,
            ['ativo', 'data_aquisicao'],
            ['asc', 'desc'],
          ),
        });
        return response.data;
      } catch (error) {
        toast({
          title: 'Erro.',
          description: 'Erro ao criar aquisicao' || error.response.data.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [handleFormDataAquisicao, toast, veiculo, updateVeiculoData],
  );

  const createAquisicao = useCallback(
    async (
      novaAquisicao: ICreateAquisicao,
      id_veiculo?: number,
      id_aquisicao?: number,
    ): Promise<IAquisicao | undefined> => {
      let response;
      const { aquisicao_file: newFile, ...restAquisicao } = novaAquisicao;

      try {
        if (newFile && !!newFile.size) {
          const formData = handleFormDataAquisicao({
            ...novaAquisicao,
            aquisicao_file: novaAquisicao.aquisicao_file as File,
          });

          response = await api.post<IAquisicao>(
            `/veiculos/${id_veiculo}/aquisicoes`,
            formData,
          );
        } else {
          response = await api.post<IAquisicao>(
            `/veiculos/${id_veiculo}/aquisicoes`,
            {
              body: restAquisicao,
            },
          );
        }

        toast({
          title: 'Sucesso!',
          description: 'Aquisicao do veiculo criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        const updatedListAquisicao = [...veiculo.aquisicoes, response.data];
        updateVeiculoData({
          aquisicoes: orderBy(
            updatedListAquisicao,
            ['ativo', 'data_aquisicao'],
            ['asc', 'desc'],
          ),
        });

        return response.data as IAquisicao;
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description:
            (error.response && error.response.message) ||
            'Ocorreu um error ao tentar aquisicao do veículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [handleFormDataAquisicao, updateVeiculoData, veiculo.aquisicoes, toast],
  );

  return (
    <AquisicoesVeiculosContext.Provider
      value={{
        createAquisicao,
        loadAquisicoes,
        aquisicaoFile,
        updateAquisicao,
      }}
    >
      {children}
    </AquisicoesVeiculosContext.Provider>
  );
};

export function useAquisicao(): IAquisicoesVeiculosContextData {
  const context = useContext(AquisicoesVeiculosContext);

  if (!context)
    throw new Error(
      'useAquisicao precisa estar dentro de VeiculoContext provider',
    );

  return context;
}
