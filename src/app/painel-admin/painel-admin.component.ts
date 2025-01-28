import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../common/service/user.service';
import { SchoolDTO } from '../common/dto/SchoolDTO';
import { UserDTO } from '../common/dto/UserDTO';
import { CursoDTO } from '../common/dto/CursoDTO';
import { SchoolService } from '../common/service/school.service';
import { CourseService } from '../common/service/course.service';
import { UserRole } from '../common/dto/UserRole';

@Component({
  selector: 'app-painel-admin',
  templateUrl: './painel-admin.component.html',
  styleUrls: ['./painel-admin.component.css'],
})
export class PainelAdminComponent {
  activeTab: 'usuarios' | 'escolas' | 'cursos' = 'usuarios';

  public UserRole = UserRole;

  // Modal status
  showAddUserModal: boolean = false;
  showUpdateUserModal: boolean = false;
  showSchoolModal: boolean = false;
  showNewSchoolModal: boolean = false;
  showAddCourseModal: boolean = false;
  showUpdateCourseModal: boolean = false;
  originalCourseTitle: string = '';

  newUser: UserDTO = this.resetNewUser();
  selectedUser: UserDTO = this.resetNewUser();

  newSchool: SchoolDTO = this.resetNewSchool();
  selectedSchool: SchoolDTO = this.resetNewSchool();

  newCourse: CursoDTO = this.resetNewCourse();
  selectedCourse: CursoDTO = this.resetNewCourse();

  usuarios: UserDTO[] = [];
  escolas: SchoolDTO[] = [];
  cursos: CursoDTO[] = [];
  instrutores: UserDTO[] = [];


  constructor(
    private router: Router,
    private userService: UserService,
    private schoolService: SchoolService,
    private courseService: CourseService
  ) {
    this.loadAllData();
  }

