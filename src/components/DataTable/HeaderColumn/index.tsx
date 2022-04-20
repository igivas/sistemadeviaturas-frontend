import React, { useCallback, useState } from 'react';
import { FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';
import { GiHorizontalFlip } from 'react-icons/gi';
import { Container } from './styles';

interface IFieldSort {
  field: string;
  sort: 'off' | 'asc' | 'desc';
  alias?: string;
}

interface IHeaderColumnProps {
  field: string;
  text: string;
  alias?: string;
  handleFieldSort(field: IFieldSort): void;
  handleExpand: () => void;
}

type Sorts = 'off' | 'asc' | 'desc';

const HeaderColumn: React.FC<IHeaderColumnProps> = ({
  field,
  text,
  alias,
  handleFieldSort,
  handleExpand,
}) => {
  const [sort, setSort] = useState<Sorts>('off');
  const [active, setActive] = useState(false);

  const handleClickSort = useCallback(() => {
    function getSort(sortOption: Sorts): Sorts {
      switch (sortOption) {
        case 'off':
          return 'desc';
        case 'asc':
          return 'off';
        case 'desc':
          return 'asc';
        default:
          return 'off';
      }
    }
    const newSort = getSort(sort);

    setSort(newSort);
    handleFieldSort({ field, sort: newSort, alias });
    if (newSort !== 'off') {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [sort, handleFieldSort, field, alias]);

  return (
    <Container>
      {text}

      <button type="button" onClick={handleExpand}>
        <GiHorizontalFlip />
      </button>

      {sort === 'off' || sort === 'asc' ? (
        <button type="button" onClick={handleClickSort}>
          <FaSortAmountUp className={active ? 'active' : ''} />
        </button>
      ) : (
        <button type="button" onClick={handleClickSort}>
          <FaSortAmountDown className={active ? 'active' : ''} />
        </button>
      )}
    </Container>
  );
};

export default HeaderColumn;
