import React, { createContext, useCallback, useState, useContext } from 'react';
import { useToast } from '@chakra-ui/react';
import { decode } from 'jsonwebtoken';
import debounce from 'debounce-promise';
import { IGetOpmsResponse } from '../interfaces/Response/IGetOpmsResponse';
import api from '../services/api';
import { IOptionFormat } from '../interfaces/IOptionFormat';

type OpmFormat = {
  id_opm: number;
  nome: string;
  sigla: string;
};

interface IPerfil {
  id_perfil: number;
  id_sistema: number;
  descricao: string;
  limite: number;
  sigla: string;
}

interface ITokenPayload {
  iad: number;
  exp: string;
  sub: string;
}
type IOption = { label: string; value: string };

type PerfilOption = IOption | undefined;

interface IUser {
  id_usuario: number;
  nome: string;
  cpf: string;
  id_pf: number;
  militar: boolean;
  perfis: IPerfil[];
  pm_apelido?: string;
  currentPerfil?: {
    value: string;
    label: string;
  };
  pessoaMilitar?: {
    id_pf_pm: number;
    matricula: string;
    numero: string;
    nome_guerra: string;
  };
  graduacao?: { gra_nome: string; gra_sigla: string };
  opm?: { nome: string; sigla: string; id_opm: number };
  image?: { data: string; data_alteracao: string };

  opmBusca: IOption & { option?: string; opmAtual: string };
}

interface IAuthState {
  token: string;
  exp: string;
  user: IUser;
}

interface ISignInCredentials {
  matricula: string;
  senha: string;
}

interface IAuthContextData {
  user: IUser;
  exp: string;
  signIn(credentials: ISignInCredentials): Promise<void>;
  signOut(): void;
  updatePerfil(perfil: PerfilOption): void;
  updateOpmBusca(opm: IOption): void;
  updateVerSubunidades(option: string): void;

  delayedPromiseOptionsUnidades(
    query: string,
    isRestrictedSearch: boolean,
  ): Promise<IOptionFormat[]>;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const [data, setData] = useState<IAuthState>(() => {
    const token = sessionStorage.getItem('@pmce-cetic-sav:token');
    const exp = sessionStorage.getItem('@pmce-cetic-sav:token-exp');
    const user = sessionStorage.getItem('@pmce-cetic-sav:user');

    if (token && user && exp) {
      api.defaults.headers.authorization = `Bearer ${token}`;
      const userObject = JSON.parse(user);
      const image = localStorage.getItem(
        `@pmce-cetic-sav:${userObject.matricula}-image`,
      );
      if (image) {
        return {
          token,
          exp,
          user: { ...userObject, image: JSON.parse(image) },
        };
      }
      return { token, exp, user: userObject };
    }

    return {} as IAuthState;
  });

