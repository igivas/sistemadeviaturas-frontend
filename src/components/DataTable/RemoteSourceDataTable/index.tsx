import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from 'react';
import { FaFilter } from 'react-icons/fa';
import * as _ from 'lodash';
import ClipLoader from 'react-spinners/ClipLoader';
import { format, parseISO } from 'date-fns';
import { ValueType } from 'react-select';
import axios from 'axios';
import Tooltip from 'components/Tooltip';
import FormCategory from 'components/form/FormCategory';
import ReactSelect from '../../form/ReactSelect';
import FormGroup from '../FormGroup';
import Select from '../FormSelect';
import FormInputSearch from '../FormInputSearch';
import Paginator from '../Paginator';
import HeaderColumn from '../HeaderColumn';
import {
  Container,
  StatusBar,
  TotalPanel,
  FilterPanel,
  FilterMoreContentPanel,
  Table,
  Thead,
  Tbody,
} from './styles';
import VisibleFilter from '../Filter';

interface IDataFields {
  [key: string]: any;
}

type FilterFormat = {
  field: string;
  label: string;
  value: string;
};

type SelectFormat = {
  value: string;
  label: string;
};

type IFilter = {
  field: string;
  label: string;
  options: SelectFormat[];
  placeholder?: string;
  handleFiltersDisabled?: (fields: any) => boolean;
};

interface IResponsePaginaton {
  total: number;
  totalPage: number;
  items: IDataFields[];
}
interface IOptionsProp {
  reload?: boolean;
  actions?: {
    headerText: string;
    items: {
      icon: JSX.Element;
      tooltip: {
        name: string;
        position: 'top' | 'left' | 'bottom' | 'right';
      };
      getRow(row: object): void;
      handleShowIcon?: (row: any) => boolean;
    }[];
  };
  filters?: IFilter[];
  search?: {
    searchable: boolean;
    fields: string[];
    label: string;
    placeholder?: string;
  };
  serverData: {
    url: string;
    params?: Record<string, any>;
    headers?: string[][] | Headers | Record<string, string> | undefined;
    serverPagination?: boolean;
  };
  order?: {
    fields: string[];
    orders?: any;
  };
}

export type IColumns = {
  field: string;
  text: string;
  type: {
    name: 'date' | 'enum' | 'text' | 'currency';
    format?: string;
    enum?: { [key: string]: string };
  };
  highlightRowColor?: {
    color: 'red' | 'green' | 'yellow';
    matchValues: (string | number)[];
  }[];
  alias?: string;
}[];

interface IDataTableProps {
  columns: IColumns;
  options: IOptionsProp;
}

interface IFieldSort {
  field: string;
  sort: 'off' | 'asc' | 'desc';
  alias: string;
}

type IHandleExpand = {
  index: number;
  isExpanded: boolean;
};

