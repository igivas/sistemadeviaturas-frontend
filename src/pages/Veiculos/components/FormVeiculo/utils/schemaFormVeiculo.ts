import * as Yup from 'yup';
import ECombustivel from 'enums/ECombustivel';
import { EPrefixoTipo, EEmprego } from 'enums/EPrefixo';
import {
  requiredField,
  requiredFieldSelect,
  maxChars,
  dateTypeError,
} from './errorFieldsFormat';
import { EOrigemDeAquisicao } from '../../../../../enums/EAquisicao';

export const aquisicaoGenerica = Yup.object({
  origem_aquisicao: Yup.mixed<EOrigemDeAquisicao>()

    .oneOf(Object.values(EOrigemDeAquisicao))
    .notRequired()
    .transform((origemAquisicao: string) => origemAquisicao.trim()),
  data_aquisicao: Yup.date().typeError('Insira um ano válido!').default(''),
  doc_aquisicao: Yup.string(),
  aquisicao_file: Yup.mixed().when('doc_aquisicao', {
    is: (value) => value,
    then: Yup.mixed().required(requiredField),
    otherwise: Yup.mixed().notRequired(),
  }),
}).required('Aquisicao é requrida');

export const dadosGerais = Yup.object({
  chassi: Yup.string().required(requiredField).max(18, maxChars(18)),
  placa: Yup.string()
    .trim()
    .notRequired()
    .transform((value) => value || null)
    .nullable(true)
    .matches(
      /^[a-zA-Z]{3}[0-9][0-9a-zA-Z][0-9]{2}$/,
      'Formato Invalido(XXX1234/XXX1X23)',
    ),
  renavam: Yup.string()
    .trim()
    .transform((value) => value || null)
    .notRequired()
    .nullable(true)
    .max(11, maxChars(11)),
  id_veiculo_especie: Yup.string().trim().required(requiredFieldSelect),
  id_marca: Yup.string().required(requiredFieldSelect),
  id_modelo: Yup.string().required(requiredFieldSelect),
  id_cor: Yup.string().required(requiredFieldSelect),
});

export type IDadosGerais = Yup.InferType<typeof dadosGerais>;

export const identificador = Yup.object({
  data_identificador: Yup.date().typeError(dateTypeError).default(''),
  identificador: Yup.string().required(requiredField).uppercase().trim(),
});

export type IIdentificador = Yup.InferType<typeof identificador>;

export const dadosGeraisOrganicoOrCedido = Yup.object({
  uf: Yup.string().required('Selecione um Estado'),
  id_modelo: Yup.string().required('Selecione uma opção'),
  ano_modelo: Yup.date().typeError('Insira um ano válido!'),
  ano_fabricacao: Yup.date().typeError('Insira um ano válido!').default(''),
  combustivel: Yup.mixed<ECombustivel>()
    .oneOf(Object.values(ECombustivel), 'Tipo de combustivel inválido')
    .required('Selecione uma opção'),
  numero_crv: Yup.string()
    .notRequired()
    .nullable(true)
    .min(10, 'Minimo de 10 digitos')
    .max(12, 'Maximo de 12 digitos')
    .transform((numero_crv: string) => numero_crv || null)
    .trim(),
  codigo_seguranca_crv: Yup.string()
    .trim()
    .notRequired()
    .length(11, 'Deve conter exatamente 11 digitos')
    .nullable(true)
    .transform((codigo_seguranca_crv: string) => codigo_seguranca_crv || null),
  valor_fipe: Yup.string()
    .required('Esse campo é requerido')
    .transform((valor: string) => valor.trimLeft().trimRight()),
});

export type IDadosGeraisOrganicoOrCedido = Yup.InferType<
  typeof dadosGeraisOrganicoOrCedido
>;

export const cargaAtualOrganicoOrCedido = Yup.object({
  tipo_doc_carga: Yup.string()
    .trim()
    .transform((value) => value || null)
    .notRequired()
    .nullable(true),
  numero_doc_carga: Yup.string().notRequired(),
  data_doc_carga: Yup.date().notRequired().nullable(true),
  orgao_tombo: Yup.string()
    .trim()
    .transform((value) => value || null)
    .nullable(true),
  tombo: Yup.string()
    .transform((value) => value || null)
    .notRequired()
    .max(11, maxChars(11))
    .nullable(true),
});

export type ICargaAtualOrganicoOrCedido = Yup.InferType<
  typeof cargaAtualOrganicoOrCedido
>;

export const prefixoOrganicoOrCedido = Yup.object({
  prefixo_tipo: Yup.mixed<EPrefixoTipo>()
    .oneOf(Object.values(EPrefixoTipo), 'Prefixo tipo invalido')
    .required(requiredField)
    .transform((prefixoTipo: string) => prefixoTipo.trim())
    .transform((prefixoSequencia: string) =>
      prefixoSequencia.trimRight().trimLeft(),
    ),
  /* data_prefixo: Yup.date().typeError(dateTypeError).required(requiredField), */
  prefixo_sequencia: Yup.string().required(requiredField),
  emprego: Yup.mixed<EEmprego>()
    .oneOf(Object.values(EEmprego), 'Tipo de emprego invalido')
    .transform((emprego: string) => emprego.trim())
    .required(requiredField),
});

export type IPrefixoOrganicoOrCedido = Yup.InferType<
  typeof prefixoOrganicoOrCedido
>;

export const dadosAdicionais = Yup.object({
  referenciasPneus: Yup.array()
    .of(
      Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
      }),
    )
    .required('Esse campo é requerido')
    .typeError('Esse campo é requerido'),
  data_operacao: Yup.date()
    .transform((value) => value || undefined)
    .notRequired()
    .nullable(true),
  observacao: Yup.string().default(''),
});
