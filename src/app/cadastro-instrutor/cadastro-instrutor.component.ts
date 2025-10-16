import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { InstructorService } from "../common/service/instructor.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cadastro-instrutor',
  templateUrl: './cadastro-instrutor.component.html',
  styleUrls: ['./cadastro-instrutor.component.css']
})
export class CadastroInstrutorComponent {
  instructorForm: FormGroup;
  isSubmitting = false;

  constructor(
    private router: Router,
    private instructorService: InstructorService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.instructorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      email: ['', [Validators.required, Validators.email]],
      motivation: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]]
    });
  }

  // Validador de CPF
  cpfValidator(control: AbstractControl): ValidationErrors | null {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { cpfInvalid: true };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalid: true };
    }

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) {
      return { cpfInvalid: true };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) {
      return { cpfInvalid: true };
    }

    return null;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.instructorForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('email')) {
      return 'Digite um e-mail válido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Deve ter no mínimo ${minLength} caracteres`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Deve ter no máximo ${maxLength} caracteres`;
    }
    if (field?.hasError('cpfInvalid')) {
      return 'CPF inválido';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.instructorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  goBack() {
    window.history.back();
  }

  submitForm() {
    // Marcar todos os campos como touched
    Object.keys(this.instructorForm.controls).forEach(key => {
      this.instructorForm.get(key)?.markAsTouched();
    });

    if (this.instructorForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente', 'Atenção');
      return;
    }

    this.isSubmitting = true;

    this.instructorService.createInstructor(this.instructorForm.value).subscribe({
      next: () => {
        // Aguardar um pouco para garantir que o usuário viu o loading
        setTimeout(() => {
          this.toastr.success('Solicitação enviada com sucesso! Aguarde a aprovação.', 'Sucesso');
          this.router.navigate(['/aguarde']);
        }, 1500);
      },
      error: (error) => {
        console.error(error);
        this.toastr.error(error.error || 'Erro ao enviar solicitação.', 'Erro');
        this.isSubmitting = false;
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
