import React, { useMemo } from 'react';
import { MdArrowDropDown, MdMenu } from 'react-icons/md';
// import { useColorMode } from '@chakra-ui/react';
import {
  Image,
  HStack,
  useMediaQuery,
  Menu,
  MenuButton,
  Button,
  MenuList,
  Flex,
  Center,
  useColorModeValue,
  Text,
  Divider,
} from '@chakra-ui/react';
import Countdown, { zeroPad } from 'react-countdown';
import UserImage from './UserImage';
import DropdownUser from './DropDownUser';
import { useAuth } from '../../../../contexts/auth';
import ImageLogo from '../../../../assets/logo-governo-ceara-50px.png';
import ImageLogoWebP from '../../../../assets/logo-governo-ceara-50px.webp';
import MenuOpm from './MenuOpm';

interface IHeaderProps {
  handleActiveSideBar(): void;
}

type OpmResponse = {
  id_opm: number;
  nome: string;
  sigla: string;
};

type OptionType = {
  value: string;
  label: string;
};

const Header: React.FC<IHeaderProps> = ({
  handleActiveSideBar,
}: IHeaderProps) => {
  const { user, exp, signOut } = useAuth();
  const [isLargerCelular] = useMediaQuery(['(min-width: 768px)']);
  const bg = useColorModeValue('white', '#373737');
  const color = useColorModeValue('gray.500', 'white');

  const memoMenuUser = useMemo(
    () => (
      <Menu>
        {({ isOpen }) => (
          <>
            <MenuButton
              isActive={isOpen}
              as={Button}
              colorScheme="white"
              color={color}
              fontWeight="400"
              _hover={{ bg: { sm: '#fff' } }}
              borderRadius="0"
              h={20}
            >
              <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <UserImage size="md" />
                {isLargerCelular && (
                  <>
                    <Flex direction="column" marginLeft="8px">
                      <Text fontSize="md" fontWeight="600">
                        {user.militar
                          ? `${user.graduacao?.gra_sigla} ${user.pm_apelido}`
                          : user.nome}
                      </Text>
                      <Text fontSize="sm" fontWeight="400" marginTop="2px">
                        {user.militar && user.opm?.sigla}
                      </Text>
                    </Flex>
                    <MdArrowDropDown size={30} />
                  </>
                )}
              </Flex>
            </MenuButton>
            <MenuList
              p={0}
              style={{ marginTop: -8, display: isOpen ? 'flex' : 'none' }}
            >
              <DropdownUser />
            </MenuList>
            {/* <ColorModeSwitcher justifySelf="flex-end" /> */}
          </>
        )}
      </Menu>
    ),
    [
      isLargerCelular,
      color,
      user.graduacao,
      user.militar,
      user.nome,
      user.opm,
      user.pm_apelido,
    ],
  );

  const menuOpm = useMemo(() => {
    return (
      <>
        {isLargerCelular && <Divider orientation="vertical" />}

        <MenuOpm />

        {isLargerCelular && <Divider orientation="vertical" />}

        <Countdown
          date={new Date(Number(exp) * 1000)}
          onComplete={() => signOut()}
          renderer={({ minutes, seconds }) => (
            <>
              {isLargerCelular && (
                <Center color={color}>
                  {zeroPad(minutes)}m:{zeroPad(seconds)}s
                </Center>
              )}
            </>
          )}
        />

        {isLargerCelular && <Divider orientation="vertical" />}
      </>
    );
  }, [isLargerCelular, color, exp, signOut]);

  return (
    <Flex
      w="100%"
      direction="row"
      height="80px"
      bg={bg}
      color={color}
      justify="space-between"
      alignItems="center"
      boxShadow="lg"
      pl={4}
      fontSize={['sm', 'md', 'lg']}
    >
      <HStack>
        <HStack spacing="48px" pr="8">
          <button type="button" onClick={handleActiveSideBar}>
            <MdMenu size={30} color="#14a64f" />
          </button>
        </HStack>

        {isLargerCelular && (
          <>
            <HStack spacing="16px">
              <picture>
                <source srcSet={ImageLogoWebP} type="image/webp" />

                <Image
                  src={ImageLogo}
                  alt="logo do governo do estado do ceará"
                />
              </picture>
              {/* <InputGroup w="320px">
          <Input
            placeholder="Pesquisa..."
            _focus={{ borderColor: 'gray.500' }}
          />
          <InputRightElement width="3.5rem" p={0}>
            <MdSearch color="green.500" size={20} />
          </InputRightElement>
        </InputGroup> */}
            </HStack>
          </>
        )}
      </HStack>

      {menuOpm}

      {memoMenuUser}
    </Flex>
  );
};

export default Header;
