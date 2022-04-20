import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useToast } from '@chakra-ui/react';
import * as _ from 'lodash';
import { IOptionFormat } from '../interfaces/IOptionFormat';
import api from '../services/api';
import IVeiculo from '../interfaces/IVeiculo';
import { IUFResponse } from '../interfaces/Response/IUFResponse';
import { IGetOrgaosResponse } from '../interfaces/Response/IGetOrgaosResponse';
import ECombustivel from '../enums/ECombustivel';
import { IMunicipio } from '../interfaces/IMunicipio';
import { IPrefixo } from '../interfaces/IPrefixo';
import { IIdentificador } from '../interfaces/IIdentificador';
import { ISituacao } from '../interfaces/ISituacao';
import { IMovimentacoesVeiculo } from '../interfaces/IMovimentacoesVeiculo';

interface IKm {
  [key: string]: string | number | object[];
}

interface IAquisicoes {
  id_aquisicao: number;
  id_veiculo: number;
  origem_aquisicao: string;
  forma_aquisicao: string;
  data_aquisicao: string;
  doc_aquisicao: string;
  valor_aquisicao: string;
  criado_por: string;
  criado_em: string;
  id_orgao_aquisicao: number;
  file_path: string;
}

export type MovimentacaoOpm = {
  id_movimentacao: number;
  opm_origem: any;
  opm_destino: any;
  tipoMovimentacao: any;
  fases: any;
};

interface IVeiculoObject extends IVeiculo {
  kms: IKm[];
  aquisicoes: IAquisicoes[];
  prefixos: IPrefixo[];
  identificadores: IIdentificador[];
  situacoes: ISituacao[];
  movimentacoes: IMovimentacoesVeiculo[];
}

interface IVeiculoContextData {
  veiculos: IVeiculoObject[];
  veiculo: IVeiculoObject;
  aquisicaoFile?: File;
  loadVeiculos(idVeiculo: string[]): Promise<IVeiculoObject[]>;
  loadVeiculo(id: number): Promise<void>;
  updateVeiculo(fieldsUpdated: object, id: number): Promise<object | undefined>;
  createVeiculo(novoVeiculo: object): Promise<IVeiculoObject>;

  // cleanVeiculo(): void;
  updateVeiculoData(veiculoData: Partial<IVeiculoObject>): void;
  defaultValue(action: 'cadastrar' | 'editar', value: any, key?: any): any;

  loadUfs(): Promise<void>;
  ufsResponse: IUFResponse[];
  ufsFormated: IOptionFormat[];

  municipios: IMunicipio[];
  loadMunicipios(id_uf: string): Promise<void>;
  optionsMunicipios: IOptionFormat[];

  orgaosResponse: IGetOrgaosResponse[];
  optionsOrgaos: IOptionFormat[];
  loadOrgaos(): Promise<void>;

  combustiveisFormated: IOptionFormat[];

  validateChassi(chassi: string): Promise<boolean>;
  validatePlaca(placa: string): Promise<boolean>;

  handleLoadOrgaos(): Promise<void>;
}

const VeiculoContext = createContext<IVeiculoContextData>(
  {} as IVeiculoContextData,
);

