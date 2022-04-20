import React, { Suspense, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { lazy } from 'react';
import { useAquisicao } from 'contexts/AquisicoesContext';
import { useVeiculosMarcas } from 'contexts/VeiculosMarcasContext';
import { usePrefixo } from '../../../contexts/PrefixoContext';
import BoxContent from '../../../components/BoxContent';
import TituloPagina from '../../../components/TituloPagina';
import Tabs from '../../../components/Tabs';
import TabPrefixos from './TabPrefixos';
import TabSituacoes from './TabSituacoes';
import TabMovimentacoes from './TabMovimentacoes';
import { useVeiculo } from '../../../contexts/VeiculoContext';
import { useSituacao } from '../../../contexts/SituacaoContext';
import { useIdentificador } from '../../../contexts/Identificadores';
import { useMovimentacao } from '../../../contexts/MovimentacaoContext';
import TabManutencoes from './TabManutencoes';
import TabAquisicoes from './TabAquisicoes';

const LazyTabCaracteristicas = lazy(() => import('./TabCaracteristicas'));
const LazyTabIdentificadores = lazy(() => import('./TabIdentificadores'));
const LazyTabKms = lazy(() => import('./TabKms'));

const VeiculoEditar: React.FC = () => {
  const match: any = useRouteMatch('/veiculos/editar/:id');
  const { id } = match?.params;

  const { veiculo, loadVeiculo } = useVeiculo();
  const { loadSituacoesVeiculo } = useSituacao();
  const { loadPrefixos } = usePrefixo();
  const { loadAquisicoes } = useAquisicao();
  const { loadIdentificadores } = useIdentificador();
  const { marcas } = useVeiculosMarcas();

  // const { loadKms } = useKm();
  const { loadMovimentacoesVeiculo } = useMovimentacao();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      await loadVeiculo(id);
      await Promise.all([
        loadSituacoesVeiculo(id),
        loadPrefixos(id),
        loadIdentificadores(id),
        loadMovimentacoesVeiculo(id),
        loadAquisicoes(id),
        // loadKms(id),
      ]);
      setLoading(false);
    }
    load();
    // setChassi(veiculo?.chassi);
  }, [
    id,
    loadVeiculo,
    loadSituacoesVeiculo,
    loadPrefixos,
    loadIdentificadores,
    loadMovimentacoesVeiculo,
    // loadKms,
    loadAquisicoes,
  ]);

  const tabs = [
    {
      key: 'caracteristicas',
      title: 'Características',
      componente: <LazyTabCaracteristicas />,
    },

    {
      key: 'aquisicoes',
      title: 'Aquisicoes',
      componente: <TabAquisicoes />,
    },

    {
      key: 'prefixos',
      title: 'Prefixos',
      componente: <TabPrefixos />,
    },
    {
      key: 'identificadores',
      title: 'Identificadores',
      componente: <LazyTabIdentificadores />,
    },
    { key: 'situacao', title: 'Situações', componente: <TabSituacoes /> },

    // {
    //   key: 'manutencoes',
    //   title: 'Manutencoes',
    //   componente: <TabManutencoes />,
    // },

    {
      key: 'movimentacoes',
      title: 'Movimentações',
      componente: <TabMovimentacoes />,
    },

    {
      key: 'manutencoes',
      title: 'Manutenções',
      componente: <TabManutencoes />,
    },

    // { key: 'pneus', title: 'Pneus', componente: <h3> TabPneus</h3> },

    { key: 'km', title: 'Km', componente: <LazyTabKms /> },

    // { key: 'cautela', title: 'Cautela', componente: <h3> TabCautela</h3> },
  ];

  return (
    <>
      {!loading && (
        <>
          <TituloPagina
            title={`Ficha do Veículo: ${
              marcas.find(
                (marca) =>
                  marca.id_veiculo_marca.toString() ===
                  veiculo.id_marca.toString(),
              )?.nome
            } ${veiculo?.veiculoModelo.nome} ${
              veiculo.placa ? `- ${veiculo.placa}` : ''
            } - ${veiculo.identificadores[0].identificador} - ${
              veiculo.situacoes[0].nome
            }`}
          />
          <BoxContent>
            <Suspense fallback={<div>Carregando...</div>}>
              <Tabs
                initialTab="caracteristicas"
                id="tabs-veiculos-editar"
                tabs={tabs}
              />
            </Suspense>
          </BoxContent>
        </>
      )}
    </>
  );
};

export default VeiculoEditar;
