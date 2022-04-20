import React, { useState, useEffect, useMemo } from 'react';
import { FaSave } from 'react-icons/fa';

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
} from '@chakra-ui/react';
import optionHistoricoAtual from 'utils/optionsHistoricoAtual';
import { IOptionFormat } from '../../../../interfaces/IOptionFormat';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import FormInputNumber from '../../../../components/form/InputNumberFormat';
import FormInput from '../../../../components/form/FormInput';
import DataTable, { IColumns } from '../../../../components/DataTable';
import PanelBottomActions from '../../../../components/PanelBottomActions';
import Button from '../../../../components/form/Button';
import Row from '../../../../components/form/Row';
import FormGroup from '../../../../components/form/FormGroup';

import DatePicker from '../../../../components/form/FormDatePicker';

import ReactSelect from '../../../../components/form/ReactSelect';
import FormTextArea from '../../../../components/form/FormTextArea';
import { Container, PanelAction, Form } from './styles';
import { useSituacao } from '../../../../contexts/SituacaoContext';

type OptionType = { label: string; value: string };

const outroString = 'outro'.trim();
const outraString = 'outra'.trim();

const schema = Yup.object()
  .shape({
    is_current_situacao: Yup.boolean().required('Este campo é requerido'),
    data_situacao: Yup.date()
      .typeError('Insira uma data válida!')
      .required('Este campo é requerido'),
    id_situacao_tipo: Yup.string().required('Esse campo é requerido'),
    id_situacao_tipo_especificacao: Yup.string().required(
      'Este campo é requerido',
    ),
    observacao: Yup.string().max(150, 'Tamanho máximo 150 caracteres'),
    km: Yup.number()
      .required('Esse campo é requerido')
      .typeError('Valor invalido'),
    localizacao: Yup.string().required('Este campo é requerido'),
    localizacao_outros: Yup.string()
      .notRequired()
      .when('localizacao', {
        is: (localizacao: string) =>
          localizacao.trim().toLowerCase() === outroString ||
          localizacao.trim().toLowerCase() === outraString,
        then: Yup.string().required('Este campo é requerido'),
      }),
  })
  .noUnknown();

interface IFormInputs {
  is_current_situacao: boolean;
  data_situacao: Date;
  id_situacao_tipo: string;
  id_situacao_tipo_especificacao: string;
  observacao: string;
  km: number;
  localizacao: string;
  localizacao_outros?: string;
}

