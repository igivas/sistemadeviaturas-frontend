import { yupResolver } from '@hookform/resolvers';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { Switch, useToast } from '@chakra-ui/react';
import { ValueType } from 'react-select';
import { FaEraser, FaSave, FaTimes } from 'react-icons/fa';
import debounce from 'debounce-promise';
import { useVeiculo } from '../../../contexts/VeiculoContext';
import { IGetOficinas } from '../../../interfaces/Response/IGetOficinas';
import FormGroup from '../../../components/form/FormGroup';
import { useAuth } from '../../../contexts/auth';
import { IOptionFormat } from '../../../interfaces/IOptionFormat';
import api from '../../../services/api';
import TituloPagina from '../../../components/TituloPagina';
import BoxContent from '../../../components/BoxContent';
import { Form } from '../../Veiculos/components/FormVeiculo/styles';
import FormCategory from '../../../components/form/FormCategory';
import Row from '../../../components/form/Row';
import AsyncSelect from '../../../components/form/AsyncSelect';
import Input from '../../../components/form/FormInput';
import FormDatePicker from '../../../components/form/FormDatePicker';
import PanelBottomActions from '../../../components/PanelBottomActions';
import Button from '../../../components/form/Button';
import EPerfil from '../../../enums/EPerfil';
import { IGetVeiculos } from '../../../interfaces/Response/IGetVeiculos';
import { usePrefixo } from '../../../contexts/PrefixoContext';
import FormTextArea from '../../../components/form/FormTextArea';

const schemaManutencao = Yup.object().shape({
  id_oficina: Yup.object({
    value: Yup.string().required('Este campo é requerido'),
  }).required('Este campo é requerido'),

  observacao: Yup.string().notRequired(),
  data_movimentacao: Yup.date().typeError('Data inválida'),

  id_opm_origem: Yup.object({
    value: Yup.string().required('Este campo é requerido'),
  }).required('Este campo é requerido'),

  id_veiculo: Yup.number().required('Esse campo é requerido'),

  is_localizacao_patio: Yup.boolean().required('Este campo é requerido'),
});

type IFormManutencao = {
  id_oficina: { value: string };
  observacao?: string;
  data_movimentacao: Date;
  id_opm_origem: { value: string };
  id_veiculo: number;
  is_localizacao_patio: boolean;
};