  const loadUserImage = useCallback(
    async (user: any, exp: string) => {
      const localImage = localStorage.getItem(
        `@pmce-cetic-sav:${user.matricula}-image`,
      );
      let currentImage;
      if (localImage) {
        currentImage = JSON.parse(localImage);
        if (currentImage.data_alteracao === user.data_alteracao) {
          setData({ ...data, exp, user: { ...user, image: currentImage } });

          return;
        }
      }

      try {
        const responseImage = await api.get(
          `policiais/${user.matricula}/images`,
        );
        const image = responseImage.data;

        const updatedUser = {
          ...user,
          image: { data: image, data_alteracao: user.data_alteracao },
        };

        localStorage.setItem(
          `@pmce-cetic-sav:${user.matricula}-image`,
          JSON.stringify({ data: image, data_alteracao: user.data_alteracao }),
        );

        setData({ ...data, exp, user: updatedUser });
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description: 'Ocorreu um error ao carregar a imagem do usuário',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    },
    [toast, data],
  );

  const signIn = useCallback(
    async ({ matricula, senha }) => {
      try {
        const response = await api.post<{
          token: string;
          user: Omit<IUser, 'currentPerfil'>;
        }>('sessions', { matricula, senha });

        const { token, user } = response.data;
        const { opm, ...restUser } = user;

        const userObject: IUser = {
          ...restUser,
          opm,
          currentPerfil: {
            value: String(user.perfis[0].id_perfil),
            label: user.perfis[0].descricao,
          },
          opmBusca: restUser.militar
            ? {
                label: opm?.sigla || user.perfis[0].descricao,
                value: opm?.id_opm.toString() as string,
                opmAtual: opm?.id_opm.toString() as string,
              }
            : {
                label: 'Todas',
                value: '0',
                opmAtual: '0',
              },
        };

        const tokenPayload = decode(token);
        const { exp } = tokenPayload as ITokenPayload;

        sessionStorage.setItem('@pmce-cetic-sav:token', token);
        sessionStorage.setItem('@pmce-cetic-sav:token-exp', String(exp));
        sessionStorage.setItem(
          '@pmce-cetic-sav:user',
          JSON.stringify(userObject),
        );
        api.defaults.headers.authorization = `Bearer ${token}`;

        setData({ token, exp, user: userObject });
        loadUserImage(userObject, exp);
      } catch (error) {
        toast({
          title: 'Ocorreu um erro.',
          description: error.response.data.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    },
    [loadUserImage, toast],
  );

  const updatePerfil = useCallback(
    (perfil: PerfilOption) => {
      const userObject = { ...data.user, currentPerfil: perfil };
      setData({ ...data, user: userObject });
      sessionStorage.setItem(
        '@pmce-cetic-sav:user',
        JSON.stringify(userObject),
      );
    },
    [data],
  );

  const updateVerSubunidades = useCallback(
    async (opcao: string) => {
      const { opmBusca, ...restUser } = data.user;

      const newOpmBusca = { ...opmBusca };

      if (opcao === '0') {
        newOpmBusca.value = newOpmBusca.opmAtual;
        newOpmBusca.option = opcao;
      } else {
        const opm = Number.parseInt(opmBusca.opmAtual, 10);

        if (opm !== -1) {
          const subUnidades = await api.get<OpmFormat[]>('opms', {
            params: {
              opm_usuario: opm,
              sub_unidades: opcao,
            },
          });

          newOpmBusca.value = subUnidades.data
            .reduce<number[]>(
              (opmsNumber, subUnidade) => [...opmsNumber, subUnidade.id_opm],
              [],
            )
            .concat(opm)
            .join(',');
        }
        newOpmBusca.option = opcao;
      }
      const userObject = { ...restUser, opmBusca: newOpmBusca };
      setData({ ...data, user: userObject });
      sessionStorage.setItem(
        '@pmce-cetic-sav:user',
        JSON.stringify(userObject),
      );
    },
    [data],
  );

  const updateOpmBusca = useCallback(
    (opm: IOption) => {
      const userObject: IUser = {
        ...data.user,
        opmBusca: { ...opm, opmAtual: opm.value },
      };

      setData({ ...data, user: userObject });
      sessionStorage.setItem(
        '@pmce-cetic-sav:user',
        JSON.stringify(userObject),
      );
    },
    [data],
  );

  const signOut = useCallback(() => {
    sessionStorage.removeItem('@pmce-cetic-sav:token');
    sessionStorage.removeItem('@pmce-cetic-sav:token-exp');
    sessionStorage.removeItem('@pmce-cetic-sav:user');

    setData({} as IAuthState);
  }, []);

  // const updateUser = useCallback(
  //   (user: IUser) => {
  //     sessionStorage.setItem('@pmce-cetic-sav:user', JSON.stringify(user));

  //     setData({
  //       token: data.token,
  //       user,
  //     });
  //   },
  //   [setData, data.token],
  // );

  const promiseOptionsUnidades = useCallback(
    async (
      inputValue: string,
      isRestrictedSearch: boolean,
    ): Promise<IOptionFormat[]> => {
      try {
        const restrictedParams = isRestrictedSearch
          ? {
              page: 1,
              perPage: 5,
              opm_usuario: data.user.opmBusca.value,
            }
          : undefined;
        const opmsSearch = await api.get<IGetOpmsResponse>('opms', {
          params: {
            query: inputValue,
            ...restrictedParams,
          },
        });

        /**
         * Esse é o meu
         */

        /* const opmsFormated = opmsSearch.data.items.map<OptionType>((opmSearch) => ({
        label: `${opmSearch.nome}-${opmSearch.sigla}`,
        value: opmSearch.id_opm.toString(),
      })); */

        /**
         * Esse é o do sargento
         */
        return (
          opmsSearch.data.items?.map<IOptionFormat>((opmSearch) => ({
            label: `${opmSearch.nome}${
              opmSearch.sigla ? ` - ${opmSearch.sigla}` : ''
            }`,
            value: opmSearch.id_opm.toString(),
          })) || []
        );
      } catch (error) {
        if (error.response && error.response.status === 401) signOut();
        return [];
      }
    },
    [signOut, data.user],
  );

  const delayedPromiseOptionsUnidades = useCallback(
    debounce(
      (query: string, isRestrictedSearch: boolean) =>
        promiseOptionsUnidades(query, isRestrictedSearch),
      500,
    ),
    [promiseOptionsUnidades],
  );

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        exp: data.exp,
        signIn,
        signOut,
        updatePerfil,
        updateOpmBusca,
        updateVerSubunidades,
        delayedPromiseOptionsUnidades,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): IAuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