const TabSituacoes: React.FC = () => {
  const { veiculo } = useVeiculo();
  const {
    createSituacao,

    situacoesFormated,
    situacoesTipos,
  } = useSituacao();
  const {
    handleSubmit,
    errors,
    control,
    trigger,
    watch,
    setValue,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_current_situacao: true,
      data_situacao: undefined,
      id_situacao_tipo: undefined,
      id_situacao_tipo_especificacao: undefined,
      localizacao: undefined,
      km: undefined,
      localizacao_outros: undefined,
      observacao: undefined,
    },
  });

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [nomeSituacao, setNomeSituacao] = useState('');

  const watchIdSituacaoTipo = watch('id_situacao_tipo');
  const watchLocalizacao = watch('localizacao');
  const watchIsSituacaoCurrent = watch('is_current_situacao');

  const onSubmit = async (data: IFormInputs): Promise<void> => {
    try {
      const createdSituacao = await createSituacao(
        {
          body: {
            ...data,
            localizacao: data.localizacao_outros || data.localizacao,
          },
        },
        nomeSituacao,
      );

      if (createdSituacao) {
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const colunas: IColumns = [
    {
      field: 'criado_em',
      text: 'Data do registro',
      type: { name: 'date', format: 'dd/MM/yyyy HH:mm:ss' },
    },
    {
      field: 'data_situacao',
      text: 'Data Situação',
      type: { name: 'date', format: 'dd/MM/yyyy' },
    },
    {
      field: 'nome',
      text: 'Situação',
      type: { name: 'text' },
    },
    {
      field: 'motivo',
      text: 'Motivo',
      type: { name: 'text' },
    },
    {
      field: 'km',
      text: 'KM',
      type: { name: 'text' },
    },
    {
      field: 'observacao',
      text: 'OBS',
      type: { name: 'text' },
    },
  ];

  const localizacoes = useMemo(() => {
    return (
      situacoesTipos
        .find(
          (situacao) =>
            situacao.id_situacao_tipo.toString() === watchIdSituacaoTipo,
        )
        ?.localizacoes.map<IOptionFormat>((localizacao) => ({
          label: localizacao,
          value: localizacao,
        })) || []
    );
  }, [situacoesTipos, watchIdSituacaoTipo]);

  const subTiposSituacoes = useMemo(() => {
    const subSituacoesTipos = situacoesTipos.find(
      (situacao) =>
        situacao.id_situacao_tipo.toString() === watchIdSituacaoTipo,
    )?.motivos;

    const formatedSubTipos =
      subSituacoesTipos?.map<IOptionFormat>((subSituacao) => ({
        label: subSituacao.especificacao,
        value: subSituacao.id_situacao_especificacao.toString(),
      })) || [];

    if (formatedSubTipos.length > 0) {
      setValue('id_situacao_tipo_especificacao', undefined);
    } else {
      setValue('id_situacao_tipo_especificacao', '-1');
    }

    return formatedSubTipos;
  }, [situacoesTipos, watchIdSituacaoTipo, setValue]);

  useEffect(() => {
    async function triggerAll(): Promise<void> {
      if (watchIdSituacaoTipo) await trigger('id_situacao_tipo_especificacao');

      if (watchLocalizacao) await trigger('localizacao_outros');
    }

    triggerAll();
  }, [watchIdSituacaoTipo, watchLocalizacao, trigger]);

  useEffect((): (() => void) | undefined => {
    const timer = setInterval(() => {
      if (watchIsSituacaoCurrent) setValue('data_situacao', new Date());
    }, 1000);

    !watchIsSituacaoCurrent && setValue('data_situacao', undefined);

    return () => clearInterval(timer);
  }, [watchIsSituacaoCurrent, setValue, trigger]);

  return (
    <Container>
      <div>
        <DataTable columns={colunas} data={veiculo.situacoes} />

        <Modal
          onClose={onClose}
          isOpen={isOpen}
          size="xl"
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Cadastro de Situação</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <FormGroup required name="Status" cols={[6, 6, 12]}>
                    <Controller
                      name="is_current_situacao"
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
                          onChange={(option: ValueType<OptionType>) => {
                            const optionSelected = option as OptionType;

                            onChange(optionSelected.value !== '0');
                          }}
                          error={errors.id_situacao_tipo?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <FormGroup required name="Data Situação" cols={[6, 6, 12]}>
                    <Controller
                      name="data_situacao"
                      control={control}
                      render={({ onChange, value }) => (
                        <DatePicker
                          showYearDropdown
                          selected={value}
                          onChange={onChange}
                          error={errors.data_situacao?.message}
                          dateFormat="dd/MM/yyyy HH:mm:ss"
                          disabled={watchIsSituacaoCurrent}
                          maxDate={new Date()}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormGroup name="KM" cols={[6, 6, 12]}>
                    <Controller
                      name="km"
                      control={control}
                      defaultValue={false}
                      render={(props) => (
                        <FormInputNumber
                          {...props}
                          error={errors.km?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <FormGroup required name="Situação Tipo" cols={[6, 6, 12]}>
                    <Controller
                      name="id_situacao_tipo"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={situacoesFormated}
                          value={situacoesFormated.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<OptionType>) => {
                            const optionSelected = option as OptionType;
                            setNomeSituacao(optionSelected.label);
                            onChange(optionSelected.value);
                          }}
                          error={errors.id_situacao_tipo?.message}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormGroup
                    required
                    name="Subtipo de Situação"
                    cols={[6, 6, 12]}
                  >
                    <Controller
                      name="id_situacao_tipo_especificacao"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={subTiposSituacoes}
                          value={subTiposSituacoes.filter(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<OptionType>) => {
                            const optionSelected = option as OptionType;
                            onChange(optionSelected.value);
                            setNomeSituacao(
                              `${nomeSituacao} - ${optionSelected.label}`,
                            );
                          }}
                          isDisabled={
                            subTiposSituacoes.length < 1 || !watchIdSituacaoTipo
                          }
                          error={errors.id_situacao_tipo_especificacao?.message}
                        />
                      )}
                    />
                  </FormGroup>
                </Row>

                <Row>
                  <FormGroup required name="Localização" cols={[6, 6, 12]}>
                    <Controller
                      name="localizacao"
                      control={control}
                      defaultValue=""
                      render={({ onChange, value }) => (
                        <ReactSelect
                          placeholder="Selecione ..."
                          optionsSelect={localizacoes}
                          value={localizacoes.find(
                            (option) => option.value === value,
                          )}
                          onChange={(option: ValueType<OptionType>) => {
                            const optionSelected = option as OptionType;
                            onChange(optionSelected.value);
                            setValue('localizacao_outros', undefined);
                          }}
                          isDisabled={!watchIdSituacaoTipo}
                          error={errors.localizacao?.message}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormGroup
                    required
                    name="Outra Localização"
                    cols={[6, 6, 12]}
                  >
                    <Controller
                      name="localizacao_outros"
                      control={control}
                      as={
                        // eslint-disable-next-line react/jsx-wrap-multilines
                        <FormInput
                          disabled={
                            !watchLocalizacao ||
                            (watchLocalizacao.trim().toLowerCase() !==
                              outroString &&
                              watchLocalizacao.trim().toLowerCase() !==
                                outroString)
                          }
                          error={errors.localizacao_outros?.message}
                        />
                      }
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
                          rows={5}
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
        <Button color="green" onClick={onOpen}>
          Mudar Situação
        </Button>
      </PanelBottomActions>
    </Container>
  );
};

export default TabSituacoes;
