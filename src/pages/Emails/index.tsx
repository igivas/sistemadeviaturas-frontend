import React from 'react';
import * as Yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import { FaEraser, FaMinus, FaPlus, FaSave } from 'react-icons/fa';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Button,
  InputRightElement,
  InputGroup,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdRefresh } from 'react-icons/md';
import PanelBottomActions from '../../components/PanelBottomActions';
import DataTable, { IColumns } from '../../components/DataTable';
import ButtonComponent from '../../components/form/Button';
import BoxContent from '../../components/BoxContent';
import TituloPagina from '../../components/TituloPagina';
import { Form } from './styles';
import api from '../../services/api';
import { useAuth } from '../../contexts/auth';

const emailSchema = Yup.object().shape({
  emails: Yup.array()
    .of(
      Yup.string()
        .email('Formato de email inválido')
        .required('Este campo é requerido'),
    )
    .required('Deve conter emails')
    .min(1, 'No minimo um email'),
});

type IFormInputs = {
  emails: string[];
};

const Emails: React.FC = () => {
  const { control, errors, handleSubmit, reset } = useForm<IFormInputs>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      emails: [undefined as any],
    },
  });

  const { signOut } = useAuth();
  const toast = useToast();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const { append, remove, fields } = useFieldArray({
    control,
    name: 'emails',
  });

  const [reload, setReload] = useState(true);

  const onSubmit = async (data: IFormInputs): Promise<void> => {
    try {
      await api.post('/emails', {
        emails: data.emails,
      });
      setReload(true);

      toast({
        title: 'Sucesso!',
        description: 'Cadastrado realizado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
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

    onClose();
  };

  const handleSetActive = async (data: any): Promise<void> => {
    setReload(false);

    try {
      await api.put(`/emails/${data.id_email}`, {
        ativo: data.ativo === '0' ? '1' : '0',
      });
      setReload(true);
      toast({
        title: 'Sucesso!',
        description: 'Email atualizado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
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

  const colunas: IColumns = [
    {
      field: 'email',
      text: 'Email',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },

    {
      field: 'ativo',
      text: 'Ativo',
      type: {
        name: 'enum',
        enum: {
          '0': 'Não',
          '1': 'Sim',
        },
      },
      highlightRowColor: [{ color: 'red', matchValues: ['0'] }],
    },

    {
      field: 'criado_por',
      text: 'Criado Por',
      type: { name: 'text' },
    },

    {
      field: 'atualizado_por',
      text: 'Atualizado por',
      type: { name: 'enum', enum: { '0': 'Não', '1': 'Sim' } },
    },

    {
      field: 'observacao',
      text: 'OBS',
      type: { name: 'text' },
    },
  ];

  const options = {
    reload,
    serverData: {
      url: `${api.defaults.baseURL}/emails`,
      headers: { Authorization: api.defaults.headers.authorization },
      serverPagination: true,
    },

    filters: [
      {
        field: 'active',
        label: 'Ativo',
        isPaginated: false,
        options: [
          { label: 'Todos', value: '' },
          {
            label: 'Sim',
            value: '1',
          },
          { label: 'Não', value: '0' },
        ],
      },
    ],

    actions: {
      headerText: 'Ações',
      items: [
        {
          icon: <MdRefresh size={18} />,

          tooltip: {
            name: 'Ativar/desativar email',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },
          getRow: handleSetActive,
        },
      ],
    },

    search: {
      searchable: true,
      label: 'Consultar Email',
      fields: ['emails.email'],
      placeholder: 'email',
    },
  };

  return (
    <>
      <TituloPagina title="Consulta e cadastro de emails" />

      <BoxContent>
        <DataTable columns={colunas} options={options} />

        <PanelBottomActions>
          <ButtonComponent
            color="green"
            icon={FaPlus}
            onClick={() => {
              onOpen();
              setReload(false);
            }}
            type="button"
          >
            Adicionar emails
          </ButtonComponent>
        </PanelBottomActions>

        <Modal
          onClose={onClose}
          isOpen={isOpen}
          size="4xl"
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Cadastro de email</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Accordion
                  allowToggle={!errors}
                  defaultIndex={
                    errors.emails && errors.emails.map((email, index) => index)
                  }
                  allowMultiple={!!errors}
                  marginBottom={16}
                  style={{ overflowY: 'scroll' }}
                >
                  {fields.map((item, index) => {
                    return (
                      <>
                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" fontSize={16}>
                              Email {`#${index + 1}`}
                            </Box>

                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <FormControl
                              isInvalid={!!errors.emails?.[index]?.message}
                              id={`emails.${index}`}
                            >
                              <FormLabel>Endereço de email</FormLabel>

                              <InputGroup size="md">
                                <Controller
                                  as={
                                    // eslint-disable-next-line react/jsx-wrap-multilines
                                    <Input
                                      placeholder="exemplo@exemplo.com"
                                      name={`emails.${index}`}
                                    />
                                  }
                                  name={`emails.${index}`}
                                  control={control}
                                />

                                <InputRightElement width="10rem" type="email">
                                  <Button
                                    h="1.75rem"
                                    size="md"
                                    onClick={() => {
                                      remove(index);
                                    }}
                                    rightIcon={<FaMinus size={8} />}
                                  >
                                    Remover
                                  </Button>
                                </InputRightElement>
                              </InputGroup>
                              <FormErrorMessage>
                                {errors.emails?.[index]?.message}
                              </FormErrorMessage>
                            </FormControl>
                          </AccordionPanel>
                        </AccordionItem>
                      </>
                    );
                  })}
                </Accordion>

                <PanelBottomActions>
                  <ButtonComponent icon={FaPlus} onClick={append} type="button">
                    Adicionar
                  </ButtonComponent>

                  <ButtonComponent
                    color="yellow"
                    icon={FaEraser}
                    type="button"
                    onClick={() => {
                      reset({
                        emails: [undefined as any],
                      });
                    }}
                  >
                    Limpar
                  </ButtonComponent>

                  <ButtonComponent icon={FaSave} color="green" type="submit">
                    Salvar
                  </ButtonComponent>
                </PanelBottomActions>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </BoxContent>
    </>
  );
};

export default Emails;
