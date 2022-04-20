import React, { Suspense } from 'react';
import { lazy } from 'react';
import { ClipLoader } from 'react-spinners';

interface IDataFields {
  [key: string]: any;
}

type SelectFormat = {
  value: string;
  label: string;
};

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
      getRow(row: any): void;
      handleShowIcon?: (row: any) => boolean;
    }[];
  };
  filters?: {
    field: string;
    label: string;
    options: SelectFormat[];
    handleNextPage?: (nextPage: boolean) => void;
    placeholder?: string;
    handleFiltersDisabled?: (params: any) => boolean;
  }[];
  search?: {
    searchable: boolean;
    fields: string[];
    label: string;
    placeholder?: string;
  };

  order?: {
    fields: string[];
    orders?: any;
  };
}

interface IOptionsPropRemote extends IOptionsProp {
  serverData: {
    url: string;
    params?: Record<string, any>;
    headers?: string[][] | Headers | Record<string, string> | undefined;
    serverPagination?: boolean;
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
  options?: IOptionsProp | IOptionsPropRemote;
  data?: IDataFields[];
}

const RemoteLazyDataTable = lazy(() => import('./RemoteSourceDataTable'));

const LocalLazyDataTable = lazy(() => import('./LocalSourceDataTable'));

const DataTable: React.FC<IDataTableProps> = ({ columns, options, data }) => {
  return (
    <>
      <Suspense fallback={<ClipLoader size={30} color="#123abc" loading />}>
        {data ? (
          <LocalLazyDataTable columns={columns} options={options} data={data} />
        ) : (
          <RemoteLazyDataTable
            columns={columns}
            options={options as IOptionsPropRemote}
          />
        )}
      </Suspense>
    </>
  );
};

export default DataTable;
