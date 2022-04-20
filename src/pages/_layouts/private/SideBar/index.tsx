import React from 'react';
import {
  MdEdit,
  MdSearch,
  MdDashboard,
  MdSupervisorAccount,
} from 'react-icons/md';
import {
  Accordion,
  Center,
  Image,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import Logo from './Logo';
import MenuItem from './Menu';
import MenuDropdown from './MenuDropdown';
import LogoCetic from '../../../../assets/logo-cetic-35px.png';
import LogoCeticWebP from '../../../../assets/logo-cetic-35px.webp';
import { Container, HeaderMenu, Footer } from './styles';

interface ISideBarProps {
  activated: boolean;
  handleActiveSideBar(): void;
}

const consultasItems = [
  { label: 'Veiculos', to: '/veiculos/consulta' },
  { label: 'Movimentacoes', to: '/movimentacoes' },
  { label: 'Marcas', to: '/marcas/consulta' },
  // { label: 'Oficina', to: '/oficinas/consulta' },
  { label: 'Referências', to: '/referencias/consulta' },
  // { label: 'Localizacoes', to: '/veiculos/localizacao' },
  { label: 'Veículos Modelos', to: '/modelos/consulta' },
];

const cadastrosItems = [
  { label: 'Veiculos', to: '/veiculos/cadastro' },
  { label: 'Pneu', to: '/pneus/cadastro' },
  { label: 'Veículos Modelos', to: '/modelos/cadastro' },

  // { label: 'Oficina', to: '/oficinas/cadastro' },
  /* { label: 'Manutencoes', to: '/manutencoes/cadastro' },
   { label: 'Situações', to: '/situacoes/cadastro' },
  { label: 'Movimentações', to: '/movimentacoes/cadastro' }, */
];

const administracaoItems = [{ label: 'Informações de Email', to: '/emails' }];

const SideBar: React.FC<ISideBarProps> = ({
  activated,
  handleActiveSideBar,
}) => {
  const bg = useColorModeValue('green.500', '#5b5b58');
  const color = useColorModeValue('gray.500', 'white');

  return (
    <Container activated={activated}>
      <HeaderMenu activated={activated}>
        <Logo activated={activated} />
      </HeaderMenu>

      <Flex
        bg={bg}
        color={color}
        direction="column"
        alignItems="initial"
        flex="1"
      >
        <Accordion allowToggle onScroll={(e) => e.preventDefault()}>
          <MenuItem
            to="/home"
            label="INICIAL"
            icon={MdDashboard}
            activated={activated}
          />

          <MenuDropdown
            label="Cadastros"
            icon={MdEdit}
            items={cadastrosItems}
            activated={activated}
            handleActiveSideBar={handleActiveSideBar}
          />

          <MenuDropdown
            label="Consultas"
            icon={MdSearch}
            items={consultasItems}
            activated={activated}
            handleActiveSideBar={handleActiveSideBar}
          />

          <MenuDropdown
            label="Administração"
            icon={MdSupervisorAccount}
            items={administracaoItems}
            activated={activated}
            handleActiveSideBar={handleActiveSideBar}
          />
        </Accordion>
      </Flex>
      <Footer activated={activated}>
        <Center w="100%">
          {activated && (
            <picture>
              <source srcSet={LogoCeticWebP} type="image/webp" />

              <Image src={LogoCetic} alt="logo cetic" />
            </picture>
          )}
        </Center>
      </Footer>
    </Container>
  );
};
export default SideBar;
