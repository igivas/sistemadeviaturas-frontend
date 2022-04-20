import React from 'react';
import {
  MdEdit,
  MdSearch,
  MdDashboard,
  MdSupervisorAccount,
} from 'react-icons/md';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
} from '@chakra-ui/react';

import Logo from './Logo';
import MenuItem from './Menu';
import MenuDropdown from './MenuDropdown';

interface ISideBarProps {
  isOpen: boolean;
  onClose(): void;
}

const cadastrosItems = [
  { label: 'Veículos', to: '/veiculos/cadastro' },
  { label: 'Pneu', to: '/pneus/cadastro' },
  // { label: 'Oficina', to: '/oficinas/cadastro' },
  // { label: 'Localizacoes', to: '/veiculos/localizacao' },

  /* { label: 'Manutencoes', to: '/manutencoes/cadastro' },
   { label: 'Situações', to: '/situacoes/cadastro' },
  { label: 'Movimentações', to: '/movimentacoes/cadastro' }, */
];

const consultasItems = [
  { label: 'Veiculos', to: '/veiculos/consulta' },
  { label: 'Movimentacoes', to: '/movimentacoes' },
  { label: 'Marcas', to: '/marcas/consulta' },
  // { label: 'Oficina', to: '/oficinas/consulta' },
  { label: 'Referências', to: '/referencias/consulta' },
  // { label: 'Localizacoes', to: '/veiculos/localizacao' },
];

const administracaoItems = [{ label: 'Informações de Email', to: '/emails' }];

const SideBarMobile: React.FC<ISideBarProps> = ({ isOpen, onClose }) => {
  return (
    <Drawer
      placement="left"
      onClose={onClose}
      isOpen={isOpen}
      size="xs"
      isFullHeight
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <HStack justifyContent="center">
              <DrawerCloseButton />
              <Logo />
            </HStack>
          </DrawerHeader>
          <DrawerBody bg="green.500" p={0}>
            <MenuItem
              to="/home"
              label="INICIAL"
              icon={MdDashboard}
              onClose={onClose}
            />
            <MenuDropdown
              label="Cadastros"
              icon={MdEdit}
              items={cadastrosItems}
            />

            <MenuDropdown
              label="Consultas"
              icon={MdSearch}
              items={consultasItems}
            />

            <MenuDropdown
              label="Administração"
              icon={MdSupervisorAccount}
              items={administracaoItems}
            />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default SideBarMobile;
