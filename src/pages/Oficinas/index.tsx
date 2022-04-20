import BoxContent from 'components/BoxContent';
import { IColumns } from 'components/DataTable';
import DataTable from 'components/DataTable';
import React from 'react';
import TituloPagina from '../../components/TituloPagina';
import api from '../../services/api';

const Oficinas: React.FC = () => {
  const colunas: IColumns = [
    {
      field: 'nome',
      text: 'Oficina',
      type: { name: 'text' },
      alias: 'oficinas.nome',
    },
    {
      field: 'endereco',
      text: 'Endereço',
      type: { name: 'text' },
      alias: 'oficinas.endereco',
    },
    {
      field: 'numero',
      text: 'Número',
      type: { name: 'text' },
      alias: 'oficinas.numero',
    },
    {
      field: 'endereco_complemento',
      text: 'Complemento',
      type: { name: 'text' },
      alias: 'oficinas.endereco_complemento',
    },
    {
      field: 'cpf_cnpj',
      text: 'CPF/CNPJ',
      type: { name: 'text' },
      alias: 'oficinas.cpf_cnpj',
    },
  ];

  /* useEffect(() => {
    async function load(): Promise<void> {
      await api.get('oficinas')
    }
    load();
  }, []) */

  const options = {
    reload: true,
    serverData: {
      url: `${api.defaults.baseURL}/oficinas`,
      headers: { Authorization: api.defaults.headers.authorization },
      serverPagination: true,
    },

    search: {
      searchable: true,
      label: 'Consultar Oficina',
      fields: [
        'oficinas.nome',
        'oficinas.endereco_complemento',
        'oficinas.endereco',
        'oficinas.numero',
      ],
      placeholder: 'endereco, complemento, numero...',
    },
  };

  return (
    <>
      <TituloPagina title="Consulta de oficinas" />
      <BoxContent>
        <div>
          <DataTable columns={colunas} options={options} />
        </div>
      </BoxContent>
    </>
  );
};

export default Oficinas;
