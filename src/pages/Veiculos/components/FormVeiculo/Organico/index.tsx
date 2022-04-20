import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  useMemo,
  Suspense,
  lazy,
} from 'react';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { parseISO } from 'date-fns';
import { MdModeEdit } from 'react-icons/md';
import { FaSave, FaTimes, FaEraser } from 'react-icons/fa';
import { ValueType } from 'react-select';
import { useToast } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers';
import FormTextArea from '../../../../../components/form/FormTextArea';
import ReactSelect from '../../../../../components/form/ReactSelect';
import FormCategory from '../../../../../components/form/FormCategory';
import PanelBottomActions from '../../../../../components/PanelBottomActions';
import Row from '../../../../../components/form/Row';
import DatePicker from '../../../../../components/form/FormDatePicker';
import FormInputFile from '../../../../../components/form/FormInputFile';
import Button from '../../../../../components/form/Button';

import {
  dadosGerais,
  identificador,
  dadosGeraisOrganicoOrCedido,
  cargaAtualOrganicoOrCedido,
  prefixoOrganicoOrCedido,
  aquisicaoGenerica,
  dadosAdicionais,
} from '../utils/schemaFormVeiculo';
import { useVeiculo } from '../../../../../contexts/VeiculoContext';
import FormGroup from '../../../../../components/form/FormGroup';
import FormInput from '../../../../../components/form/FormInput';
import InputCurrency from '../../../../../components/form/InputCurrency';
import { Form } from './styles';
import Identificador from './Identificador';
import Prefixo from './Prefixo';

import { formatReferenciasPneus } from '../utils/dataFormated';
import {
  EFormaDeAquisicao,
  EOrigemDeAquisicao,
} from '../../../../../enums/EAquisicao';
import { useKm } from '../../../../../contexts/KmContext';

interface IProps {
  action: 'editar' | 'cadastrar';
}

type OptionType = { label: string; value: string };

const optionsFormaAquisicao = [
  { value: '0', label: 'Compra' },
  { value: '1', label: 'Doação' },
];

const maxValueAquisicao = 99000000;

const aquisicaoOrg = aquisicaoGenerica.concat(
  Yup.object({
    forma_aquisicao: Yup.mixed<EFormaDeAquisicao>()
      .required('Esse campo é requerido')
      .oneOf(Object.values(EFormaDeAquisicao), 'Forma de aquisicao invalida'),
    id_orgao_aquisicao: Yup.string().when('forma_aquisicao', {
      is: '1',
      then: Yup.string().required('Esse campo é requerido'),
      otherwise: Yup.string().default(''),
    }),
    valor_aquisicao: Yup.string()
      .when('forma_aquisicao', {
        is: '0',
        then: Yup.string().required('Esse campo é requerido'),
        otherwise: Yup.string().notRequired(),
      })
      .test('invalidValue', 'Valor de aquisição invalido', (value) => {
        try {
          if (Number.parseFloat(value) || !value) return true;
          return false;
        } catch (error) {
          return false;
        }
      })
      .test(
        'bigValue',
        'Valor maior que R$ 99.000.000',
        (value) => Number.parseFloat(value) <= maxValueAquisicao || !value,
      )
      .test(
        'bigValue',
        'Insira um valor maior que R$ 0,00',
        (value) => !!(Number.parseFloat(value) !== 0 || !value),
      ),
  }),
);

const schemaEditar = Yup.object()
  .shape({
    numero_motor: Yup.string()
      .transform((value) => value || undefined)
      .notRequired()
      .max(20, 'No máximo 20 caracteres!'),
  })

  .concat(dadosGerais)
  .concat(dadosGeraisOrganicoOrCedido)
  .concat(cargaAtualOrganicoOrCedido)
  .concat(dadosAdicionais);
export type IFormOrganicoEditar = Yup.InferType<typeof schemaEditar>;

const schemaCadastrar = Yup.object()
  .shape({
    km: Yup.string().required('Esse campo é requerido'),
    aquisicaoOrg,
  })
  .concat(schemaEditar)
  .concat(prefixoOrganicoOrCedido)
  .concat(identificador);
export type IFormOrganicoCadastrar = Yup.InferType<typeof schemaCadastrar>;

const LazyDadosGerais = lazy(() => import('./DadosGerais'));
const LazyCarga = lazy(() => import('./CargaAtual'));

