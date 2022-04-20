import styled from 'styled-components';

interface IProps {
  perPage: number;
}

interface IMoreContentPanelProps {
  activated: boolean;
}

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 1px;
  font-size: 14px;
`;

export const Thead = styled.thead`
  th {
    font-weight: 700;
    background-color: #fff;
  }

  th#action-header {
    text-align: center;
  }

  th div#header-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const Tbody = styled.tbody`
  td#actions {
    div {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;

      button {
        background: none;
        border: none;
        display: flex;
        justify-content: center;
      }

      svg {
        color: #898c90;
        transition: color 0.2s;

        &:hover {
          color: #333;
        }
      }
    }
  }

  tr:nth-child(even) {
    background-color: #f5f5f5;
  }

  tr {
    background-color: #fff;
  }
  tr:hover {
    background-color: #e5e5e5;
  }
`;

export const Container = styled.div<IProps>`
  table,
  th,
  td {
    border: 1px solid #999;
  }

  th,
  td {
    padding: 8px 8px;
    text-align: left;
  }

  td {
    max-width: 5rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  td.expanded {
    overflow: unset;
    text-overflow: unset;
    white-space: unset;
  }

  @media screen and (max-width: 960px) {
    overflow-x: scroll;
    max-width: 100vw;
  }
`;

export const FilterPanel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  margin-left: -8px;
  margin-right: -8px;

  & > svg {
    margin-top: 22px;
  }

  @media screen and (max-width: 960px) {
    flex-direction: column;
    flex: 1;
    width: 100%;
    overflow-x: scroll;

    & > div {
      width: 100%;
    }
  }
`;

export const StatusBar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 8px;
  justify-content: space-between;
  align-items: center;
`;

export const TotalPanel = styled.div`
  font-weight: 400;
  font-size: 14px;
  margin-left: 4px;
`;

export const FilterMoreContentPanel = styled.div<IMoreContentPanelProps>`
  position: absolute;
  display: ${(props) => (props.activated ? 'flex' : 'none')};
  flex-direction: column;

  overflow-y: scroll;

  height: 20rem;
  width: 30rem;

  background-color: rgb(255, 255, 255);
  border-radius: 4px;
  right: 0;

  z-index: 1000;

  & > div {
    width: 100%;
  }

  margin-top: 25.5rem;

  label {
    line-height: 1rem;
  }

  margin-right: 2rem;

  animation: openPopUp 1s normal forwards;

  @keyframes openPopUp {
    from {
      opacity: ${(props) => (props.activated ? 0 : 1)};
    }
    to {
      opacity: ${(props) => (props.activated ? 1 : 0)};
    }
  }

  @media screen and (max-width: 960px) {
    left: 0;
    margin-top: -2rem;
    flex-direction: column;
    flex: 1;
    width: 100%;
    overflow-y: scroll;
  }
`;
