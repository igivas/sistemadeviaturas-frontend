import React, { useCallback } from 'react';
import IInputCpfCnpj from '../../../interfaces/components/IInputCPFCNPJ';
import FormInput from '../FormInput';

const InputCpfCnpj: React.FC<IInputCpfCnpj> = ({
  value,
  onChange,
  ...rest
}) => {
  const handleShowCPF = useCallback((cpfValue: string): string => {
    switch (cpfValue.length) {
      case 3:
        return cpfValue.concat('.');

      case 6:
        return cpfValue
          .substr(0, 3)
          .concat('.')
          .concat(cpfValue.substr(3, 3).concat('.'));

      case 9:
        return cpfValue
          .substr(0, 3)
          .concat('.')
          .concat(cpfValue.substr(3, 3).concat('.'))
          .concat(cpfValue.substr(6, 3))
          .concat('-');

      default:
        if (cpfValue.length <= 3) return cpfValue;
        if (cpfValue.length <= 6)
          return cpfValue.substr(0, 3).concat('.').concat(cpfValue.substr(3));

        if (cpfValue.length <= 9)
          return cpfValue
            .substr(0, 3)
            .concat('.')
            .concat(cpfValue.substr(3, 3).concat('.'))
            .concat(cpfValue.substr(6));

        return cpfValue
          .substr(0, 3)
          .concat('.')
          .concat(cpfValue.substr(3, 3).concat('.'))
          .concat(cpfValue.substr(6, 3))
          .concat('-')
          .concat(cpfValue.substr(9, 2));
    }
  }, []);

  const handleDeleteNumber = useCallback((cpfValue: string) => {
    const onlyNumbers = cpfValue.replace(/[^0-9]/g, '');

    switch (onlyNumbers.length) {
      case 3:
        return cpfValue.substr(0, 3);

      case 6:
        return cpfValue.substr(0, 7);

      case 9:
        return cpfValue.substr(0, 11);

      case 12:
        return onlyNumbers
          .substr(0, 3)
          .concat('.')
          .concat(onlyNumbers.substr(3, 3).concat('.'))
          .concat(onlyNumbers.substr(6, 3))
          .concat('-')
          .concat(onlyNumbers.substr(9, 3));

      default:
        return cpfValue;
    }
  }, []);

  return (
    <FormInput
      value={value}
      onChange={(e) => {
        const onlyNumbers = e.target.value.toString().replace(/[^0-9]/g, '');
        let valueInput;

        if (onlyNumbers.length <= 11) valueInput = handleShowCPF(onlyNumbers);
        else if (onlyNumbers.length === 12) {
          valueInput = onlyNumbers
            .substr(0, 2)
            .concat('.')
            .concat(onlyNumbers.substr(2, 3))
            .concat('.')
            .concat(onlyNumbers.substr(5, 3))
            .concat('/')
            .concat(onlyNumbers.substr(8))
            .concat('-');
        } else if (onlyNumbers.length > 12 && onlyNumbers.length <= 14)
          valueInput = onlyNumbers
            .substr(0, 2)
            .concat('.')
            .concat(onlyNumbers.substr(2, 3))
            .concat('.')
            .concat(onlyNumbers.substr(5, 3))
            .concat('/')
            .concat(onlyNumbers.substr(8, 4))
            .concat('-')
            .concat(onlyNumbers.substr(12));

        onChange(valueInput);
      }}
      maxLength={18}
      onKeyDown={(event) => {
        if (event.key === 'Backspace') {
          onChange(handleDeleteNumber(event.currentTarget.value));
        }
      }}
      {...rest}
    />
  );
};

export default InputCpfCnpj;
