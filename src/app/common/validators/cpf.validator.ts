import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CpfValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const cpf = CpfValidator.cleanCpf(control.value);

    if (!cpf) {
      return null;
    }

    if (cpf.length !== 11) {
      return { cpfInvalid: true };
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalid: true };
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== parseInt(cpf.charAt(9))) {
      return { cpfInvalid: true };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (digit2 !== parseInt(cpf.charAt(10))) {
      return { cpfInvalid: true };
    }

    return null;
  }

  static cleanCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '');
  }

  static formatCpf(cpf: string): string {
    const cleaned = CpfValidator.cleanCpf(cpf);
    if (!cleaned) return '';

    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    return cleaned.substring(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
}
