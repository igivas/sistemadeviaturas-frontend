import React, { useState, useEffect, useCallback } from 'react';
import { Switch, useToast } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Controller, FieldError, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import { FaEraser, FaSave, FaTimes } from 'react-icons/fa';
import { ValueType } from 'react-select';
import debounce from 'debounce-promise';
import { useHistory } from 'react-router-dom';
import InputCep from 'components/form/InputCep';
import InputCpfCnpj from '../../../components/form/InputCPFCNPJ';
import PanelBottomActions from '../../../components/PanelBottomActions';
import Button from '../../../components/form/Button';
import { useVeiculo } from '../../../contexts/VeiculoContext';
import { IOptionFormat } from '../../../interfaces/IOptionFormat';
import ReactSelect from '../../../components/form/ReactSelect';
import AsyncCreatableSelect from '../../../components/form/AsyncCreatableSelect';
import Row from '../../../components/form/Row';
import BoxContent from '../../../components/BoxContent';
import FormInput from '../../../components/form/FormInput';
import FormGroup from '../../../components/form/FormGroup';
import TituloPagina from '../../../components/TituloPagina';
import FormCategory from '../../../components/form/FormCategory';
import { Container, Form } from './styles';
import api from '../../../services/api';
import { IEndereco } from '../../../interfaces/IEndereco';
import { useAuth } from '../../../contexts/auth';

const schemaOficina = Yup.object().shape({
  nome: Yup.string().required('Esse campo é requerido'),
  id_municipio: Yup.object({
    value: Yup.string().required('Esse campo é requerido'),
  }).required('Esse campo é requerido'),
  matriz: Yup.boolean().required('Este campo é requerido'),
  nome_filial: Yup.string().notRequired(),
  cpf_cnpj: Yup.string()
    .required('Este campo é requerido')
    .max(18, 'No máximo 14 caracteres'),
  estado: Yup.string()
    .required('Este campo é requerido')
    .max(2, 'Tamanho invalido para estado'),
  endereco: Yup.object({
    value: Yup.string()
      .required('Esse campo é requerido')
      .max(255, 'No máximo 255 caracteres'),
  }).required('Este campo é requerido'),
  numero_endereco: Yup.string()
    .required('Este campo é requerido')
    .max(12, 'Maximo de 12 Caracteres'),
  complemento: Yup.string().notRequired(),
  cep: Yup.string().notRequired(),
});

type IFormOficina = {
  nome: string;
  matriz: boolean;
  nome_filial?: string;
  cpf_cnpj: string;
  estado: string;
  endereco: {
    value: string;
  };
  numero_endereco: string;
  complemento?: string;
  cep?: string;
  id_municipio: {
    value: string;
  };
};