  loadAllData(): void {
    this.getUsers();
    this.getSchools();
    this.getCourses();
    this.getInstructors();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Tabs
  changeTab(tab: 'usuarios' | 'escolas' | 'cursos'): void {
    this.activeTab = tab;
  }

  

  // Usuários

  getUsers(): void {
    this.userService.getUsers().subscribe((response) => {
      this.usuarios = response;
    });
  }

  updateUserRole(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.newUser.role = target.value as UserRole;
  }

  addUser(): void {
    if (!this.newUser.role) {
      alert('Por favor, selecione o tipo de usuário.');
      return;
    }
  
    if (this.newUser.role === 'STUDENT' && !this.newUser.schoolId) {
      alert('Por favor, selecione uma escola para o estudante.');
      return;
    }
  
    const userPayload = {
      ...this.newUser,
      role: this.newUser.role, 
      school: this.newUser.role === 'STUDENT' ? { id: this.newUser.schoolId } : null, 
    };
  
    let addUserObservable;
    if (this.newUser.role === 'ADMINISTRATOR' || this.newUser.role === 'INSTRUCTOR') {
      addUserObservable = this.userService.addUser(userPayload); 
    } else if (this.newUser.role === 'STUDENT') {
      addUserObservable = this.userService.addUser(userPayload); 
    } else {
      alert('Papel do usuário inválido.');
      return;
    }
  
    addUserObservable.subscribe(
      () => {
        this.getUsers();
        this.closeUserModals();
        alert('Usuário adicionado com sucesso.');
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
        alert('Erro ao adicionar usuário.');
      }
    );
  }
  

  toggleAddUserModal(): void {
    this.newUser = this.resetNewUser();
    this.showAddUserModal = true;
  }

  resetNewUser(): UserDTO {
    return {
      id: 0,
      name: '',
      email: '',
      cpf: '',
      password: '',
      role: UserRole.STUDENT,
      schoolId: 0,
      birthDate: new Date(),
      adminCourses: [],
      instructorCourses: [],
      studentCourses: [],
    };
  }

  updateUser(): void {
    if (this.selectedUser.role === UserRole.STUDENT && !this.selectedUser.schoolId) {
      alert('Por favor, selecione uma escola para o estudante.');
      return;
    }
  
    const userPayload = {
      ...this.selectedUser,
      school: this.selectedUser.role === UserRole.STUDENT ? { id: this.selectedUser.schoolId } : null,
    };
  
    this.userService.updateUser(userPayload).subscribe(
      () => {
        this.getUsers();
        this.closeUserModals();
        alert('Usuário atualizado com sucesso.');
      },
      (error) => {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário.');
      }
    );
  }
  

  toggleUpdateUserModal(user: UserDTO): void {
    this.selectedUser = { ...user };
    this.showAddUserModal = false;
    this.showUpdateUserModal = true;
  }

  closeUserModals(): void {
    this.newUser = this.resetNewUser();
    this.showAddUserModal = false;
    this.showUpdateUserModal = false;
  }




// Escola

  getSchools(): void {
    this.schoolService.getSchools().subscribe((response) => {
      this.escolas = response;
    });
  }

  addNewSchool(): void {
    if (!this.newSchool.name || !this.newSchool.email) {   //if (!this.newSchool.name || !this.newSchool.email || !this.newSchool.password) {

      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
  
    this.schoolService.addSchool(this.newSchool).subscribe(
      () => {
        this.getSchools();
        this.toggleNewSchoolModal();
        alert('Escola cadastrada com sucesso!');
      },
      (error) => {
        console.error('Erro ao cadastrar escola:', error);
        alert('Erro ao cadastrar escola.');
      }
    );
  }
  
  updateSchool(): void {
    if (!this.selectedSchool.name || !this.selectedSchool.city || !this.selectedSchool.federativeUnit) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
  
    this.schoolService.updateSchool(this.selectedSchool).subscribe(
      () => {
        this.getSchools();
        this.closeSchoolModal();
        alert('Escola atualizada com sucesso!');
      },
      (error) => {
        console.error('Erro ao atualizar escola:', error);
        alert('Erro ao atualizar escola.');
      }
    );
  }
  
  resetNewSchool(): SchoolDTO {
    return { 
      id: 0, 
      name: '', 
      email: '', 
      city: '', 
      federativeUnit: '', 
      // password: '', 
      students: [] 
    };
  }
  
  toggleNewSchoolModal(): void {
    this.newSchool = this.resetNewSchool();
    this.showNewSchoolModal = !this.showNewSchoolModal;
  }

  toggleSchoolModal(school: SchoolDTO): void {
    this.selectedSchool = { ...school };
    this.showSchoolModal = true;
  }

  closeSchoolModal(): void {
    this.selectedSchool = this.resetNewSchool();
    this.showSchoolModal = false;
  }





// Cursos


getCourses(): void {
  this.courseService.getCourses().subscribe(
    (response) => {
      this.cursos = response.map((course) => ({
        ...course,
        description: course.description || 'Descrição não disponível', // Preenche com uma descrição padrão
        instructors: course.instructors || [], // Garante que instrutores seja uma lista vazia se estiver ausente
      }));
    },
    (error) => {
      console.error('Erro ao buscar cursos:', error);
      alert('Erro ao buscar cursos.');
    }
  );
}


  getInstructors(): void {
    this.userService.getInstructors().subscribe((response) => {
      this.instrutores = response;
    });
  }

  addCourse(): void {
    if (!this.newCourse.name || !this.newCourse.description || this.newCourse.instructors.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.courseService.addCourse(this.newCourse).subscribe(
      () => {
        this.getCourses();
        this.closeAddCourseModal();
        alert('Curso adicionado com sucesso!');
      },
      (error) => {
        console.error('Erro ao adicionar curso:', error);
        alert('Erro ao adicionar curso.');
      }
    );
  }

  updateCourse(): void {
    if (!this.selectedCourse.name || !this.selectedCourse.description || this.selectedCourse.instructors.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
  
    const coursePayload = {
      name: this.selectedCourse.name,
      description: this.selectedCourse.description,
      instructors: this.selectedCourse.instructors.map((instructor) => ({ id: instructor.id })), // Mapeia apenas os IDs dos instrutores
    };
  
    this.courseService.updateCourse(this.selectedCourse.id, coursePayload).subscribe(
      () => {
        this.getCourses();
        this.closeUpdateCourseModal();
        alert('Curso atualizado com sucesso!');
      },
      (error) => {
        console.error('Erro ao atualizar curso:', error);
        alert('Erro ao atualizar curso.');
      }
    );
  }
  

  openAddCourseModal(): void {
    this.newCourse = this.resetNewCourse();
    this.showAddCourseModal = true;
  }

  closeAddCourseModal(): void {
    this.newCourse = this.resetNewCourse();
    this.showAddCourseModal = false;
  }

  openUpdateCourseModal(course: CursoDTO): void {
    this.selectedCourse = { ...course };
    this.showUpdateCourseModal = true;
  }

  closeUpdateCourseModal(): void {
    this.selectedCourse = this.resetNewCourse();
    this.showUpdateCourseModal = false;
  }

  resetNewCourse(): CursoDTO {
    return {
      id: 0,
      name: '',
      description: '',
      creationDate: '',
      lastUpdateDate: '',
      students: [],
      admins: [],
      instructors: [],
      feedBacks: [],
      sections: [],
    };
  }
}