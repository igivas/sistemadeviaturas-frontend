import React, { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import FormGroup from '../../../../../components/form/FormGroup';
import Row from '../../../../../components/form/Row';
import DatePicker from '../../../../../components/form/FormDatePicker';
import FormInput from '../../../../../components/form/FormInput';
import { IIdentificador } from '../utils/schemaFormVeiculo';
import { useIdentificador } from '../../../../../contexts/Identificadores';

type IProps = {
  disabled: boolean;
};

const FormIdentificador: React.FC<IProps> = ({ disabled }) => {
  const {
    errors,
    control,
    setValue,
    clearErrors,
  } = useFormContext<IIdentificador>();
  const { validateIdentificador } = useIdentificador();

  const identificadorValid = useCallback(
    async (identificador: string) => {
      const formatedIdentificador = identificador.trimEnd().trimStart();
      if (formatedIdentificador && formatedIdentificador.length) {
        if (await validateIdentificador({ nome: formatedIdentificador }))
          clearErrors('identificador');
        else setValue('identificador', '');
      } else setValue('identificador', '');
    },
    [clearErrors, setValue, validateIdentificador],
  );

  return (
    <>
      <Row>
        <FormGroup required name="Data Identificador" cols={[2, 6, 6]}>
          <Controller
            name="data_identificador"
            control={control}
            render={({ onChange, value }) => (
              <DatePicker
                showYearDropdown
                selected={value}
                onChange={onChange}
                error={errors.data_identificador?.message}
                dateFormat="dd/MM/yyyy"
                disabled={disabled}
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="Identificador" cols={[2.5, 6, 12]}>
          <Controller
            name="identificador"
            control={control}
            render={({ value, onChange }) => (
              <FormInput
                onChange={onChange}
                value={value.trim().toUpperCase() as string}
                disabled={disabled}
                error={errors.identificador?.message}
                onBlur={() => identificadorValid(value.toUpperCase() as string)}
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
              />
            )}
          />
        </FormGroup>
      </Row>
    </>
  );
};

export default FormIdentificador;
