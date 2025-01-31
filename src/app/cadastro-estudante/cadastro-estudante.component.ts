import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolDTO } from '../common/dto/SchoolDTO';
import { UserDTO } from '../common/dto/UserDTO';
import { SchoolService } from '../common/service/school.service';
import { StudentService } from '../common/service/student.service';

@Component({
  selector: 'app-cadastro-estudante',
  templateUrl: './cadastro-estudante.component.html',
  styleUrls: ['./cadastro-estudante.component.css']
})
export class CadastroEstudanteComponent implements OnInit {
  newUser: Partial<UserDTO> = {
    name: '',
    cpf: '',
    email: '',
    password: '',
    birthDate: new Date(),
    schoolId: undefined
  };

  escolas: SchoolDTO[] = []; // Lista de escolas carregadas do back-end
  carregandoEscolas: boolean = false;

  constructor(
    private studentService: StudentService,
    private schoolService: SchoolService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarEscolas();
  }

  carregarEscolas(): void {
    this.carregandoEscolas = true;
    this.schoolService.getSchools().subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.escolas = data;
        } else {
          alert('Nenhuma escola encontrada. Cadastre uma escola primeiro.');
          this.router.navigate(['/cadastro-escola']);
        }
        this.carregandoEscolas = false;
      },
      (error) => {
        console.error('Erro ao carregar escolas:', error);
        alert('Erro ao carregar escolas. Verifique sua conexão e tente novamente.');
        this.carregandoEscolas = false;
      }
    );
  }

  cadastrarEstudante(): void {
    if (!this.newUser.schoolId) {
      alert('Para se cadastrar, você precisa associar uma escola. Cadastre sua escola primeiro.');
      this.router.navigate(['/cadastro-escola']);
      return;
    }
  
    const studentData = {
      ...this.newUser,
      school: { id: this.newUser.schoolId } // Adiciona o objeto school esperado pelo back-end
    };
  
    this.studentService.registerStudent(studentData).subscribe(
      () => {
        alert('Cadastro realizado com sucesso! Faça login para acessar.');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Erro no cadastro:', error);
        alert('Erro ao realizar o cadastro. Tente novamente.');
      }
    );
  }
  
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
