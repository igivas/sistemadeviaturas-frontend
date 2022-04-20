import Button from 'components/Button';
import React, { useCallback } from 'react';
import ReactSelect from 'components/form/ReactSelect';
import { ValueType } from 'react-select';
import { IOptionFormat } from 'interfaces/IOptionFormat';
import { useAuth } from '../../../../../contexts/auth';
import UserImage from '../UserImage';
import { Container, Header, Content, InfoUser } from './styles';

const DropDown: React.FC = () => {
  const { user, signOut, updatePerfil } = useAuth();

  /* const handleChangePerfil = (perfil: string): void => {
    updatePerfil(perfil);
  }; */

  const handleClickSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <Container>
      <Header>
        <UserImage size="lg" />
        <InfoUser>
          <p>{user.nome}</p>
          <p>{user.graduacao?.gra_nome}</p>
          <p>Matrícula: {user.id_usuario}</p>
          <p>OPM: {user.opm?.sigla}</p>
        </InfoUser>
      </Header>
      <Content>
        <span>Perfil de acesso:</span>
        <ReactSelect
          value={user.currentPerfil}
          onChange={(value: ValueType<IOptionFormat>) => {
            const optionSelected = value as IOptionFormat;

            updatePerfil(optionSelected);
          }}
          optionsSelect={user.perfis.map((perfil) => ({
            label: perfil.descricao,
            value: perfil.id_perfil.toString(),
          }))}
          styles={{
            control: (base) => ({
              ...base,
              fontSize: '1rem',
              height: '2.5rem',
            }),

            singleValue: (provided, state) => {
              const opacity = state.isDisabled ? 0.5 : 1;
              const transition = 'opacity 300ms';

              return { ...provided, opacity, transition, color: 'inherit' };
            },

            option: (styles, { isFocused }) => {
              return {
                ...styles,
                color: 'inherit',
                fontSize: '1rem',
                backgroundColor: isFocused ? '#E2E8F0' : 'rgb(255, 255, 255)',
              };
            },
          }}
        />
        <Button
          colorScheme="red"
          size="sm"
          mt="2"
          variant="solid"
          onClick={() => handleClickSignOut()}
        >
          Sair
        </Button>
      </Content>
    </Container>
  );
};

export default DropDown;
