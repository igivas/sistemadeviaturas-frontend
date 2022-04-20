import React, { useCallback } from 'react';
import { FaPlus, FaSearch, FaSave } from 'react-icons/fa';
import { ValueType } from 'react-select';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
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
import api from '../../../../services/api';
import DataTable, { IColumns } from '../../../../components/DataTable';
import PanelBottomActions from '../../../../components/PanelBottomActions';
import Button from '../../../../components/form/Button';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import Row from '../../../../components/form/Row';
import FormGroup from '../../../../components/form/FormGroup';
import NumberFormat from '../../../../components/form/InputNumberFormat';
import ReactSelect from '../../../../components/form/ReactSelect';

import { Container, PanelAction, Form } from './styles';
import { EPrefixoTipo, EEmprego } from '../../../../enums/EPrefixo';
import { usePrefixo } from '../../../../contexts/PrefixoContext';
import { IOptionFormat } from '../../../../interfaces/IOptionFormat';

const optionsPrefixosTipos = Object.entries(EPrefixoTipo).reduce(
  (options, currentPrefixoTipo) => {
    return [
      ...options,
      {
        label: currentPrefixoTipo[0],
        value: currentPrefixoTipo[1],
      },
    ];
  },
  [] as any[],
);
const schema = Yup.object().shape({
  prefixo_tipo: Yup.string().required('Esse campo é requerido'),
  emprego: Yup.string().required('Esse campo é requerido'),
  // data_prefixo: Yup.date().typeError('Insira uma data válida!'),
  prefixo_sequencia: Yup.string()
    .required('Esse campo é requerido')
    .max(5, 'No máximo 5 caracteres!'),
});

type IFormInputs = Yup.InferType<typeof schema>;

const TabPrefixos: React.FC = () => {
  const { veiculo } = useVeiculo();
  const { createPrefixo, optionsEmpregos } = usePrefixo();
  const {
    handleSubmit,
    errors,
    control,
    setValue,
    clearErrors,
    watch,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      prefixo_sequencia:
        veiculo.prefixos.length > 0
          ? veiculo.prefixos[0].prefixo_sequencia
          : undefined,
      prefixo_tipo:
        veiculo.prefixos.length > 0
          ? veiculo.prefixos[0].prefixo_tipo
          : undefined,
    },
  });

  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const prefixoTipo = watch('prefixo_tipo');
  const empregos = optionsEmpregos(prefixoTipo as EPrefixoTipo);

  const formatedEPrefixoTipo = optionsPrefixosTipos.reduce((tipo, current) => {
    return {
      ...tipo,
      [current.value]: current.label,
    };
  }, {});

  const formatedEEmprego = Object.entries(EEmprego).reduce(
    (objEmprego, emprego) => ({
      ...objEmprego,
      [emprego[1]]: emprego[0],
    }),
    {},
  );

  const colunas: IColumns = [
    {
      field: 'prefixo_tipo',
      text: 'Tipo',
      type: {
        name: 'enum',
        enum: formatedEPrefixoTipo,
      },
    },
    {
      field: 'prefixo_sequencia',
      text: 'Sequência',
      type: { name: 'text' },
    },

    {
      field: 'emprego',
      text: 'Emprego',
      type: {
        name: 'enum',
        enum: formatedEEmprego,
      },
    },
    {
      field: 'criado_em',
      text: 'Criado Em',
      type: { name: 'date', format: 'dd/MM/yyyy HH:mm:ss' },
    },
  ];

  function handleClickEditar(row: object): void {
    // console.log('minha row', row);
    // history.push('/veiculos/editar');
    alert('Função não está pronta');
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

          getRow: handleClickEditar,
        },
      ],
    },
    order: {
      fields: ['data_prefixo'],
      orders: ['desc'],
    },
  };

  const prefixoValid = useCallback(
    (prefixoSequencia: string) => {
      async function isValidPrefixo(): Promise<void> {
        try {
          await api.get(`/check`, {
            params: {
              query: {
                prefixo: {
                  prefixo_tipo: prefixoTipo,
                  prefixo_sequencia: prefixoSequencia,
                },
              },
            },
          });
          clearErrors(['prefixo_sequencia', 'prefixo_tipo']);
        } catch (error) {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                toast({
                  title: 'Erro',
                  description: 'Prefixo já existente',
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                  position: 'top-right',
                });
                setValue('prefixo_sequencia', '');

                break;
              }

              default: {
                /* empty */
              }
            }
          }
        }
      }

      isValidPrefixo();
    },
    [toast, prefixoTipo, setValue, clearErrors],
  );

  const onSubmit = async (data: IFormInputs): Promise<void> => {
    try {
      const createdPrefixo = await createPrefixo(veiculo.id_veiculo, {
        body: {
          ...data,
          emprego: empregos.find((option) => option.value === data.emprego)
            ?.value,
          criado_por: 1,
        },
      });

      if (createdPrefixo) onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <div>
        <DataTable
          columns={colunas}
          options={options}
          data={veiculo.prefixos}
        />

        <Modal
          onClose={onClose}
          isOpen={isOpen}
          size="xl"
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Cadastro de Prefixo</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  {/* <FormGroup name="Data Prefixo" cols={[4, 6, 12]}>
                <Controller
                  name="data_prefixo"
                  control={control}
                  defaultValue={false}
                  render={({ onChange, value }) => (
                    <DatePicker
                      showYearDropdown
                      selected={value}
                      onChange={onChange}
                      error={errors.data_prefixo?.message}
                      dateFormat="dd/MM/yyyy"
                    />
                  )}
                />
              </FormGroup> */}
                  <FormGroup name="Prefixo Tipo" cols={[8, 6, 12]}>
                    <Controller
                      name="prefixo_tipo"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={optionsPrefixosTipos}
                          value={optionsPrefixosTipos.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<IOptionFormat>) => {
                            const optionSelected = option as IOptionFormat;
                            onChange(optionSelected.value);
                          }}
                          error={errors.prefixo_tipo?.message}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormGroup
                    required
                    name="Prefixo Sequencia"
                    cols={[4, 6, 12]}
                  >
                    <Controller
                      name="prefixo_sequencia"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <NumberFormat
                          onChange={onChange}
                          value={value}
                          error={errors.prefixo_sequencia?.message}
                          format="#####"
                          onBlur={() => prefixoValid(value)}
                          disabled={
                            !!(veiculo.prefixos && veiculo.prefixos.length > 0)
                          }
                        />
                      )}
                    />
                  </FormGroup>
                  <FormGroup required name="Emprego" cols={[8, 6, 12]}>
                    <Controller
                      name="emprego"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={empregos}
                          value={empregos.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<IOptionFormat>) => {
                            const optionSelected = option as IOptionFormat;
                            onChange(optionSelected.value);
                          }}
                          error={errors.emprego?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <Row />

                <PanelAction>
                  <Button color="green" icon={FaSave} type="submit">
                    Salvar
                  </Button>
                </PanelAction>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
      <PanelBottomActions>
        <Button color="green" icon={FaPlus} onClick={onOpen}>
          Adicionar
        </Button>
      </PanelBottomActions>
    </Container>
  );
};

export default TabPrefixos;