const RemoteSourceDataTable: React.FC<IDataTableProps> = ({
  columns,
  options,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [fieldsSort, setFieldsSort] = useState([] as IFieldSort[]);
  const [isMoreContentOpen, setIsMoreContentOpen] = useState(false);

  const [searchIpunt, setSearchInput] = useState('');
  const [query, setQuery] = useState('');

  const [dataList, setDataList] = useState<IDataFields[]>([]);

  const [filters, setFilters] = useState<FilterFormat[]>([]);

  const handleChangePage = (selectedPage: number): void => {
    setCurrentPage(selectedPage);
  };

  const wrapperRef = useRef<HTMLDivElement>(null);

  const columnsFields = columns?.map((column) => {
    return {
      field: column.field,
      type: column.type,
      alias: column.alias,
    };
  });

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any): void {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsMoreContentOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const [handleExpandColumns, setHandleExpandColumns] = useState<
    IHandleExpand[]
  >(
    columnsFields.map<IHandleExpand>((column, index) => ({
      index,
      isExpanded: false,
    })),
  );

  const serverResponsePagination = useCallback(
    (response: IResponsePaginaton): void => {
      setTotal(response.total);
      setTotalPage(response.totalPage);
      setDataList(response.items);
    },
    [],
  );

  const dataFiltered = useCallback(
    (list: IDataFields[]): IDataFields[] => {
      const listFiltered = list.filter((item) => {
        let result = false;
        Object.entries(item).forEach((prop) => {
          if (options?.search?.fields.includes(prop[0])) {
            if (
              String(prop[1]).toLowerCase().includes(query.toLowerCase().trim())
            ) {
              result = true;
            }
          } else {
            result = true;
          }
        });
        return result;
      });
      setTotal(listFiltered.length);
      setTotalPage(Math.ceil(listFiltered.length / perPage));
      return listFiltered;
    },
    [perPage, query, options],
  );

  const getItemsPage = useCallback(
    (dataListPage: IDataFields[]): IDataFields[] => {
      const items = dataFiltered(dataListPage).slice(
        perPage * currentPage - perPage,
        perPage * currentPage,
      );

      if (items) {
        return items;
      }

      return [];
    },
    [perPage, currentPage, dataFiltered],
  );

  const handleIncrementPage = (): void => {
    if (currentPage < totalPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDecrementPage = (): void => {
    if (currentPage >= 2) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect((): (() => void) | undefined => {
    const timer = setTimeout(() => {
      setQuery(searchIpunt);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchIpunt, options]);

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;

    setSearchInput(value);

    setCurrentPage(1);
  };

  const handleChangePerPage = (event: ChangeEvent<HTMLSelectElement>): void => {
    setPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const orderList = useCallback(
    (list) => {
      if (options?.order) {
        return _.orderBy(
          list,
          options.order.fields,
          options.order.orders ? options.order.orders : [],
        );
      }
      return list;
    },
    [options],
  );

  useEffect(() => {
    const timer = setTimeout(async (): Promise<void> => {
      const { url, params, headers, serverPagination } = options.serverData;
      const fields = options.search?.fields;

      const fieldQuery =
        fields && query
          ? {
              fields: [...fields],
              query,
            }
          : undefined;

      const pagination = serverPagination
        ? {
            page: currentPage,
            perPage,
          }
        : undefined;

      const formatedFilters = filters?.reduce(
        (filterObject, filter) => ({
          ...filterObject,
          [filter.field]: filter.value,
        }),
        {},
      );

      const formatedFieldSort = fieldsSort.filter(
        (field) => field.alias !== undefined,
      );

      try {
        if (
          options.reload ||
          Object.keys(formatedFilters).length > 0 ||
          filters.length > 0
        ) {
          const response = await axios.get(url, {
            params: {
              ...params,
              ...pagination,
              ...fieldQuery,
              ...formatedFilters,
              fieldSort: formatedFieldSort
                .map((fieldSort) => fieldSort.alias)
                .reverse(),
              orderSort: formatedFieldSort
                .map((fieldSort) => fieldSort.sort)
                .reverse(),
            },
            headers,
          });
          if (options.serverData.serverPagination) {
            serverResponsePagination(response.data || []);
          } else {
            setDataList(getItemsPage(response.data || []));
          }
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    options.serverData,
    options.search,
    options.reload,
    getItemsPage,
    serverResponsePagination,
    orderList,
    currentPage,
    perPage,
    filters,
    query,
    fieldsSort,
  ]);

  const perPageItems = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '30', label: '30' },
  ];

  const formatValue = useCallback(
    (value, tipo) => {
      if (tipo.name === 'date') {
        try {
          return format(parseISO(value), tipo.format);
        } catch (error) {
          return value;
        }
      }
      return value;
    },

    [],
  );

  const getValue = useCallback(
    (row, column) => {
      switch (column.type.name) {
        case 'enum':
          return column.type.enum[_.get(row, column.field)];
        case 'date':
          return formatValue(_.get(row, column.field), column.type);
        case 'currency':
          try {
            return new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              style: 'currency',
            }).format(
              !Number.isNaN(Number(String(_.get(row, column.field))))
                ? _.get(row, column.field)
                : 0,
            );
          } catch (error) {
            return _.get(row, column.field);
          }
        default:
          return _.get(row, column.field);
      }
    },
    [formatValue],
  );

  const getColor = useCallback(
    (row) => {
      const columnsWithHighLight = columns.filter(
        (column) => !!column.highlightRowColor,
      );

      let color = 'black';

      if (columnsWithHighLight) {
        columnsWithHighLight.forEach((highlights, index) => {
          highlights.highlightRowColor?.forEach((highlight) => {
            if (
              highlight.matchValues.includes(
                _.get(row, columnsWithHighLight[index].field),
              )
            ) {
              color = highlight.color;
            }
          });
        });
      }

      return color;
    },
    [columns],
  );

  const handleFieldSort = useCallback(
    (field) => {
      const fields = fieldsSort.filter((item) => item.field !== field.field);

      if (field.sort !== 'off') {
        setFieldsSort([...fields, field]);
      } else {
        setFieldsSort(fields);
      }
    },
    [fieldsSort],
  );

  const filterFiltersDisabled = useCallback(() => {
    const optionsWihHandleFiltersDisabled = options?.filters?.filter(
      (option) =>
        option.handleFiltersDisabled &&
        option.handleFiltersDisabled(filters) &&
        filters.filter((filter) => filter.field === option.field).length > 0,
    );

    return optionsWihHandleFiltersDisabled;
  }, [options, filters]);

  useEffect(() => {
    // verifica quais filtros possuem depencia

    const optionsWihHandleFiltersDisabled = filterFiltersDisabled();
    if (
      optionsWihHandleFiltersDisabled &&
      optionsWihHandleFiltersDisabled.length > 0
    ) {
      const filteredFilters = filters.filter((filter) =>
        optionsWihHandleFiltersDisabled.find(
          (option) => option.field !== filter.field,
        ),
      );
      setFilters(filteredFilters);
    }
  }, [filters, filterFiltersDisabled]);

  const handleOptionChange = useCallback(
    (optionSelected: SelectFormat, filter: IFilter) => {
      if (optionSelected.value) {
        const indexFilter = filters.findIndex(
          (filter2) => filter2.field === filter.field,
        );

        if (indexFilter < 0)
          setFilters([
            ...filters,
            {
              field: filter.field,
              ...optionSelected,
            },
          ]);
        else {
          const copyFilters = [...filters];
          copyFilters[indexFilter].value = optionSelected.value;
          setFilters(copyFilters);
        }
      } else {
        const removeIndexFilter = filters.filter(
          (filterRemove) => filterRemove.field !== filter.field,
        );

        setFilters(removeIndexFilter);
      }
    },
    [filters],
  );

  const handleValue = useCallback(
    (filter: IFilter) =>
      filter.options
        ? filter.options.find((option) => {
            if (filters.length > 0) {
              const indexParam = filters.findIndex(
                (filterURL) => filterURL.field === filter.field,
              );
              return option.value === filters[indexParam]?.value || false;
            }
            return false;
          })
        : undefined,
    [filters],
  );

  const handleIsDisabled = useCallback(
    (filter: IFilter) =>
      filter.handleFiltersDisabled
        ? filter.handleFiltersDisabled(filters)
        : false,
    [filters],
  );

  return (
    <>
      <Container perPage={perPage}>
        <FilterPanel>
          {options?.filters?.slice(0, 4).map((filter) => (
            // <FormGroup key={filter.label} name={filter.label} cols={[2, 4, 6]}>
            //   <ReactSelect
            //     optionsSelect={filter.options}
            //     onChange={(option: ValueType<SelectFormat>) => {
            //       // handleFilters(filter.field, event.target.value);
            //       const optionSelected = option as SelectFormat;
            //       handleOptionChange(optionSelected, filter);
            //     }}
            //     value={handleValue(filter)}
            //     isDisabled={handleIsDisabled(filter)}
            //     placeholder={filter.placeholder || 'Selecione ...'}
            //   />
            // </FormGroup>

            <VisibleFilter
              filter={filter}
              value={handleValue(filter)}
              isDisabled={handleIsDisabled(filter)}
              handleChange={(option: ValueType<SelectFormat>) => {
                // handleFilters(filter.field, event.target.value);
                const optionSelected = option as SelectFormat;
                handleOptionChange(optionSelected, filter);
              }}
              filters={filters}
            />
          ))}

          {options?.filters && options.filters.length >= 4 && (
            <FaFilter
              size={24}
              onClick={() => setIsMoreContentOpen(true)}
              style={{ cursor: 'pointer' }}
            />
          )}
          <FilterMoreContentPanel
            ref={wrapperRef}
            activated={isMoreContentOpen}
          >
            <FormCategory>Mais Filtros</FormCategory>

            {options?.filters
              ?.slice(4, options?.filters?.length)
              .map((filter) => (
                <VisibleFilter
                  filter={filter}
                  value={handleValue(filter)}
                  isDisabled={handleIsDisabled(filter)}
                  handleChange={(option: ValueType<SelectFormat>) => {
                    // handleFilters(filter.field, event.target.value);
                    const optionSelected = option as SelectFormat;
                    handleOptionChange(optionSelected, filter);
                  }}
                  filters={filters}
                />
              ))}
          </FilterMoreContentPanel>
          {options?.search?.searchable && (
            <FormGroup name={options.search.label}>
              <FormInputSearch
                handleChangeSearch={(event) => handleChangeSearch(event)}
                searchInput={searchIpunt}
                placeholder={options.search.placeholder || 'Digite algo...'}
                filters={filters}
              />
            </FormGroup>
          )}
        </FilterPanel>
        <Table>
          <Thead>
            <tr>
              {columns?.map((column, index) => (
                <th
                  className={
                    handleExpandColumns[index].isExpanded ? 'expanded' : ''
                  }
                  key={index}
                >
                  <HeaderColumn
                    field={column.field}
                    text={column.text}
                    handleFieldSort={handleFieldSort}
                    alias={column.alias}
                    handleExpand={() => {
                      setHandleExpandColumns(
                        handleExpandColumns.map((columnExpand, indexExpanded) =>
                          index === indexExpanded
                            ? {
                                ...columnExpand,
                                isExpanded: !columnExpand.isExpanded,
                              }
                            : columnExpand,
                        ),
                      );
                    }}
                  />
                </th>
              ))}
              {options?.actions?.items && (
                <th id="action-header">{options?.actions?.headerText}</th>
              )}
            </tr>
          </Thead>
          <Tbody>
            {loading && (
              <tr>
                <td
                  id="row-loading"
                  colSpan={
                    options?.actions ? columns.length + 1 : columns.length
                  }
                >
                  <ClipLoader size={30} color="#123abc" loading={loading} />
                </td>
              </tr>
            )}
            {dataList?.map((row, indexRow) => (
              <tr
                key={indexRow}
                style={{
                  color: getColor(row),
                }}
              >
                {columnsFields.map((column, index) => {
                  return (
                    <td
                      key={column.field}
                      className={
                        handleExpandColumns[index].isExpanded ? 'expanded' : ''
                      }
                    >
                      {getValue(row, column)}
                    </td>
                  );
                })}

                {options?.actions && (
                  <td id="actions">
                    <div>
                      {options?.actions.items.map((action, index) => {
                        return (
                          ((action.handleShowIcon &&
                            !!action.handleShowIcon(row)) ||
                            !action.handleShowIcon) && (
                            <Tooltip
                              text={action.tooltip.name}
                              position={action.tooltip.position}
                            >
                              <button
                                type="button"
                                key={index}
                                onClick={() => action.getRow(row)}
                              >
                                {action.icon}
                              </button>
                            </Tooltip>
                          )
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </Tbody>
        </Table>
      </Container>
      <StatusBar>
        <TotalPanel>
          {dataList.length === 0
            ? 'Nenhum registro encontrado'
            : `Mostrando de ${
                dataList.length > 0 ? perPage * currentPage - perPage + 1 : 0
              } a ${
                dataList.length + perPage * (currentPage - 1)
              } de ${total} registros`}
        </TotalPanel>
        <FormGroup name="">
          <Select optionsSelect={perPageItems} onChange={handleChangePerPage} />
        </FormGroup>
        {dataList.length >= 1 && (
          <Paginator
            totalPage={totalPage}
            currentPage={currentPage}
            handleChangePage={handleChangePage}
            handleIncrementPage={handleIncrementPage}
            handleDecrementPage={handleDecrementPage}
          />
        )}
      </StatusBar>
    </>
  );
};

export default RemoteSourceDataTable;
