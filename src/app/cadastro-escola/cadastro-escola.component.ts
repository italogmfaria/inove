import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolDTO } from '../common/dto/SchoolDTO';
import { SchoolService } from '../common/service/school.service';


@Component({
  selector: 'app-cadastro-escola',
  templateUrl: './cadastro-escola.component.html',
  styleUrls: ['./cadastro-escola.component.css']
})
export class CadastroEscolaComponent {
  school: SchoolDTO = {
    id: 0,
    name: '',
    city: '',
    email: '',
    federativeUnit: '',
    students: []
  };

  constructor(private router: Router, private schoolService: SchoolService) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  registerSchool() {
    this.schoolService.addSchool(this.school).subscribe({
      next: () => {
        alert('Escola cadastrada com sucesso!');
        this.router.navigate(['/cadastro-estudante']);
      },
      error: (err) => {
        console.error('Erro ao cadastrar escola', err);
        alert('Erro ao cadastrar escola. Tente novamente.');
      }
    });
  }
}