export const VeiculoProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const [veiculo, setVeiculo] = useState<IVeiculoObject>({} as IVeiculoObject);
  const [veiculos, setVeiculos] = useState<IVeiculoObject[]>([]);

  const [ufsResponse, setUfsResponse] = useState<IUFResponse[]>([]);
  const [municipios, setMunicipios] = useState<IMunicipio[]>([]);

  const [orgaosResponse, setOrgaosResponse] = useState<IGetOrgaosResponse[]>(
    [],
  );

  const toastWarningId = useRef<string | number>();

  const getVeiculo = useCallback(async (id: string) => {
    return api.get<IVeiculoObject>(`veiculos/${id}`);
  }, []);

  const loadVeiculos = useCallback(
    async (ids: string[]) => {
      const veiculosResponse = await Promise.all(
        ids.map(async (id) => {
          const { data } = await getVeiculo(id);
          return data;
        }),
      );

      setVeiculos(veiculosResponse);
      return veiculosResponse;
    },
    [getVeiculo],
  );

  // const history = useHistory();
  const loadVeiculo = useCallback(
    async (id: number): Promise<void> => {
      try {
        const veiculoResponse = await getVeiculo(id.toString());

        setVeiculo({
          ...veiculoResponse.data,
        });
      } catch (error) {
        console.log(error);
      }
    },
    [getVeiculo],
  );

  const updateVeiculoData = useCallback(
    (veiculoData: Partial<IVeiculoObject>) => {
      setVeiculo((veiculoState) => ({
        ...veiculoState,
        ...veiculoData,
      }));
    },
    [],
  );

  const defaultValue = (
    action: 'cadastrar' | 'editar',
    value: any,
    key?: any,
  ): any => {
    if (action === 'cadastrar') return value;

    return _.get(veiculo, key as string) || value;
  };

  const updateVeiculo = useCallback(
    async (fieldsUpdated, id) => {
      toastWarningId.current = toast({
        title: 'Aviso!',
        description: `Processando veiculo...`,
        status: 'warning',
        duration: 15000,
        isClosable: true,
        position: 'top-right',
      });

      try {
        const { ...rest } = fieldsUpdated;

        const veiculoUpdated = await api.put(`veiculos/${id}`, {
          body: { ...rest },
        });

        toast.close(toastWarningId.current as number | string);

        toast({
          title: 'Sucesso!',
          description: 'Veículo atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        return veiculoUpdated.data;
      } catch (error) {
        toast.close(toastWarningId.current as number | string);

        toast({
          title: 'Ocorreu um erro.',
          description:
            error.response?.data?.message ||
            'Ocorreu um error ao tentar atualizar o veículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }

      return undefined;
    },
    [toast],
  );

  const createVeiculo = useCallback(
    async (novoVeiculo): Promise<any> => {
      toastWarningId.current = toast({
        title: 'Aviso!',
        description: `Processando veiculo...`,
        status: 'warning',
        duration: 15000,
        isClosable: true,
        position: 'top-right',
      });
      try {
        const { aquisicao_file, ...rest } = novoVeiculo;
        let response;

        if (aquisicao_file) {
          const formData = new FormData();
          formData.append('aquisicao_file', aquisicao_file);
          formData.append('body', JSON.stringify(rest));
          response = await api.post('veiculos', formData);
        } else {
          response = await api.post('veiculos', { body: rest });
        }

        toast.close(toastWarningId.current as number | string);
        setVeiculo(response.data);

        toast({
          title: 'Sucesso!',
          description: 'Veículo cadastrado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        return response.data;
      } catch (error) {
        toast.close(toastWarningId.current as number | string);

        toast({
          title: 'Ocorreu um erro.',
          description:
            (error.response && error.response.message) ||
            'Ocorreu um error ao tentar cadastrar o veículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        return undefined;
      }
    },
    [toast],
  );

  const loadUfs = useCallback(async () => {
    const ufs = await api.get<IUFResponse[]>('estados');
    setUfsResponse(ufs.data);
  }, []);

  const ufsFormated = useMemo(() => {
    return ufsResponse
      ? ufsResponse
          .map((uf) => {
            return {
              value: uf.id_estado,
              label: uf.sigla,
            };
          })
          .sort((a, b) => {
            return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
          })
      : [];
  }, [ufsResponse]);

  const loadMunicipios = useCallback(async (id_uf: string) => {
    const response = await api.get<IMunicipio[]>('enderecos', {
      params: {
        uf: id_uf,
      },
    });

    setMunicipios(response.data);
  }, []);

  const optionsMunicipios = useMemo(
    () =>
      municipios.map<IOptionFormat>((municipio) => ({
        label: municipio.nome,
        value: municipio.id_municipio.toString(),
      })),
    [municipios],
  );

  const loadOrgaos = useCallback(async () => {
    const orgaos = await api.get<IGetOrgaosResponse[]>('orgaos');
    setOrgaosResponse(orgaos.data);
  }, []);

  const optionsOrgaos = useMemo(
    () =>
      orgaosResponse.map<IOptionFormat>((orgao) => ({
        label: `${orgao.nome} - ${orgao.sigla}`,
        value: orgao.id_orgao.toString(),
      })),
    [orgaosResponse],
  );

  const combustiveisFormated = useMemo(
    () =>
      Object.entries(ECombustivel).reduce((options, currentPrefixoTipo) => {
        return [
          ...options,
          {
            label: currentPrefixoTipo[0],
            value: currentPrefixoTipo[1],
          },
        ];
      }, [] as any[]),
    [],
  );

  const validateChassi = useCallback(
    async (chassi: string) => {
      try {
        await api.get(`/check`, {
          params: {
            query: { veiculo: { chassi } },
          },
        });
        return true;
      } catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400: {
              toast({
                title: 'Erro',
                description: 'Chassi já existente ou inválida',
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
      }

      return false;
    },
    [toast],
  );

  const validatePlaca = useCallback(
    async (placa: string) => {
      try {
        await api.get(`/check`, {
          params: {
            query: {
              veiculo: { placa },
            },
          },
        });
        return true;
      } catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400: {
              toast({
                title: 'Erro',
                description: 'Placa já existente ou inválida',
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
      }

      return false;
    },
    [toast],
  );

  const handleLoadOrgaos = useCallback(async () => {
    if (
      veiculo.aquisicoes &&
      veiculo.aquisicoes.length > 0 &&
      veiculo.aquisicoes.findIndex(
        (aquisicao) => aquisicao.id_orgao_aquisicao !== undefined,
      ) > 0 &&
      orgaosResponse.findIndex(
        (orgao) =>
          veiculo.aquisicoes.findIndex(
            (aquisicao) => aquisicao?.id_orgao_aquisicao === orgao.id_orgao,
          ) < 0,
      ) < 0
    ) {
      await loadOrgaos();
    }
  }, [loadOrgaos, veiculo, orgaosResponse]);

  return (
    <VeiculoContext.Provider
      value={{
        loadUfs,
        veiculo,
        veiculos,
        loadVeiculo,
        loadVeiculos,
        updateVeiculo,
        createVeiculo,
        updateVeiculoData,
        defaultValue,
        ufsResponse,
        ufsFormated,
        loadMunicipios,
        municipios,
        optionsMunicipios,
        loadOrgaos,
        orgaosResponse,
        optionsOrgaos,
        combustiveisFormated,
        validateChassi,
        validatePlaca,
        handleLoadOrgaos,
      }}
    >
      {children}
    </VeiculoContext.Provider>
  );
};

export function useVeiculo(): IVeiculoContextData {
  const context = useContext(VeiculoContext);

  if (!context) {
    throw new Error(
      'useVeiculo precisa estar dentro de VeiculoContext provider',
    );
  }
  return context;
}
