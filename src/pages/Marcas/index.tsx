import React from 'react';
import BoxContent from '../../components/BoxContent';
import DataTable, { IColumns } from '../../components/DataTable';
import TituloPagina from '../../components/TituloPagina';
import { useVeiculosMarcas } from '../../contexts/VeiculosMarcasContext';

interface IFields {
  [key: string]: string | number;
}

const Marcas: React.FC = () => {
  const { marcas } = useVeiculosMarcas();

  const colunas: IColumns = [
    {
      field: 'id_veiculo_marca',
      text: 'Código',
      type: { name: 'text' },
    },
    {
      field: 'nome',
      text: 'Marca',
      type: { name: 'text' },
    },
  ];

  const options = {
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
  };

  return (
    <>
      <TituloPagina title="Administração de Marcas de Veículos" />
      <BoxContent>
        <div>
          <DataTable columns={colunas} options={options} data={marcas} />
        </div>
      </BoxContent>
    </>
  );
};

export default Marcas;
