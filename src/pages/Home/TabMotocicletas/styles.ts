import styled from 'styled-components';

export const Container = styled.div`
  min-height: calc(100vh - 220px);
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    width: calc(100% - 19px);
    flex: 1;
    font-size: 15px;
  }
`;
