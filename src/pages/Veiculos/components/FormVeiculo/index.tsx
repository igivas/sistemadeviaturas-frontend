import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { ValueType } from 'react-select';
import { useKm } from '../../../../contexts/KmContext';
import FormGroup from '../../../../components/form/FormGroup';
import Row from '../../../../components/form/Row';
import FormCategory from '../../../../components/form/FormCategory';
import ReactSelect from '../../../../components/form/ReactSelect';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import { useVeiculosEspecies } from '../../../../contexts/VeiculosEspeciesContext';
import { useVeiculosCores } from '../../../../contexts/VeiculosCoresContext';
import { useVeiculosMarcas } from '../../../../contexts/VeiculosMarcasContext';

interface IProps {
  action: 'editar' | 'cadastrar';
}

type OptionType = { label: string; value: string };

const optionsOrigemAquisicao = [
  { value: '0', label: 'Orgânico' },
  { value: '1', label: 'Locado' },
  { value: '2', label: 'Cessão' },
];

const LazyFormOrganico = lazy(() => import('./Organico'));
const LazyFormCedido = lazy(() => import('./Cedido'));
const LazyFormLocado = lazy(() => import('./Locado'));

const FormVeiculo: React.FC<IProps> = ({ action }) => {
  const [origemAquisicao, setOrigemAquisicao] = useState('');
  const {
    veiculo,
    loadOrgaos,
    orgaosResponse,
    handleLoadOrgaos,
  } = useVeiculo();
  const { loadEspecies, especies } = useVeiculosEspecies();
  const { loadCores, cores } = useVeiculosCores();
  const { loadMarcas, marcas } = useVeiculosMarcas();
  const { loadReferenciasPneus } = useKm();

  useEffect((): (() => void) | undefined => {
    const timer = setTimeout(async () => {
      loadReferenciasPneus();

      if (action === 'cadastrar') {
        if (especies.length < 1) loadEspecies();

        if (cores.length < 1) loadCores();

        if (marcas.length < 1) loadMarcas();
        if (orgaosResponse.length < 1) loadOrgaos();
      } else {
        if (
          veiculo.id_veiculo_especie &&
          especies.findIndex(
            (especie) =>
              especie.id_veiculo_especie.toString() !==
              veiculo.id_veiculo_especie.toString(),
          ) < 0
        ) {
          loadEspecies();
        }
        if (
          veiculo.id_cor &&
          cores.findIndex(
            (cor) => cor.id_cor.toString() !== veiculo.id_cor.toString(),
          ) < 0
        ) {
          loadCores();
        }

        if (
          veiculo.id_marca &&
          marcas.findIndex(
            (marca) =>
              marca.id_veiculo_marca.toString() !== veiculo.id_marca.toString(),
          ) < 0
        ) {
          loadMarcas();
        }
        handleLoadOrgaos();
      }
    }, 15);
    return () => clearTimeout(timer);
  }, [
    veiculo,
    especies,
    loadEspecies,
    cores,
    loadCores,
    orgaosResponse,
    loadOrgaos,
    handleLoadOrgaos,
    loadReferenciasPneus,
    marcas,
    loadMarcas,
    action,
  ]);

  const formAquisicao = {
    Orgânico: <LazyFormOrganico action={action} />,
    '0': <LazyFormOrganico action={action} />,

    Cessão: <LazyFormCedido action={action} />,
    '2': <LazyFormCedido action={action} />,

    Locado: <LazyFormLocado action={action} />,
    '1': <LazyFormLocado action={action} />,
  };

  const formularioAquisicao = useMemo(() => {
    return action === 'editar'
      ? formAquisicao[veiculo.aquisicoes[0].origem_aquisicao as '0' | '1' | '2']
      : formAquisicao[origemAquisicao as 'Orgânico' | 'Cessão' | 'Locado'];
  }, [veiculo, action, origemAquisicao, formAquisicao]);

  return (
    <div>
      <Suspense fallback={<div>Carregando dados do formulario ...</div>}>
        {action === 'cadastrar' && (
          <>
            <FormCategory>AQUISIÇÃO</FormCategory>

            <Row>
              <FormGroup required name="Origem de Aquisição" cols={[3, 6, 12]}>
                <ReactSelect
                  autoFocus
                  placeholder="Selecione ..."
                  optionsSelect={optionsOrigemAquisicao}
                  value={optionsOrigemAquisicao.find(
                    (option) => option.label === origemAquisicao,
                  )}
                  onChange={(option: ValueType<OptionType>) => {
                    const optionSelected = option as OptionType;

                    setOrigemAquisicao(optionSelected.label);
                  }}
                  isDisabled={action !== 'cadastrar'}
                />
              </FormGroup>
            </Row>
          </>
        )}
        {formularioAquisicao}
      </Suspense>
    </div>
  );
};

export default FormVeiculo;
