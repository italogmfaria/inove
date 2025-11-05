import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from "../common/service/instructor.service";
import { ToastrService } from 'ngx-toastr';
import { CpfValidator } from '../common/validators/cpf.validator';

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
      cpf: ['', [Validators.required, CpfValidator.validate]],
      email: ['', [Validators.required, Validators.email]],
      motivation: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]]
    });
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
    Object.keys(this.instructorForm.controls).forEach(key => {
      this.instructorForm.get(key)?.markAsTouched();
    });

    if (this.instructorForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente', 'Atenção');
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.instructorForm.value,
      cpf: CpfValidator.cleanCpf(this.instructorForm.value.cpf)
    };

    this.instructorService.createInstructor(formData).subscribe({
      next: () => {
        setTimeout(() => {
          this.toastr.success('Solicitação enviada com sucesso! Aguarde a aprovação.', 'Sucesso');
          this.router.navigate(['/aguarde']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao criar instrutor:', error);
        this.isSubmitting = false;

        if (error.status === 0) {
          this.toastr.error('Não foi possível conectar ao servidor. Verifique sua conexão.', 'Erro de Conexão');
          return;
        }

        if (error.status === 400) {
          let errorMessage = '';

          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          if (errorMessage.includes('E-mail já cadastrado') ||
              errorMessage.includes('e-mail') ||
              errorMessage.includes('email')) {
            this.toastr.error('O e-mail informado já está cadastrado no sistema.', 'E-mail Duplicado');
            return;
          }

          if (errorMessage.includes('CPF já cadastrado') ||
              errorMessage.includes('cpf')) {
            this.toastr.error('O CPF informado já está cadastrado no sistema.', 'CPF Duplicado');
            return;
          }

          if (errorMessage.includes('solicitação de cadastro') ||
              errorMessage.includes('solicitação')) {
            this.toastr.warning(errorMessage, 'Solicitação Pendente');
            return;
          }

          const message = errorMessage || 'Verifique os dados informados e tente novamente.';
          this.toastr.warning(message, 'Dados Inválidos');
          return;
        }

        if (error.status === 409) {
          this.toastr.error('Já existe uma solicitação pendente com esses dados.', 'Conflito');
          return;
        }

        if (error.status === 422) {
          const errorMessage = error.error?.message || 'Verifique os dados informados.';
          this.toastr.warning(errorMessage, 'Validação');
          return;
        }

        if (error.status >= 500) {
          this.toastr.error(
            'Ocorreu um erro no servidor. Tente novamente mais tarde.',
            'Erro no Servidor'
          );
          return;
        }

        // Erro genérico para casos não tratados
        this.toastr.error('Não foi possível enviar a solicitação. Tente novamente.', 'Erro');
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
