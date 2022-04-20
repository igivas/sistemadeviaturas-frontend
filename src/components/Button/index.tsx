import React from 'react';

import { Button, ButtonProps } from '@chakra-ui/react';

const AccordionComponent: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <Button {...rest} borderRadius="4px" onScroll={(e) => e.preventDefault()}>
      {children}
    </Button>
  );
};

export default AccordionComponent;