const NovaManutencao: React.FC = () => {
  const { signOut, delayedPromiseOptionsUnidades, user } = useAuth();
  const { veiculos, loadVeiculos, veiculo } = useVeiculo();
  const { loadPrefixos } = usePrefixo();
  const toast = useToast();
  const history = useHistory();
  const dataAtual = new Date();

  const perfilUsuario = user.currentPerfil
    ? Number.parseInt(user.currentPerfil.value, 10)
    : -1;

  const {
    control,
    errors,
    handleSubmit,
    reset,
    setValue,
  } = useForm<IFormManutencao>({
    resolver: yupResolver(schemaManutencao),
    defaultValues: veiculo
      ? {
          id_veiculo: veiculo.id_veiculo,
          data_movimentacao: new Date(
            dataAtual.getFullYear(),
            dataAtual.getMonth(),
            dataAtual.getDate(),
          ),
          is_localizacao_patio: false,
        }
      : {
          id_veiculo: undefined,
          data_movimentacao: new Date(
            dataAtual.getFullYear(),
            dataAtual.getMonth(),
            dataAtual.getDate(),
          ),
          is_localizacao_patio: false,
          id_oficina: undefined,
          id_opm_origem: undefined,
        },
  });

  const [veiculoOpmDestino, setVeiculoOpmDestino] = useState<IOptionFormat[]>(
    [],
  );
  const [opmOrigemNome, setOpmOrigemNome] = useState<IOptionFormat>(
    {} as IOptionFormat,
  );

  const data_movimentacao = undefined;

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
        (item: any) => item.id_veiculo.toString() === id_veiculo,
      );

      await loadPrefixos(veiculoEncontrado?.id_veiculo);
    },
    [veiculos, loadPrefixos],
  );

  const promiseOptionsOficina = debounce(async (nomeOficina: string): Promise<
    IOptionFormat[]
  > => {
    if (nomeOficina.trim().length > 0) {
      const oficinasResponse = await api.get<IGetOficinas>('oficinas', {
        params: {
          query: nomeOficina,
          fields: ['oficinas.nome'],
        },
      });
      return (
        oficinasResponse.data.items?.map((oficina) => ({
          label: oficina.nome,
          value: oficina.id_oficina,
        })) || []
      );
    }

    return [];
  }, 250);

  useEffect(() => {
    async function loadOpmCarga(): Promise<void> {
      if (veiculo) {
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
    }

    loadOpmCarga();
  }, [veiculo, data_movimentacao, toast, signOut]);

  useEffect(() => {
    if (veiculoOpmDestino.length > 0) {
      setValue('id_opm_origem', veiculoOpmDestino[0]);
    }
  }, [setValue, veiculoOpmDestino, perfilUsuario]);

  const onSubmit = async (formValues: IFormManutencao): Promise<void> => {
    console.log(formValues);
  };

  return (
    <>
      <TituloPagina title="Movimentar Veiculo" />
      <BoxContent>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <FormCategory>Dados do veiculo</FormCategory>
            <Row>
              <FormGroup required name="Placa" cols={[3, 6, 12]}>
                <Controller
                  name="id_veiculo"
                  control={control}
                  render={({ onChange }) => (
                    <AsyncSelect
                      loadOptions={promiseOptionsPlaca}
                      value={{
                        label: veiculo?.placa,
                        value: veiculo.id_veiculo.toString(),
                      }}
                      onChange={async (option: ValueType<IOptionFormat>) => {
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
                      value={{
                        label: veiculo?.renavam,
                        value: veiculo.id_veiculo.toString(),
                      }}
                      onChange={(option: ValueType<IOptionFormat>) => {
                        const optionSelected = option as IOptionFormat;
                        veiculoSelected(optionSelected.value);
                        onChange(optionSelected);
                      }}
                      isDisabled={!!veiculo.id_veiculo}
                      error={errors.id_veiculo?.message}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup name="Marca" cols={[3, 6, 12]}>
                <Input disabled value={veiculo?.veiculoMarca.nome} />
              </FormGroup>

              <FormGroup name="Modelo" cols={[3, 6, 12]}>
                <Input value={veiculo?.veiculoModelo.nome} disabled />
              </FormGroup>
            </Row>

            <FormCategory>Dados da Manutenção</FormCategory>
            <Row>
              <FormGroup required name="OPM de Origem" cols={[4, 6, 12]}>
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
                      error={errors.id_opm_origem?.value?.message}
                      isDisabled={veiculoOpmDestino.length > 0}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup required name="Localização no Patio" cols={[2, 6, 12]}>
                <Controller
                  control={control}
                  name="is_localizacao_patio"
                  render={({ onChange, value }) => (
                    <Switch
                      isChecked={value}
                      onChange={() => onChange(!value)}
                      size="lg"
                      colorScheme="green"
                    />
                  )}
                />
              </FormGroup>

              <FormGroup required name="Oficina" cols={[6, 6, 12]}>
                <Controller
                  name="id_oficina"
                  control={control}
                  render={({ onChange, value }) => (
                    <AsyncSelect
                      loadOptions={promiseOptionsOficina}
                      error={errors.id_oficina?.value?.message}
                      onChange={(option: ValueType<IOptionFormat>) => {
                        const optionSelected = option as IOptionFormat;

                        setValue('id_oficina', optionSelected);
                        onChange(optionSelected);
                      }}
                      value={value}
                    />
                  )}
                />
              </FormGroup>
            </Row>

            <Row>
              <FormGroup name="Oficinas" cols={[12, 12, 12]}>
                <Controller
                  name="observacao"
                  control={control}
                  as={
                    <FormTextArea error={errors.observacao?.message} rows={6} />
                  }
                />
              </FormGroup>
            </Row>

            <Row>
              {!Number.isNaN(perfilUsuario) &&
                perfilUsuario === EPerfil.Administrador && (
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
            </Row>

            <PanelBottomActions>
              <>
                <Button
                  color="red"
                  icon={FaTimes}
                  onClick={() =>
                    veiculo
                      ? history.push(`/veiculos/editar/${veiculo.id_veiculo}`)
                      : history.push('/veiculos/consulta')
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
          </div>
        </Form>
      </BoxContent>
    </>
  );
};

export default NovaManutencao;
