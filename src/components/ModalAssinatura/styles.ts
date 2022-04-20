import styled from 'styled-components';

export const Content = styled.div`
  padding: 8px 20px;
`;

export const UserContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  background-color: #00a7d0;
  padding: 8px;
`;

export const UserCPF = styled.p`
  font-size: 0.8rem;
  color: #fff;
`;

export const Post = styled.p`
  text-align: center;
  margin-bottom: -8px;
  color: #fff;
`;

export const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  align-content: center;

  label {
    text-align: center;
  }

  div#pins_inputs {
    margin-top: 32px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    input {
      letter-spacing: 6px;
      font-size: 48px;
    }
  }
`;
