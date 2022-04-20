import { format, parseISO } from 'date-fns';
import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import ETipoMovimentacao from '../../enums/ETipoMovimentacao';
import { IVisualizarMovimentacao } from '../../interfaces/IVisualizarMovimentacao';
import FormGroup from '../form/FormGroup';
import FormCategory from '../form/FormCategory';
import Row from '../form/Row';
import Input from '../form/FormInput';
import EFase from '../../enums/EFase';
import ButtonAccordeon from '../Button';
import api from '../../services/api';

const VisualizarMovimentacao: React.FC<IVisualizarMovimentacao> = ({
  chassi,
  data_movimentacao,
  fases,
  placa,
  renavam,
  tipo_movimentacao,
  url_documento_sga,
  url_documento_devolucao_sga,
  identificador,
}) => {
  return (
    <>
      <Row>
        <FormCategory>Dados do Veiculo</FormCategory>
        <FormGroup required name="Chassi" cols={[4, 4, 12]}>
          <Input value={chassi} disabled />
        </FormGroup>

        <FormGroup required name="Renavam" cols={[4, 4, 12]}>
          <Input value={renavam} disabled />
        </FormGroup>

        <FormGroup required name="Placa" cols={[4, 4, 12]}>
          <Input value={placa} disabled />
        </FormGroup>
      </Row>

      <Row>
        <FormGroup required name="Identificador" cols={[4, 4, 12]}>
          <Input value={identificador} disabled />
        </FormGroup>
      </Row>

      <Row>
        <FormCategory>Dados da Movimentacao</FormCategory>

        <FormGroup required name="Tipo de Movimentacao" cols={[4, 4, 12]}>
          <Input value={ETipoMovimentacao[tipo_movimentacao]} disabled />
        </FormGroup>

        <FormGroup required name="Data da Movimentacao" cols={[4, 4, 12]}>
          <Input
            value={format(
              parseISO(data_movimentacao?.toString()),
              'dd/mm/yyyy',
            )}
            disabled
          />
        </FormGroup>

        {url_documento_sga && (
          <ButtonAccordeon
            style={{
              background: '#e4e9ee',
              marginTop: '8px',
              justifyContent: 'space-between',
              color: '#444444',
            }}
            onClick={async (event) => {
              event.preventDefault();
              const file = await api.get(url_documento_sga, {
                responseType: 'blob',
              });

              const blob = new Blob([file.data], {
                type: file.headers['content-type'],
              });

              const fileURL = URL.createObjectURL(blob);
              window.open(fileURL, '_blank');
            }}
          >
            <FaExternalLinkAlt size={16} style={{ marginRight: '8px' }} />
            Documento de oferta/recebimento
          </ButtonAccordeon>
        )}
      </Row>

      {url_documento_devolucao_sga && (
        <Row>
          <ButtonAccordeon
            style={{
              background: '#e4e9ee',
              marginTop: '8px',
              justifyContent: 'space-between',
              color: '#444444',
            }}
            onClick={async (event) => {
              event.preventDefault();
              const file = await api.get(url_documento_devolucao_sga, {
                responseType: 'blob',
              });

              const blob = new Blob([file.data], {
                type: file.headers['content-type'],
              });

              const fileURL = URL.createObjectURL(blob);
              window.open(fileURL, '_blank');
            }}
          >
            <FaExternalLinkAlt size={16} style={{ marginRight: '8px' }} />
            Documento de devolucao
          </ButtonAccordeon>
        </Row>
      )}

      {fases.map((fase) => (
        <>
          <Row>
            <FormCategory key={fase.id_movimentacao_fase}>
              {format(parseISO(fase.criado_em.toString()), 'dd/mm/yyyy')}
            </FormCategory>

            <FormGroup required name="Fase" cols={[4, 4, 12]}>
              <Input value={EFase[fase.id_tipo_fase as EFase]} disabled />
            </FormGroup>

            <FormGroup required name="Assinado Por" cols={[8, 8, 12]}>
              <Input
                value={fase.assinado_por || 'Assinatura Pendente'}
                disabled
              />
            </FormGroup>
          </Row>
          {fase.id_movimentacao_fase === EFase.Devolução && (
            <Row>
              <FormGroup required name="" cols={[4, 4, 12]} />

              <FormGroup required name="Assinado Por" cols={[8, 8, 12]}>
                <Input
                  value={
                    fase.assinado_devolucao_destino_por || 'Assinatura Pendente'
                  }
                  disabled
                />
              </FormGroup>
            </Row>
          )}
        </>
      ))}
    </>
  );
};

export default VisualizarMovimentacao;
