import React from 'react';
import Header from './Header';
import Footer from './Footer';

import { Container } from './styles';

const DefaultLayout: React.FC = ({ children }) => {
  return (
    <>
      <Header
        title={
          process.env.REACT_APP_TITLE ||
          'ADICIONE O TÍTULO EM .ENV NA VARIÁVEL REACT_APP_TITLE'
        }
      />
      <Container>{children}</Container>
      <Footer />
    </>
  );
};

export default DefaultLayout;
