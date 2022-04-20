import React from 'react';
import { useHistory } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import BoxContent from '../../../components/BoxContent';
import DataTable, { IColumns } from '../../../components/DataTable';
import TituloPagina from '../../../components/TituloPagina';

interface IFields {
  [key: string]: string | number;
}

const Referencias: React.FC = () => {
  const history = useHistory();

  const colunas: IColumns = [
    {
      field: 'id_referencia_pneu',
      text: 'Código',
      type: { name: 'text' },
    },
    {
      field: 'descricao',
      text: 'Descrição',
      type: { name: 'text' },
    },
    {
      field: 'veiculoEspecie.nome',
      text: 'Espécie',
      type: { name: 'text' },
    },
  ];

  function handleClickEditar(row: IFields): void {
    history.push(`/marcas/editar/${row.id_marca}`);
  }

  const options = {
    serverData: {
      url: `${process.env.REACT_APP_URL_API}/referencias_pneus`,
      serverPagination: false,
    },
    actions: {
      headerText: 'Ações',
      items: [
        {
          icon: <FaSearch size={13} />,
          tooltip: {
            name: 'visualizar',
            position: 'top' as 'top' | 'left' | 'bottom' | 'right',
          },

          getRow: handleClickEditar,
        },
      ],
    },
    // filters: [
    //   {
    //     field: 'situacao',
    //     label: 'Situação',
    //     options: [
    //       { value: 'Baixada', text: 'Baixada' },
    //       { value: 'Inservível', text: 'Inservível' },
    //       { value: 'Operando', text: 'Operando' },
    //     ],
    //   },
    // ],
    search: {
      // type: local | remote
      searchable: true,
      label: 'Pesquisar',
      fields: ['nome'],
    },
  };

  return (
    <>
      <TituloPagina title="Administração de Referências de Veículos" />
      <BoxContent>
        <div>
          <DataTable columns={colunas} options={options} />
        </div>
      </BoxContent>
    </>
  );
};

export default Referencias;
