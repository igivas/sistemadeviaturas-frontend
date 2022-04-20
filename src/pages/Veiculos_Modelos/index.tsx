import React, { useCallback, useState } from 'react';
import { FaEdit, FaSave, FaSearch, FaTimes } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import {
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  toast,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ModalContent, ModalHeader } from 'components/Modal/styles';
import { IGetModelos } from 'interfaces/Response/IGetModelos';
import Modal from 'components/Modal';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';

import { PanelAction } from 'pages/Veiculos/Editar/TabPrefixos/styles';
import Button from 'components/form/Button';
import { Form } from 'pages/Veiculos/components/FormVeiculo/styles';
import { ValueType } from 'react-select';
import { IOptionFormat } from 'interfaces/IOptionFormat';
import { close } from 'fs';
import PanelBottomActions from 'components/PanelBottomActions';
import { position } from 'polished';
import Input from '../../components/form/FormInput';
import FormGroup from '../../components/form/FormGroup';
import FormCategory from '../../components/form/FormCategory';
import Row from '../../components/form/Row';

import { useAuth } from '../../contexts/auth';
import { useVeiculosEspecies } from '../../contexts/VeiculosEspeciesContext';
import { useVeiculosMarcas } from '../../contexts/VeiculosMarcasContext';
import api from '../../services/api';
import BoxContent from '../../components/BoxContent';
import TituloPagina from '../../components/TituloPagina';
import DataTable, { IColumns } from '../../components/DataTable';
import FormInput from '../../components/form/FormInput';
import ReactSelect from '../../components/form/ReactSelect';

interface IFields {
  [key: string]: string | number;
}

type IProps = {
  disabled: boolean;
};

type IFormInputs = {
  id_veiculo_modelo: string;
  id_veiculo_marca: string;
  id_veiculo_especie: string;
  nome: string;
};

const validationSchema = Yup.object().shape({
  nome: Yup.string().required('Este campo é requerido'),
  id_veiculo_marca: Yup.string().required('Este campo é requerido'),
  id_veiculo_especie: Yup.string().required('Este campo é requerido'),
});

