import React, { ChangeEvent, memo } from 'react';
import { FaSearch } from 'react-icons/fa';

import { Container, Input } from './styles';

type FilterFormat = {
  field: string;
  label: string;
  value: string;
};

interface IProps {
  handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void;
  searchInput: string;
  placeholder: string;
  filters: FilterFormat[];
}

const propsAreEqual = (
  {
    searchInput: previousValue,

    filters: previousFilters,
  }: IProps,
  {
    searchInput: nextValue,

    filters: nextFilters,
  }: IProps,
): boolean =>
  previousValue === nextValue &&
  JSON.stringify(nextFilters) === JSON.stringify(previousFilters);

const FormInputSearch = memo<IProps>(
  ({ handleChangeSearch, searchInput, placeholder }) => {
    return (
      <Container>
        <Input
          onChange={handleChangeSearch}
          value={searchInput}
          placeholder={placeholder}
        />
        <button type="button">
          <FaSearch />
        </button>
      </Container>
    );
  },
  propsAreEqual,
);

export default FormInputSearch;
