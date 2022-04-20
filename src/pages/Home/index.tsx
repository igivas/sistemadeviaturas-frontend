import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';

import api from '../../services/api';
import BoxContent from '../../components/BoxContent';
import TabGeral from './TabGeral';
import TabAutomoveis from './TabAutomoveis';
import TabMotocicletas from './TabMotocicletas';

// import TabOutros from './TabOutros';

type Total = {
  total_operando: number;
  total_baixada: number;
  total_inservível: number;
};

type FrotaResponse = {
  [key: string]: {
    [key2: string]: Total;
  };
};

const LazyTabs = lazy(() => import('../../components/Tabs'));

const Home: React.FC = () => {
  const [frota, setFrota] = useState<FrotaResponse>({} as FrotaResponse);

  useEffect(() => {
    async function loadFrota(): Promise<void> {
      const frotaResponse = await api.get<FrotaResponse>('/veiculos', {
        params: {
          frotas: ['administrativa', 'operacional'],
        },
      });
      setFrota(frotaResponse.data);
    }

    loadFrota();
  }, []);

  const entriesFrota = Object.entries(frota);

  const total = useCallback(() => {
    const resultadoTotal = entriesFrota.reduce((nextEspecie, actualFrota) => {
      const entriesEspecies = Object.values(actualFrota[1]);

      const resultadoFrota = entriesEspecies.reduce(
        (formatedResultValue, actualEspecie, index) => {
          return index === 0
            ? [...Object.entries(actualEspecie)]
            : index < entriesEspecies.length - 1
            ? formatedResultValue.reduce(
                (tipoSituacaoResult: any, tipoSituacao) => {
                  const nextTotalByEspecie = Object.entries(
                    entriesEspecies[index + 1],
                  ).find(
                    (nextEspecieValue) =>
                      tipoSituacao[0] === nextEspecieValue[0],
                  );

                  return nextTotalByEspecie
                    ? [
                        ...tipoSituacaoResult,
                        [
                          tipoSituacao[0],
                          tipoSituacao[1] + nextTotalByEspecie[1],
                        ],
                      ]
                    : [...tipoSituacaoResult, tipoSituacao];
                },
                [] as [string, number][],
              )
            : [...formatedResultValue];
        },
        [] as [string, number][],
      );

      return {
        ...nextEspecie,
        [actualFrota[0]]: Object.fromEntries(resultadoFrota),
      };
    }, {});

    return resultadoTotal;
  }, [entriesFrota]);

  total();

  const filterByEspecie = useCallback(
    (especie: string) => {
      const filteredEspecie = Object.entries(frota).reduce(
        (previousTipoEspecie, tipoEspecie) => {
          const tipoFrotaEspecie = Object.entries(tipoEspecie[1]).filter(
            (especieSearch) => especieSearch[0] === especie,
          );

          const objSelectedEspecie = tipoFrotaEspecie.reduce(
            (previous, next) => {
              return {
                ...previous,
                ...next[1],
              };
            },
            {},
          );

          return {
            ...previousTipoEspecie,
            [tipoEspecie[0]]: objSelectedEspecie,
          };
        },
        {},
      );

      return filteredEspecie;
    },
    [frota],
  );

  const tabs = [
    {
      key: 'geral',
      title: 'Geral',
      componente: <TabGeral frota={total()} />,
    },
    {
      key: 'automoveis',
      title: 'Automóveis',
      componente: <TabAutomoveis frota={filterByEspecie('automóvel')} />,
    },
    {
      key: 'motocicletas',
      title: 'Motocicletas',
      componente: <TabMotocicletas frota={filterByEspecie('motocicleta')} />,
    },
    /* {
      key: 'outros',
      title: 'Outros',
      componente: <TabOutros frota={filterByEspecie('outros')} />,
    }, */
  ];

  return (
    <>
      <BoxContent>
        <Suspense fallback={<div>carregando</div>}>
          <LazyTabs initialTab="geral" id="tabs-home" tabs={tabs} />
        </Suspense>
      </BoxContent>
    </>
  );
};

export default Home;
