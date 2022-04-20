import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
// import { useToast } from '@chakra-ui/react';
import { IOptionFormat } from 'interfaces/IOptionFormat';
import { useAuth } from '../../contexts/auth';
import BoxContent from '../../components/BoxContent';
import DataTable, { IColumns } from '../../components/DataTable';
import TituloPagina from '../../components/TituloPagina';
import api from '../../services/api';
import { useSituacao } from '../../contexts/SituacaoContext';

interface IFields {
  [key: string]: string | number;
}

interface IResponsePaginaton {
  total: number;
  totalPage: number;
}

interface ISelectFieldFormat extends IOptionFormat {
  field: string;
}

interface IResponsePaginaton {
  total: number;
  totalPage: number;
}

interface IResponseModelos extends IResponsePaginaton {
  items: {
    id_veiculo_modelo: number;
    nome: string;
  }[];
}

const Veiculos: React.FC = () => {
  const history = useHistory();
  const { signOut, user } = useAuth();
  const { situacoesTipos: situacoes, situacoesFormated } = useSituacao();

  // const toast = useToast();
  const [siutacoesTipos, setSiutacoesTipos] = useState<IOptionFormat[]>([]);
  const [modelos, setModelos] = useState<{
    options: IOptionFormat[];
    totalPage: number;
    page: number;
  }>({ page: 1 } as {
    options: IOptionFormat[];
    totalPage: number;
    page: number;
  });
  const [anosFabricacao, setAnosFabricacao] = useState<IOptionFormat[]>([]);
  /* const [opms, setOpms] = useState<{
    options: IOptionFormat[];
    totalPage: number;
    page: number;
  }>({ page: 1 } as {
    options: IOptionFormat[];
    totalPage: number;
    page: number;
  });

  const [nextPageOpm, setNextPageOpm] = useState(false); */
  const [nextPageModelo, setNextPageModelo] = useState(false);

  const [idSituacao, setidSituacao] = useState(-1);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [modelosTipos, anosFab] = await Promise.all([
          api.get<IResponseModelos>('modelos', {
            params: {
              opm: user.opmBusca.value,
            },
          }),
          api.get<string[]>('veiculos/anos_fabricacao', {
            params: {
              opms: user.opmBusca.value,
            },
          }),
        ]);

        setModelos({
          options: [
            { label: 'Todos', value: '' },
            ...modelosTipos.data.items.map<IOptionFormat>((modeloTipo) => ({
              label: modeloTipo.nome,
              value: modeloTipo.id_veiculo_modelo.toString(),
            })),
          ],
          page: 1,
          totalPage: modelosTipos.data.totalPage,
        });

        setAnosFabricacao([
          { label: 'Todos', value: '' },
          ...anosFab.data.map<IOptionFormat>((anos) => ({
            label: anos,
            value: anos,
          })),
        ]);
      } catch (error) {
        if (error.reponse) {
          switch (error.reponse.status) {
            case 401:
              signOut();
              break;

            default:
              /* toast({
                title: 'Ocorreu um erro.',
                description:
                  error.response.data.message ||
                  'Ocorreu um erro ao cadastrar a movimentação.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              }); */
              break;
          }
        }
      }
    }

    setSiutacoesTipos([{ label: 'Todas', value: '' }, ...situacoesFormated]);

    load();
  }, [signOut, user.opmBusca, situacoesFormated]);

  useEffect(() => {
    async function load(): Promise<void> {
      if (nextPageModelo && modelos.page <= modelos.totalPage) {
        const modelosTipos = await api.get<IResponseModelos>('modelos', {
          params: {
            page: modelos.page + 1,
            perPage: 10,
          },
        });

        setModelos({
          options: [
            ...modelos.options,
            ...modelosTipos.data.items.map<IOptionFormat>((modeloTipo) => ({
              label: modeloTipo.nome,
              value: modeloTipo.id_veiculo_modelo.toString(),
            })),
          ],
          page: modelos.page + 1,
          totalPage: modelosTipos.data.totalPage,
        });
      }

      setNextPageModelo(false);
    }

    load();
  }, [modelos, nextPageModelo]);

  const colunas: IColumns = [
    {
      field: 'placa',
      text: 'Placa',
      type: { name: 'text' },
      alias: 'veiculos.placa',
    },
    {
      field: 'opm_sigla',
      text: 'OPM',
      type: { name: 'text' },
      alias: 'unidade.opm_sigla',
    },
    {
      field: 'modelo',
      text: 'Modelo',
      type: { name: 'text' },
      alias: 'modelo.nome',
    },
    {
      field: 'ano_fabricacao',
      text: 'Ano',
      type: { name: 'text' },
      alias: 'veiculos.ano_fabricacao',
    },
    {
      field: 'km',
      text: 'Km',
      type: { name: 'text' },
      alias: 'km',
    },
    {
      field: 'identificador',
      text: 'Identificador',
      type: { name: 'text' },
      alias: 'identificador',
    },
    {
      field: 'localizacao',
      text: 'Localizacao',
      type: { name: 'text' },
      alias: 'localizacoes.localizacao',
    },
    {
      field: 'aquisicao',
      text: 'Origem Aquisição',
      type: {
        name: 'enum',
        enum: {
          '0': 'Orgânico',
          '1': 'Locado',
          '2': 'Cedido',
        },
      },
      alias: 'aquisicoes.origem_aquisicao',
    },
    {
      field: 'is_reserva',
      text: 'Reserva',
      type: {
        name: 'enum',
        enum: {
          '0': 'Não',
          '1': 'Sim',
        },
      },
      alias: 'situacaoTipoAtual.nome',
    },
    {
      field: 'situacao',
      text: 'Situação',
      type: { name: 'text' },
      alias: 'situacaoTipoAtual.nome',
    },
    {
      field: 'motivo',
      text: 'Motivo',
      type: { name: 'text' },
      alias: 'situacaoTipoAtual.especificacao',
    },
  ];

  function handleClickEditar(row: IFields): void {
    history.push(`/veiculos/editar/${row.id_veiculo}`);
  }

  const foundedSituacao = situacoes.find(
    (situacao) => situacao.id_situacao_tipo === idSituacao,
  );

  const options = {
    reload: true,
    serverData: {
      url: `${api.defaults.baseURL}/veiculos`,
      headers: { Authorization: api.defaults.headers.authorization },
      serverPagination: true,
      params: {
        opms: user.opmBusca.value,
      },
    },
    actions: {
      headerText: 'Ações',
      items: [
        {
          icon: <FaSearch size={13} />,
          tooltip: {
            name: 'Visualizar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },

          getRow: handleClickEditar,
        },
      ],
    },
    filters: [
      /* {
        field: 'placa',
        label: 'Placa',
        options: [
          { value: 'AAA0001', label: 'AAA0001' },
          { value: 'AAA0002', label: 'AAA0002' },
          { value: 'AAA0003', label: 'AAA0003' },
        ],
      }, */
      /* {
        field: 'opms',
        label: 'Opm',
        options: opms.options,
        handleNextPage: setNextPageOpm,
      }, */
      {
        field: 'id_modelo',
        label: 'Modelo',
        isPaginated: false,
        options: modelos.options,
        handleNextPage: setNextPageModelo,
      },
      {
        field: 'ano_fabricacao',
        label: 'Ano',
        isPaginated: false,
        options: anosFabricacao,
      },
      {
        field: 'origem_aquisicao',
        label: 'Origem',
        isPaginated: false,
        options: [
          { label: 'Todos', value: '' },
          { value: '0', label: 'Orgânico' },
          { value: '2', label: 'Cedido' },
          { value: '1', label: 'Locado' },
        ],
      },
      {
        isPaginated: false,
        field: 'ids_situacoes_veiculos',
        label: 'Situação',
        options: siutacoesTipos,
      },
      {
        isPaginated: false,
        field: 'id_situacao_tipo',
        label: 'Subtipo de Situação',
        options: foundedSituacao
          ? [
              { label: 'Todos', value: '' },

              ...foundedSituacao.motivos.map<IOptionFormat>((motivo) => ({
                label: motivo.especificacao,
                value: motivo.id_situacao_especificacao.toString(),
              })),
            ]
          : [],

        handleFiltersDisabled: (params: ISelectFieldFormat[]): boolean => {
          const paramSituacao = params.find(
            (param) =>
              param.field === 'ids_situacoes_veiculos' &&
              !param.value.includes(','),
          );

          if (!paramSituacao) {
            return true;
          }

          const foundedParam = situacoes.findIndex(
            (situacao) =>
              situacao.id_situacao_tipo.toString() === paramSituacao.value,
          );

          if (foundedParam < 0 || situacoes[foundedParam].motivos.length < 1)
            return true;

          setidSituacao(situacoes[foundedParam].id_situacao_tipo);

          return false;
        },
      },

      {
        field: 'is_reserva',
        label: 'Reserva',
        isPaginated: false,
        options: [
          { label: 'Todos', value: '' },
          { value: '0', label: 'Não' },
          { value: '1', label: 'Sim' },
        ],
      },
    ],
    search: {
      searchable: true,
      label: 'Consultar Veiculo',
      fields: [
        'veiculos.placa',
        'veiculos.renavam',
        'identificador.identificador',
      ],
      placeholder: 'Placa, Renavam, Ident.',
    },
  };

  return (
    <>
      <TituloPagina title="Consulta Frota Veicular PMCE" />
      <BoxContent>
        <div>
          <DataTable columns={colunas} options={options} />
        </div>
      </BoxContent>
    </>
  );
};

export default Veiculos;
