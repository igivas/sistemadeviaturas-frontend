import React, { useState, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ValueType } from 'react-select';
import { EPrefixoTipo } from 'enums/EPrefixo';
import NumberFormat from '../../../../../components/form/InputNumberFormat';
import ReactSelect from '../../../../../components/form/ReactSelect';
import Row from '../../../../../components/form/Row';
import FormGroup from '../../../../../components/form/FormGroup';
import { IPrefixoOrganicoOrCedido } from '../utils/schemaFormVeiculo';
import { usePrefixo } from '../../../../../contexts/PrefixoContext';

type OptionFormat = { label: string; value: string };

const optionsPrefixosTipos = Object.entries(EPrefixoTipo).reduce(
  (options, currentPrefixoTipo) => {
    return [
      ...options,
      {
        label: currentPrefixoTipo[0],
        value: currentPrefixoTipo[1],
      },
    ];
  },
  [] as any[],
);

const PrefixoCedidoOrOrganico: React.FC = () => {
  const {
    control,
    errors,
    setValue,
    clearErrors,
    watch,
  } = useFormContext<IPrefixoOrganicoOrCedido>();
  const [isPrefixoSequenciaClosed, setIsPrefixoSequenciaClosed] = useState(
    true,
  );

  const { validatePrefixo, optionsEmpregos } = usePrefixo();

  const prefixoTipo = watch('prefixo_tipo') as EPrefixoTipo;

  const empregos = optionsEmpregos(prefixoTipo);

  const prefixoValid = useCallback(
    async (prefixoSequencia: string): Promise<void> => {
      const formatedPrefixoSequencia = prefixoSequencia?.trimLeft().trimRight();
      const formatedPrefixoTipo = prefixoTipo.trim();
      if (prefixoSequencia && formatedPrefixoSequencia.length > 0)
        if (
          await validatePrefixo(
            formatedPrefixoTipo as EPrefixoTipo,
            formatedPrefixoSequencia,
          )
        )
          clearErrors(['prefixo_sequencia', 'prefixo_tipo']);
        else setValue('prefixo_sequencia', '');
      else setValue('prefixo_sequencia', '');
    },
    [prefixoTipo, setValue, clearErrors, validatePrefixo],
  );

  return (
    <>
      <Row>
        {/* <FormGroup required name="Data Prefixo" cols={[2, 6, 6]}>
          <Controller
            name="data_prefixo"
            control={control}
            render={({ onChange, value }) => (
              <DatePicker
                showYearDropdown
                selected={value}
                onChange={onChange}
                error={errors.data_prefixo?.message}
                dateFormat="dd/MM/yyyy"
              />
            )}
          />
        </FormGroup> */}
        <FormGroup required name="Prefixo Tipo" cols={[3, 6, 12]}>
          <Controller
            name="prefixo_tipo"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={optionsPrefixosTipos}
                value={optionsPrefixosTipos.find(
                  (option) => option.value === value,
                )}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);

                  setIsPrefixoSequenciaClosed(false);
                }}
                error={errors.prefixo_tipo?.message}
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="Prefixo Sequência" cols={[2, 6, 12]}>
          <Controller
            name="prefixo_sequencia"
            control={control}
            render={({ onChange, value }) => (
              <NumberFormat
                onChange={onChange}
                value={value}
                error={errors.prefixo_sequencia?.message}
                format="#####"
                disabled={isPrefixoSequenciaClosed}
                onBlur={() => prefixoValid(value)}
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="Emprego" cols={[5, 6, 12]}>
          <Controller
            name="emprego"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={empregos}
                value={empregos.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.emprego?.message}
                isDisabled={!prefixoTipo}
              />
            )}
          />
        </FormGroup>
      </Row>
    </>
  );
};

export default PrefixoCedidoOrOrganico;
