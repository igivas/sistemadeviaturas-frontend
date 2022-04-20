import React from 'react';
import { useHistory } from 'react-router-dom';
import { useVeiculo } from '../../../../contexts/VeiculoContext';
import Button from '../../../../components/form/Button';
import PanelBottomActions from '../../../../components/PanelBottomActions';

const TabManutencoes: React.FC = () => {
  const { veiculo } = useVeiculo();

  const history = useHistory();

  return (
    <PanelBottomActions>
      <Button
        color="green"
        onClick={async () =>
          history.push(`/veiculos/manutencao/${veiculo.id_veiculo}`)
        }
        type="button"
      >
        Nova Manutenção
      </Button>
    </PanelBottomActions>
  );
};

export default TabManutencoes;
