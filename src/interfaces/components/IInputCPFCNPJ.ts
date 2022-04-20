import { InputHTMLAttributes } from 'react';

export default interface IInputCpfCnpj
  extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  onChange(...event: any): void;
}
