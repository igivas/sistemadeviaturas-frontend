import React, { useEffect } from 'react';
import { FaPlus, FaSave } from 'react-icons/fa';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { ValueType } from 'react-select';
import { useKm } from '../../../../contexts/KmContext';
import Row from '../../../../components/form/Row';
import ReactSelect from '../../../../components/form/ReactSelect';
import FormGroup from '../../../../components/form/FormGroup';
import api from '../../../../services/api';
import { Container, Form, PanelAction } from './styles';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import DataTable, { IColumns } from '../../../../components/DataTable';
import { FormTextArea } from '../../../../components/form/FormTextArea/styles';
import DatePicker from '../../../../components/form/FormDatePicker';
import FormInput from '../../../../components/form/FormInput';
import Button from '../../../../components/form/Button';
import PanelBottomActions from '../../../../components/PanelBottomActions';
import optionHistoricoAtual from '../../../../utils/optionsHistoricoAtual';
import { IOptionFormat } from '../../../../interfaces/IOptionFormat';

const schema = Yup.object().shape({
  is_current_km: Yup.boolean().required('Este campo é requerido'),

  data_km: Yup.date().typeError('Insira uma data válida!'),
  km_atual: Yup.number()
    .required('Esse campo é requerido')
    .typeError('Valor invalido'),
  observacao: Yup.string().max(150, 'Tamanho máximo 150 caracteres'),
});

interface IFormInputs {
  data_km: Date;
  km_atual: number;
  observacao: string;
  is_current_km: boolean;
}

const TabKms: React.FC = () => {
  const { veiculo } = useVeiculo();
  const { createKm } = useKm();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const {
    handleSubmit,
    errors,
    control,
    setValue,
    watch,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      data_km: undefined,
      is_current_km: true,
      km_atual: undefined,
      observacao: undefined,
    },
  });

  const watchIsKmCurrent = watch('is_current_km');

  const colunas: IColumns = [
    {
      field: 'criado_em',
      text: 'Data de criacao',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },

    {
      field: 'data_km',
      text: 'Data Km',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },

    {
      field: 'km_atual',
      text: 'KM',
      type: { name: 'text' },
    },

    {
      field: 'criado_por',
      text: 'KM',
      type: { name: 'text' },
    },
  ];

  /* function handleClickEditar(row: object): void {
    // console.log('minha row', row);
    // history.push('/veiculos/editar');
  } */

  const options = {
    reload: true,
    serverData: {
      url: `${api.defaults.baseURL}/veiculos/${veiculo.id_veiculo}/kms`,
      headers: { Authorization: api.defaults.headers.authorization },
      serverPagination: true,
    },

    /* actions: {
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
    }, */
    filters: [
      // {
      //   field: 'situacao',
      //   label: 'Situação',
      //   options: [
      //     { value: 'Baixada', text: 'Baixada' },
      //     { value: 'Inservível', text: 'Inservível' },
      //     { value: 'Operando', text: 'Operando' },
      //   ],
      // },
    ],
  };

  useEffect((): (() => void) | undefined => {
    const timer = setInterval(() => {
      if (watchIsKmCurrent) setValue('data_km', new Date());
    }, 1000);

    !watchIsKmCurrent && setValue('data_km', undefined);

    return () => clearInterval(timer);
  }, [watchIsKmCurrent, setValue]);

  const onSubmit = async (data: IFormInputs): Promise<void> => {
    try {
      const { data_km, km_atual } = data;
      const createdSituacao = await createKm(
        {
          data_km,
          km_atual,
        },
        veiculo.id_veiculo,
      );

      if (createdSituacao) {
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <DataTable columns={colunas} options={options} />

      <Modal
        onClose={onClose}
        isOpen={isOpen}
        size="xl"
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cadastro de Km</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <FormGroup required name="Status" cols={[6, 6, 12]}>
                  <Controller
                    name="is_current_km"
                    control={control}
                    render={({ onChange, value }) => (
                      <ReactSelect
                        placeholder="Selecione ..."
                        optionsSelect={optionHistoricoAtual}
                        value={
                          value
                            ? optionHistoricoAtual[1]
                            : optionHistoricoAtual[0]
                        }
                        onChange={(option: ValueType<IOptionFormat>) => {
                          const optionSelected = option as IOptionFormat;

                          onChange(optionSelected.value !== '0');
                        }}
                        error={errors.is_current_km?.message}
                      />
                    )}
                  />
                </FormGroup>
              </Row>

              <Row>
                <FormGroup required name="Data Km" cols={[4, 12, 12]}>
                  <Controller
                    name="data_km"
                    control={control}
                    defaultValue={false}
                    render={({ onChange, value }) => (
                      <DatePicker
                        showYearDropdown
                        selected={value}
                        onChange={onChange}
                        error={errors.data_km?.message}
                        dateFormat="dd/MM/yyyy HH:mm:ss"
                        disabled={watchIsKmCurrent}
                        maxDate={new Date()}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup name="KM" cols={[6, 6, 12]}>
                  <Controller
                    name="km_atual"
                    control={control}
                    render={(props) => (
                      <FormInput {...props} error={errors.km_atual?.message} />
                    )}
                  />
                </FormGroup>
              </Row>
              <Row>
                <FormGroup name="Observação" cols={[12, 12, 12]}>
                  <Controller
                    name="observacao"
                    control={control}
                    defaultValue=""
                    render={(props) => (
                      <FormTextArea
                        {...props}
                        rows={4}
                        maxLength={150}
                        error={errors.observacao?.message}
                      />
                    )}
                  />
                </FormGroup>
              </Row>

              <PanelAction>
                <Button color="green" icon={FaSave} type="submit">
                  Salvar
                </Button>
              </PanelAction>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <PanelBottomActions>
        <Button color="green" icon={FaPlus} onClick={onOpen}>
          Adicionar
        </Button>
      </PanelBottomActions>
    </Container>
  );
};

export default TabKms;
