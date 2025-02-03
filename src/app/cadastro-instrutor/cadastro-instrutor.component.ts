import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {InstructorService} from "../common/service/instructor.service";

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
    private instructorService: InstructorService
  ) {}

  goBack() {
    window.history.back();
  }

  submitForm() {
    this.instructorService.createInstructor(this.instructor).subscribe({
      next: (response) => {
        alert(response);
        this.router.navigate(['/aguarde']);
      },
      error: (error) => {
        console.error(error);
        alert(error.error || 'Erro ao enviar solicitação.');
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}

