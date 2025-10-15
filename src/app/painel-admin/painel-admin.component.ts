import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../common/service/user.service';
import { SchoolDTO } from '../common/dto/SchoolDTO';
import { UserDTO } from '../common/dto/UserDTO';
import { CursoDTO } from '../common/dto/CursoDTO';
import { SchoolService } from '../common/service/school.service';
import { CourseService } from '../common/service/course.service';
import { UserRole } from '../common/dto/UserRole';
import { AuthService } from '../common/service/auth.service';
import { ToastrService } from 'ngx-toastr';

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
    private courseService: CourseService,
    private authService: AuthService,
    private toastr: ToastrService
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
        this.toastr.warning('Por favor, selecione o tipo de usuário.', 'Atenção');
        return;
    }

    const userPayload = {
        ...this.newUser,
        role: this.newUser.role,
        school: this.newUser.role === 'STUDENT' ? { id: this.newUser.schoolId } : null,
    };

    let addUserObservable;
    if (['ADMINISTRATOR', 'INSTRUCTOR'].includes(this.newUser.role)) {
        addUserObservable = this.userService.addUser(userPayload);
    } else if (this.newUser.role === 'STUDENT') {
        addUserObservable = this.userService.addUser(userPayload);
    } else {
        this.toastr.error('Papel do usuário inválido.', 'Erro');
        return;
    }

    addUserObservable.subscribe(
        () => {
            this.getUsers();
            this.closeUserModals();
            this.toastr.success('Usuário adicionado com sucesso.', 'Sucesso');
        },
        (error) => {
            console.error('Erro ao adicionar usuário:', error);
            this.toastr.error('Erro ao adicionar usuário.', 'Erro');
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
    if (!this.selectedUser.name || !this.selectedUser.email) {
      this.toastr.warning('Por favor, preencha os campos obrigatórios.', 'Atenção');
      return;
    }

    const userPayload = {
      id: this.selectedUser.id,
      name: this.selectedUser.name,
      email: this.selectedUser.email,
    };

    this.userService.updateUser(userPayload).subscribe(
      () => {
        this.getUsers();
        this.closeUserModals();
        this.toastr.success('Usuário atualizado com sucesso!', 'Sucesso');
      },
      (error) => {
        console.error('Erro ao atualizar usuário:', error);
        this.toastr.error('Erro ao atualizar usuário.', 'Erro');
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
    if (!this.newSchool.name || !this.newSchool.email) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.', 'Atenção');
      return;
    }

    this.schoolService.addSchool(this.newSchool).subscribe(
      () => {
        this.getSchools();
        this.toggleNewSchoolModal();
        this.toastr.success('Escola cadastrada com sucesso!', 'Sucesso');
      },
      (error) => {
        console.error('Erro ao cadastrar escola:', error);
        this.toastr.error('Erro ao cadastrar escola.', 'Erro');
      }
    );
  }

  updateSchool(): void {
    if (!this.selectedSchool.name || !this.selectedSchool.city || !this.selectedSchool.federativeUnit) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.', 'Atenção');
      return;
    }

    this.schoolService.updateSchool(this.selectedSchool).subscribe(
      () => {
        this.getSchools();
        this.closeSchoolModal();
        this.toastr.success('Escola atualizada com sucesso!', 'Sucesso');
      },
      (error) => {
        console.error('Erro ao atualizar escola:', error);
        this.toastr.error('Erro ao atualizar escola.', 'Erro');
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
        description: course.description || 'Descrição não disponível',
        instructors: course.instructors || [],
      }));
    },
    (error) => {
      console.error('Erro ao buscar cursos:', error);
      this.toastr.error('Erro ao buscar cursos.', 'Erro');
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
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.', 'Atenção');
      return;
    }

    this.courseService.addCourse(this.newCourse).subscribe(
      () => {
        this.getCourses();
        this.closeAddCourseModal();
        this.toastr.success('Curso adicionado com sucesso!', 'Sucesso');
      },
      (error) => {
        console.error('Erro ao adicionar curso:', error);
        this.toastr.error('Erro ao adicionar curso.', 'Erro');
      }
    );
  }

  updateCourse(): void {
    if (!this.selectedCourse.name || !this.selectedCourse.description) {
      this.toastr.warning('Por favor, preencha os campos obrigatórios.', 'Atenção');
      return;
    }

    const coursePayload = {
      name: this.selectedCourse.name,
      description: this.selectedCourse.description,
    };

    this.courseService.updateCourse(this.selectedCourse.id, coursePayload).subscribe(
      () => {
        this.getCourses();
        this.closeUpdateCourseModal();
        this.toastr.success('Curso atualizado com sucesso!', 'Sucesso');
      },
      (error) => {
        console.error('Erro ao atualizar curso:', error);
        this.toastr.error('Erro ao atualizar curso.', 'Erro');
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
