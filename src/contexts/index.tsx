import React from 'react';

import { VeiculoProvider } from './VeiculoContext';
import { SituacaoProvider } from './SituacaoContext';
import { MovimentacaoProvider } from './MovimentacaoContext';
import { AuthProvider } from './auth';
import { DocumentoProvider } from './DocumentoContext';
import { VeiculosEspeciesProvider } from './VeiculosEspeciesContext';
import { VeiculosCoresProvider } from './VeiculosCoresContext';
import { VeiculosMarcasProvider } from './VeiculosMarcasContext';
import { PrefixoProvider } from './PrefixoContext';
import { IdentificadorProvider } from './Identificadores';
import { KmsProvider } from './KmContext';
import { AquisicoesVeiculosProvider } from './AquisicoesContext';

const AppProvider: React.FC = ({ children }) => (
  <AuthProvider>
    <VeiculoProvider>
      <DocumentoProvider>
        <AquisicoesVeiculosProvider>
          <SituacaoProvider>
            <PrefixoProvider>
              <IdentificadorProvider>
                <VeiculosEspeciesProvider>
                  <VeiculosCoresProvider>
                    <VeiculosMarcasProvider>
                      <KmsProvider>
                        <MovimentacaoProvider>{children}</MovimentacaoProvider>
                      </KmsProvider>
                    </VeiculosMarcasProvider>
                  </VeiculosCoresProvider>
                </VeiculosEspeciesProvider>
              </IdentificadorProvider>
            </PrefixoProvider>
          </SituacaoProvider>
        </AquisicoesVeiculosProvider>
      </DocumentoProvider>
    </VeiculoProvider>
  </AuthProvider>
);

export default AppProvider;