const VeiculoModelo: React.FC<IProps> = ({ disabled }) => {
  const history = useHistory();
  const { user } = useAuth();
  const toast = useToast();

  const [isActionEdit, setIsActionEdit] = useState(false);

  const { control, errors, handleSubmit } = useForm<IFormInputs>({
    resolver: yupResolver(validationSchema, {
      stripUnknown: true,
      abortEarly: false,
    }),
    defaultValues: {} as IFormInputs,
  });

  const { marcasFormated } = useVeiculosMarcas();

  const { especiesFormated } = useVeiculosEspecies();

  const [dadosModelos, setDadosModelos] = useState<IGetModelos>();

  const {
    isOpen: isOpenVisualizar,
    onClose: onCloseVisualizar,
    onOpen: onOpenVisualizar,
  } = useDisclosure();

  const colunas: IColumns = [
    {
      field: 'id_veiculo_modelo',
      text: 'Id',
      type: { name: 'text' },
      alias: 'modelos.id_veiculo_modelo',
    },

    {
      field: 'marca',
      text: 'Marca',
      type: { name: 'text' },
      alias: 'marca.nome',
    },

    {
      field: 'especie',
      text: 'Espécie',
      type: { name: 'text' },
      alias: 'veiculoEspecie.nome',
    },

    {
      field: 'nome',
      text: 'Modelo',
      type: { name: 'text' },
      alias: 'modelos.nome',
    },
  ];

  /*
  function handleClickEditar(row: IFields): void {
    history.push(`/modelos/editar/${row.id_veiculo_modelo}`);
  }

  const handleEditarModeloVeiculo = useCallback(
    ({
      id_veiculo_modelo,
      id_veiculo_marca,
      id_veiculo_especie,
      nome,
    }: any): void => {
      setAction(`editar`);

      setRow({
        id_veiculo_modelo,
        id_veiculo_marca,
        id_veiculo_especie,
        nome,
      });
      onOpen();
    },
    [onOpen],
  );
  */

  async function handleEditarModeloVeiculo(row: IFormInputs): Promise<boolean> {
    try {
      setDadosModelos({
        id_veiculo_modelo: parseInt(row.id_veiculo_modelo, 10),
        nome: row.nome as string,
        id_veiculo_especie: parseInt(row.id_veiculo_especie, 10),
        id_veiculo_marca: parseInt(row.id_veiculo_marca, 10),
        criado_por: user.id_usuario.toString(),
      });

      onOpenVisualizar();
    } catch (error) {
      onCloseVisualizar();
      toast({
        title: 'Ocorreu um erro.',
        description: 'Erro inesperado',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }

    return true;
  }

  const options = {
    reload: true,
    serverData: {
      url: `${api.defaults.baseURL}/modelos/list`,
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
          icon: <FaEdit size={13} />,
          tooltip: {
            name: 'Editar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },
          getRow: handleEditarModeloVeiculo,
        },
      ],
    },
    filters: [
      {
        field: 'id_veiculo_marca',
        label: 'Marca',
        isPaginated: false,
        options: [{ label: 'Todos', value: '' }, ...marcasFormated],
      },
      {
        field: 'id_veiculo_especie',
        label: 'Espécie',
        isPaginated: false,
        options: [{ label: 'Todos', value: '' }, ...especiesFormated],
      },
      {
        field: 'is_carga',
        label: 'Somente existente na Carga',
        isPaginated: false,
        options: [
          { label: 'Sim', value: '1' },
          { value: '', label: 'Não' },
        ],
      },
    ],
    search: {
      searchable: true,
      label: 'Consultar Modelo',
      fields: ['modelos.nome'],
      placeholder: 'Modelo',
    },
  };

  /*
  const onSubmit = async (data: IFormInputs): Promise<void> => {
    await updateModelo(data, dadosModelos?.id_veiculo_modelo as number);
    onCloseVisualizar();
  }; */

  const onSubmit = async (data: IFormInputs): Promise<void> => {
    try {
      await api.put<IGetModelos>(
        `/modelos/${dadosModelos?.id_veiculo_modelo}`,
        data,
      );

      toast({
        title: 'Sucesso!',
        description: 'Modelo de veículo atualizado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      onCloseVisualizar();
    } catch (error) {
      toast({
        title: 'Erro.',
        description:
          'Erro ao salvar edição de dados' || error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };
  /*
  function onSubmit(data: IFormInputs): void {
    history.push(`/modelos/editar/${data.id_veiculo_modelo}`);
  } */

  return (
    <>
      <TituloPagina title="Administração de Modelos de Veículos" />
      <BoxContent>
        <div>
          <DataTable columns={colunas} options={options} />

          {dadosModelos && (
            <Modal
              onClose={onCloseVisualizar}
              isOpen={isOpenVisualizar}
              size="xl"
              title={dadosModelos ? 'Editar Modelo' : 'Modal'}
            >
              <FormCategory>Dados do Veículo</FormCategory>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <FormGroup required name="Modelo" cols={[5, 7, 12]}>
                    <Controller
                      name="nome"
                      control={control}
                      defaultValue={dadosModelos.nome}
                      render={({ onChange, value }) => (
                        <FormInput
                          onChange={onChange}
                          value={value?.trim().toUpperCase() as string}
                          error={errors.nome?.message}
                          onPaste={(e) => {
                            onChange(
                              e.clipboardData
                                .getData('text/plain')
                                .replace(/\s/g, '')
                                .toUpperCase(),
                            );
                            e.preventDefault();
                          }}
                        />
                      )}
                    />
                  </FormGroup>
                  <FormGroup required name="Marca" cols={[5, 7, 12]}>
                    <Controller
                      control={control}
                      name="id_veiculo_marca"
                      defaultValue={dadosModelos.id_veiculo_marca.toString()}
                      render={({ onChange, value }) => (
                        <ReactSelect
                          autoFocus
                          placeholder="Selecione ..."
                          optionsSelect={marcasFormated}
                          value={marcasFormated.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<IOptionFormat>) => {
                            const optionSelected = option as IOptionFormat;
                            onChange(optionSelected.value);
                          }}
                          error={errors.id_veiculo_marca?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <FormGroup required name="Espécie" cols={[5, 7, 12]}>
                    <Controller
                      control={control}
                      name="id_veiculo_especie"
                      defaultValue={dadosModelos.id_veiculo_especie.toString()}
                      render={({ onChange, value }) => (
                        <ReactSelect
                          autoFocus
                          placeholder="Selecione..."
                          optionsSelect={especiesFormated}
                          value={especiesFormated.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<IOptionFormat>) => {
                            const optionSelected = option as IOptionFormat;
                            onChange(optionSelected.value);
                          }}
                          error={errors.id_veiculo_especie?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <PanelBottomActions>
                  <Button color="green" icon={FaSave} type="submit">
                    Salvar
                  </Button>

                  <Button
                    color="red"
                    icon={FaTimes}
                    type="button"
                    onClick={() => {
                      onCloseVisualizar();
                    }}
                  >
                    Cancelar
                  </Button>
                </PanelBottomActions>
              </Form>
            </Modal>
          )}
        </div>
      </BoxContent>
    </>
  );
};

export default VeiculoModelo;
