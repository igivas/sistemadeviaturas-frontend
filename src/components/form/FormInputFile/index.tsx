import React, { InputHTMLAttributes } from 'react';
import { FaTrash } from 'react-icons/fa';

// https://www.pluralsight.com/guides/how-to-use-a-simple-form-submit-with-files-in-react

import {
  Input,
  Error,
  InputWrapper,
  InputButtonWrapper,
  InputButton,
} from './styles';

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
  fontSize?: number;
  onClickButton?: (...event: any) => void;
  /* register?: any;
  onFileSelectSuccess?(file: File): void;
  onFileSelectError?(): void;
  onFileSelect(e: any): void; */
}

const FormInput: React.FC<IProps> = ({
  disabled,
  error,
  onClickButton,
  /* register,
  fontSize = 14,
  onFileSelect, */
  ...rest
}) => {
  // const fileInput = useRef(null);

  // const handleFileInput = (e): void => {
  //   handle validations
  //   onFileSelect(e.target.files[0]);
  //   const file = e.target.files[0];
  //   if (file.size > 1024)
  //     onFileSelectError({ error: 'File size cannot exceed more than 1MB' });
  //   else onFileSelectSuccess(file);
  // };
  return (
    <InputButtonWrapper>
      <InputWrapper>
        <Input
          {...rest}
          type="file"
          className={`${disabled && 'disabled'}`}
          disabled={disabled}
          /* ref={register} */
          error={error}
          onScroll={(e) => e.preventDefault()}
        />
        {error && <Error>{error}</Error>}
      </InputWrapper>

      <InputButton
        style={{
          justifyContent: 'center',

          padding: 0,
        }}
        color="yellow"
        type="button"
        onClick={onClickButton}
        icon={FaTrash}
      />
    </InputButtonWrapper>
  );
};

export default FormInput;
