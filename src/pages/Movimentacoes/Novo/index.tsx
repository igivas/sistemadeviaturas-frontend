import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { ValueType } from 'react-select';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import * as Yup from 'yup';
import {
  FaSave,
  FaTimes,
  FaEraser,
  FaRegFilePdf,
  FaPencilAlt,
} from 'react-icons/fa';
import { useDisclosure, useToast } from '@chakra-ui/react';
import debounce from 'debounce-promise';
import { compareAsc } from 'date-fns';
import ModalConfirmação from '../../../components/ModalConfirmação';
import { useIdentificador } from '../../../contexts/Identificadores';
import ModalAssinatura from '../../../components/ModalAssinatura';
import EFase from '../../../enums/EFase';
import { movimentacoesFasesMapper } from '../../../mappers/tiposMovimentacoesFasesMapper';
import ETipoMovimentacao from '../../../enums/ETipoMovimentacao';
import { useMovimentacao } from '../../../contexts/MovimentacaoContext';
import { useAuth } from '../../../contexts/auth';
import FormGroup from '../../../components/form/FormGroup';
import Row from '../../../components/form/Row';
import { Form } from '../../Veiculos/components/FormVeiculo/styles';
import TituloPagina from '../../../components/TituloPagina';
import BoxContent from '../../../components/BoxContent';
import AsyncSelect from '../../../components/form/AsyncSelect';
import ReactSelect from '../../../components/form/ReactSelect';
import Input from '../../../components/form/FormInput';
import FormCategory from '../../../components/form/FormCategory';
import Button from '../../../components/form/Button';
import PanelBottomActions from '../../../components/PanelBottomActions';
import api from '../../../services/api';
import { IOptionFormat } from '../../../interfaces/IOptionFormat';
import { dateTypeError } from '../../Veiculos/components/FormVeiculo/utils/errorFieldsFormat';
import FormDatePicker from '../../../components/form/FormDatePicker';
import FormInputFile from '../../../components/form/FormInputFile';
import FormInput from '../../../components/form/FormInput';
import EPerfil from '../../../enums/EPerfil';
import { IGetVeiculos } from '../../../interfaces/Response/IGetVeiculos';
import { useVeiculo } from '../../../contexts/VeiculoContext';
import { usePrefixo } from '../../../contexts/PrefixoContext';
import { Container, Content, PdfLink, SubTitle } from '../style';
import Modal from '../../../components/Modal';
import { useVeiculosMarcas } from '../../../contexts/VeiculosMarcasContext';

const schema = Yup.object().shape({
  id_veiculo: Yup.number().required('Esse campo é requerido'),
  id_tipo_movimentacao: Yup.number()
    .required('Esse campo é requerido')
    .typeError('Valor invalido'),
  id_opm_origem: Yup.number().when(['id_tipo_movimentacao'], {
    is: (id_tipo_movimentacao) => !!id_tipo_movimentacao,
    then: Yup.number()
      .required('Esse campo é requerido')
      .typeError('Valor invalido'),
    otherwise: Yup.number()
      .typeError('Valor invalido')
      .notRequired()
      .nullable(true),
  }),
  id_opm_destino: Yup.number().when(['id_tipo_movimentacao'], {
    is: (id_tipo_movimentacao) => !!id_tipo_movimentacao,
    then: Yup.number()
      .required('Esse campo é requerido')
      .typeError('Valor invalido'),
    otherwise: Yup.number()
      .typeError('Valor invalido')
      .notRequired()
      .nullable(true),
  }),
  data_movimentacao: Yup.date()
    .typeError(dateTypeError)
    .max(new Date(), 'Data superior a data atual'),

  data_retorno: Yup.date()
    .typeError('Este campo é requerido')
    .when(['id_tipo_movimentacao'], {
      is: (id_tipo_movimentacao) =>
        id_tipo_movimentacao === ETipoMovimentacao.Empréstimo,
      then: Yup.date()
        .typeError('Este campo é requerido')
        .required('Este campo é requerido'),
    }),

  movimentacao_file: Yup.mixed<File>().required('Este campo é requerido'),
  identificador: Yup.string().notRequired().uppercase(),
});

type IFormInputs = Yup.InferType<typeof schema>;

