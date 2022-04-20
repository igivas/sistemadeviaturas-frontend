import React, { useEffect, useState, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ValueType } from 'react-select';
import api from '../../../../../services/api';
import { useVeiculo } from '../../../../../contexts/VeiculoContext';
import Row from '../../../../../components/form/Row';
import ReactSelect from '../../../../../components/form/ReactSelect';
import FormInput from '../../../../../components/form/FormInput';
import FormGroup from '../../../../../components/form/FormGroup';
import NumberFormat from '../../../../../components/form/InputNumberFormat';
import DatePicker from '../../../../../components/form/FormDatePicker';
import InputCurrency from '../../../../../components/form/InputCurrency';
import {
  IDadosGerais,
  IDadosGeraisOrganicoOrCedido,
} from '../utils/schemaFormVeiculo';
import { useVeiculosEspecies } from '../../../../../contexts/VeiculosEspeciesContext';
import { useVeiculosCores } from '../../../../../contexts/VeiculosCoresContext';
import { useVeiculosMarcas } from '../../../../../contexts/VeiculosMarcasContext';

type OptionFormat = {
  value: string;
  label: string;
};

type IProps = {
  disabled: boolean;
  action: 'editar' | 'cadastrar';
};

type IVeiculoModelo = {
  id_veiculo_modelo: number;
  id_veiculo_marca: number;
  nome: string;
};

