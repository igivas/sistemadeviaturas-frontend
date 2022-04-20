import BoxContent from 'components/BoxContent';
import TituloPagina from 'components/TituloPagina';
import React, { useState } from 'react';
import { Suspense } from 'react';
import { useRouteMatch } from 'react-router-dom';

const ModeloEditar: React.FC = () => {
  const match: any = useRouteMatch('/modelos/editar/:id');
  const { id } = match?.params;

  const [loading, setLoading] = useState(true);

  return (
    <>
      {!loading && (
        <>
          <TituloPagina
            title={`Modelo do Veículo

             `}
          />
          <BoxContent>
            <Suspense fallback={<div>Carregando...</div>} />
          </BoxContent>
        </>
      )}
    </>
  );
};

export default ModeloEditar;
