import React, { useState } from 'react';
import {
  FaFileSignature,
  FaPencilAlt,
  FaRegFilePdf,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { compareAsc, format, parseISO } from 'date-fns';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { maxBy } from 'lodash';
import IKm from '../../../../interfaces/IKms';
import { useAuth } from '../../../../contexts/auth';
import PanelBottomActions from '../../../../components/PanelBottomActions';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import api from '../../../../services/api';
import { useMovimentacao } from '../../../../contexts/MovimentacaoContext';
import DataTable, { IColumns } from '../../../../components/DataTable';
import Button from '../../../../components/form/Button';
import Modal from '../../../../components/Modal';
import { Container } from './styles';
import { IGetMovimentacao } from '../../../../interfaces/Response/IGetMovimentacao';
import ETipoMovimentacao from '../../../../enums/ETipoMovimentacao';
import { IDadosAssinatura } from '../../../../interfaces/IDadosAssinatura';
import VisualizarMovimentacao from '../../../../components/VisualizarMovimentacao';
import ModalAssinatura from '../../../../components/ModalAssinatura';
import EFase from '../../../../enums/EFase';
import { Content, PdfLink, SubTitle } from '../../../Movimentacoes/style';
import Row from '../../../../components/form/Row';
import FormGroup from '../../../../components/form/FormGroup';
import { FormTextArea } from '../../../../components/form/FormTextArea/styles';
import { IFieldsTableMovimentacao } from '../../../../interfaces/IFieldsTableMovimentacao';

const TabMovimentacoes: React.FC = () => {
  const [dadosAssinatura, setDadosAssinatura] = useState<IDadosAssinatura>();

  const { user } = useAuth();
  const toast = useToast();

  const match: any = useRouteMatch('/veiculos/editar/:id');
  const { id } = match?.params;

  const history = useHistory();

  const { veiculo } = useVeiculo();
  const { createMovimentacao, handleFaseMovimentacao } = useMovimentacao();

  const [idTipoMovimentacaoFase, setidTipoMovimentacaoFase] = useState<EFase>();
  const [justificativa, setJustificativa] = useState('');

  const enumAssinatura = {
    '0': 'Pendente',
    '1': 'Assinado',
  };

  const [
    dadosMovimentacao,
    setDadosMovimentacao,
  ] = useState<IGetMovimentacao>();

  const {
    isOpen: isOpenVisualizar,
    onOpen: onOpenVisualizar,
    onClose: onCloseVisualizar,
  } = useDisclosure();

  const {
    isOpen: isOpenDadosAssinatura,
    onClose: onCloseDadosAssinatura,
    onOpen: onOpenDadosAssinatura,
  } = useDisclosure();

  const {
    isOpen: isOpenAssinatura,
    onOpen: onOpenAssinatura,
    onClose: onCloseAssinatura,
  } = useDisclosure();

  const handleCloseModalAssinatura = (): void => {
    onCloseDadosAssinatura();
  };

  /* const [canMovimentate, setCanMovimentate] = useState(
    !!selectedMovimentacao.movimentacao?.nome
      .toLowerCase()
      .trim()
      .includes('oferta'),
  ); */

  // const canMovimentate = (): void => {
  //   history.push(`veiculos/movimentar/${id}`);
  // };

  const colunas: IColumns = [
    {
      field: 'data_movimentacao',
      text: 'Data',
      type: { name: 'date', format: 'dd/MM/yyyy' },
      alias: 'movimentacoes.data_movimentacao',
    },

    {
      field: 'fases[0].criado_em',
      text: 'Data da Ultima fase',
      type: { name: 'date', format: 'dd/MM/yyyy' },
      alias: 'movimentacoesFase.criado_em',
    },
    {
      field: 'opm_origem.sigla',
      text: 'OPM Origem',
      type: { name: 'text' },
      alias: 'opm_origem.sigla',
    },

    {
      field: 'assinado_origem',
      text: 'Assinatura Origem',
      type: {
        name: 'enum',
        enum: enumAssinatura,
      },
      alias: 'dadoMovimentacaoMudancaVeiculo.assinado_origem',
      highlightRowColor: [{ color: 'red', matchValues: ['0'] }],
    },

    {
      field: 'assinado_devolucao_origem',
      text: 'Assinatura Devolucao Origem',
      type: {
        name: 'enum',
        enum: enumAssinatura,
      },
      alias: 'dadoMovimentacaoMudancaVeiculo.assinado_devolucao_origem',
      highlightRowColor: [{ color: 'red', matchValues: ['0'] }],
    },

    {
      field: 'localizacoes[0].oficina',
      text: 'Orgao destino',
      type: {
        name: 'text',
      },
    },

    {
      field: 'opm_destino.sigla',
      text: 'OPM Destino',
      type: { name: 'text' },
      alias: 'opm_destino.sigla',
    },

    {
      field: 'assinado_destino',
      text: 'Assinatura Destino',
      type: {
        name: 'enum',
        enum: enumAssinatura,
      },
      alias: 'movimentacaoTransferencia.assinado_destino',
      highlightRowColor: [{ color: 'red', matchValues: ['0'] }],
    },

    {
      field: 'assinado_devolucao_destino',
      text: 'Assinatura Devolucao Destino',
      type: {
        name: 'enum',
        enum: enumAssinatura,
      },
      alias: 'movimentacaoTransferencia.assinado_devolucao_origem',
      highlightRowColor: [{ color: 'red', matchValues: ['0'] }],
    },

    {
      field: 'id_tipo_movimentacao',
      text: 'Tipo',
      type: {
        name: 'enum',
        enum: {
          1: 'Transferência',
          2: 'Empréstimo',
          3: 'Cessão',
          4: 'Manutenção',
          5: 'Descarga',
          6: 'Devolucao de Locação',
        },
      },
      alias: 'movimentacoes.tipo_movimentacao',
    },
    {
      text: 'Fase atual',
      field: 'fases[0].id_movimentacao_fase',
      type: {
        name: 'enum',
        enum: {
          1: 'Oferta',
          2: 'Concessão',
          3: 'Recebido',
          4: 'Recusado',
          5: 'Devolução',
          6: 'Entrega',
          8: 'Vistoria',
          9: 'Ordem de Servico',
        },
      },
      alias: 'movimentacoesFase.id_tipo_fase',
      // highlightRowColor: [{ color: 'yellow', matchValues: [4] }],
    },

    {
      field: 'localizacoes[0]',
      text: 'Localizacao',
      type: {
        name: 'text',
      },
    },

    {
      field: 'prev_devolucao',
      text: 'Prev Devolução',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },

    /* {
      field: 'status',
      text: 'Status',
      type: { name: 'text' },
    }, */
  ];

  async function handleShowMovimentacao(
    row: IFieldsTableMovimentacao,
  ): Promise<boolean> {
    try {
      const movimentacao = await api.get<IGetMovimentacao>(
        `movimentacoes/${row.id_movimentacao}`,
      );

      const filteredIdentificadorByDate = veiculo.identificadores.filter(
        (identificador) =>
          compareAsc(
            parseISO(identificador.data_identificador),
            parseISO(row.data_movimentacao.toString() as string),
          ) <= 0,
      );

      const identificadorMovimentacao = maxBy(
        filteredIdentificadorByDate,
        function (identificador) {
          return compareAsc(
            parseISO(identificador.data_identificador),
            parseISO(row.data_movimentacao.toString() as string),
          ) <= 0
            ? identificador.data_identificador
            : row.data_movimentacao;
        },
      );

      setDadosMovimentacao({
        chassi: veiculo.chassi as string,
        criado_por: user.id_usuario.toString(),
        data_movimentacao: row.data_movimentacao as Date,
        placa: veiculo.placa as string,
        renavam: veiculo.renavam as string,
        tipo_movimentacao: row.id_tipo_movimentacao as ETipoMovimentacao,
        fases: movimentacao.data.fases as [],
        url_documento_sga: row.url_documento_sga as string,
        observacao: row.observacao as string,
        identificador: identificadorMovimentacao?.identificador as string,
        url_documento_devolucao_sga: row.url_documento_devolucao_sga as string,
      });

      onOpenVisualizar();
    } catch (error) {
      onCloseVisualizar();
      toast({
        title: 'Ocorreu um erro.',
        description: 'Função nao implementada',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }

    return true;
  }

  async function handleRecusarVeiculo(): Promise<void> {
    const movimentacao = await createMovimentacao(
      {
        id_tipo_movimentacao_fase: idTipoMovimentacaoFase,
        id_movimentacao: dadosAssinatura?.id_movimentacao,
        observacao: justificativa || undefined,
      },
      dadosAssinatura?.id_veiculo as number,
    );
    if (movimentacao) {
      onCloseDadosAssinatura();
    }
  }

  async function handleRecebido(row: IFieldsTableMovimentacao): Promise<void> {
    const dadosParaAssinatura = {
      id_movimentacao: row.id_movimentacao as number,
      id_veiculo: row.id_veiculo as number,
      assinado_destino: row.assinado_destino as '0' | '1',
      assinado_origem: row.assinado_origem as '0' | '1',
      tipo_movimentacao: row.id_tipo_movimentacao as number,
      placa: row.placa as string,
      data_movimentacao: format(
        parseISO(row.data_movimentacao.toString()),
        'dd/MM/yyyy',
      ) as string,

      oficina: row.oficina,
    };
    if (handleFaseMovimentacao(row)) {
      const opms = user.opmBusca?.value
        .split(',')
        .map((opm) => Number.parseInt(opm, 10));

      if (
        row.id_tipo_movimentacao === ETipoMovimentacao.Empréstimo &&
        row.fases?.[0].id_movimentacao_fase === EFase.Recebimento
      ) {
        if (
          !opms.includes(row.opm_destino?.id_opm as number) &&
          !row.assinado_devolucao_destino
        )
          toast({
            title: 'Ocorreu um erro.',
            description:
              'Somente a Opm de destino pode iniciar o processo de devolucao',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        else if (!row.url_documento_devolucao_sga) {
          const response = await createMovimentacao(
            {
              id_tipo_movimentacao_fase: EFase.Devolução,
              id_movimentacao: row.id_movimentacao,
            },
            row.id_veiculo,
          );

          if (response) {
            const km = await api.get<IKm>(`veiculos/${row.id_veiculo}/kms`, {
              params: {
                data_km: row.data_movimentacao,
              },
            });

            onOpenDadosAssinatura();
            setDadosAssinatura({
              ...dadosParaAssinatura,
              km_atual: km.data.km_atual,
              assinado_devolucao_destino: '0',
              assinado_devolucao_origem: '0',
              url_documento_sga: response.url_documento_sga as string,
              opm_origem: (row.opm_destino as Record<string, any>)
                .sigla as string,
              opm_destino: (row?.opm_origem as Record<string, any>)?.sigla,
            });
          }
        }
      } else {
        const km = await api.get<IKm>(`veiculos/${row.id_veiculo}/kms`, {
          params: {
            data_km: row.data_movimentacao,
          },
        });
        onOpenDadosAssinatura();

        setDadosAssinatura({
          ...dadosParaAssinatura,
          km_atual: km.data.km_atual,
          assinado_devolucao_destino: row.assinado_devolucao_destino,
          assinado_devolucao_origem: row.assinado_devolucao_origem,
          url_documento_sga:
            row.url_documento_devolucao_sga ||
            (row.url_documento_sga as string),
          opm_origem:
            row.fases?.[0].id_movimentacao_fase === EFase.Devolução
              ? ((row.opm_destino as Record<string, any>).sigla as string)
              : ((row.opm_origem as Record<string, any>).sigla as string),
          opm_destino:
            row.fases?.[0].id_movimentacao_fase === EFase.Devolução
              ? ((row.opm_origem as Record<string, any>).sigla as string)
              : ((row.opm_destino as Record<string, any>).sigla as string),
        });
      }
    }
  }

  const options = {
    actions: {
      headerText: 'Ações',
      items: [
        {
          icon: <FaSearch size={13} />,
          tooltip: {
            name: 'visualizar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },

          getRow: handleShowMovimentacao,
        },

        {
          icon: <FaFileSignature size={13} />,

          tooltip: {
            name: 'Movimentar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },
          getRow: handleRecebido,
        },

        /* {
          icon: <BiTransfer size={13} />,
          tooltip: {
            name: 'visualizar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },

          getRow: handleClickEditar,
        }, */
      ],
    },

    search: {
      searchable: true,
      label: 'Pesquisar',
      fields: ['placa', 'renavam'],
    },
  };

  return (
    <Container>
      <DataTable
        columns={colunas}
        options={options}
        data={veiculo.movimentacoes}
      />

      {dadosMovimentacao && (
        <Modal
          onClose={onCloseVisualizar}
          isOpen={isOpenVisualizar}
          size="xl"
          title={
            dadosMovimentacao
              ? 'Ficha de Movimentacao'
              : dadosAssinatura
              ? `${
                  ETipoMovimentacao[dadosAssinatura.tipo_movimentacao]
                } de Carga`
              : 'Modal'
          }
        >
          <VisualizarMovimentacao {...dadosMovimentacao} />
        </Modal>
      )}

      {dadosAssinatura && (
        <Modal
          onClose={onCloseDadosAssinatura}
          isOpen={isOpenDadosAssinatura}
          size="xl"
          title={`${
            ETipoMovimentacao[
              dadosAssinatura?.tipo_movimentacao as ETipoMovimentacao
            ]
          } de Carga`}
        >
          <Container>
            <SubTitle>
              {dadosAssinatura?.assinado_origem === '0'
                ? 'Envio'
                : 'Recebimento'}
            </SubTitle>
            <Content>
              Você confirma o{' '}
              {dadosAssinatura?.assinado_origem === '0'
                ? 'envio'
                : 'recebimento'}{' '}
              do veiculo de{' '}
              {dadosAssinatura?.placa && `placa ${dadosAssinatura?.placa}`},{' '}
              {dadosAssinatura?.km_atual && `km ${dadosAssinatura?.km_atual}`}{' '}
              da {dadosAssinatura?.opm_origem} para{' '}
              {dadosAssinatura?.opm_destino} na data{' '}
              {dadosAssinatura?.data_movimentacao}?
              <p>
                Este procedimento gerará a assinatura do termo eletronico de
                transferencia de veículo. Para ter validade o termo deverá ser
                assinado eletronicamente
              </p>
            </Content>

            <PdfLink
              href={dadosAssinatura?.url_documento_sga}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaRegFilePdf size={60} />
              Visualizar Termo
            </PdfLink>
          </Container>

          {idTipoMovimentacaoFase === EFase.Recusado && (
            <Row>
              <FormGroup name="Justificativa" cols={[12, 12, 12]}>
                <FormTextArea
                  rows={5}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value.trimLeft())}
                />
              </FormGroup>
            </Row>
          )}

          <PanelBottomActions>
            <>
              {dadosAssinatura?.assinado_origem === '0' && (
                <Button
                  color="red"
                  icon={FaTimes}
                  onClick={handleCloseModalAssinatura}
                >
                  Cancelar
                </Button>
              )}

              {dadosAssinatura?.assinado_origem === '1' &&
                dadosAssinatura?.assinado_destino === '0' && (
                  <Button
                    color="red"
                    icon={FaPencilAlt}
                    onClick={() => {
                      if (idTipoMovimentacaoFase !== EFase.Recusado)
                        setidTipoMovimentacaoFase(EFase.Recusado);
                      else if (justificativa.trim().length < 1) {
                        toast({
                          title: 'Erro',
                          description: 'Insira sua justificativa',
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                          position: 'top-right',
                        });
                      } else {
                        handleRecusarVeiculo();
                        onCloseDadosAssinatura();
                      }
                    }}
                  >
                    Recusar
                  </Button>
                )}
              <Button
                color="green"
                icon={FaPencilAlt}
                type="button"
                onClick={() => {
                  if (
                    dadosAssinatura &&
                    dadosAssinatura.assinado_origem === '0'
                  )
                    setidTipoMovimentacaoFase(EFase['Pendente Assinatura']);
                  else {
                    setidTipoMovimentacaoFase(EFase.Recebimento);
                  }
                  onOpenAssinatura();
                  onCloseDadosAssinatura();
                }}
              >
                Assinar
              </Button>
            </>
          </PanelBottomActions>
        </Modal>
      )}

      {isOpenAssinatura && idTipoMovimentacaoFase !== EFase.Recusado && (
        <ModalAssinatura
          data={{
            movimentacao: {
              id_tipo_movimentacao_fase: idTipoMovimentacaoFase,
              id_movimentacao: dadosAssinatura?.id_movimentacao,
              observacao: justificativa || undefined,
            },
          }}
          tipo="movimentacao"
          cargos={
            user.graduacao
              ? [{ label: user.graduacao.gra_nome, value: '1' }]
              : []
          }
          isOpen={isOpenAssinatura}
          onClose={() => {
            onCloseAssinatura();
          }}
          id_veiculo={dadosAssinatura?.id_veiculo as number}
          size="2xl"
        />
      )}

      <PanelBottomActions>
        <Button
          color="green"
          onClick={() => history.push(`/veiculos/movimentar/${id}`)}
          type="button"
        >
          Movimentar
        </Button>
      </PanelBottomActions>
    </Container>
  );
};

export default TabMovimentacoes;
