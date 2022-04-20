import React, { useEffect, useState, FormEvent, useCallback } from 'react';
import {
  FaEdit,
  FaExternalLinkAlt,
  FaPlus,
  FaSave,
  FaSearch,
} from 'react-icons/fa';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import { ValueType } from 'react-select';
import { orderBy } from 'lodash';
import api from '../../../../services/api';
import { useAquisicao } from '../../../../contexts/AquisicoesContext';
import { IAquisicao } from '../../../../interfaces/IAquisicao';
import FormInput from '../../../../components/form/FormInput';
import FormInputFile from '../../../../components/form/FormInputFile';
import Button from '../../../../components/form/Button';
import {
  EFormaDeAquisicao,
  EOrigemDeAquisicao,
} from '../../../../enums/EAquisicao';
import Row from '../../../../components/form/Row';
import FormGroup from '../../../../components/form/FormGroup';
import ReactSelect from '../../../../components/form/ReactSelect';
import FormDatePicker from '../../../../components/form/FormDatePicker';
import { IOptionFormat } from '../../../../interfaces/IOptionFormat';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import DataTable, { IColumns } from '../../../../components/DataTable';
import PanelBottomActions from '../../../../components/PanelBottomActions';
import * as Component from './styles';
import { requiredField } from '../../components/FormVeiculo/utils/errorFieldsFormat';
import InputCurrency from '../../../../components/form/InputCurrency';
import ButtonAccordeon from '../../../../components/Button';

const maxValueAquisicao = 99000000;

