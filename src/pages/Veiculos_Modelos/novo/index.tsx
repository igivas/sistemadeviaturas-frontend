import React from 'react';
import { yupResolver } from '@hookform/resolvers';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '@chakra-ui/react';
import { ValueType } from 'react-select';
import { FaEraser, FaSave, FaTimes } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import BoxContent from '../../../components/BoxContent';
import FormGroup from '../../../components/form/FormGroup';
import FormInput from '../../../components/form/FormInput';
import Row from '../../../components/form/Row';
import TituloPagina from '../../../components/TituloPagina';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/auth';
import { useVeiculosEspecies } from '../../../contexts/VeiculosEspeciesContext';
import { useVeiculosMarcas } from '../../../contexts/VeiculosMarcasContext';
import { Container } from './styles';
import FormCategory from '../../../components/form/FormCategory';
import { Form } from './styles';
import ReactSelect from '../../../components/form/ReactSelect';
import PanelBottomActions from '../../../components/PanelBottomActions';
import Button from '../../../components/form/Button';

const schemaVeiculoModelo = Yup.object().shape({
  nome: Yup.string().required('Esse campo é requerido'),
  id_veiculo_especie: Yup.number().required('Esse campo é requerido'),
  id_veiculo_marca: Yup.number().required('Esse campo é requerido'),
});

type IFormVeiculoModelo = {
  nome: string;
  id_veiculo_especie: number;
  id_veiculo_marca: number;
};

type OptionFormat = {
  value: string;
  label: string;
};

type IProps = {
  disabled: boolean;
  action: 'editar' | 'cadastrar';
};

const VeiculoModeloNovo: React.FC<IProps> = ({ disabled }) => {
  const history = useHistory();
  const toast = useToast();
  const { signOut } = useAuth();
  const { control, handleSubmit, errors, reset } = useForm<IFormVeiculoModelo>({
    resolver: yupResolver(schemaVeiculoModelo),
    defaultValues: {
      nome: '',
      id_veiculo_especie: undefined,
      id_veiculo_marca: undefined,
    },
  });

  const { especiesFormated } = useVeiculosEspecies();
  const { marcasFormated } = useVeiculosMarcas();

  const onSubmit = async (data: IFormVeiculoModelo): Promise<void> => {
    const { nome, id_veiculo_especie, id_veiculo_marca } = data;

    try {
      await api.post('modelos', {
        body: {
          nome,
          id_veiculo_especie,
          id_veiculo_marca,
        },
      });

      toast({
        title: 'Sucesso!',
        description: 'Cadastro realizado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      history.push('/modelos/consulta');
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            signOut();
            break;
          default:
            toast({
              title: 'Ocorreu um erro.',
              description: error.response.data.message,
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

  return (
    <Container>
      <TituloPagina title="Cadastro de Modelos de Veículos" />
      <BoxContent>
        <div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <FormCategory> Dados do Modelo do Veículo</FormCategory>

              <FormGroup cols={[2, 6, 12]} name="Espécie" required>
                <Controller
                  name="id_veiculo_especie"
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactSelect
                      placeholder="Selecione ..."
                      optionsSelect={especiesFormated}
                      value={especiesFormated.find(
                        (option) => option.value === value,
                      )}
                      onChange={(option: ValueType<OptionFormat>) => {
                        const optionSelected = option as OptionFormat;
                        onChange(optionSelected.value);
                      }}
                      error={errors.id_veiculo_especie?.message}
                      isDisabled={disabled}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup cols={[2, 6, 12]} name="Marca" required>
                <Controller
                  name="id_veiculo_marca"
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactSelect
                      placeholder="Selecione ..."
                      optionsSelect={marcasFormated}
                      value={marcasFormated.find(
                        (option) => option.value === value,
                      )}
                      onChange={(option: ValueType<OptionFormat>) => {
                        const optionSelected = option as OptionFormat;
                        onChange(optionSelected.value);
                      }}
                      error={errors.id_veiculo_marca?.message}
                      isDisabled={disabled}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup cols={[3, 6, 12]} name="Modelo" required>
                <Controller
                  name="nome"
                  control={control}
                  as={<FormInput error={errors.nome?.message} />}
                />
              </FormGroup>
            </Row>
            <PanelBottomActions>
              <Button
                color="red"
                icon={FaTimes}
                onClick={() => history.push('/modelos/consulta')}
              >
                Cancelar
              </Button>
              <Button
                color="yellow"
                icon={FaEraser}
                type="button"
                onClick={() => {
                  reset();
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

export default VeiculoModeloNovo;
