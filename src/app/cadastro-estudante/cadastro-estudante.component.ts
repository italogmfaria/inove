import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SchoolDTO } from '../common/dto/SchoolDTO';
import { SchoolService } from '../common/service/school.service';
import { StudentService } from '../common/service/student.service';
import { ToastrService } from 'ngx-toastr';
import { CpfValidator } from '../common/validators/cpf.validator';

@Component({
  selector: 'app-cadastro-estudante',
  templateUrl: './cadastro-estudante.component.html',
  styleUrls: ['./cadastro-estudante.component.css']
})
export class CadastroEstudanteComponent implements OnInit {
  studentForm: FormGroup;
  escolas: SchoolDTO[] = [];
  carregandoEscolas: boolean = false;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private studentService: StudentService,
    private schoolService: SchoolService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, CpfValidator.validate]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
      schoolId: [undefined, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarEscolas();
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) {
      return null;
    }

    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    const valid = hasNumber && hasLetter;
    if (!valid) {
      return { passwordWeak: true };
    }

    return null;
  }

  carregarEscolas(): void {
    this.carregandoEscolas = true;
    this.schoolService.getSchools().subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.escolas = data;
        } else {
          this.toastr.warning('Nenhuma escola encontrada. Cadastre uma escola primeiro.', 'Atenção');
          this.router.navigate(['/cadastro-escola']);
        }
        this.carregandoEscolas = false;
      },
      (error) => {
        console.error('Erro ao carregar escolas:', error);
        this.toastr.error('Erro ao carregar escolas. Verifique sua conexão e tente novamente.', 'Erro');
        this.carregandoEscolas = false;
      }
    );
  }

  getErrorMessage(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
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
    if (field?.hasError('cpfInvalid')) {
      return 'CPF inválido';
    }
    if (field?.hasError('passwordWeak')) {
      return 'A senha deve conter letras e números';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  cadastrarEstudante(): void {
    Object.keys(this.studentForm.controls).forEach(key => {
      this.studentForm.get(key)?.markAsTouched();
    });

    if (this.studentForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente', 'Atenção');
      return;
    }

    if (!this.studentForm.value.schoolId) {
      this.toastr.warning('Para se cadastrar, você precisa associar uma escola. Cadastre sua escola primeiro.', 'Atenção');
      this.router.navigate(['/cadastro-escola']);
      return;
    }

    this.isSubmitting = true;

    const studentData = {
      ...this.studentForm.value,
      cpf: CpfValidator.cleanCpf(this.studentForm.value.cpf),
      birthDate: new Date(),
      school: { id: this.studentForm.value.schoolId }
    };

    this.studentService.registerStudent(studentData).subscribe(
      () => {
        this.toastr.success('Cadastro realizado com sucesso! Faça login para acessar.', 'Sucesso');
        this.router.navigate(['/login']);
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Erro no cadastro:', error);
        this.toastr.error('Erro ao realizar o cadastro. Tente novamente.', 'Erro');
        this.isSubmitting = false;
      }
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