const NovaOficina: React.FC = () => {
  const { ufsFormated, loadMunicipios, optionsMunicipios } = useVeiculo();
  const toast = useToast();
  const { signOut } = useAuth();
  const history = useHistory();

  const {
    control,
    handleSubmit,
    errors,
    setValue,
    reset,
    watch,
  } = useForm<IFormOficina>({
    resolver: yupResolver(schemaOficina),
    defaultValues: {
      cpf_cnpj: undefined,
      matriz: true,
      nome: undefined,
      nome_filial: undefined,
    },
  });

  const [optionsMatriz, setOptionsMatriz] = useState<IOptionFormat[]>([]);

  const uf = watch('estado');
  const id_municipio = watch('id_municipio');
  const isMatriz = watch('matriz');

  const onSubmit = async (data: IFormOficina): Promise<void> => {
    const {
      cpf_cnpj,
      endereco,
      id_municipio: municipio,
      nome,
      numero_endereco,
      complemento,
      nome_filial,
      cep,
    } = data;

    try {
      await api.post('oficinas', {
        body: {
          cpf_cnpj: cpf_cnpj.replace(/[^0-9]/g, ''),
          endereco: endereco.value,
          id_municipio: municipio.value,
          nome,
          numero: numero_endereco,
          complemento,
          nome_filial,
          cep: cep?.replace(/[^0-9]/g, ''),
        },
      });

      toast({
        title: 'Sucesso!',
        description: 'Cadastrado realizado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      history.push('/oficinas/consulta');
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            signOut();
            break;
          default:
            toast({
              title: 'Ocorreu um erro.',
              description:
                error.response.data.message ||
                'Ocorreu um erro ao cadastrar os emails.',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            break;
        }
      }
    }
  };

  const optionsEnderecos = useCallback(
    debounce(async (query: string): Promise<IOptionFormat[]> => {
      if (query.trim().length > 0) {
        const enderecos = await api.get<IEndereco[]>('enderecos', {
          params: {
            endereco: query,
            id_municipio: id_municipio.value,
          },
        });
        return enderecos.data.map<IOptionFormat>((endereco) => ({
          label: endereco.nome,
          value: endereco.nome,
        }));
      }
      return [];
    }, 500),
    [id_municipio],
  );

  useEffect(() => {
    async function loadMatrizes(): Promise<void> {
      if (!isMatriz && optionsMatriz.length < 1) {
        const response = await api.get<{ id_oficina: string; nome: string }[]>(
          'oficinas/matriz',
        );

        if (response.data.length < 1) {
          setValue('matriz', true);
        } else
          setOptionsMatriz(
            response.data.map((matriz) => ({
              label: matriz.nome,
              value: matriz.id_oficina,
            })),
          );
      }
    }

    loadMatrizes();
  }, [isMatriz, optionsMatriz.length, setValue]);

  return (
    <Container>
      <TituloPagina title="Cadastro de Oficina" />
      <BoxContent>
        <div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <FormCategory>Dados da Oficina</FormCategory>
              <FormGroup cols={[3, 6, 12]} name="Nome da oficina" required>
                <Controller
                  name="nome"
                  control={control}
                  as={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <FormInput error={errors.nome?.message} />
                  }
                />
              </FormGroup>
              <FormGroup cols={[1, 6, 12]} name="Matriz" required>
                <Controller
                  name="matriz"
                  control={control}
                  render={({ value, onChange }) => (
                    <Switch
                      isChecked={value}
                      onChange={() => onChange(!value)}
                      size="lg"
                      colorScheme="green"
                    />
                  )}
                />
                {errors.matriz?.message}
              </FormGroup>

              {!watch('matriz') && (
                <FormGroup cols={[3, 6, 12]} name="Nome da Filial">
                  <Controller
                    name="nome_filial"
                    control={control}
                    as={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <ReactSelect
                        optionsSelect={optionsMatriz}
                        error={errors.nome_filial?.message}
                      />
                    }
                  />
                </FormGroup>
              )}

              <FormGroup cols={[3, 6, 12]} name="CPF/CNPJ" required>
                <Controller
                  name="cpf_cnpj"
                  control={control}
                  render={({ value, onChange }) => (
                    // <FormInput
                    //   value={value}
                    //   error={errors.cpf_cnpj?.message}
                    //   onKeyDown={handleDeleteNumber}
                    //   onChange={handleCpfCnjp}
                    //   maxLength={18}
                    // />
                    <InputCpfCnpj
                      value={value}
                      onChange={onChange}
                      error={errors.cpf_cnpj?.message}
                    />
                  )}
                />
              </FormGroup>
            </Row>

            <Row>
              <FormCategory>Endereco</FormCategory>

              <FormGroup cols={[3, 6, 12]} name="UF" required>
                <Controller
                  name="estado"
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactSelect
                      placeholder="Selecione ..."
                      optionsSelect={ufsFormated}
                      value={ufsFormated.find(
                        (option) => option.value === value,
                      )}
                      onChange={(option: ValueType<IOptionFormat>) => {
                        const optionSelected = option as IOptionFormat;
                        onChange(optionSelected.value);

                        loadMunicipios(optionSelected.value);
                      }}
                      error={errors.estado?.message}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup cols={[3, 6, 12]} name="Municipio" required>
                <Controller
                  name="id_municipio"
                  control={control}
                  as={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <ReactSelect
                      placeholder="Selecione ..."
                      optionsSelect={optionsMunicipios}
                      error={(errors.id_municipio as FieldError)?.message}
                      isDisabled={!uf}
                    />
                  }
                />
              </FormGroup>

              <FormGroup cols={[3, 6, 12]} name="CEP">
                <Controller
                  name="cep"
                  control={control}
                  render={({ value, onChange }) => (
                    // <FormInput
                    //   value={value}
                    //   error={errors.cep?.message}
                    //   onKeyDown={handleDeleteCep}
                    //   onChange={handleChangeCEP}
                    //   maxLength={10}
                    //   onBlur={async () => {
                    //     const numbersCep = valorCep?.replace(/[^0-9]/g, '');

                    //     if (numbersCep && numbersCep.length === 8) {
                    //       await api.get('', {
                    //         baseURL: `https://viacep.com.br/ws/${numbersCep}/json`,
                    //       });
                    //     }
                    //   }}
                    // />

                    <InputCep
                      value={value}
                      onChange={onChange}
                      error={errors.cep?.message}
                    />
                  )}
                />
              </FormGroup>
            </Row>

            <Row>
              <FormGroup cols={[12, 6, 12]} name="Endereco" required>
                <Controller
                  name="endereco"
                  control={control}
                  render={({ onChange, value }) => (
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <AsyncCreatableSelect
                      loadOptions={optionsEnderecos}
                      error={errors.endereco?.value?.message}
                      isDisabled={!id_municipio}
                      onChange={(option: ValueType<IOptionFormat>) => {
                        const optionSelected = option as IOptionFormat;

                        setValue('endereco', optionSelected);
                        onChange(optionSelected);
                      }}
                      value={value}
                      formatCreateLabel={(userInput) =>
                        `Criar endereço ${userInput}`
                      }
                    />
                  )}
                />
              </FormGroup>
            </Row>

            <Row>
              <FormGroup cols={[1, 6, 12]} name="Numero" required>
                <Controller
                  name="numero_endereco"
                  control={control}
                  as={<FormInput error={errors.numero_endereco?.message} />}
                />
              </FormGroup>

              <FormGroup cols={[8, 6, 12]} name="Complemento">
                <Controller
                  name="complemento"
                  control={control}
                  as={<FormInput error={errors.complemento?.message} />}
                />
              </FormGroup>
            </Row>

            <PanelBottomActions>
              <Button color="red" icon={FaTimes} type="button">
                Cancelar
              </Button>
              <Button
                color="yellow"
                icon={FaEraser}
                type="button"
                onClick={() => {
                  reset();
                  /* Object.keys(initialCleanValues).forEach((key) =>
                    setValue(key, undefined),
                  ); */
                }}
              >
                Limpar
              </Button>
              <Button color="green" icon={FaSave} type="submit">
                Salvar
              </Button>
            </PanelBottomActions>
          </Form>
        </div>
      </BoxContent>
    </Container>
  );
};

export default NovaOficina;
