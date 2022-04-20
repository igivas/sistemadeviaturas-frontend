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
import { ValueType } from 'react-select';
import { useToast } from '@chakra-ui/react';
import { useKm } from '../../../../../contexts/KmContext';
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
import ReactSelect from '../../../../../components/form/ReactSelect';
import { Form } from './styles';
import FormTextArea from '../../../../../components/form/FormTextArea';
import Identificador from './Identificador';
import Prefixo from './Prefixo';
// import { useAuth } from '../../../../../contexts/auth';
import {
  dadosGerais,
  identificador,
  cargaAtualOrganicoOrCedido,
  dadosGeraisOrganicoOrCedido,
  prefixoOrganicoOrCedido,
} from '../utils/schemaFormVeiculo';

import { aquisicaoGenerica, dadosAdicionais } from '../utils/schemaFormVeiculo';
import { formatReferenciasPneus } from '../utils/dataFormated';

interface IProps {
  action: 'editar' | 'cadastrar';
}

type OptionType = { label: string; value: string };

const aquisicaoCed = aquisicaoGenerica.concat(
  Yup.object({
    id_orgao_aquisicao: Yup.string().required('Selecione uma opção'),
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
export type IFormEditarCedido = Yup.InferType<typeof schemaEditar>;

const schemaCadastrar = Yup.object()
  .shape({
    aquisicaoCed,
    km: Yup.string().required('Esse campo é requerido'),
  })
  .concat(schemaEditar)
  .concat(prefixoOrganicoOrCedido)
  .concat(identificador);
export type IFormCadastarCedido = Yup.InferType<typeof schemaCadastrar>;

const LazyDadosGerais = lazy(() => import('./DadosGerais'));
const LazyCarga = lazy(() => import('./CargaAtual'));

const FormCedido: React.FC<IProps> = ({ action }) => {
  const {
    veiculo,
    aquisicaoFile,
    updateVeiculo,
    createVeiculo,
    defaultValue,
    orgaosResponse,
  } = useVeiculo();
  const { optionsReferenciasPneus } = useKm();

  const history = useHistory();
  const toast = useToast();
  const [disabled, setDisabled] = useState(action !== 'cadastrar');
  const [orgaosAquisicao, setOrgaosAquisicao] = useState<OptionType[]>([]);

  const [
    disabledButtonCreateVeiculo,
    setDisabledButtonCreateVeiculo,
  ] = useState(false);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const orgaosFormated = orgaosResponse.map((orgaoAtual) => {
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

  const initialCleanValues = {
    aquisicaoCed: {
      data_aquisicao:
        action === 'cadastrar'
          ? ''
          : parseISO(veiculo.aquisicoes[0].data_aquisicao) || undefined,
      doc_aquisicao: defaultValue(action, '', 'aquisicoes[0].doc_aquisicao'),
      id_orgao_aquisicao: defaultValue(
        action,
        '',
        'aquisicoes[0].id_orgao_aquisicao',
      ).toString(),
      origem_aquisicao: EOrigemDeAquisicao.CESSAO,
      aquisicao_file:
        action === 'cadastrar' ? undefined : aquisicaoFile || undefined,
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
  } as IFormCadastarCedido;

  const formCedido = useMemo(
    () => (action === 'cadastrar' ? schemaCadastrar : schemaEditar),
    [action],
  );
  const methods = useForm<IFormCadastarCedido>({
    resolver: yupResolver(formCedido, {
      stripUnknown: true,
      abortEarly: false,
    }),
    defaultValues: initialCleanValues,
  });

  const { handleSubmit, errors, control, reset, setValue, watch } = methods;

  const docAquisicao = watch('aquisicaoCed.doc_aquisicao');

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

  const onSubmit = async (data: IFormCadastarCedido): Promise<void> => {
    const {
      aquisicaoCed: aquisicao,
      ano_modelo,
      ano_fabricacao,
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
      renavam: renavam?.trim() || null,
      tombo: tombo?.trim() || null,
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

      const {
        prefixo_sequencia,
        prefixo_tipo,
        emprego,
        data_identificador,
        identificador: ident,
        ...restDataCadastrar
      } = rest as Partial<IFormCadastarCedido>;
      try {
        const createdVeiculo = await createVeiculo({
          aquisicao_file,
          prefixo: {
            prefixo_sequencia,
            prefixo_tipo,
            emprego,
          },
          identificador: {
            data_identificador,
            identificador: ident,
          },
          aquisicao: {
            ...restAquisicao,
            origem_aquisicao: EOrigemDeAquisicao.CESSAO,
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
      try {
        await updateVeiculo(
          {
            ...veiculoCaracteristicas,
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
    /* const referenciasFormated = data.referenciasPneus.map(
      (item: any): object => {
        return {
          id_referencia_pneu: item.value,
        };
      },
    );
    const dataFormated = (): any => {
      if (action === 'editar') {
        return {
          ...data,
          // opm_carga: data.opm_carga,
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
        // opm_carga: data.opm_carga,
        referenciasPneus: referenciasFormated,
        ano_fabricacao: new Date(data.ano_fabricacao).getFullYear(),
        ano_modelo: new Date(data.ano_modelo).getFullYear(),
        numero_crv: data.numero_crv.trim(),
        codigo_seguranca_crv: data.codigo_seguranca_crv.trim(),
        prefixo_sequencia: data.prefixo_sequencia.trim(),
        renavam: data.renavam.trim(),
        numero_doc_carga: data.numero_doc_carga.trim(),
        prefixo: {
          prefixo_tipo: data.prefixo_tipo,
          emprego: data.emprego,
          prefixo_sequencia: data.prefixo_sequencia,
          data_prefixo: data.data_prefixo,
          criado_por: 1,
        },
        aquisicao: {
          origem_aquisicao: '2',
          // forma_aquisicao: data.aquisicaoCed.forma_aquisicao,
          id_orgao_aquisicao: data.aquisicaoCed.id_orgao_aquisicao,
          data_aquisicao: data.aquisicaoCed.data_aquisicao,
          valor_aquisicao: '0',
        },
        identificador: {
          data_identificador: data.data_identificador,
          identificador: data.identificador,
        },
      };
    };
    if (action === 'editar') {
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
        console.log(dataFormated());
        const createdVeiculo = await createVeiculo(dataFormated());
        if (createdVeiculo) {
          reset(initialValues());
        }
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
        setValue('aquisicaoCed.aquisicao_file', undefined);
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
        setValue('aquisicaoCed.aquisicao_file', undefined);
        element.currentTarget.value = '';
      } else {
        setValue('aquisicaoCed.aquisicao_file', file);
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {action === 'cadastrar' && (
            <>
              <Row>
                <FormGroup required name="Data de Aquisição" cols={[4, 6, 12]}>
                  <Controller
                    name="aquisicaoCed.data_aquisicao"
                    control={control}
                    render={({ onChange, value }) => (
                      <DatePicker
                        showYearDropdown
                        selected={value}
                        onChange={onChange}
                        error={errors.aquisicaoCed?.data_aquisicao?.message}
                        dateFormat="dd/MM/yyyy"
                        disabled={disabled}
                      />
                    )}
                  />
                </FormGroup>

                {/* <FormGroup name="Valor de Aquisição" cols={[4, 6, 12]}>
                <Controller
                  name="valor_aquisicao"
                  control={control}
                  render={({ onChange, value }) => (
                    <InputCurrency
                      value={value}
                      onChange={(
                        event: any,
                        valueInput: any,
                        maskedValue: any,
                      ) => onChange(Number(valueInput))}
                      error={errors.valor_aquisicao?.message}
                      disabled={disabled}
                    />
                  )}
                />
              </FormGroup> */}
              </Row>
              <Row>
                <FormGroup name="Orgão de Aquisição" cols={[6, 12, 12]}>
                  <Controller
                    name="aquisicaoCed.id_orgao_aquisicao"
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
                        error={errors.aquisicaoCed?.id_orgao_aquisicao?.message}
                        isDisabled={disabled}
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup name="Documento Aquisição" cols={[6, 12, 12]}>
                  <Controller
                    name="aquisicaoCed.doc_aquisicao"
                    control={control}
                    render={(props) => (
                      <FormInput
                        {...props}
                        disabled={disabled}
                        error={errors.aquisicaoCed?.doc_aquisicao?.message}
                      />
                    )}
                  />
                </FormGroup>
              </Row>
              <Row>
                <FormGroup
                  name="Arquivo de aquisição (OBS: MAX: 2MB - PNG/JPEG/JPG/PDF)"
                  cols={[6, 6, 12]}
                  required={!!docAquisicao}
                >
                  <Controller
                    name="aquisicaoCed.aquisicao_file"
                    control={control}
                    render={() => (
                      <FormInputFile
                        onChange={(e) => {
                          handleSelectedFile(e);
                        }}
                        error={errors.aquisicaoCed?.aquisicao_file?.message}
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
            {/* <DadosGerais action={action} disabled={disabled} /> */}

            <FormCategory>CARGA ATUAL</FormCategory>
            <Suspense fallback={<div>Carregando</div>}>
              <LazyCarga disabled={disabled} />
            </Suspense>
            {/* <Carga disabled={disabled} /> */}

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
                      error={errors.data_operacao?.message}
                      dateFormat="dd/MM/yyyy"
                      disabled={disabled}
                    />
                  )}
                  error={errors.data_operacao?.message}
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

export default FormCedido;
