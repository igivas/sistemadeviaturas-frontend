import React from 'react';
import Logo from '../../../../assets/sspds-pm.png';
import LogoWebP from '../../../../assets/sspds-pm.webp';
import { Container, LogoContainer, WhiteContainer, LogoImage } from './styles';

interface IProps {
  title: string;
}

const Header: React.FC<IProps> = ({ title }) => {
  return (
    <Container>
      <LogoContainer>
        <a href="https://www.pm.ce.gov.br/">
          <picture>
            <source id="logotipo" srcSet={LogoWebP} type="image/webp" />
            <LogoImage src={Logo} alt="logotipo" />
          </picture>
        </a>
      </LogoContainer>

      <WhiteContainer>
        <div
          id="title-page"
          className="justify-content-center align-items-center"
        >
          <h3>{title}</h3>
        </div>
      </WhiteContainer>
    </Container>
  );
};

export default Header;
