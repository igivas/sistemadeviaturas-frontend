import React from 'react';
import { useToast } from '@chakra-ui/react';

import { FaSearch } from 'react-icons/fa';
import { useKm } from 'contexts/KmContext';
import { useEffect } from 'react';
import BoxContent from '../../components/BoxContent';
import DataTable, { IColumns } from '../../components/DataTable';
import TituloPagina from '../../components/TituloPagina';

interface IFields {
  [key: string]: string | number;
}

const Referencias: React.FC = () => {
  const toast = useToast();
  const { referenciasPneus, loadReferenciasPneus } = useKm();

  useEffect(() => {
    async function loadReferencias(): Promise<void> {
      await loadReferenciasPneus();
    }
    loadReferencias();
  }, [loadReferenciasPneus]);

  // const history = useHistory();

  const colunas: IColumns = [
    {
      field: 'id_pneu',
      text: 'Código',
      type: { name: 'text' },
    },
    {
      field: 'referencia',
      text: 'Descrição',
      type: { name: 'text' },
    },
    {
      field: 'id_veiculo_especie',
      text: 'Espécie',
      type: {
        name: 'enum',
        enum: {
          '1': 'Motocicleta',
          '2': 'Triciclo',
          '3': 'Quadriciclo',
          '4': 'Automóvel',
          '5': 'Caminhonete',
          '6': 'Caminhão',
          '7': 'Camioneta',
          '8': 'Microônibus',
          '9': 'Ônibus',
          '10': 'Reboque ou Semi-reboque',
          '11': 'Utilitário',
          '12': 'Trator',
          '13': 'Outros',
        },
      },
    },
  ];

  function handleClickEditar(row: IFields): void {
    toast({
      title: 'Sucesso!',
      description: 'Funcionalidade Em Construção Tente mais tarde.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
    // history.push(`/referencias/editar/${row.id_referencia_pneu}`);
  }

  const options = {
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
  };

  return (
    <>
      <TituloPagina title="Administração de Referências de Referencia de Pneus" />
      <BoxContent>
        <div>
          <DataTable
            columns={colunas}
            options={options}
            data={referenciasPneus}
          />
        </div>
      </BoxContent>
    </>
  );
};

export default Referencias;
