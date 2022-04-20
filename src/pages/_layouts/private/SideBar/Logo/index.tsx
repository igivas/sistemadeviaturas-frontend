import React from 'react';
import { HStack, Image, Text } from '@chakra-ui/react';
import AssinaturaLogo from '../../../../../assets/viatura-logo.png';
import AssinaturaLogoWebP from '../../../../../assets/viatura-logo.webp';

interface IProps {
  activated: boolean;
}

const Logo: React.FC<IProps> = ({ activated }) => {
  return (
    <HStack spacing="24px">
      <Text
        fontSize="2xl"
        color="#14a64f"
        fontWeight="bold"
        textShadow="1px 1px #666"
      >
        {process.env.REACT_APP_SIGLA || 'SIGLA'}
      </Text>
      {activated && (
        <picture>
          <source srcSet={AssinaturaLogoWebP} type="image/webp" />

          <Image
            height="50px"
            src={AssinaturaLogo}
            alt="logo do sga, folha de papel com um a frente"
          />
        </picture>
      )}
    </HStack>
  );
};

export default Logo;
