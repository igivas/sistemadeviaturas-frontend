import React from 'react';
import { FaSave } from 'react-icons/fa';
import { useForm, Controller } from 'react-hook-form';
// import { useMovimentacao } from 'contexts/MovimentacaoContext';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers';

import { IoIosMail } from 'react-icons/io';
import {
  Divider,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from '@chakra-ui/react';
import UserImage from 'pages/_layouts/private/Header/UserImage';
import { useAuth } from '../../contexts/auth';
import { useMovimentacao } from '../../contexts/MovimentacaoContext';
import PanelBottomActions from '../PanelBottomActions';
import Modal, { IModalProps } from '../Modal';
import FormInput from '../form/FormInput';
import FormGroup from '../form/FormGroup';
import Button from '../form/Button';
import { Content, Form, Post, UserCPF, UserContent } from './styles';
import api from '../../services/api';
import ETipoAssinatura from '../../enums/ETipoAssinatura';

interface IOptionsCargos {
  value: string;
  label: string;
}

interface IModalAssinaturaProps extends IModalProps {
  cargos: IOptionsCargos[];
  tipo: 'movimentacao';
  data: any;
  id_veiculo: number;
}

const schemaAssinatura = Yup.object().shape({
  assinatura: Yup.string().required('Este cmapo é requerido'),
  pin: Yup.string().required('Este cmapo é requerido'),
  tipo_assinatura: Yup.string()
    .oneOf(['0', '1', '2'])
    .required('Esse campo é requerido'),
});

/* const schemaAssinatura = Yup.object().shape({
  cargo: Yup.string().required('Este campo é obrigatorio'),
  pin_assinatura: Yup.string().required('Este campo é obrigatorio'),
  pin_24h: Yup.string()
    .required('Este campo é obrigatorio')
    .max(6, 'Não pode haver mais de 6 digitos'),
}); */

type IFormInputsAssinatura = Yup.InferType<typeof schemaAssinatura>;

const ModalAssinatura: React.FC<Omit<IModalAssinaturaProps, 'title'>> = ({
  data,
  tipo,
  id_veiculo,
  onClose,
  ...rest
}) => {
  const toast = useToast();
  const { user } = useAuth();
  const { handleSubmit, control, errors } = useForm<IFormInputsAssinatura>({
    resolver: yupResolver(schemaAssinatura),
    defaultValues: {
      assinatura: undefined,
      pin: undefined,
      tipo_assinatura: '0',
    },
  });
  const { createMovimentacao } = useMovimentacao();

  const onSubmit = async (dataForm: IFormInputsAssinatura): Promise<void> => {
    try {
      if (tipo === 'movimentacao') {
        await createMovimentacao(
          {
            ...data.movimentacao,
            cpf: user.cpf,
            ...dataForm,
          },
          id_veiculo,
        );
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Ocorreu um erro.',
        description: 'Ocorreu um erro ao tentar fazer assinatura',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleCreatePin24h = async (): Promise<void> => {
    try {
      const createdPin = await api.post('documentos/create_pin', {
        user: user.id_usuario,
      });

      toast({
        title: 'Sucesso!',
        description:
          createdPin.data.message ||
          'Um novo pin foi gerado. Por favor, verifique seu email',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      toast({
        title: 'Ocorreu um erro.',
        description:
          'Ocorreu um erro ao tentar criar o Pin 24hrs. Por favor tente mais tarde',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <Modal title="Assinatura Eletronica PMCE" {...rest} onClose={onClose}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <UserContent>
          <UserImage size="lg" />
          <Flex direction="column" marginLeft="8px">
            <Post>{user.nome}</Post>
            <UserCPF>{user.cpf}</UserCPF>

            <Controller
              name="tipo_assinatura"
              control={control}
              render={({ onChange, value }) => (
                <RadioGroup
                  onChange={onChange}
                  defaultValue="2"
                  marginTop="32px"
                  value={value}
                >
                  <Stack spacing={5} direction="column">
                    <Radio
                      name=""
                      size="md"
                      colorScheme="green"
                      value={ETipoAssinatura['POR ORDEM']}
                      fontSize="16px"
                    >
                      POR ORDEM
                    </Radio>
                    <Radio
                      size="md"
                      colorScheme="green"
                      value={ETipoAssinatura['POR IMPEDIMENTO']}
                    >
                      POR IMPEDIMENTO
                    </Radio>
                  </Stack>
                </RadioGroup>
              )}
            />
          </Flex>
        </UserContent>

        <Content>
          <Divider marginTop="8px" />
          <div id="pins_inputs">
            <FormGroup required name="Digit PIN assinatura" cols={[6, 6, 6]}>
              <Controller
                name="assinatura"
                control={control}
                render={({ onChange, value }) => (
                  <FormInput
                    type="password"
                    onChange={onChange}
                    value={value}
                    error={errors.assinatura?.message}
                  />
                )}
              />
            </FormGroup>

            <FormGroup required name="Digit PIN 24H" cols={[4, 6, 6]}>
              <Controller
                name="pin"
                control={control}
                render={({ onChange, value }) => (
                  <FormInput
                    type="password"
                    onChange={onChange}
                    value={value}
                    error={errors.pin?.message}
                    maxLength={6}
                  />
                )}
              />
            </FormGroup>
          </div>
          <PanelBottomActions>
            <>
              <Button
                color="blue"
                type="button"
                icon={IoIosMail}
                onClick={handleCreatePin24h}
              >
                Receber PIN 24H
              </Button>
              <Button color="green" icon={FaSave} type="submit">
                Assinar
              </Button>
            </>
          </PanelBottomActions>
        </Content>
      </Form>
    </Modal>
  );
};

export default ModalAssinatura;
