import DataTable, { IColumns } from 'components/DataTable';
import TituloPagina from 'components/TituloPagina';
import { useAuth } from 'contexts/auth';
import React from 'react';
import api from 'services/api';

const VeiculosLocalizacoes: React.FC = () => {
  const { user } = useAuth();
  const colunas: IColumns = [
    {
      field: 'data_localizacao',
      text: 'Data',
      type: { name: 'date', format: 'dd/MM/yyyy' },
      alias: 'movimentacoes.data_movimentacao',
    },
    {
      field: 'localizacao',
      text: 'Localizacao',
      type: { name: 'text' },
    },

    {
      field: 'veiculo.placa',
      text: 'Placa',
      type: { name: 'text' },
      alias: 'veiculo.placa',
    },
  ];

  const options = {
    reload: true,
    serverData: {
      url: `${api.defaults.baseURL}/veiculos/localizacoes`,
      headers: { Authorization: api.defaults.headers.authorization },
      serverPagination: true,
      params: {
        opms: user.opmBusca.value,
      },
    },

    search: {
      searchable: true,
      label: 'Consultar Veiculo',
      fields: ['veiculo.placa'],
      placeholder: 'Placa, Renavam, Ident.',
    },
  };

  return (
    <>
      <TituloPagina title="Consulta de localizacoes de veiculos" />
      <DataTable columns={colunas} options={options} />
    </>
  );
};

export default VeiculosLocalizacoes;