const DadosGerais: React.FC<IProps> = ({ disabled, action }) => {
  const {
    control,
    errors,
    clearErrors,
    setValue,
    watch,
    getValues,
  } = useFormContext<
    IDadosGerais &
      IDadosGeraisOrganicoOrCedido & { numero_motor: string; km: string }
  >();
  const {
    ufsFormated,
    combustiveisFormated,
    validateChassi,
    validatePlaca,
  } = useVeiculo();

  const { especiesFormated } = useVeiculosEspecies();
  const { coresFormated } = useVeiculosCores();
  const { marcasFormated } = useVeiculosMarcas();

  const [veiculosModelos, setVeiculosModelos] = useState<OptionFormat[]>([]);
  const [modeloEnable, setModeloEnable] = useState<boolean>(
    action !== 'cadastrar',
  );

  const marca = watch('id_marca');

  useEffect(() => {
    async function load(): Promise<void> {
      if (!marca) {
        setModeloEnable(false);
        return;
      }
      setModeloEnable(true);
      try {
        const modelos = await api.get(`marcas/${marca}/modelos`);
        const modelosFormated = modelos.data.map(
          (modeloAtual: IVeiculoModelo) => {
            return {
              value: modeloAtual.id_veiculo_modelo.toString(),
              label: modeloAtual.nome,
            };
          },
        );

        setVeiculosModelos(modelosFormated);
      } catch (error) {
        console.log(error);
      }
    }
    setVeiculosModelos([]);

    load();
  }, [marca]);

  const chassiValid = useCallback(
    async (chassi: string) => {
      if (chassi && chassi.length) {
        if (await validateChassi(chassi)) clearErrors('chassi');
        else setValue('chassi', '');
      } else setValue('chassi', '');
    },
    [clearErrors, setValue, validateChassi],
  );

  const placaValid = useCallback(
    async (placa: string) => {
      if (placa && placa.length) {
        if (await validatePlaca(placa)) clearErrors('placa');
        else setValue('placa', '');
      } else setValue('placa', '');
    },
    [clearErrors, setValue, validatePlaca],
  );

  const prefixoTipo = String(watch('prefixo_tipo'));

  if (prefixoTipo) {
    const moto = especiesFormated.find((especie) =>
      especie.label.toLowerCase().includes('moto'),
    );
    if (
      prefixoTipo.toLowerCase().includes('mr') ||
      prefixoTipo.toLowerCase().includes('mp')
    ) {
      if (moto) setValue('id_veiculo_especie', moto.value);
    } else if (moto && moto.value === getValues('id_veiculo_especie')) {
      setValue('id_veiculo_especie', '');
    }
  }

  return (
    <>
      <Row>
        <FormGroup required name="Chassi" cols={[2.5, 6, 12]}>
          <Controller
            name="chassi"
            control={control}
            render={({ onChange, value }) => {
              return (
                <FormInput
                  onChange={onChange}
                  disabled={disabled}
                  error={errors.chassi?.message}
                  value={value.trim().toUpperCase() as string}
                  onBlur={() =>
                    chassiValid(value.trim().toUpperCase() as string)
                  }
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
              );
            }}
          />
        </FormGroup>
        <FormGroup name="Placa" cols={[1.5, 6, 12]}>
          <Controller
            name="placa"
            control={control}
            render={({ value, onChange }) => (
              <FormInput
                disabled={disabled}
                error={errors.placa?.message}
                onChange={onChange}
                value={value.trim().toUpperCase() as string}
                onBlur={() => placaValid(value.trim().toUpperCase() as string)}
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

        <FormGroup name="Renavam" cols={[2, 6, 12]}>
          <Controller
            name="renavam"
            control={control}
            render={({ onChange, value, ...restProps }) => {
              return (
                <NumberFormat
                  onChange={onChange}
                  value={value.trim().toUpperCase() as string}
                  error={errors.renavam?.message}
                  format="###########"
                  disabled={disabled}
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
                  {...restProps}
                />
              );
            }}
          />
        </FormGroup>
        <FormGroup required name="Cor" cols={[2, 6, 6]}>
          <Controller
            name="id_cor"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={coresFormated}
                value={coresFormated.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.id_cor?.message}
                isDisabled={disabled}
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="Espécie" cols={[2, 6, 12]}>
          <Controller
            name="id_veiculo_especie"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={
                  prefixoTipo.toLowerCase().includes('mr') ||
                  prefixoTipo.toLowerCase().includes('mp')
                    ? especiesFormated.filter((especie) =>
                        especie.label.toLowerCase().includes('moto'),
                      )
                    : action === 'cadastrar'
                    ? especiesFormated.filter(
                        (especie) =>
                          !especie.label.toLowerCase().includes('moto'),
                      )
                    : especiesFormated
                }
                value={especiesFormated.find(
                  (option) => option.value === value,
                )}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                  // setMarca(optionSelected.value);
                }}
                error={errors.id_veiculo_especie?.message}
                isDisabled={
                  disabled ||
                  prefixoTipo.toLowerCase().includes('mr') ||
                  prefixoTipo.toLowerCase().includes('mp')
                }
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="Marca" cols={[2, 6, 12]}>
          <Controller
            name="id_marca"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={marcasFormated}
                value={marcasFormated.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                  // setMarca(optionSelected.value);
                }}
                error={errors.id_marca?.message}
                isDisabled={disabled}
              />
            )}
          />
        </FormGroup>
      </Row>
      <Row>
        <FormGroup required name="Modelo" cols={[3, 6, 12]}>
          <Controller
            name="id_modelo"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={veiculosModelos}
                value={veiculosModelos.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.id_modelo?.message}
                isDisabled={disabled || !modeloEnable}
              />
            )}
          />
        </FormGroup>
        <FormGroup name="Número CRV" cols={[2, 6, 12]}>
          <Controller
            name="numero_crv"
            control={control}
            render={({ onChange, value }) => {
              const trimmedNumeroCRV = String(value).trim();
              return (
                <NumberFormat
                  onChange={onChange}
                  value={trimmedNumeroCRV}
                  error={errors.numero_crv?.message}
                  format="###############"
                  disabled={disabled}
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
              );
            }}
          />
        </FormGroup>
        <FormGroup name="Cód. Seg. CRV" cols={[2.5, 6, 12]}>
          <Controller
            name="codigo_seguranca_crv"
            control={control}
            render={({ onChange, value }) => {
              const trimmedCodSegurancaCRV = String(value).trim();
              return (
                <NumberFormat
                  onChange={onChange}
                  value={trimmedCodSegurancaCRV}
                  error={errors.codigo_seguranca_crv?.message}
                  format="###############"
                  disabled={disabled}
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
              );
            }}
          />
        </FormGroup>
        <FormGroup name="N° Motor" cols={[4, 12, 12]}>
          <Controller
            name="numero_motor"
            control={control}
            render={(props) => {
              const toUpperNumeroMotor = String(props.value || '');
              return (
                <FormInput
                  {...props}
                  disabled={disabled}
                  error={errors.numero_motor?.message}
                  value={toUpperNumeroMotor.toUpperCase()}
                  onPaste={(e) => {
                    // e.clipboardData.getData('Text').replace(/\s/g, '')
                    props.onChange(
                      e.clipboardData
                        .getData('text/plain')
                        .replace(/\s/g, '')
                        .toUpperCase(),
                    );
                    e.preventDefault();
                  }}
                />
              );
            }}
          />
        </FormGroup>
      </Row>
      {/* <Row>

        <FormGroup name="Caracterizado?" cols={[3, 6, 6]}>
          <Controller
            name="adesivado"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={optionsSimNao}
                value={optionsSimNao.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.adesivado?.message}
                isDisabled={disabled}
              />
            )}
          />
        </FormGroup>

      </Row> */}

      <Row>
        <FormGroup required name="Ano Fab." cols={[1.5, 6, 12]}>
          <Controller
            name="ano_fabricacao"
            control={control}
            render={({ onChange, value }) => (
              <DatePicker
                showYearPicker
                selected={value}
                onChange={onChange}
                error={errors.ano_fabricacao?.message}
                dateFormat="yyyy"
                disabled={disabled}
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="Ano Mod." cols={[1.5, 6, 12]}>
          <Controller
            name="ano_modelo"
            control={control}
            render={({ onChange, value }) => (
              <DatePicker
                showYearPicker
                selected={value}
                onChange={onChange}
                error={errors.ano_modelo?.message}
                dateFormat="yyyy"
                disabled={disabled}
              />
            )}
          />
        </FormGroup>
        <FormGroup required name="UF" cols={[2, 6, 12]}>
          <Controller
            name="uf"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={ufsFormated}
                value={ufsFormated.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.uf?.message}
                isDisabled={disabled}
              />
            )}
          />
        </FormGroup>

        <FormGroup required name="Combustível" cols={[2, 6, 12]}>
          <Controller
            name="combustivel"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={combustiveisFormated}
                value={combustiveisFormated.find(
                  (option) => option.value === value,
                )}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.combustivel?.message}
                isDisabled={disabled}
              />
            )}
          />
        </FormGroup>
        {/* <FormGroup name="Caracterizado?" cols={[3, 6, 6]}>
          <Controller
            name="adesivado"
            control={control}
            render={({ onChange, value }) => (
              <ReactSelect
                placeholder="Selecione ..."
                optionsSelect={optionsSimNao}
                value={optionsSimNao.find((option) => option.value === value)}
                onChange={(option: ValueType<OptionFormat>) => {
                  const optionSelected = option as OptionFormat;
                  onChange(optionSelected.value);
                }}
                error={errors.adesivado?.message}
                isDisabled={disabled}
              />
            )}
          />
        </FormGroup> */}
        <FormGroup required name="Valor FIPE" cols={[2, 6, 12]}>
          <Controller
            name="valor_fipe"
            control={control}
            render={({ onChange, value }) => (
              <InputCurrency
                value={value}
                onChange={(event: any, valueInput: any) =>
                  onChange(Number(valueInput))
                }
                error={errors.valor_fipe?.message}
                disabled={disabled}
              />
            )}
          />
        </FormGroup>

        {action === 'cadastrar' && (
          <FormGroup required name="Km" cols={[2, 6, 12]}>
            <Controller
              name="km"
              control={control}
              render={({ onChange, value }) => (
                <NumberFormat
                  onChange={onChange}
                  value={value}
                  error={errors.km?.message}
                  format="###############"
                  disabled={disabled}
                />
              )}
            />
          </FormGroup>
        )}
      </Row>
    </>
  );
};

export default DadosGerais;
