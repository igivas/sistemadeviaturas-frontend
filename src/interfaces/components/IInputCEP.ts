import { InputHTMLAttributes } from 'react';

export default interface IInputCEP
  extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  onChange(...event: any): void;
}
