import { EPrefixoTipo, EEmprego } from '../enums/EPrefixo';

const prefixoMapper = {
  [EPrefixoTipo['21 - ADM']]: [EEmprego['Não Consta']],
  [EPrefixoTipo['23 - Operacional']]: [
    EEmprego['Operacional - Caracterizada'],
    EEmprego['Operacional - Inteligência'],
  ],
  [EPrefixoTipo['MP - POG']]: [
    EEmprego['Não Consta'],
    EEmprego['Operacional - Inteligência'],
    EEmprego['Operacional - Caracterizada'],
  ],
  [EPrefixoTipo['MR - RAIO']]: [
    EEmprego['Não Consta'],
    EEmprego['Operacional - Inteligência'],
    EEmprego['Operacional - Caracterizada'],
  ],
  [EPrefixoTipo['22 - Apoio']]: [
    EEmprego.Ambulância,
    EEmprego['Não Consta'],
    EEmprego['Base Móvel'],
    EEmprego['Transporte Especializado'],
    EEmprego['Transporte de Pessoas'],
    EEmprego['Transporte de Animais'],
  ],
};

export default prefixoMapper;
