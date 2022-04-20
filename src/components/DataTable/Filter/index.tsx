import React, { memo } from 'react';
import { ValueType } from 'react-select';
import FormGroup from 'components/form/FormGroup';
import ReactSelect from 'components/form/ReactSelect';
import { IOptionFormat } from '../../../interfaces/IOptionFormat';

type IFormat = {
  field: string;
  label: string;
  options: IOptionFormat[];
  placeholder?: string | undefined;
};

type FilterFormat = {
  field: string;
  label: string;
  value: string;
};

type IProps = {
  filter: IFormat;
  handleChange: (value: ValueType<IOptionFormat>) => void;
  isDisabled: boolean;
  value?: IOptionFormat;
  filters: FilterFormat[];
};

const propsAreEqual = (
  {
    value: previousValue,
    filter: previousFilter,
    isDisabled: previousDisabled,
    filters: previousFilters,
  }: IProps,
  {
    value: nextValue,
    filter: nextFilter,
    isDisabled: nextDisabled,
    filters: nextFilters,
  }: IProps,
): boolean =>
  previousValue?.value === nextValue?.value &&
  previousFilter.options === nextFilter.options &&
  nextDisabled === previousDisabled &&
  JSON.stringify(nextFilters) === JSON.stringify(previousFilters);

const VisibleFilter = memo<IProps>(
  ({ filter, handleChange, value, isDisabled }) => {
    return (
      <FormGroup key={filter.label} name={filter.label} cols={[2, 4, 6]}>
        <ReactSelect
          optionsSelect={filter.options}
          onChange={handleChange}
          value={value}
          isDisabled={isDisabled}
          placeholder={filter.placeholder || 'Selecione ...'}
        />
      </FormGroup>
    );
  },
  propsAreEqual,
);

export default VisibleFilter;