const FormVeiculo: React.FC<IProps> = ({ action }) => {
  const {
    veiculo,
    aquisicaoFile,
    updateVeiculo,
    createVeiculo,
    defaultValue,
    orgaosResponse,
  } = useVeiculo();
  const history = useHistory();
  const toast = useToast();
  const { optionsReferenciasPneus } = useKm();

  const [disabled, setDisabled] = useState(action !== 'cadastrar');
  const [orgaosAquisicao, setOrgaosAquisicao] = useState<OptionType[]>([]);

  const [
    disabledButtonCreateVeiculo,
    setDisabledButtonCreateVeiculo,
  ] = useState(false);

  const validationSchema = useMemo(
    () => (action === 'editar' ? schemaEditar : schemaCadastrar),
    [action],
  );

  const orderOptions = useCallback((options: OptionType[]) => {
    return options.sort((a: OptionType, b: OptionType) => {
      return a.label.localeCompare(b.label);
    });
  }, []);

  const initialCleanValues = {
    aquisicaoOrg: {
      valor_aquisicao: defaultValue(
        action,
        '0',
        'aquisicoes[0].valor_aquisicao',
      ),
      forma_aquisicao: defaultValue(
        action,
        '',
        'aquisicoes[0].forma_aquisicao',
      ),
      data_aquisicao:
        action === 'cadastrar'
          ? ''
          : parseISO(veiculo.aquisicoes[0].data_aquisicao) || undefined,
      id_orgao_aquisicao: defaultValue(
        action,
        '',
        'aquisicoes[0].id_orgao_aquisicao',
      ).toString(),
      origem_aquisicao: EOrigemDeAquisicao.ORGANICO,
      aquisicao_file:
        action === 'cadastrar' ? undefined : aquisicaoFile || undefined,
      doc_aquisicao: defaultValue(action, '', 'aquisicoes[0].doc_aquisicao'),
    },
    emprego: '' as unknown,
    prefixo_sequencia: '' as unknown,
    prefixo_tipo: '' as unknown,

    identificador: '',
    data_identificador: '' as unknown,

    km: '' as unknown,

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
    ano_fabricacao:
      action === 'cadastrar'
        ? ''
        : new Date(Number(veiculo.ano_fabricacao), 0, 1),
    ano_modelo:
      action === 'cadastrar' ? '' : new Date(Number(veiculo.ano_modelo), 0, 1),
    combustivel: defaultValue(action, '', 'combustivel'),
    codigo_seguranca_crv: defaultValue(action, '', 'codigo_seguranca_crv'),
    valor_fipe: defaultValue(action, '', 'valor_fipe'),
    uf: defaultValue(action, '', 'uf').trim().toString(),
    numero_crv: defaultValue(action, '', 'numero_crv'),
    renavam: defaultValue(action, '', 'renavam'),
    numero_motor: defaultValue(action, '', 'numero_motor'),

    data_doc_carga:
      action === 'cadastrar'
        ? undefined
        : veiculo.data_doc_carga
        ? parseISO(veiculo.data_doc_carga)
        : undefined,
    orgao_tombo: defaultValue(action, undefined, 'orgao_tombo')?.toString(),
    tipo_doc_carga: defaultValue(action, null, 'tipo_doc_carga'),
    tombo: defaultValue(action, '', 'tombo'),
    numero_doc_carga: defaultValue(action, '', 'numero_doc_carga'),

    data_operacao:
      action === 'cadastrar'
        ? undefined
        : veiculo.data_operacao
        ? parseISO(veiculo.data_operacao)
        : undefined,
    referenciasPneus: defaultValue(action, [], 'referenciasPneus'),
    observacao: defaultValue(action, '', 'observacao'),
  } as IFormOrganicoCadastrar;

  const methods = useForm<IFormOrganicoCadastrar>({
    resolver: yupResolver(validationSchema, {
      stripUnknown: true,
      abortEarly: false,
    }),
    defaultValues: initialCleanValues,
    // reValidateMode: 'onSubmit',
  });

  const { handleSubmit, errors, control, reset, watch, setValue } = methods;

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

  const forma_aquisicao = watch('aquisicaoOrg.forma_aquisicao');
  const docAquisicao = watch('aquisicaoOrg.doc_aquisicao');

  const onSubmit = async (data: IFormOrganicoCadastrar): Promise<void> => {
    const {
      aquisicaoOrg: aquisicao,
      ano_fabricacao,
      ano_modelo,
      referenciasPneus,
      numero_doc_carga,
      numero_motor,
      placa,
      renavam,
      tombo,
      chassi,
      ...restForm
    } = data;

    const rest = {
      ...restForm,
      numero_doc_carga: numero_doc_carga?.trim(),
      numero_motor: numero_motor?.trim(),
      placa: placa?.trim(),
      renavam: renavam?.trim(),
      tombo: tombo?.trim(),
      chassi: chassi.trim(),
    };
    const veiculoCaracteristicas = {
      ano_fabricacao: ano_fabricacao?.getFullYear(),
      ano_modelo: ano_modelo?.getFullYear(),
      referenciasPneus:
        referenciasPneus && formatReferenciasPneus(referenciasPneus),
    };

    setDisabledButtonCreateVeiculo(true);

    if (action === 'cadastrar') {
      const { aquisicao_file, ...restAquisicao } = aquisicao;

      try {
        const {
          prefixo_sequencia,
          prefixo_tipo,
          emprego,
          data_identificador,
          identificador: ident,
          ...restDataCadastrar
        } = rest as Partial<IFormOrganicoCadastrar>;
        const createdVeiculo = await createVeiculo({
          aquisicao_file,

          prefixo: {
            prefixo_sequencia: prefixo_sequencia?.trim(),
            prefixo_tipo: prefixo_tipo?.trim(),
            emprego,
          },
          identificador: {
            data_identificador,
            identificador: ident?.trim(),
          },
          aquisicao: {
            ...restAquisicao,
            origem_aquisicao: EOrigemDeAquisicao.ORGANICO,
          },
          ...veiculoCaracteristicas,
          ...restDataCadastrar,
        });

        setDisabledButtonCreateVeiculo(false);
        if (createdVeiculo) {
          reset(initialCleanValues);
          history.push('/veiculos/consulta');
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      await updateVeiculo(
        {
          ...veiculoCaracteristicas,
          ...rest,
        },
        veiculo.id_veiculo && veiculo.id_veiculo,
      );
      setDisabledButtonCreateVeiculo(false);
      history.push('/veiculos/consulta');
    }
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
        setValue('aquisicaoOrg.aquisicao_file', undefined);
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
        setValue('aquisicaoOrg.aquisicao_file', undefined);
        element.currentTarget.value = '';
      } else {
        setValue('aquisicaoOrg.aquisicao_file', file);
      }
    }
  }

  useEffect(() => {
    if (forma_aquisicao === '0') {
      const orgaoContainsPMCE = orgaosResponse.find((orgaoAtual) => {
        return orgaoAtual.sigla.includes('PMCE');
      });

      if (orgaoContainsPMCE) {
        setValue(
          'aquisicaoOrg.id_orgao_aquisicao',
          orgaoContainsPMCE.id_orgao.toString(),
        );
        setOrgaosAquisicao([
          {
            label: `${orgaoContainsPMCE.sigla} - ${orgaoContainsPMCE.nome}`,
            value: orgaoContainsPMCE.id_orgao.toString(),
          },
        ]);
      }
    } else {
      const orgaosWithoutPMCE = orgaosResponse.filter(
        (orgao) => !orgao.sigla.includes('PMCE'),
      );

      setOrgaosAquisicao(
        orgaosWithoutPMCE.map<OptionType>((orgao) => ({
          label: `${orgao.nome} - ${orgao.sigla}`,
          value: orgao.id_orgao.toString(),
        })),
      );
    }
  }, [orgaosResponse, forma_aquisicao, setValue]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {action === 'cadastrar' && (
            <>
              <Row>
                <FormGroup required name="Data de Aquisição" cols={[4, 6, 12]}>
                  <Controller
                    name="aquisicaoOrg.data_aquisicao"
                    control={control}
                    render={({ onChange, value }) => (
                      <DatePicker
                        showYearDropdown
                        onChange={onChange}
                        dateFormat="dd/MM/yyyy"
                        disabled={disabled}
                        error={errors.aquisicaoOrg?.data_aquisicao?.message}
                        selected={value}
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup required name="Forma de Aquisição" cols={[4, 6, 12]}>
                  <Controller
                    name="aquisicaoOrg.forma_aquisicao"
                    control={control}
                    render={({ onChange, value }) => (
                      <ReactSelect
                        placeholder="Selecione ..."
                        optionsSelect={orderOptions(optionsFormaAquisicao)}
                        value={optionsFormaAquisicao.find(
                          (option) => option.value === value,
                        )}
                        onChange={(option: ValueType<OptionType>) => {
                          const optionSelected = option as OptionType;
                          onChange(optionSelected.value);
                        }}
                        error={errors.aquisicaoOrg?.forma_aquisicao?.message}
                        isDisabled={disabled}
                      />
                    )}
                  />
                </FormGroup>

                {forma_aquisicao === '0' && (
                  <FormGroup
                    required
                    name="Valor de Aquisição"
                    cols={[4, 6, 12]}
                  >
                    <Controller
                      name="aquisicaoOrg.valor_aquisicao"
                      control={control}
                      render={({ onChange, value }) => (
                        <InputCurrency
                          value={value}
                          onChange={(event: any, valueInput: any) =>
                            onChange(Number(valueInput))
                          }
                          error={errors.aquisicaoOrg?.valor_aquisicao?.message}
                          disabled={disabled}
                        />
                      )}
                      defaultValue={0}
                    />
                  </FormGroup>
                )}
              </Row>
              <Row>
                {forma_aquisicao === '0' && (
                  <FormGroup
                    required
                    name="Orgão de Aquisição"
                    cols={[6, 12, 12]}
                  >
                    <Controller
                      name="aquisicaoOrg.id_orgao_aquisicao"
                      control={control}
                      render={() => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={orgaosAquisicao}
                          error={
                            errors.aquisicaoOrg?.id_orgao_aquisicao?.message
                          }
                          isDisabled
                          value={orgaosAquisicao[0]}
                        />
                      )}
                      defaultValue={8}
                    />
                  </FormGroup>
                )}

                {forma_aquisicao === '1' && (
                  <FormGroup required name="Orgão de doação" cols={[6, 12, 12]}>
                    <Controller
                      name="aquisicaoOrg.id_orgao_aquisicao"
                      control={control}
                      render={({ onChange, value }) => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={orgaosAquisicao}
                          value={orgaosAquisicao.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<OptionType>) => {
                            const optionSelected = option as OptionType;
                            onChange(optionSelected.value);
                          }}
                          error={
                            errors.aquisicaoOrg?.id_orgao_aquisicao?.message
                          }
                          isDisabled={disabled}
                        />
                      )}
                    />
                  </FormGroup>
                )}

                <FormGroup name="Documento Aquisição" cols={[6, 12, 12]}>
                  <Controller
                    name="aquisicaoOrg.doc_aquisicao"
                    control={control}
                    render={(props) => (
                      <FormInput
                        {...props}
                        disabled={disabled}
                        error={errors.aquisicaoOrg?.doc_aquisicao?.message}
                      />
                    )}
                  />
                </FormGroup>
              </Row>
              <Row>
                <FormGroup
                  name="Arquivo de aquisição (OBS: MAX: 2MB - PNG/JPEG/JPG/PDF)"
                  cols={[6, 4, 3]}
                  required={!!docAquisicao}
                >
                  <Controller
                    name="aquisicaoOrg.aquisicao_file"
                    control={control}
                    render={() => (
                      <FormInputFile
                        onChange={(e) => {
                          handleSelectedFile(e);
                        }}
                        error={errors.aquisicaoOrg?.aquisicao_file?.message}
                        disabled={disabled}
                        onClickButton={() => {
                          const inputs = document.querySelectorAll('input');
                          inputs.forEach((input) => {
                            if (input.type === 'file') {
                              // eslint-disable-next-line no-param-reassign
                              input.value = '';
                              setValue(
                                'aquisicaoOrg.aquisicao_file',
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
              <FormCategory>PREFIXO ATUAL</FormCategory>

              <Prefixo />

              <FormCategory>IDENTIFICADOR ATUAL</FormCategory>
              <Identificador disabled={disabled} />
            </>
          )}

          <>
            <FormCategory>DADOS GERAIS</FormCategory>
            <Suspense fallback={<div>carregando...</div>}>
              <LazyDadosGerais action={action} disabled={disabled} />
            </Suspense>

            <FormCategory>CARGA ATUAL</FormCategory>
            <Suspense fallback={<div>Carregando</div>}>
              <LazyCarga disabled={disabled} action={action} />
            </Suspense>

            <FormCategory>DADOS ADICIONAIS</FormCategory>
            <Row>
              <FormGroup required name="Referências Pneus" cols={[8, 6, 12]}>
                <Controller
                  name="referenciasPneus"
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactSelect
                      placeholder="Selecione ..."
                      optionsSelect={optionsReferenciasPneus}
                      isMulti
                      value={value}
                      onChange={onChange}
                      isDisabled={disabled}
                      error={(errors.referenciasPneus as any)?.message}
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
                      dateFormat="dd/MM/yyyy"
                      disabled={disabled}
                      error={errors.data_operacao?.message}
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
            </Row>
          </>
        </div>

        <PanelBottomActions>
          {action === 'editar' && (
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
          )}
          {action === 'cadastrar' && (
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
                onClick={() => {
                  reset(initialCleanValues);
                  /* Object.keys(initialCleanValues).forEach((key) =>
                    setValue(key, undefined),
                  ); */
                }}
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

export default FormVeiculo;