const validationSchema = Yup.object()
  .shape({
    origem_aquisicao: Yup.mixed<EOrigemDeAquisicao>()
      .required('Este campo é requerido')

      .oneOf(Object.values(EOrigemDeAquisicao)),
    id_orgao_aquisicao: Yup.string()
      .notRequired()
      .when(['origem_aquisicao'], {
        is: (origem_aquisicao: EOrigemDeAquisicao) =>
          origem_aquisicao === EOrigemDeAquisicao.CESSAO ||
          origem_aquisicao === EOrigemDeAquisicao.ORGANICO,
        then: Yup.string().required('Este campo é requerido'),
      }),

    forma_aquisicao: Yup.mixed<EFormaDeAquisicao>()
      .oneOf(Object.values(EFormaDeAquisicao), 'Forma de aquisicao invalida')
      .notRequired()
      .when('origem_aquisicao', {
        is: (origem_aquisicao: EOrigemDeAquisicao) =>
          origem_aquisicao === EOrigemDeAquisicao.ORGANICO,
        then: Yup.mixed<EFormaDeAquisicao>()
          .oneOf(
            Object.values(EFormaDeAquisicao),
            'Forma de aquisicao invalida',
          )
          .required('Esse campo é requerido'),
      }),
    data_aquisicao: Yup.date().typeError('Insira um ano válido!').default(''),
    doc_aquisicao: Yup.string(),
    aquisicao_file: Yup.mixed().when('doc_aquisicao', {
      is: (value) => value,
      then: Yup.mixed().required(requiredField),
      otherwise: Yup.mixed().notRequired(),
    }),
    valor_aquisicao: Yup.string()
      .notRequired()
      .when(['origem_aquisicao', 'forma_aquisicao'], {
        is: (
          origem_aquisicao: EOrigemDeAquisicao,
          formaAquisicao: EFormaDeAquisicao,
        ) =>
          origem_aquisicao === EOrigemDeAquisicao.ORGANICO &&
          formaAquisicao === EFormaDeAquisicao.COMPRA,
        then: Yup.string().required('Esse campo é requerido'),
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
  })
  .required('Requerido');

type IFormInputs = {
  origem_aquisicao: EOrigemDeAquisicao;
  id_orgao_aquisicao?: string;
  aquisicao_file?: any;
  data_aquisicao: Date;
  doc_aquisicao: string;
  forma_aquisicao: EFormaDeAquisicao;
  valor_aquisicao: string;
};

const optionsFormaAquisicao = [
  { value: '0', label: 'Compra' },
  { value: '1', label: 'Doação' },
];

const optionsOrigemAquisicao = [
  { value: '0', label: 'Orgânico' },
  { value: '1', label: 'Locado' },
  { value: '2', label: 'Cessão' },
];

const TabAquisicoes: React.FC = () => {
  const { veiculo, orgaosResponse, loadOrgaos } = useVeiculo();
  const { createAquisicao, updateAquisicao } = useAquisicao();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();

  const [row, setRow] = useState<IFormInputs & { id_aquisicao: number }>();
  const [action, setAction] = useState<'editar' | 'cadastrar'>('cadastrar');
  const [isActionEdit, setIsActionEdit] = useState(false);

  const {
    control,
    errors,
    handleSubmit,
    watch,
    setValue,
    trigger,
  } = useForm<IFormInputs>({
    resolver: yupResolver(validationSchema, {
      stripUnknown: true,
      abortEarly: false,
    }),
    defaultValues: row || ({} as IFormInputs),
    // reValidateMode: 'onSubmit',
  });

  const formaAquisicao = watch('forma_aquisicao');
  const origemAquisicao = watch('origem_aquisicao');
  const docAquisicao = watch('doc_aquisicao');

  const [orgaosAquisicao, setOrgaosAquisicao] = useState<IOptionFormat[]>([]);

  useEffect(() => {
    if (formaAquisicao === '0') {
      const orgaoContainsPMCE = orgaosResponse.find((orgaoAtual) => {
        return orgaoAtual.sigla.includes('PMCE');
      });

      if (orgaoContainsPMCE) {
        setValue('id_orgao_aquisicao', orgaoContainsPMCE.id_orgao.toString());
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
        orgaosWithoutPMCE.map<IOptionFormat>((orgao) => ({
          label: `${orgao.nome} - ${orgao.sigla}`,
          value: orgao.id_orgao.toString(),
        })),
      );
    }
  }, [orgaosResponse, formaAquisicao, setValue]);

  useEffect(() => {
    if (orgaosResponse.length < 1) loadOrgaos();
  }, [orgaosResponse, loadOrgaos]);

  const colunas: IColumns = [
    {
      field: 'data_aquisicao',
      text: 'Data',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },

    {
      field: 'origem_aquisicao',
      text: 'Origem de Aquisicao',
      type: {
        name: 'enum',
        enum: {
          '0': 'Orgânico',
          '1': 'Locado',
          '2': 'Cedido',
        },
      },
    },

    {
      field: 'valor_aquisicao',
      text: 'Valor da aquisicao',
      type: { name: 'currency' },
    },
  ];

  const handleClickEditar = useCallback(
    async ({
      data_aquisicao,
      valor_aquisicao,
      id_orgao_aquisicao,
      origem_aquisicao,
      forma_aquisicao,
      id_aquisicao,
      doc_aquisicao,
      file_path,
    }: IAquisicao): Promise<void> => {
      setAction(`editar`);
      const file = file_path
        ? await api.get<Blob>(file_path, { responseType: 'blob' })
        : undefined;

      setRow({
        data_aquisicao: new Date(data_aquisicao),
        valor_aquisicao,
        id_orgao_aquisicao: id_orgao_aquisicao?.toString(),
        origem_aquisicao,
        forma_aquisicao,
        id_aquisicao,
        doc_aquisicao,
        aquisicao_file: file?.data,
      });
      onOpen();
    },
    [onOpen],
  );

  // console.log(origemAquisicao);

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

          getRow: handleClickEditar,
        },
      ],
    },
    order: {
      fields: ['data_aquisicao'],
      orders: ['desc'],
    },
  };

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
        setValue('aquisicao_file', undefined);
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
        setValue('aquisicao_file', undefined);
        element.currentTarget.value = '';
      } else {
        setValue('aquisicao_file', file);
      }
    }
  }

  const onSubmit = async (data: IFormInputs): Promise<void> => {
    if (action === 'cadastrar') {
      await createAquisicao(data, veiculo.id_veiculo);
    } else {
      await updateAquisicao(data, row?.id_aquisicao as number);
    }
    onClose();
  };

  return (
    <Component.Container>
      <div>
        <DataTable
          columns={colunas}
          options={options}
          data={veiculo.aquisicoes}
        />

        <Modal
          onClose={() => {
            setIsActionEdit(false);
            setAction('cadastrar');
            onClose();
          }}
          isOpen={isOpen}
          size="xl"
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Cadastro de Aquisicao</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Component.Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <FormGroup
                    required
                    name="Origem de Aquisição"
                    cols={[4, 6, 12]}
                  >
                    <Controller
                      control={control}
                      name="origem_aquisicao"
                      defaultValue={row?.origem_aquisicao}
                      render={({ value, onChange }) => (
                        <ReactSelect
                          autoFocus
                          placeholder="Selecione ..."
                          optionsSelect={optionsOrigemAquisicao}
                          value={optionsOrigemAquisicao.find(
                            (option) => option.value === value,
                          )}
                          onChange={async (
                            option: ValueType<IOptionFormat>,
                          ) => {
                            const optionSelected = option as IOptionFormat;
                            onChange(optionSelected.value);
                            setValue('aquisicao_file', undefined);
                            setValue('id_orgao_aquisicao', undefined);
                            setValue('forma_aquisicao', undefined);
                            setValue('doc_aquisicao', undefined);

                            await trigger();
                          }}
                          isDisabled={action === 'editar'}
                          error={errors.origem_aquisicao?.message}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormGroup
                    required
                    name="Data de Aquisição"
                    cols={[4, 6, 12]}
                  >
                    <Controller
                      name="data_aquisicao"
                      control={control}
                      defaultValue={row?.data_aquisicao}
                      render={({ onChange, value }) => (
                        <FormDatePicker
                          showYearDropdown
                          onChange={onChange}
                          dateFormat="dd/MM/yyyy"
                          error={errors.data_aquisicao?.message}
                          disabled={!isActionEdit && action === 'editar'}
                          selected={value}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                {(origemAquisicao === EOrigemDeAquisicao.ORGANICO ||
                  row?.forma_aquisicao) && (
                  <Row>
                    <FormGroup
                      required
                      name="Forma de Aquisição"
                      cols={[4, 6, 12]}
                    >
                      <Controller
                        name="forma_aquisicao"
                        control={control}
                        defaultValue={row?.forma_aquisicao}
                        render={({ onChange, value }) => (
                          <ReactSelect
                            placeholder="Selecione ..."
                            optionsSelect={orderBy(
                              optionsFormaAquisicao,
                              ['label'],
                              ['desc'],
                            )}
                            value={optionsFormaAquisicao.find(
                              (option) => option.value === value,
                            )}
                            onChange={async (
                              option: ValueType<IOptionFormat>,
                            ) => {
                              const optionSelected = option as IOptionFormat;
                              onChange(optionSelected.value);

                              await trigger([
                                'id_orgao_aquisicao',
                                'valor_aquisicao',
                              ]);
                            }}
                            error={errors.forma_aquisicao?.message}
                            isDisabled={isActionEdit}
                          />
                        )}
                      />
                    </FormGroup>
                    {(formaAquisicao === EFormaDeAquisicao.COMPRA ||
                      row?.forma_aquisicao === EFormaDeAquisicao.COMPRA) && (
                      <FormGroup
                        required
                        name="Valor de Aquisição"
                        cols={[4, 6, 12]}
                      >
                        <Controller
                          name="valor_aquisicao"
                          control={control}
                          defaultValue={row?.valor_aquisicao}
                          render={({ onChange, value }) => (
                            <InputCurrency
                              value={value}
                              onChange={(
                                event: any,
                                valueInput: any,
                                maskedValue: any,
                              ) => onChange(Number(valueInput))}
                              error={errors.valor_aquisicao?.message}
                              disabled={isActionEdit}
                            />
                          )}
                        />
                      </FormGroup>
                    )}
                  </Row>
                )}

                <Row>
                  {(origemAquisicao === EOrigemDeAquisicao.ORGANICO ||
                    origemAquisicao === EOrigemDeAquisicao.CESSAO ||
                    row?.origem_aquisicao === EOrigemDeAquisicao.ORGANICO ||
                    row?.origem_aquisicao === EOrigemDeAquisicao.CESSAO) && (
                    <FormGroup
                      required
                      name="Orgão de Aquisição"
                      cols={[6, 12, 12]}
                    >
                      <Controller
                        name="id_orgao_aquisicao"
                        control={control}
                        defaultValue={row?.id_orgao_aquisicao}
                        render={({ onChange, value }) => (
                          <ReactSelect
                            placeholder="Selecione ..."
                            optionsSelect={orgaosAquisicao}
                            isDisabled={
                              (formaAquisicao as EFormaDeAquisicao) ===
                                EFormaDeAquisicao.COMPRA &&
                              origemAquisicao !== EOrigemDeAquisicao.CESSAO &&
                              !isActionEdit
                            }
                            onChange={(option: ValueType<IOptionFormat>) => {
                              const optionSelected = option as IOptionFormat;
                              onChange(optionSelected.value);
                            }}
                            value={orgaosAquisicao.find(
                              (orgao) => orgao.value === value,
                            )}
                            error={errors.id_orgao_aquisicao?.message}
                          />
                        )}
                      />
                    </FormGroup>
                  )}
                </Row>

                <Row>
                  <FormGroup name="Documento Aquisição" cols={[6, 12, 12]}>
                    <Controller
                      name="doc_aquisicao"
                      control={control}
                      render={({ onChange, value }) => (
                        <FormInput
                          onChange={onChange}
                          value={value}
                          onBlur={async () =>
                            !!value?.trim() && trigger('movimentacao_file')
                          }
                          error={errors.doc_aquisicao?.message}
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
                      name="aquisicao_file"
                      control={control}
                      render={() => (
                        <FormInputFile
                          onChange={(e) => {
                            handleSelectedFile(e);
                          }}
                          error={errors.aquisicao_file?.message}
                          onClickButton={() => {
                            const inputs = document.querySelectorAll('input');
                            inputs.forEach((input) => {
                              if (input.type === 'file') {
                                // eslint-disable-next-line no-param-reassign
                                input.value = '';
                                setValue('aquisicao_file', undefined);
                              }
                            });
                          }}
                        />
                      )}
                    />

                    {row?.aquisicao_file && (
                      <ButtonAccordeon
                        style={{
                          background: '#e4e9ee',
                          marginTop: '8px',
                          justifyContent: 'space-between',
                          color: '#444444',
                        }}
                        onClick={async (event) => {
                          event.preventDefault();

                          const fileBuffer = await row?.aquisicao_file.arrayBuffer();

                          const blob = new Blob([fileBuffer], {
                            type: row?.aquisicao_file.type,
                          });

                          const fileURL = URL.createObjectURL(blob);
                          window.open(fileURL, '_blank');
                        }}
                      >
                        <FaExternalLinkAlt
                          size={16}
                          style={{ marginRight: '8px' }}
                        />
                        Clique aqui para ver o arquivo atual
                      </ButtonAccordeon>
                    )}
                  </FormGroup>
                </Row>

                <Component.PanelAction>
                  {action === 'editar' && (
                    <Button
                      color="yellow"
                      icon={FaEdit}
                      type="button"
                      onClick={() => setIsActionEdit(!isActionEdit)}
                    >
                      Editar
                    </Button>
                  )}
                  <Button color="green" icon={FaSave} type="submit">
                    Salvar
                  </Button>
                </Component.PanelAction>
              </Component.Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>

      <PanelBottomActions>
        <Button
          color="green"
          icon={FaPlus}
          onClick={() => {
            setRow(undefined);
            onOpen();
          }}
        >
          Adicionar
        </Button>
      </PanelBottomActions>
    </Component.Container>
  );
};

export default TabAquisicoes;
