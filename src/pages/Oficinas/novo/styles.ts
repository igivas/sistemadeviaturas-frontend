import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  > h3 {
    margin-bottom: 8px;
    font-size: 20px;
  }
`;

export const Form = styled.form`
  height: '100%';
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;
