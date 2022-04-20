import { useToast } from '@chakra-ui/react';
import { orderBy } from 'lodash';
import React, { useContext, useState, createContext, useCallback } from 'react';

import { useMemo } from 'react';
import { IReferenciaPneu } from '../interfaces/IReferenciaPneu';
import IKm from '../interfaces/IKms';
import api from '../services/api';
import { IOptionFormat } from '../interfaces/IOptionFormat';

type IKmContextData = {
  kms: IKm[];
  referenciasPneus: IReferenciaPneu[];
  loadKms(id: string): Promise<void>;
  loadReferenciasPneus(): Promise<void>;
  createKm(novoKm: object, id_veiculo: number): Promise<IKm | undefined>;
  createReferenciasPneus(
    novaReferencia: object,
  ): Promise<IReferenciaPneu[] | undefined>;
  optionsReferenciasPneus: IOptionFormat[];
};

const KmsContext = createContext<IKmContextData>({} as IKmContextData);

export const KmsProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const [kms, setKms] = useState<IKm[]>([]);
  const [referenciasPneus, setReferenciasPneus] = useState<IReferenciaPneu[]>(
    [],
  );

  const loadKms = useCallback(async (id: string): Promise<void> => {
    const loadedKms = await api.get<IKm[]>(`veiculos/${id}/kms`);

    setKms(loadedKms.data);
  }, []);

  const createKm = useCallback(
    async (novoKm: object, id_veiculo: number): Promise<IKm | undefined> => {
      try {
        const response = await api.post<IKm>(`veiculos/${id_veiculo}/kms`, {
          body: novoKm,
        });

        const addedKm = [
          {
            ...response.data,
          },
          ...kms,
        ];

        setKms(orderBy(addedKm, ['data_km'], ['desc']));

        toast({
          title: 'Sucesso!',
          description: 'Km cadastrado com sucesso.',
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
            'Ocorreu um error ao tentar cadastrar o prefixo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [kms, toast],
  );

  const optionsReferenciasPneus = useMemo(() => {
    return referenciasPneus.map<IOptionFormat>((referenciaPneu) => ({
      label: referenciaPneu.referencia,
      value: referenciaPneu.id_pneu.toString(),
    }));
  }, [referenciasPneus]);

  const loadReferenciasPneus = useCallback(async () => {
    const response = await api.get<IReferenciaPneu[]>('referencias_pneus');

    setReferenciasPneus(response.data);
  }, []);

  const createReferenciasPneus = useCallback(
    async (novaReferencia: object) => {
      try {
        const response = await api.post<IReferenciaPneu[]>(
          'referencias_pneus',
          novaReferencia,
        );

        const updatedListReferenciasPneus = [
          ...referenciasPneus,
          ...response.data,
        ];

        toast({
          title: 'Sucesso!',
          description: 'Referência criada com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        setReferenciasPneus(updatedListReferenciasPneus);

        return response.data;
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description: 'Ocorreu um error ao tentar criar a referência.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [referenciasPneus, toast],
  );

  return (
    <KmsContext.Provider
      value={{
        loadKms,
        createKm,
        kms,
        referenciasPneus,
        loadReferenciasPneus,
        createReferenciasPneus,
        optionsReferenciasPneus,
      }}
    >
      {children}
    </KmsContext.Provider>
  );
};

export function useKm(): IKmContextData {
  const context = useContext(KmsContext);

  if (!context) {
    throw new Error(
      'usePrefixo precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
