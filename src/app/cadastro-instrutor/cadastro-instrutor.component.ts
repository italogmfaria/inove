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
    // Marcar todos os campos como touched
    Object.keys(this.instructorForm.controls).forEach(key => {
      this.instructorForm.get(key)?.markAsTouched();
    });

    if (this.instructorForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente', 'Atenção');
      return;
    }

    this.isSubmitting = true;

    // Limpar o CPF antes de enviar (remove pontos e traços)
    const formData = {
      ...this.instructorForm.value,
      cpf: CpfValidator.cleanCpf(this.instructorForm.value.cpf)
    };

    this.instructorService.createInstructor(formData).subscribe({
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
