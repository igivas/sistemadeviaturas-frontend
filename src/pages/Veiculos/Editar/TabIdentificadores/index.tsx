import React, { useCallback } from 'react';
import { FaPlus, FaSearch, FaSave } from 'react-icons/fa';
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
} from '@chakra-ui/react';
import DataTable, { IColumns } from '../../../../components/DataTable';
import PanelBottomActions from '../../../../components/PanelBottomActions';
import Button from '../../../../components/form/Button';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import Row from '../../../../components/form/Row';
import FormGroup from '../../../../components/form/FormGroup';
import FormInput from '../../../../components/form/FormInput';
import DatePicker from '../../../../components/form/FormDatePicker';
import FormTextArea from '../../../../components/form/FormTextArea';
import { Container, PanelAction, Form } from './styles';
import { useIdentificador } from '../../../../contexts/Identificadores';

const schema = Yup.object().shape({
  data_identificador: Yup.date().typeError('Insira uma data válida!'),
  identificador: Yup.string()
    .required('Esse campo é requerido')
    .max(15, 'Tamanho máximo 15 caracteres'),
  observacao: Yup.string().max(150, 'Tamanho máximo 150 caracteres'),
});

interface IFormInputs {
  data_identificador: Date;
  identificador: string;
  observacao: string;
}

const TabIdentificadores: React.FC = () => {
  const { veiculo } = useVeiculo();
  const { createIdentificador, validateIdentificador } = useIdentificador();
  const {
    handleSubmit,
    errors,
    control,
    clearErrors,
    setValue,
    watch,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const { isOpen, onClose, onOpen } = useDisclosure();

  const data_identificador = watch('data_identificador');

  const identificadorValid = useCallback(
    async (identificador: string) => {
      const formatedIdentificador = identificador.trimEnd().trimStart();
      if (formatedIdentificador && formatedIdentificador.length) {
        if (
          await validateIdentificador({
            nome: formatedIdentificador,
            data_identificador,
          })
        )
          clearErrors('identificador');
        else setValue('identificador', '');
      } else setValue('identificador', '');
    },
    [clearErrors, setValue, validateIdentificador, data_identificador],
  );

  const onSubmit = async (data: any): Promise<void> => {
    try {
      const createdIdentificador = await createIdentificador(
        veiculo.id_veiculo,
        { ...data },
      );

      if (createdIdentificador) {
        onClose();

        // setDataIdentificador(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const colunas: IColumns = [
    {
      field: 'data_identificador',
      text: 'Data',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },
    {
      field: 'identificador',
      text: 'Identificador',
      type: { name: 'text' },
    },
    {
      field: 'ativo',
      text: 'Ativo para este veiculo',
      type: { name: 'enum', enum: { '0': 'Não', '1': 'Sim' } },
    },

    {
      field: 'observacao',
      text: 'OBS',
      type: { name: 'text' },
    },
  ];

  function handleClickEditar(row: object): void {
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
      fields: ['data_identificador'],
      orders: ['desc'],
    },
  };

  return (
    <Container>
      <div>
        <DataTable
          columns={colunas}
          options={options}
          data={veiculo.identificadores}
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
            <ModalHeader>Cadastro de Identificador</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <FormGroup
                    required
                    name="Data Identificador"
                    cols={[4, 12, 12]}
                  >
                    <Controller
                      name="data_identificador"
                      control={control}
                      defaultValue={false}
                      render={({ onChange, value }) => (
                        <DatePicker
                          showYearDropdown
                          selected={value}
                          onChange={onChange}
                          error={errors.data_identificador?.message}
                          dateFormat="dd/MM/yyyy"
                        />
                      )}
                    />
                  </FormGroup>

                  <FormGroup required name="Identificador" cols={[8, 12, 12]}>
                    <Controller
                      name="identificador"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <FormInput
                          onChange={onChange}
                          value={value?.trim().toUpperCase() as string}
                          error={errors.identificador?.message}
                          onBlur={() => identificadorValid(value)}
                          onPaste={(e) => {
                            // e.clipboardData.getData('Text').replace(/\s/g, '')
                            onChange(
                              e.clipboardData
                                .getData('text/plain')
                                .replace(/\s/g, '')
                                .toUpperCase(),
                            );
                            e.preventDefault();
                          }}
                          disabled={!data_identificador}
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
      </div>
      <PanelBottomActions>
        <Button color="green" icon={FaPlus} onClick={onOpen}>
          Adicionar
        </Button>
      </PanelBottomActions>
    </Container>
  );
};

export default TabIdentificadores;
