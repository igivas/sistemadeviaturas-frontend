import React from 'react';
import { Switch } from 'react-router-dom';
// import NovaSituacao from 'pages/Situacoes/Novo';

import NovaManutencao from '../pages/Manutencoes/Novo';
import VeiculosLocalizacoes from '../pages/VeiculosLocalizacoes';
import VeiculoModeloNovo from '../pages/Veiculos_Modelos/novo';
import VeiculoModelo from '../pages/Veiculos_Modelos';
import NovaMovimentacao from '../pages/Movimentacoes/Novo';
import NovaReferenciaPneu from '../pages/ReferenciaPneus/Novo';
import NovaOficina from '../pages/Oficinas/novo';
import Home from '../pages/Home';
import VeiculoNovo from '../pages/Veiculos/Novo';
import Veiculos from '../pages/Veiculos';
import VeiculoEditar from '../pages/Veiculos/Editar';
import Marcas from '../pages/Marcas';
import Referencias from '../pages/ReferenciaPneus';
import Route from './Route';
import SignIn from '../pages/SignIn';
import Movimentacoes from '../pages/Movimentacoes';
import Emails from '../pages/Emails';
import Oficinas from '../pages/Oficinas';

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route path="/" exact component={SignIn} />
      <Route path="/home" component={Home} isPrivate />
      {/* <Route path="/situacoes/cadastro" component={NovaSituacao} isPrivate /> */}
      {/* <Route
        path="/movimentacoes/cadastro"
        component={NovaMovimentacao}
        isPrivate
      /> */}
      <Route path="/veiculos/cadastro" component={VeiculoNovo} isPrivate />
      <Route path="/marcas/consulta" component={Marcas} isPrivate />
      <Route path="/referencias/consulta" component={Referencias} isPrivate />
      <Route path="/veiculos/consulta" component={Veiculos} isPrivate />
      <Route path="/modelos/consulta" component={VeiculoModelo} isPrivate />
      <Route
        path="/veiculos/editar/:id"
        component={VeiculoEditar}
        isPrivate
        exact
      />

      <Route
        path="/veiculos/manutencao/:id"
        component={NovaManutencao}
        isPrivate
      />
      <Route
        path="/veiculos/movimentar/:id"
        component={NovaMovimentacao}
        isPrivate
      />
      <Route path="/movimentacoes" component={Movimentacoes} isPrivate exact />
      <Route path="/emails" component={Emails} isPrivate exact />
      <Route path="/pneus/cadastro" component={NovaReferenciaPneu} isPrivate />

      <Route path="/oficinas/consulta" component={Oficinas} isPrivate />
      <Route path="/oficinas/cadastro" component={NovaOficina} isPrivate />
      <Route
        path="/veiculos/localizacao"
        component={VeiculosLocalizacoes}
        isPrivate
      />

      {/* <Route
        path="/manutencoes/cadastro"
        component={NovaManutencao}
        exact
        isPrivate
      /> */}

      <Route path="/modelos/cadastro" component={VeiculoModeloNovo} isPrivate />
    </Switch>
  );
};

export default Routes;
