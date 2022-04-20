import Button from 'components/form/Button';
import PanelBottomActions from 'components/PanelBottomActions';
import React from 'react';
import { IconBaseProps } from 'react-icons';
import { FaSave, FaTimes } from 'react-icons/fa';
import Modal, { IModalProps } from '../Modal';

interface IModalConfirmacao extends IModalProps {
  confirmOptions: {
    handleClick(data: any): Promise<void>;
    icon: React.ComponentType<IconBaseProps>;
    color: 'red' | 'yellow' | 'green' | 'default' | 'blue';
    title?: string;
    isDisabled: boolean;
  };
}

const ModalConfirmação: React.FC<IModalConfirmacao> = ({
  title,
  children,
  onClose,
  confirmOptions,
  ...modalProps
}) => {
  return (
    <Modal {...modalProps} onClose={onClose} title={title}>
      {children}
      <PanelBottomActions>
        <Button color="red" type="button" icon={FaTimes} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          color={confirmOptions.color}
          icon={confirmOptions.icon}
          type="button"
          onClick={confirmOptions.handleClick}
          disabled={confirmOptions.isDisabled}
        >
          {confirmOptions.title}
        </Button>
      </PanelBottomActions>
    </Modal>
  );
};

ModalConfirmação.defaultProps = {
  confirmOptions: {
    icon: FaSave,
    handleClick: async () => {
      alert('A implementar');
    },
    isDisabled: false,
    color: 'green',
  },
};

export default ModalConfirmação;
