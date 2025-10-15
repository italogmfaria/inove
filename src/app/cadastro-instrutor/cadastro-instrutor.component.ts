import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {InstructorService} from "../common/service/instructor.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cadastro-instrutor',
  templateUrl: './cadastro-instrutor.component.html',
  styleUrls: ['./cadastro-instrutor.component.css']
})
export class CadastroInstrutorComponent {
  instructor = {
    name: '',
    cpf: '',
    email: '',
    motivation: ''
  };

  constructor(
    private router: Router,
    private instructorService: InstructorService,
    private toastr: ToastrService
  ) {}

  goBack() {
    window.history.back();
  }

  submitForm() {
    this.instructorService.createInstructor(this.instructor).subscribe({
      next: (response) => {
        this.toastr.success(response, 'Sucesso');
        this.router.navigate(['/aguarde']);
      },
      error: (error) => {
        console.error(error);
        this.toastr.error(error.error || 'Erro ao enviar solicitação.', 'Erro');
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
