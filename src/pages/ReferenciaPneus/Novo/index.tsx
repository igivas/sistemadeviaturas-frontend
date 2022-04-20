import React from 'react';

import { FaEraser, FaPlus, FaSave } from 'react-icons/fa';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from '@chakra-ui/react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers';
import { useHistory } from 'react-router-dom';
import FormInput from '../../../components/form/FormInput';
import { useVeiculosEspecies } from '../../../contexts/VeiculosEspeciesContext';
import BoxContent from '../../../components/BoxContent';
import ReactSelect from '../../../components/form/ReactSelect';
import TituloPagina from '../../../components/TituloPagina';
import { Container, Form } from './styles';
import FormCategory from '../../../components/form/FormCategory';
import Row from '../../../components/form/Row';
import FormGroup from '../../../components/form/FormGroup';
import PanelBottomActions from '../../../components/PanelBottomActions';
import Button from '../../../components/form/Button';

import { useKm } from '../../../contexts/KmContext';

const schemaReferenciaPneus = Yup.object().shape({
  referencias_pneus: Yup.array()
    .of(
      Yup.object({
        id_veiculo_especie: Yup.object({
          value: Yup.string().required('Este campo é requerido'),
        }),
        descricao: Yup.string().required('Este campo é requerido'),
      }),
    )
    .required('Referencia de pneu é requerido'),
});

type IReferenciaPneu = {
  referencias_pneus: {
    id_veiculo_especie: {
      value: string;
    };
    descricao: string;
  }[];
};

const NovaReferenciaPneu: React.FC = () => {
  const { especiesFormated } = useVeiculosEspecies();
  const history = useHistory();
  const { createReferenciasPneus } = useKm();

  const { control, errors, handleSubmit, reset } = useForm<IReferenciaPneu>({
    resolver: yupResolver(schemaReferenciaPneus),
    defaultValues: {
      referencias_pneus: [{}],
    },
  });

  const { append, remove, fields } = useFieldArray({
    control,
    name: 'referencias_pneus',
  });

  const onSubmit = async ({
    referencias_pneus,
  }: IReferenciaPneu): Promise<void> => {
    if (
      await createReferenciasPneus({
        body: {
          referencias_pneus: referencias_pneus.map((referenciaPneu) => ({
            id_veiculo_especie: referenciaPneu.id_veiculo_especie.value,
            descricao: referenciaPneu.descricao,
          })),
        },
      })
    )
      history.push('/referencias/consulta');
  };

  /* const handleSubmit = async (): Promise<void> => {

  }; */

  return (
    <Container>
      <TituloPagina title="Cadastro de Pneus" />
      <BoxContent>
        <div>
          <FormCategory> Cadastro de Categorias </FormCategory>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Accordion
              allowToggle={!errors}
              allowMultiple={!!errors}
              marginBottom={16}
            >
              {fields.map((item, index) => {
                return (
                  <>
                    <AccordionItem height="40%">
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize={16}>
                          Referencia de pneu {`#${index + 1}`}
                        </Box>

                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={8}>
                        <Row>
                          <FormGroup
                            cols={[3, 6, 12]}
                            name="Espécie de Veículo"
                          >
                            <Controller
                              name={`referencias_pneus.${index}.id_veiculo_especie`}
                              control={control}
                              render={(props) => (
                                <ReactSelect
                                  placeholder="Selecione ..."
                                  optionsSelect={especiesFormated}
                                  {...props}
                                  error={
                                    errors.referencias_pneus?.[index]
                                      ?.id_veiculo_especie?.value?.message
                                  }
                                />
                              )}
                            />
                          </FormGroup>

                          <FormGroup cols={[3, 6, 12]} name="Descricao">
                            <Controller
                              name={`referencias_pneus.${index}.descricao`}
                              control={control}
                              render={({ onChange, value }) => (
                                <FormInput
                                  onChange={onChange}
                                  value={value?.trim().toUpperCase() as string}
                                  error={
                                    errors.referencias_pneus?.[index]?.descricao
                                      ?.message
                                  }
                                />
                              )}
                            />
                          </FormGroup>

                          <FormGroup
                            cols={[3, 6, 12]}
                            name="Referência de Pneus"
                          >
                            <Button
                              icon={FaEraser}
                              type="button"
                              onClick={() => remove(index)}
                            >
                              Deletar
                            </Button>
                          </FormGroup>
                        </Row>
                      </AccordionPanel>
                    </AccordionItem>
                  </>
                );
              })}
            </Accordion>

            <PanelBottomActions>
              <Button icon={FaPlus} onClick={append} type="button">
                Adicionar
              </Button>

              <Button
                color="yellow"
                icon={FaEraser}
                type="button"
                onClick={() => {
                  reset({
                    referencias_pneus: [{}],
                  });
                }}
              >
                Limpar
              </Button>

              <Button icon={FaSave} color="green" type="submit">
                Salvar
              </Button>
            </PanelBottomActions>
          </Form>
        </div>
      </BoxContent>
    </Container>
  );
};

export default NovaReferenciaPneu;
