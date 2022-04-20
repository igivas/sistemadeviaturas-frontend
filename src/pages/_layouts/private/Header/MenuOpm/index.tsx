import React, { useEffect, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  useDisclosure,
  Button,
  Box,
  FormControl,
  FormLabel,
  Checkbox,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { ValueType } from 'react-select';
import FormGroup from '../../../../../components/form/FormGroup';
import { useAuth } from '../../../../../contexts/auth';
import AsyncSelect from '../../../../../components/form/AsyncSelect';
import { IOptionFormat } from '../../../../../interfaces/IOptionFormat';

const MenuOpm: React.FC = () => {
  const {
    user,
    updateOpmBusca,
    updateVerSubunidades,
    delayedPromiseOptionsUnidades,
  } = useAuth();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [opmSelecionada, setOpmSelecionada] = useState<IOptionFormat>();
  const color = useColorModeValue('gray.500', 'white');
  // const colorHover = useColorModeValue('white', 'gray.500');

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (opmSelecionada) {
        if (opmSelecionada.label.includes(' - '))
          updateOpmBusca({
            label: opmSelecionada.label.split(' - ')[1],
            value: opmSelecionada.value,
          });
        else
          updateOpmBusca({
            label: opmSelecionada.label,
            value: opmSelecionada.value,
          });
      }
    };

    load();
    // eslint-disable-next-line
  }, [opmSelecionada]);

  const handleSwitchSubunidade = (sub: boolean): void => {
    updateVerSubunidades(sub ? '1' : '0');
  };

  return (
    <>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom"
        closeOnBlur
      >
        <Tooltip hasArrow label="Trocar Unidade" placement="bottom">
          <Box>
            <PopoverTrigger>
              <Button
                _hover={{ bg: '#eee' }}
                colorScheme="white"
                color={color}
                fontWeight="400"
                borderRadius="0"
                h={20}
                w={{ base: '200px', sm: '80px', md: '120px' }}
              >
                {user.opmBusca?.label}
              </Button>
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent p={5} style={{ display: isOpen ? 'flex' : 'none' }}>
          <PopoverCloseButton />
          <FormGroup name="Trocar Unidade" cols={[12, 12, 12]}>
            <AsyncSelect
              placeholder="Selecione ..."
              value={opmSelecionada}
              isClearable
              loadOptions={(value: string) =>
                delayedPromiseOptionsUnidades(value.trim(), true)
              }
              onChange={(option: ValueType<IOptionFormat>) => {
                const optionSelected = option as IOptionFormat;

                setOpmSelecionada(optionSelected);
              }}
              styles={{
                control: (styles) => ({
                  ...styles,
                  width: '100%',
                  backgroundColor: 'white',
                }),
                menuList: () => ({ width: '100%' }),
                option: (styles) => ({
                  ...styles,
                  width: '100%',
                  border: 1,
                  fontSize: '1rem',
                }),
              }}
              loadingMessage={() => 'Carregando ...'}
            />
          </FormGroup>
          <FormControl
            paddingLeft="8px"
            display="flex"
            alignItems="center"
            mt="2"
          >
            <FormLabel htmlFor="subunidades" mb="0">
              Ver Subunidades?
            </FormLabel>
            <Checkbox
              id="subunidades"
              marginRight="4px"
              isChecked={user.opmBusca.option === '1'}
              colorScheme="green"
              onChange={(e) => handleSwitchSubunidade(e.target.checked)}
            />
            {!user.opmBusca.option || user.opmBusca.option === '0'
              ? `Sim`
              : `Não`}
          </FormControl>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default MenuOpm;
