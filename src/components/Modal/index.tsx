import React from 'react';
import {
  Modal as ModalChakra,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  size:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | 'full'
    | 'xs'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl';

  title: string;
}

const Modal: React.FC<IModalProps> = ({
  isOpen,
  size,
  title,
  onClose,
  children,
}) => {
  return (
    <ModalChakra isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ModalChakra>
  );
};

export default Modal;
