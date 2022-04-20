import React from 'react';
import { Avatar } from '@chakra-ui/react';
import { useAuth } from '../../../../../contexts/auth';
import ImageDefault from '../../../../../assets/pm_foto.jpg';
// import ImageDefault from '../../../../../assets/cap-rodrigues.jpg';
// import ImageDefault from '../../../../../assets/sgt-castro.jpg';
// import ImageDefault from '../../../../../assets/policial3.jpg';

interface IProps {
  size: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const UserImage: React.FC<IProps> = ({ size }) => {
  const { user } = useAuth();

  const dataImage = `data:image/jpeg;base64,${user.image?.data}`;

  return (
    <Avatar
      name="user"
      size={size}
      src={user.image?.data ? dataImage : ImageDefault}
    />
  );
};

export default UserImage;
