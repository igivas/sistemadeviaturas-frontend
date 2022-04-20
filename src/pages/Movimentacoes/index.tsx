import React, { useCallback, useState } from 'react';

import {
  FaEraser,
  FaFileSignature,
  FaPencilAlt,
  FaRegFilePdf,
  FaSearch,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { useDisclosure, useToast } from '@chakra-ui/react';
import ModalConfirmação from '../../components/ModalConfirmação';
import { IFieldsTableMovimentacao } from '../../interfaces/IFieldsTableMovimentacao';
import Modal from '../../components/Modal';
import IKm from '../../interfaces/IKms';
import ETipoMovimentacao from '../../enums/ETipoMovimentacao';
import ModalAssinatura from '../../components/ModalAssinatura';
import Row from '../../components/form/Row';
import Button from '../../components/form/Button';
import PanelBottomActions from '../../components/PanelBottomActions';
import { useMovimentacao } from '../../contexts/MovimentacaoContext';
import FormTextArea from '../../components/form/FormTextArea';
import FormGroup from '../../components/form/FormGroup';
import TituloPagina from '../../components/TituloPagina';
import { useAuth } from '../../contexts/auth';
import DataTable, { IColumns } from '../../components/DataTable';
import BoxContent from '../../components/BoxContent';
import api from '../../services/api';
import { IGetMovimentacao } from '../../interfaces/Response/IGetMovimentacao';
import VisualizarMovimentacao from '../../components/VisualizarMovimentacao';
import EFase from '../../enums/EFase';
import { Container, Content, PdfLink, SubTitle } from './style';
import { IDadosAssinatura } from '../../interfaces/IDadosAssinatura';

const Movimentacoes: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const {
    tiposMovimentacoes,
    fases,
    createMovimentacao,
    handleFaseMovimentacao,
  } = useMovimentacao();

  const [reload, setReload] = useState(true);

  const [dadosAssinatura, setDadosAssinatura] = useState<IDadosAssinatura>();
  const [dadosDelecao, setDadosDelecao] = useState<number>();
  const [idTipoMovimentacaoFase, setidTipoMovimentacaoFase] = useState<EFase>();
  const [justificativa, setJustificativa] = useState('');

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

  const {
    isOpen: isOpenModalConfirmacao,
    onOpen: onOpenModalConfirmacao,
    onClose: onCloseModalConfirmacao,
  } = useDisclosure();

  const handleOpenModalAssinatura = (): void => {
    setReload(false);
    onOpenDadosAssinatura();
  };

  const handleCloseModalAssinatura = (): void => {
    setReload(true);
    onCloseDadosAssinatura();
  };

  const enumAssinatura = {
    '0': 'Pendente',
    '1': 'Assinado',
  };

  const colunas: IColumns = [
    {
      field: 'id_movimentacao',
      text: 'Id',
      type: { name: 'text' },
      alias: 'movimentacoes.id_movimentacao',
    },

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

    {
      field: 'data_retorno',
      text: 'Data retorno',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },

    {
      field: 'placa',
      text: 'Placa',
      type: { name: 'text' },
      alias: 'veiculos.placa',
    },

    {
      field: 'renavam',
      text: 'Renavam',
      type: { name: 'text' },
      alias: 'veiculos.renavam',
    },

    {
      field: 'identificador',
      text: 'Identificador',
      type: { name: 'text' },
      alias: 'identificador.identificador',
    },

    /* {
      field: 'status',
      text: 'Status',
      type: { name: 'text' },
    }, */
  ];

  async function handleRecebido(row: IFieldsTableMovimentacao): Promise<void> {
    setReload(false);
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
          setReload(true);
          if (response) {
            const km = await api.get<IKm>(`veiculos/${row.id_veiculo}/kms`, {
              params: {
                data_km: row.data_movimentacao,
              },
            });

            handleOpenModalAssinatura();
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
        handleOpenModalAssinatura();

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
    setReload(false);
  }
  const handleShowMovimentacao = useCallback(
    async (row: IFieldsTableMovimentacao): Promise<boolean> => {
      setReload(false);

      try {
        const movimentacao = await api.get<IGetMovimentacao>(
          `movimentacoes/${row.id_movimentacao}`,
        );

        setDadosMovimentacao({
          chassi: row.chassi as string,
          criado_por: user.id_usuario.toString(),
          data_movimentacao: row.data_movimentacao as Date,
          placa: row.placa as string,
          renavam: row.renavam as string,
          tipo_movimentacao: row.id_tipo_movimentacao as ETipoMovimentacao,
          fases: movimentacao.data.fases as [],
          url_documento_sga: row.url_documento_sga as string,
          observacao: row.observacao as string,
          identificador: row.identificador as string,
          localizacoes: row.localizacoes as string[],
          url_documento_devolucao_sga: row.url_documento_devolucao_sga,
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
    },
    [onCloseVisualizar, onOpenVisualizar, toast, user.id_usuario],
  );

  async function handleRecusarVeiculo(): Promise<void> {
    await createMovimentacao(
      {
        id_tipo_movimentacao_fase: idTipoMovimentacaoFase,
        id_movimentacao: dadosAssinatura?.id_movimentacao,
        observacao: justificativa || undefined,
      },
      dadosAssinatura?.id_veiculo as number,
    );
    setReload(true);
    onCloseDadosAssinatura();
  }

  const handleShowIconMovimentarVeiculo = useCallback(
    (row: IFieldsTableMovimentacao): boolean => {
      const opms = user.opmBusca.value
        .split(',')
        .map((uniCodigos) => Number.parseInt(uniCodigos, 10))
        .filter((uniCodigos) => !Number.isNaN(uniCodigos));

      if (
        !opms.includes(row.opm_destino?.id_opm as number) &&
        !opms.includes(row.opm_origem?.id_opm as number)
      )
        return false;

      switch (row.id_tipo_movimentacao) {
        case ETipoMovimentacao.Transferência:
          return !(
            (opms.includes(row.opm_destino?.id_opm as number) &&
              row.assinado_destino === '1') ||
            (opms.includes(row.opm_origem?.id_opm as number) &&
              row.assinado_origem === '1')
          );

        case ETipoMovimentacao.Empréstimo:
          if (
            row.assinado_origem === '1' &&
            row.assinado_destino === '1' &&
            row.assinado_devolucao_destino === '1' &&
            row.assinado_devolucao_origem === '1'
          )
            return false;

          switch (row?.fases?.[0].id_movimentacao_fase) {
            case EFase.Oferta:
              return !(
                (opms.includes(row.opm_destino?.id_opm as number) &&
                  row.assinado_destino === '1') ||
                (opms.includes(row.opm_origem?.id_opm as number) &&
                  row.assinado_origem === '1')
              );

            case EFase.Recebimento:
              return (
                opms.includes(row.opm_destino?.id_opm as number) &&
                row.assinado_destino === '1'
              );

            case EFase.Devolução:
              if (opms.includes(row.opm_destino?.id_opm as number))
                return row.assinado_devolucao_destino === '0';

              if (opms.includes(row.opm_origem?.id_opm as number))
                return (
                  row.assinado_devolucao_origem === '1' &&
                  row.assinado_devolucao_destino === '1'
                );

              return false;
            default:
              return false;
          }

        default:
          return false;
      }
    },
    [user.opmBusca],
  );

  const handleShowActionDeletar = useCallback(
    (row: IFieldsTableMovimentacao): boolean => {
      return row.assinado_destino === '0' && row.assinado_origem === '0';
    },
    [],
  );

  const handleDeletarMovimentacao = useCallback(
    async (row: IFieldsTableMovimentacao) => {
      setReload(false);
      setDadosDelecao(row.id_movimentacao);
      onOpenModalConfirmacao();
    },
    [onOpenModalConfirmacao],
  );

  const options = {
    reload,
    serverData: {
      url: `${api.defaults.baseURL}/movimentacoes/veiculos`,
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

          getRow: handleShowMovimentacao,
        },

        {
          icon: <FaFileSignature size={13} />,

          tooltip: {
            name: 'Movimentar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },
          getRow: handleRecebido,
          handleShowIcon: handleShowIconMovimentarVeiculo,
        },

        {
          icon: <FaTrash size={13} />,

          tooltip: {
            name: 'Deletar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },
          getRow: handleDeletarMovimentacao,
          handleShowIcon: handleShowActionDeletar,
        },
      ],
    },
    filters: [
      {
        field: 'id_itpo_movimentacao',
        label: 'Tipo de Movimentacao',
        isPaginated: false,
        options: [{ label: 'Todos', value: '' }, ...tiposMovimentacoes],
      },
      {
        field: 'fase',
        label: 'Fase',
        isPaginated: false,
        options: [{ label: 'Todos', value: '' }, ...fases],
      },

      {
        field: 'pendente_assinatura',
        label: 'Assinatura',
        isPaginated: false,
        options: [
          { label: 'Todos', value: '' },
          { label: 'Pendente', value: '0' },
          { label: 'Assinado', value: '1' },
        ],
      },
    ],
    search: {
      searchable: true,
      label: 'Consultar Movimentacao',
      fields: [
        'veiculos.placa',
        'veiculos.renavam',
        'identificador.identificador',
      ],
      placeholder: 'Placa, Renavam, Identificador',
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

      <ModalConfirmação
        onClose={onCloseModalConfirmacao}
        isOpen={isOpenModalConfirmacao}
        size="xl"
        title="Confirmação de deleção de movimentação"
        confirmOptions={{
          handleClick: async () => {
            try {
              await api.delete(`movimentacoes/${dadosDelecao}`);
              toast({
                title: 'Sucesso!',
                description: 'Movimentação deletada com sucesso.',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
            } catch (error) {
              toast({
                title: 'Ocorreu um erro.',
                description:
                  (error.response && error.response.message) ||
                  'Ocorreu um erro ao tentar deletar a movimentação.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
            }
            setReload(true);
            onCloseModalConfirmacao();
          },
          color: 'green',
          icon: FaEraser,
          title: 'Confirmar',
          isDisabled: false,
        }}
      >
        <Content
          style={{
            textAlign: 'center',
            fontSize: '1.3rem',
            fontWeight: 'bold',
          }}
        >
          Você deseja realmente deletar esta movimentação
        </Content>
      </ModalConfirmação>

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
            {(dadosAssinatura.tipo_movimentacao ===
              ETipoMovimentacao.Transferência ||
              dadosAssinatura.tipo_movimentacao ===
                ETipoMovimentacao.Empréstimo) && (
              // eslint-disable-next-line react/jsx-indent
              <>
                <SubTitle>
                  {dadosAssinatura?.assinado_origem === '0'
                    ? 'Envio'
                    : 'Recebimento'}
                </SubTitle>
                <Content>
                  {dadosAssinatura.tipo_movimentacao ===
                    ETipoMovimentacao.Transferência}
                  Você confirma o{' '}
                  {dadosAssinatura?.assinado_origem === '0'
                    ? 'envio'
                    : 'recebimento'}{' '}
                  do veiculo de{' '}
                  {dadosAssinatura?.placa && `placa ${dadosAssinatura?.placa}`},{' '}
                  {dadosAssinatura?.km_atual &&
                    `km ${dadosAssinatura?.km_atual}`}{' '}
                  da {dadosAssinatura?.opm_origem} para{' '}
                  {dadosAssinatura?.opm_destino} na data{' '}
                  {dadosAssinatura?.data_movimentacao}?
                  <p>
                    Este procedimento gerará a assinatura do termo eletronico de
                    transferencia de veículo. Para ter validade o termo deverá
                    ser assinado eletronicamente
                  </p>
                </Content>
              </>
            )}

            {dadosAssinatura.tipo_movimentacao ===
              ETipoMovimentacao['Em Manutenção'] && (
              <>
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
                  para manutenção na oficina {dadosAssinatura.oficina} o veiculo
                  de{' '}
                  {dadosAssinatura?.placa && `placa ${dadosAssinatura?.placa}`},{' '}
                  {dadosAssinatura?.km_atual &&
                    `km ${dadosAssinatura?.km_atual}`}{' '}
                  da {dadosAssinatura?.opm_origem} para{' '}
                  {dadosAssinatura?.opm_destino} na data{' '}
                  {dadosAssinatura?.data_movimentacao}?
                  <p>
                    Este procedimento gerará a assinatura do termo eletronico de
                    transferencia de veículo. Para ter validade o termo deverá
                    ser assinado eletronicamente
                  </p>
                </Content>
              </>
            )}

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
                    (dadosAssinatura &&
                      dadosAssinatura.assinado_origem === '0') ||
                    dadosAssinatura.assinado_devolucao_destino === '0' ||
                    dadosAssinatura.assinado_devolucao_origem === '0'
                  ) {
                    setidTipoMovimentacaoFase(EFase['Pendente Assinatura']);
                  } else {
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
            setReload(true);
          }}
          id_veiculo={dadosAssinatura?.id_veiculo as number}
          size="2xl"
        />
      )}
    </>
  );
};

export default Movimentacoes;
