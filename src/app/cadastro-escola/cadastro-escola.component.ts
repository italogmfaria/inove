import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchoolService } from '../common/service/school.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-cadastro-escola',
  templateUrl: './cadastro-escola.component.html',
  styleUrls: ['./cadastro-escola.component.css']
})
export class CadastroEscolaComponent {
  schoolForm: FormGroup;
  isSubmitting = false;
  returnUrl: string = '/cadastro-estudante';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schoolService: SchoolService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    // Verificar se há returnUrl nos query params
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    this.schoolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      federativeUnit: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern(/^[A-Z]{2}$/)]]
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  goBack() {
    if (this.returnUrl !== '/cadastro-estudante') {
      this.router.navigate([this.returnUrl]);
    } else {
      this.router.navigate(['/cadastro-estudante']);
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.schoolForm.get(fieldName);
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
      return 'Máximo de 2 caracteres';
    }
    if (field?.hasError('pattern')) {
      return 'Digite a sigla do estado (ex: SP, RJ)';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.schoolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  registerSchool() {
    Object.keys(this.schoolForm.controls).forEach(key => {
      this.schoolForm.get(key)?.markAsTouched();
    });

    if (this.schoolForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente', 'Atenção');
      return;
    }

    this.isSubmitting = true;

    const schoolData = {
      id: 0,
      ...this.schoolForm.value,
      students: []
    };

    this.schoolService.addSchool(schoolData).subscribe({
      next: () => {
        this.toastr.success('Escola cadastrada com sucesso!', 'Sucesso');
        this.router.navigate([this.returnUrl]);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erro ao cadastrar escola', err);
        this.toastr.error('Erro ao cadastrar escola. Tente novamente.', 'Erro');
        this.isSubmitting = false;
      }
    });
  }
}
