import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { CpfValidator } from '../validators/cpf.validator';

@Directive({
  selector: '[cpfMask]'
})
export class CpfMaskDirective {
  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove tudo que não é número
    const cleaned = CpfValidator.cleanCpf(value);

    // Limita a 11 dígitos
    const limited = cleaned.substring(0, 11);

    // Formata o CPF
    const formatted = CpfValidator.formatCpf(limited);

    // Atualiza o valor do input
    input.value = formatted;

    // Atualiza o valor do FormControl com apenas os números
    if (this.control?.control) {
      this.control.control.setValue(cleaned.substring(0, 11), { emitEvent: false });
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any): void {
    const input = event.target as HTMLInputElement;
    const cleaned = CpfValidator.cleanCpf(input.value);

    if (cleaned) {
      input.value = CpfValidator.formatCpf(cleaned);
    }
  }
}

