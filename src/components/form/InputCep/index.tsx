import React from 'react';
import IInputCEP from '../../../interfaces/components/IInputCEP';
import FormInput from '../FormInput';

const InputCep: React.FC<IInputCEP> = ({ onChange, ...rest }) => {
  return (
    <FormInput
      {...rest}
      maxLength={10}
      onChange={(event) => {
        const onlyNumbers = event?.target?.value.replace(/[^0-9]/g, '');
        let valueCEP;

        if (onlyNumbers.length <= 8)
          switch (onlyNumbers.length) {
            case 2:
              valueCEP = onlyNumbers.concat('.');
              break;

            case 5:
              valueCEP = onlyNumbers
                .substr(0, 2)
                .concat('.')

                .concat(onlyNumbers.substr(2, 3))
                .concat('-');

              break;
            default:
              if (onlyNumbers.length <= 2) valueCEP = onlyNumbers;
              else if (onlyNumbers.length <= 5)
                valueCEP = onlyNumbers
                  .substr(0, 2)
                  .concat('.')

                  .concat(onlyNumbers.substr(2, 3));

              break;
          }

        onChange(valueCEP);
      }}
      onKeyDown={(event) => {
        let valueCEP;

        if (event.key === 'Backspace') {
          const onlyNumbers = event.currentTarget.value.replace(/[^0-9]/g, '');
          switch (onlyNumbers.length) {
            case 2:
              valueCEP = event.currentTarget.value.substr(0, 2);
              break;

            case 5:
              valueCEP = event.currentTarget.value.substr(0, 6);
              break;

            default:
              valueCEP = event.currentTarget.value;
              break;
          }

          onChange(valueCEP);
        }
      }}
    />
  );
};

export default InputCep;