// const tiposMovimentacaoFase: IOptionFormat[] = [{ value }];

const NovaMovimentacao: React.FC = () => {
  const urlSGA = useRef<string>();
  const { marcas } = useVeiculosMarcas();
  const match: any = useRouteMatch('/veiculos/movimentar/:id');
  const { id } = match?.params;

  const { signOut, delayedPromiseOptionsUnidades, user } = useAuth();
  const {
    tiposMovimentacoes,
    createMovimentacao,
    loadMovimentacoesVeiculo,
  } = useMovimentacao();
  const history = useHistory();
  const dadosMovimentacao = useRef<Record<string, any>>();

  const {
    isOpen: isOpenConfirmacaoMovimentacao,
    onClose: onCloseConfirmacaoMovimentacao,
    onOpen: onOpenConfirmacaoMovimentacao,
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

  const tiposMovimentacoesFormated = useMemo(() => {
    return tiposMovimentacoes.filter(
      (movimentacao) =>
        movimentacao.value !== ETipoMovimentacao['Em Manutenção'].toString(),
    );
  }, [tiposMovimentacoes]);

  const { veiculos, loadVeiculos, veiculo, loadVeiculo } = useVeiculo();
  const { loadPrefixos } = usePrefixo();
  const { loadIdentificadores } = useIdentificador();

  // const { loadKms } = useKm();

  const perfilUsuario = user.currentPerfil
    ? Number.parseInt(user.currentPerfil.value, 10)
    : -1;

  const dataAtual = new Date();

  const [idMovimentacao, setIdMovimentacao] = useState<number>();

  const methods = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: veiculo
      ? {
          id_veiculo: veiculo.id_veiculo,
          data_movimentacao: new Date(
            dataAtual.getFullYear(),
            dataAtual.getMonth(),
            dataAtual.getDate(),
          ),
          movimentacao_file: {} as File,
          data_retorno: undefined,
        }
      : {
          data_movimentacao: new Date(
            dataAtual.getFullYear(),
            dataAtual.getMonth(),
            dataAtual.getDate(),
          ),
          id_veiculo: undefined,
          id_tipo_movimentacao: undefined,
          id_opm_origem: undefined,
          id_opm_destino: undefined,
          movimentacao_file: {} as File,
        },
  });

  const {
    handleSubmit,
    errors,
    control,
    reset,
    setValue,
    watch,
    trigger,
  } = methods;

  const data_movimentacao = watch('data_movimentacao');
  const movimentacaoFile = watch('movimentacao_file');

  const toast = useToast();

  const [veiculoOpmDestino, setVeiculoOpmDestino] = useState<IOptionFormat[]>(
    [],
  );

  const [opmDestinoNome, setOpmDestinoNome] = useState<IOptionFormat>(
    {} as IOptionFormat,
  );

  const [opmOrigemNome, setOpmOrigemNome] = useState<IOptionFormat>(
    {} as IOptionFormat,
  );

  const [
    disabledButtonCreateMovimentacao,
    setDisabledButtonCreateMovimentacao,
  ] = useState(false);

  useEffect(() => {
    async function load(): Promise<void> {
      if (id && Object.values(veiculo).length < 1) {
        await loadVeiculo(id);
        await Promise.all([
          loadPrefixos(id),
          loadIdentificadores(id),

          // loadKms(id),
        ]);

        setValue('id_veiculo', id);
      }
    }
    load();
    // setChassi(veiculo?.chassi);
  }, [id, veiculo, loadVeiculo, loadPrefixos, loadIdentificadores, setValue]);

  const promiseOptionsRenavam = debounce(async (inputValue: string): Promise<
    IOptionFormat[] | undefined
  > => {
    try {
      if (inputValue.trim().length > 0) {
        const response = await api.get<IGetVeiculos>(`veiculos`, {
          params: {
            query: inputValue,
            fields: ['veiculos.renavam'],
            opms: user.opmBusca.value,
          },
        });

        if (response.data.items) {
          const veiculosIds = await Promise.all(
            response.data.items.map(async (item) => item.id_veiculo.toString()),
          );

          const veiculosLoaded = await loadVeiculos(veiculosIds);

          return veiculosLoaded.map((veiculoLoaded) => ({
            label: veiculoLoaded.placa,
            value: veiculoLoaded.id_veiculo.toString(),
          }));
        }

        return undefined;
      }
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }, 250);

  const promiseOptionsPlaca = debounce(async (inputValue: string): Promise<
    IOptionFormat[] | undefined
  > => {
    let responseFormated;
    try {
      if (inputValue.trim().length > 0) {
        const response = await api.get<IGetVeiculos>(`veiculos`, {
          params: {
            query: inputValue,
            fields: ['veiculos.placa'],
            opms: user.opmBusca.value,
          },
        });

        if (response.data.items) {
          const veiculosIds = await Promise.all(
            response.data.items.map(async (item) => item.id_veiculo.toString()),
          );

          const veiculosLoaded = await loadVeiculos(veiculosIds);

          return veiculosLoaded.map((veiculoLoaded) => ({
            label: veiculoLoaded.placa,
            value: veiculoLoaded.id_veiculo.toString(),
          }));
        }

        return undefined;
      }
    } catch (error) {
      console.log(error);
    }
    return responseFormated;
  }, 250);

  const veiculoSelected = useCallback(
    async (id_veiculo: string) => {
      const veiculoEncontrado: any = veiculos.find(
        (item) => item.id_veiculo.toString() === id_veiculo,
      );

      try {
        const movimentacoes = await loadMovimentacoesVeiculo(
          veiculoEncontrado?.id_veiculo,
        );

        const filteredVeiculosByDate = movimentacoes
          ?.filter((movimentacao) => {
            return (
              compareAsc(
                new Date(movimentacao.data_movimentacao),
                data_movimentacao,
              ) <= 0
            );
          })
          .sort((a, b) =>
            compareAsc(
              new Date(a.data_movimentacao),
              new Date(b.data_movimentacao),
            ),
          );

        if (
          filteredVeiculosByDate &&
          filteredVeiculosByDate.length > 0 &&
          (filteredVeiculosByDate?.[0].fases[0].id_movimentacao_fase ===
            EFase.Concessão ||
            filteredVeiculosByDate?.[0].fases[0].id_movimentacao_fase ===
              EFase.Oferta)
        ) {
          toast({
            title: 'Ocorreu um erro.',
            description: 'Veiculos já esta em outra movimentacao',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });

          return;
        }

        await loadPrefixos(veiculoEncontrado?.id_veiculo);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            toast({
              title: 'Ocorreu um erro.',
              description:
                'Você expirou o tempo ou não possui mais acesso ao sistema',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            signOut();
          } else {
            toast({
              title: 'Ocorreu um erro.',
              description: error.response.data.message || 'Erro interno',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          }
        }
      }
    },
    [
      veiculos,
      toast,
      loadPrefixos,
      data_movimentacao,
      signOut,
      loadMovimentacoesVeiculo,
    ],
  );

  const onSubmit = async (formValues: IFormInputs): Promise<void> => {
    const { movimentacao_file, ...restForm } = formValues;

    const movimentacaoData = movimentacao_file.size
      ? { movimentacao_file, ...restForm }
      : {
          ...restForm,
        };

    dadosMovimentacao.current = {
      ...movimentacaoData,
      data_movimentacao,
      id_tipo_movimentacao_fase:
        movimentacoesFasesMapper[
          formValues.id_tipo_movimentacao as ETipoMovimentacao
        ][0],
    };
    onOpenConfirmacaoMovimentacao();
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (veiculo && veiculo.id_veiculo) {
        try {
          const opmDestino = await api.get(
            `veiculos/${veiculo.id_veiculo}/carga`,
            {
              params: {
                data_movimentacao,
              },
            },
          );

          setVeiculoOpmDestino(
            opmDestino.data
              ? [
                  {
                    value: opmDestino.data.opm_destino.id_opm.toString(),
                    label: `${opmDestino.data.opm_destino.nome} - ${opmDestino.data.opm_destino.sigla}`,
                  },
                ]
              : [],
          );
        } catch (error) {
          if (error.response) {
            if (error.response.status === 401) {
              toast({
                title: 'Ocorreu um erro.',
                description:
                  'Você expirou o tempo ou não possui mais acesso ao sistema',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
              signOut();
            } else {
              toast({
                title: 'Ocorreu um erro.',
                description: error.response.data.message || 'Erro interno',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
            }
          }
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [veiculo, data_movimentacao, toast, signOut]);

  useEffect(() => {
    if (veiculoOpmDestino.length > 0) {
      setValue('id_opm_origem', veiculoOpmDestino[0].value);
      setValue('movimentacao_file', {} as File);
      setValue('identificador', undefined);
    } else {
      setValue('id_opm_origem', undefined);
      setValue('movimentacao_file', undefined);
      setValue('identificador', undefined);
    }
  }, [setValue, veiculoOpmDestino, perfilUsuario]);

  useEffect(() => {
    async function handleCreateMovimentacao(): Promise<void> {
      if (disabledButtonCreateMovimentacao) {
        const response = await createMovimentacao(
          dadosMovimentacao.current as object,
          veiculo.id_veiculo,
        );

        setDisabledButtonCreateMovimentacao(false);
        if (response) {
          onCloseConfirmacaoMovimentacao();

          if (response?.url_documento_sga) {
            setIdMovimentacao(response.id_movimentacao);
            if (!dadosMovimentacao.current?.movimentacao_file?.size) {
              urlSGA.current = response.url_documento_sga;
            }
            onOpenDadosAssinatura();
          } else {
            history.push(`/veiculos/editar/${veiculo.id_veiculo}`);
          }
        }
      }
    }

    handleCreateMovimentacao();
  }, [
    history,
    onOpenAssinatura,
    veiculo.id_veiculo,
    createMovimentacao,
    disabledButtonCreateMovimentacao,
    onCloseConfirmacaoMovimentacao,
    onOpenDadosAssinatura,
  ]);

  function handleSelectedFile(event: FormEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files
      ? event.currentTarget.files[0]
      : null;
    const element = event;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Erro.',
          description: 'Tamanho do arquivo nao pode ser superior a 2MB',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      } else if (
        !file.type.match(/^(application\/pdf)|(image\/((pn|(jpe?))g))$/)
      ) {
        toast({
          title: 'Erro.',
          description: 'Arquivo invalido. Apenas PDF/PNG/JPG/JPEG',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        element.currentTarget.value = '';
      } else {
        setValue('movimentacao_file', file);
      }
    }
  }

  return (
    <>
      <TituloPagina title="Movimentar veículo" />
      <BoxContent>
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <FormCategory>Dados do veículo</FormCategory>
              <Row>
                <FormGroup required name="Placa" cols={[3, 6, 12]}>
                  <Controller
                    name="id_veiculo"
                    control={control}
                    render={({ onChange }) => (
                      <AsyncSelect
                        loadOptions={promiseOptionsPlaca}
                        value={
                          veiculo?.placa
                            ? {
                                label: veiculo?.placa,
                                value: veiculo.id_veiculo.toString(),
                              }
                            : undefined
                        }
                        onChange={(option: ValueType<IOptionFormat>) => {
                          const optionSelected = option as IOptionFormat;

                          veiculoSelected(optionSelected.value);
                          onChange(optionSelected.value);
                        }}
                        isDisabled={!!veiculo.id_veiculo}
                        error={errors.id_veiculo?.message}
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup required name="Renavam" cols={[3, 6, 12]}>
                  <Controller
                    name="id_veiculo"
                    control={control}
                    render={({ onChange }) => (
                      <AsyncSelect
                        loadOptions={promiseOptionsRenavam}
                        value={
                          veiculo?.renavam
                            ? {
                                label: veiculo?.renavam,
                                value: veiculo.id_veiculo.toString(),
                              }
                            : undefined
                        }
                        onChange={(option: ValueType<IOptionFormat>) => {
                          const optionSelected = option as IOptionFormat;

                          veiculoSelected(optionSelected.value);
                          onChange(optionSelected.value);
                        }}
                        isDisabled={!!veiculo.id_veiculo}
                        error={errors.id_veiculo?.message}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup name="Marca" cols={[3, 6, 12]}>
                  <Input
                    disabled
                    value={
                      marcas.find(
                        (marca) =>
                          marca.id_veiculo_marca.toString() ===
                          veiculo.id_marca?.toString(),
                      )?.nome
                    }
                  />
                </FormGroup>

                <FormGroup name="Modelo" cols={[3, 6, 12]}>
                  <Input value={veiculo?.veiculoModelo?.nome} disabled />
                </FormGroup>
              </Row>

              <FormCategory>Dados da Movimentação</FormCategory>
              <Row>
                <FormGroup
                  required
                  name="Tipo de Movimentação"
                  cols={[4, 6, 12]}
                >
                  <Controller
                    name="id_tipo_movimentacao"
                    control={control}
                    defaultValue=""
                    render={({ onChange, value }) => (
                      <ReactSelect
                        placeholder="Selecione ..."
                        optionsSelect={tiposMovimentacoesFormated}
                        value={tiposMovimentacoesFormated.find(
                          (option) => option.value === value,
                        )}
                        onChange={async (option: ValueType<IOptionFormat>) => {
                          const optionSelected = option as IOptionFormat;
                          if (
                            Number.parseInt(optionSelected.value, 10) ===
                            ETipoMovimentacao.Empréstimo
                          ) {
                            await trigger();
                          }
                          onChange(optionSelected.value);
                        }}
                        error={errors.id_tipo_movimentacao?.message}
                      />
                    )}
                  />
                </FormGroup>

                {!Number.isNaN(perfilUsuario) &&
                  perfilUsuario === EPerfil.Administrador &&
                  (!movimentacaoFile || !!movimentacaoFile) && (
                    <FormGroup
                      required
                      name="Data da Movimentacao"
                      cols={[2.5, 6, 12]}
                    >
                      <Controller
                        name="data_movimentacao"
                        control={control}
                        render={({ value, onChange }) => (
                          <FormDatePicker
                            showYearDropdown
                            onChange={onChange}
                            dateFormat="dd/MM/yyyy"
                            error={errors.data_movimentacao?.message}
                            selected={value}
                          />
                        )}
                      />
                    </FormGroup>
                  )}

                {Number.parseInt(
                  watch('id_tipo_movimentacao')?.toString(),
                  10,
                ) === ETipoMovimentacao.Empréstimo && (
                  <>
                    <FormGroup
                      required
                      name="Data de Retorno"
                      cols={[2.5, 6, 12]}
                    >
                      <Controller
                        name="data_retorno"
                        control={control}
                        render={({ value, onChange }) => (
                          <FormDatePicker
                            showYearDropdown
                            onChange={onChange}
                            dateFormat="dd/MM/yyyy"
                            error={errors.data_retorno?.message}
                            selected={value}
                          />
                        )}
                      />
                    </FormGroup>
                  </>
                )}
              </Row>

              <Row>
                {/* campo disabled nao passa valores, esse é o problema */}
                <FormGroup required name="OPM de Origem" cols={[6, 6, 12]}>
                  <Controller
                    name="id_opm_origem"
                    control={control}
                    render={({ onChange }) => (
                      <AsyncSelect
                        loadOptions={(unidade: string) =>
                          delayedPromiseOptionsUnidades(unidade.trim(), false)
                        }
                        value={
                          veiculoOpmDestino.length > 0
                            ? veiculoOpmDestino[0]
                            : opmOrigemNome
                        }
                        onChange={(option: ValueType<IOptionFormat>) => {
                          const optionSelected = option as IOptionFormat;

                          setOpmOrigemNome(optionSelected);
                          onChange(optionSelected.value);
                        }}
                        optionsSelect={veiculoOpmDestino}
                        error={errors.id_opm_origem?.message}
                        isDisabled={veiculoOpmDestino.length > 0}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup required name="OPM de Destino" cols={[6, 6, 12]}>
                  <Controller
                    name="id_opm_destino"
                    control={control}
                    render={({ onChange }) => (
                      <AsyncSelect
                        loadOptions={(unidade: string) =>
                          delayedPromiseOptionsUnidades(unidade.trim(), false)
                        }
                        onChange={(option: ValueType<IOptionFormat>) => {
                          const optionSelected = option as IOptionFormat;

                          setOpmDestinoNome(optionSelected);
                          onChange(optionSelected.value);
                        }}
                        error={errors.id_opm_destino?.message}
                        value={opmDestinoNome}
                      />
                    )}
                  />
                </FormGroup>
              </Row>

              <Row>
                <Controller
                  name="movimentacao_file"
                  control={control}
                  render={() =>
                    !Number.isNaN(perfilUsuario) &&
                    perfilUsuario === EPerfil.Administrador ? (
                      <FormGroup
                        name="Arquivo da movimentacao (OBS: MAX: 2MB - PNG/JPEG/JPG/PDF)"
                        cols={[6, 6, 2]}
                      >
                        <FormInputFile
                          onChange={(e) => {
                            handleSelectedFile(e);
                          }}
                          error={(errors.movimentacao_file as any)?.message}
                        />
                      </FormGroup>
                    ) : (
                      <> </>
                    )
                  }
                />

                {!veiculoOpmDestino.length && (
                  <FormGroup required name="Identificador" cols={[3, 6, 12]}>
                    <Controller
                      name="identificador"
                      control={control}
                      render={({ onChange, value }) => (
                        <FormInput
                          onChange={onChange}
                          value={value?.trim().toUpperCase() as string}
                          error={errors.identificador?.message}
                        />
                      )}
                    />
                  </FormGroup>
                )}
              </Row>
            </div>
            <PanelBottomActions>
              <>
                <Button
                  color="red"
                  icon={FaTimes}
                  onClick={() =>
                    history.push(`/veiculos/editar/${veiculo.id_veiculo}`)
                  }
                >
                  Cancelar
                </Button>
                <Button
                  color="yellow"
                  icon={FaEraser}
                  type="button"
                  onClick={() => reset()}
                >
                  Limpar
                </Button>
                <Button color="green" icon={FaSave} type="submit">
                  Movimentar
                </Button>
              </>
            </PanelBottomActions>
          </Form>
        </FormProvider>

        <ModalConfirmação
          onClose={onCloseConfirmacaoMovimentacao}
          isOpen={isOpenConfirmacaoMovimentacao}
          size="xl"
          title="Movimentação"
          confirmOptions={{
            handleClick: async () => {
              setDisabledButtonCreateMovimentacao(true);
            },
            icon: FaSave,
            color: 'green',
            title: 'Confirmar',
            isDisabled: disabledButtonCreateMovimentacao,
          }}
        >
          <Container>
            <Content
              style={{
                textAlign: 'center',
                fontSize: '1.3rem',
                fontWeight: 'bold',
              }}
            >
              Você deseja confirmar esta
              {
                ETipoMovimentacao[
                  dadosMovimentacao.current?.id_tipo_movimentacao
                ]
              }
              ?
            </Content>
          </Container>
        </ModalConfirmação>

        <Modal
          onClose={onCloseDadosAssinatura}
          isOpen={isOpenDadosAssinatura}
          size="xl"
          title={`${
            ETipoMovimentacao[
              watch('id_tipo_movimentacao') as ETipoMovimentacao
            ]
          } de Carga`}
        >
          <Container>
            <SubTitle>Envio</SubTitle>
            <Content>
              Você confirma o envio do veiculo{' '}
              {veiculo?.placa ? `de placa ${veiculo?.placa}` : ''} da(o){' '}
              {veiculoOpmDestino[0]?.label} para {opmDestinoNome.label}
              <p>
                Este procedimento gerará a assinatura do termo eletronico de
                transferencia de veículo. Para ter validade o termo deverá ser
                assinado eletronicamente
              </p>
            </Content>

            <PdfLink
              href={urlSGA.current}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaRegFilePdf size={60} />
              Visualizar Termo
            </PdfLink>
          </Container>

          <PanelBottomActions>
            <>
              <Button
                color="red"
                icon={FaTimes}
                onClick={onCloseDadosAssinatura}
              >
                Cancelar
              </Button>

              <Button
                color="green"
                icon={FaPencilAlt}
                type="button"
                onClick={() => {
                  onOpenAssinatura();
                  onCloseDadosAssinatura();
                }}
              >
                Assinar
              </Button>
            </>
          </PanelBottomActions>
        </Modal>

        {isOpenAssinatura && (
          <ModalAssinatura
            data={{
              movimentacao: {
                id_tipo_movimentacao_fase: EFase['Pendente Assinatura'],
                id_movimentacao: idMovimentacao as number,
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
            id_veiculo={veiculo?.id_veiculo}
            size="2xl"
          />
        )}
      </BoxContent>
    </>
  );
};

export default NovaMovimentacao;
