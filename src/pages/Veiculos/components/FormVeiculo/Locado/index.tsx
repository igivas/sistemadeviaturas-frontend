import React, {
  useState,
  useEffect,
  ChangeEvent,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import { parseISO } from 'date-fns';
import { MdModeEdit } from 'react-icons/md';
import { FaSave, FaTimes, FaEraser } from 'react-icons/fa';
import { useToast } from '@chakra-ui/react';
import { EOrigemDeAquisicao } from '../../../../../enums/EAquisicao';
import FormInputFile from '../../../../../components/form/FormInputFile';
import { useVeiculo } from '../../../../../contexts/VeiculoContext';
import FormGroup from '../../../../../components/form/FormGroup';
import FormInput from '../../../../../components/form/FormInput';
import DatePicker from '../../../../../components/form/FormDatePicker';
import Row from '../../../../../components/form/Row';
import PanelBottomActions from '../../../../../components/PanelBottomActions';
import Button from '../../../../../components/form/Button';
import FormCategory from '../../../../../components/form/FormCategory';
import { Form } from './styles';
import Identificador from './Identificador';
import { dadosGerais, identificador } from '../utils/schemaFormVeiculo';
import { aquisicaoGenerica } from '../utils/schemaFormVeiculo';

interface IProps {
  action: 'editar' | 'cadastrar';
}

type OptionType = { label: string; value: string };

const aquisicaoLoc = aquisicaoGenerica;

const schemaCadastrar = Yup.object()
  .shape({
    aquisicaoLoc,
    is_reserva: Yup.boolean().required('Este campo é requerido'),
    km: Yup.string().required('Esse campo é requerido'),
  })
  .concat(dadosGerais)
  .concat(identificador);
export type IFormLocadoCadastrar = Yup.InferType<typeof schemaCadastrar>;

const LazyDadosGerais = lazy(() => import('./DadosGerais'));

const FormLocado: React.FC<IProps> = ({ action }) => {
  const {
    veiculo,
    aquisicaoFile,
    createVeiculo,
    updateVeiculo,
    defaultValue,
    orgaosResponse,
  } = useVeiculo();
  const history = useHistory();
  const toast = useToast();
  const [disabled, setDisabled] = useState(action !== 'cadastrar');
  const [, setOrgaosAquisicao] = useState<OptionType[]>([]);

  const [
    disabledButtonCreateVeiculo,
    setDisabledButtonCreateVeiculo,
  ] = useState(false);

  // const [origemAquisicao] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const orgaosFormated = orgaosResponse.map<OptionType>((orgaoAtual) => {
          return {
            value: orgaoAtual.id_orgao.toString(),
            label: `${orgaoAtual.sigla} - ${orgaoAtual.nome}`,
          };
        });

        setOrgaosAquisicao(orgaosFormated);
      } catch (error) {
        console.log(error);
      }
    }

    load();
  }, [orgaosResponse]);

  // const formatInitialReferencias = useCallback((): any[] => {
  //   return veiculo.referenciasPneus?.map((item) => {
  //     return {
  //       value: item.id_referencia_pneu,
  //       label: item.descricao,
  //     };
  //   });
  // }, [veiculo]);

  const formLocado = useMemo(
    () => (action === 'cadastrar' ? schemaCadastrar : dadosGerais),
    [action],
  );

  const initialCleanValues = {
    aquisicaoLoc: {
      origem_aquisicao: EOrigemDeAquisicao.LOCADO,
      doc_aquisicao: defaultValue(action, '', 'aquisicoes[0].doc_aquisicao'),
      data_aquisicao:
        action === 'cadastrar'
          ? ''
          : parseISO(veiculo.aquisicoes[0].data_aquisicao) || undefined,
      aquisicao_file:
        action === 'cadastrar' ? undefined : aquisicaoFile || undefined,
    },
    identificador: '',
    data_identificador: '' as unknown,

    chassi: defaultValue(action, '', 'chassi'),
    placa: defaultValue(action, '', 'placa'),
    id_veiculo_especie: defaultValue(
      action,
      '',
      'id_veiculo_especie',
    ).toString(),
    id_marca: defaultValue(action, '', 'id_marca').toString(),
    id_modelo: defaultValue(action, '', 'id_modelo').toString(),
    id_cor: defaultValue(action, '', 'id_cor').toString(),
    is_reserva: Boolean(Number(defaultValue(action, false, 'is_reserva'))),
    km: '' as unknown,

    renavam: defaultValue(action, '', 'renavam'),
  } as IFormLocadoCadastrar;

  const methods = useForm<IFormLocadoCadastrar>({
    resolver: yupResolver(formLocado),
    defaultValues: initialCleanValues,
  });

  const { handleSubmit, errors, control, reset, watch, setValue } = methods;

  const docAquisicao = watch('aquisicaoLoc.doc_aquisicao');

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      toast({
        title: 'Erro.',
        description:
          'Campos obrigatórios não preenchidos ou campos obrigatórios em formato inválido',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [errors, toast]);

  const onSubmit = async (data: IFormLocadoCadastrar): Promise<void> => {
    const {
      aquisicaoLoc: aquisicao,
      placa,
      renavam,
      chassi,
      ...restForm
    } = data;
    const rest = {
      ...restForm,
      placa: placa?.trim(),
      renavam: renavam?.trim(),
      chassi: chassi.trim(),
    };
    setDisabledButtonCreateVeiculo(true);
    if (action === 'cadastrar') {
      try {
        const { aquisicao_file, ...restAquiscao } = aquisicao;
        const {
          identificador: ident,
          data_identificador,
          ...restData
        } = rest as Partial<IFormLocadoCadastrar>;

        const createdVeiculo = await createVeiculo({
          aquisicao: {
            ...restAquiscao,
            origem_aquisicao: EOrigemDeAquisicao.LOCADO,
          },
          aquisicao_file,
          identificador: {
            identificador: ident,
            data_identificador,
          },
          ...restData,
        });
        setDisabledButtonCreateVeiculo(false);
        if (createdVeiculo) {
          history.push('/veiculos/consulta');
          reset(initialCleanValues);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await updateVeiculo(
          {
            aquisicao: {
              origem_aquisicao: EOrigemDeAquisicao.LOCADO,
            },
            ...rest,
          },
          veiculo.id_veiculo && veiculo.id_veiculo,
        );

        setDisabledButtonCreateVeiculo(false);

        history.push('/veiculos/consulta');
      } catch (error) {
        console.log(error);
      }
    }
    /*  const referenciasFormated =
      data.referenciasPneus &&
      data.referenciasPneus.map((item: any): object => {
        return {
          id_referencia_pneu: item.value,
        };
      });
    console.log(referenciasFormated);
    const dataFormated = (): any => {
      if (action === 'editar') {
        return {
          ...data,
          referenciasPneus: referenciasFormated,
          ano_fabricacao: new Date(data.ano_fabricacao).getFullYear(),
          ano_modelo: new Date(data.ano_modelo).getFullYear(),
          numero_crv: data.numero_crv.trim(),
          codigo_seguranca_crv: data.codigo_seguranca_crv.trim(),
          renavam: data.renavam.trim(),
          numero_doc_carga: data.numero_doc_carga.trim(),
          // opm_carga: opmSelected?.uni_codigo,
        };
      }

      return {
        ...data,

        referenciasPneus: referenciasFormated,
        ano_fabricacao: new Date(data.ano_fabricacao).getFullYear(),
        ano_modelo: new Date(data.ano_modelo).getFullYear(),
        numero_crv: data.numero_crv.trim(),
        codigo_seguranca_crv: data.codigo_seguranca_crv.trim(),
        prefixo_sequencia: data.prefixo_sequencia.trim(),
        renavam: data.renavam.trim(),
        numero_doc_carga: data.numero_doc_carga.trim(),
        aquisicao: {
          origem_aquisicao: data.origem_aquisicao,
          forma_aquisicao: data.forma_aquisicao,
          id_orgao_aquisicao: data.id_orgao_aquisicao,
          data_aquisicao: data.data_aquisicao,
          valor_aquisicao: data.valor_aquisicao,
        },
        identificador: {
          data_identificador: data.data_identificador,
          identificador: data.identificador,
        },
      };
    }; */

    /* if (action === 'editar') {
      try {
        await updateVeiculo(
          dataFormated(),
          veiculo.id_veiculo && veiculo.id_veiculo,
        );
      } catch (error) {
        console.log(error);
      }
    }

    if (action === 'cadastrar') {
      try {
        const createdVeiculo = await createVeiculo(dataFormated());

        if (createdVeiculo) {
          reset(initialValues());
        }
        console.log(dataFormated());
      } catch (error) {
        console.log(error);
      }
    } */
  };

  function handleSelectedFile(event: ChangeEvent<HTMLInputElement>): void {
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
        setValue('aquisicaoLoc.aquisicao_file', undefined);
        element.currentTarget.value = '';
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
        setValue('aquisicaoLoc.aquisicao_file', undefined);
        element.currentTarget.value = '';
      } else {
        setValue('aquisicaoLoc.aquisicao_file', file);
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <>
            {action === 'cadastrar' && (
              <>
                <Row>
                  <FormGroup required name="Data da locação" cols={[3, 6, 12]}>
                    <Controller
                      name="aquisicaoLoc.data_aquisicao"
                      control={control}
                      render={({ onChange, value }) => (
                        <DatePicker
                          showYearDropdown
                          selected={value}
                          onChange={onChange}
                          error={errors.aquisicaoLoc?.data_aquisicao?.message}
                          dateFormat="dd/MM/yyyy"
                          disabled={disabled}
                        />
                      )}
                    />
                  </FormGroup>

                  {/* <FormGroup
                required
                name="Empresa de Aquisição"
                cols={[5, 12, 12]}
              >
                <Controller
                  name="id_orgao_aquisicao"
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactSelect
                      placeholder="Selecione..."
                      optionsSelect={orgaosAquisicaoFiltered}
                      value={orgaosAquisicao.find(
                        (option) => option.value === value,
                      )}
                      onChange={(option: ValueType<OptionType>) => {
                        const optionSelected = option as OptionType;
                        onChange(optionSelected.value);
                      }}
                      error={errors.aquisicaoLoc?.id_orgao_aquisicao?.message}
                      isDisabled={disabled}
                    />
                  )}
                />
              </FormGroup> */}
                  <FormGroup
                    name="Descrição do Documento Locação"
                    cols={[4, 12, 12]}
                  >
                    <Controller
                      name="aquisicaoLoc.doc_aquisicao"
                      control={control}
                      render={(props) => (
                        <FormInput
                          {...props}
                          disabled={disabled}
                          error={errors.aquisicaoLoc?.doc_aquisicao?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <FormGroup
                    name="Arquivo de locação (OBS: MAX: 2MB - PNG/JPEG/JPG/PDF)"
                    cols={[6, 3, 2]}
                    required={!!docAquisicao}
                  >
                    <Controller
                      name="aquisicaoLoc.aquisicao_file"
                      control={control}
                      render={() => (
                        <FormInputFile
                          onChange={(e) => {
                            handleSelectedFile(e);
                          }}
                          error={errors.aquisicaoLoc?.aquisicao_file?.message}
                          disabled={disabled}
                          onClickButton={() => {
                            const inputs = document.querySelectorAll('input');
                            inputs.forEach((input) => {
                              if (input.type === 'file') {
                                // eslint-disable-next-line no-param-reassign
                                input.value = '';
                                setValue(
                                  'aquisicaoCed.aquisicao_file',
                                  undefined,
                                );
                              }
                            });
                          }}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <FormCategory>IDENTIFICADOR ATUAL</FormCategory>
                <Identificador disabled={disabled} />
              </>
            )}
          </>

          <>
            <FormCategory>DADOS GERAIS</FormCategory>
            <Suspense fallback={<div>carregando...</div>}>
              <LazyDadosGerais action={action} disabled={disabled} />
            </Suspense>

            {/* <DadosGerais action={action} disabled={disabled} /> */}

            {/* <FormCategory>DADOS ADICIONAIS</FormCategory>
            <Row>
              <FormGroup name="Referências Pneus" cols={[8, 6, 12]}>
                <Controller
                  name="referenciasPneus"
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactSelect
                      placeholder="Selecione..."
                      optionsSelect={veiculoReferencias}
                      isMulti
                      value={value}
                      onChange={(option: ValueType<OptionType>) => {
                        const optionSelected = option as OptionType;
                        onChange(optionSelected || []);
                      }}
                      // error={errors.referenciasPneus?.message}
                      isDisabled={disabled}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup name="Data Operação" cols={[4, 6, 12]}>
              <Controller
                name="data_operacao"
                control={control}
                render={({ onChange, value }) => (
                  <DatePicker
                    showYearDropdown
                    selected={value}
                    onChange={onChange}
                    error={errors.data_operacao?.message}
                    dateFormat="dd/MM/yyyy"
                    disabled={disabled}
                  />
                )}
              />
            </FormGroup>
            </Row>
            <Row>
              <FormGroup name="Observação" cols={[12, 12, 12]}>
              <Controller
                name="observacao"
                control={control}
                render={(props) => (
                  <FormTextArea
                    {...props}
                    rows={5}
                    disabled={disabled}
                    error={errors.observacao?.message}
                  />
                )}
              />
            </FormGroup>
            </Row> */}
          </>
        </div>

        <PanelBottomActions>
          {action === 'editar' ? (
            <>
              <Button
                color="red"
                icon={FaTimes}
                onClick={() => history.push('/veiculos/consulta')}
              >
                Cancelar
              </Button>
              {disabled && (
                <Button
                  color="yellow"
                  icon={MdModeEdit}
                  onClick={() => setDisabled(!disabled)}
                  disabled={!disabled}
                >
                  Editar
                </Button>
              )}

              {!disabled && (
                <Button
                  color="green"
                  icon={FaSave}
                  type="submit"
                  disabled={disabledButtonCreateVeiculo}
                >
                  Salvar
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                color="red"
                icon={FaTimes}
                onClick={() => history.push('/veiculos/consulta')}
              >
                Cancelar
              </Button>
              <Button
                color="yellow"
                icon={FaEraser}
                type="button"
                onClick={() => reset(initialCleanValues)}
              >
                Limpar
              </Button>
              <Button
                color="green"
                icon={FaSave}
                type="submit"
                disabled={disabledButtonCreateVeiculo}
              >
                Salvar
              </Button>
            </>
          )}
        </PanelBottomActions>
      </Form>
    </FormProvider>
  );
};

export default FormLocado;
