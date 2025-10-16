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
  showPassword: boolean = false;
  selectedInstructorId: number | null = null;

  // Propriedades para o modal de confirmação
  showConfirmModal: boolean = false;
  confirmationType: 'delete' | 'logout' = 'delete';
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  private pendingAction: (() => void) | null = null;

  // Search filters
  searchUsuarios: string = '';
  searchEscolas: string = '';
  searchCursos: string = '';

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
    // Configurar o modal de confirmação
    this.confirmationType = 'logout';
    this.confirmationTitle = 'Sair da Plataforma';
    this.confirmationMessage = 'Tem certeza que deseja sair do painel administrativo? Você precisará fazer login novamente para acessar.';

    // Armazenar a ação pendente
    this.pendingAction = () => {
      this.authService.logout();
      this.router.navigate(['/login']);
    };

    // Exibir o modal
    this.showConfirmModal = true;
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
      schoolId: null as any,
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
      cpf: this.selectedUser.cpf
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
    this.showPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
    this.userService.getInstructors().subscribe(
      (response) => {
        this.instrutores = response;
      },
      (error) => {
        console.error('Erro ao buscar instrutores:', error);
        this.toastr.error('Erro ao carregar instrutores.', 'Erro');
      }
    );
  }

  addCourse(): void {
    if (!this.newCourse.name || !this.newCourse.description || !this.selectedInstructorId) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios, incluindo o instrutor.', 'Atenção');
      return;
    }

    const instructor = this.instrutores.find(i => i.id === Number(this.selectedInstructorId));
    if (!instructor) {
      this.toastr.error('Instrutor não encontrado.', 'Erro');
      return;
    }

    const coursePayload = {
      ...this.newCourse,
      instructors: [instructor]
    };

    this.courseService.addCourse(coursePayload).subscribe(
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
      this.toastr.warning('Por favor, preencha o título e a descrição do curso.', 'Atenção');
      return;
    }

    // Find the selected instructor from the list
    const instructor = this.selectedInstructorId ?
      this.instrutores.find(i => i.id === Number(this.selectedInstructorId)) :
      null;

    const coursePayload = {
      id: this.selectedCourse.id,
      name: this.selectedCourse.name,
      description: this.selectedCourse.description,
      instructors: instructor ? [instructor] : []
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
    this.getInstructors();
    this.newCourse = this.resetNewCourse();
    this.selectedInstructorId = null;
    this.showAddCourseModal = true;
  }

  openUpdateCourseModal(course: CursoDTO): void {
    this.getInstructors();
    this.selectedCourse = { ...course };
    const currentInstructor = course.instructors && course.instructors.length > 0 ? course.instructors[0] : null;
    this.selectedInstructorId = currentInstructor ? currentInstructor.id : null;
    this.showUpdateCourseModal = true;
  }

  closeAddCourseModal(): void {
    this.newCourse = this.resetNewCourse();
    this.selectedInstructorId = null;
    this.showAddCourseModal = false;
  }

  closeUpdateCourseModal(): void {
    this.selectedCourse = this.resetNewCourse();
    this.selectedInstructorId = null;
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

  addInstructorToCourse(): void {
    if (!this.selectedInstructorId) {
      this.toastr.warning('Por favor, selecione um instrutor.', 'Atenção');
      return;
    }

    const instructor = this.instrutores.find(i => i.id === this.selectedInstructorId);
    if (!instructor) {
      this.toastr.error('Instrutor não encontrado.', 'Erro');
      return;
    }

    // Verificar se o instrutor já foi adicionado
    const alreadyAdded = this.newCourse.instructors.some(i => i.id === instructor.id);
    if (alreadyAdded) {
      this.toastr.warning('Este instrutor já foi adicionado.', 'Atenção');
      return;
    }

    this.newCourse.instructors.push(instructor);
    this.selectedInstructorId = null;
    this.toastr.success('Instrutor adicionado!', 'Sucesso');
  }

  removeInstructor(index: number): void {
    this.newCourse.instructors.splice(index, 1);
    this.toastr.info('Instrutor removido.', 'Info');
  }

  deleteUser(user: UserDTO): void {
    this.confirmationType = 'delete';
    this.confirmationTitle = 'Remover Usuário';
    this.confirmationMessage = `Tem certeza que deseja remover o usuário "${user.name}"? Esta ação não pode ser desfeita e pode afetar dados relacionados.`;

    this.pendingAction = () => {
      this.userService.deleteUser(user.id).subscribe(
        () => {
          this.getUsers();
          this.toastr.success(`O usuário "${user.name}" foi removido com sucesso!`, 'Usuário Removido');
        },
        (error) => {
          console.error('Erro ao remover usuário:', error);
          this.toastr.error('Erro ao remover usuário. Verifique se o usuário possui vínculos.', 'Erro');
        }
      );
    };

    this.showConfirmModal = true;
  }

  deleteSchool(school: SchoolDTO): void {
    this.confirmationType = 'delete';
    this.confirmationTitle = 'Remover Escola';
    this.confirmationMessage = `Tem certeza que deseja remover a escola "${school.name}"? Esta ação não pode ser desfeita e pode afetar estudantes vinculados.`;

    this.pendingAction = () => {
      this.schoolService.deleteSchool(school.id).subscribe(
        () => {
          this.getSchools();
          this.toastr.success(`A escola "${school.name}" foi removida com sucesso!`, 'Escola Removida');
        },
        (error) => {
          console.error('Erro ao remover escola:', error);
          this.toastr.error('Erro ao remover escola. Verifique se a escola possui estudantes vinculados.', 'Erro');
        }
      );
    };

    this.showConfirmModal = true;
  }

  deleteCourse(course: CursoDTO): void {
    this.confirmationType = 'delete';
    this.confirmationTitle = 'Remover Curso';
    this.confirmationMessage = `Tem certeza que deseja remover o curso "${course.name}"? Esta ação não pode ser desfeita e afetará todos os alunos inscritos.`;

    this.pendingAction = () => {
      this.courseService.forceDeleteCourse(course.id).subscribe(
        () => {
          this.getCourses();
          this.toastr.success(`O curso "${course.name}" foi removido com sucesso!`, 'Curso Removido');
        },
        (error) => {
          console.error('Erro ao remover curso:', error);
          this.toastr.error('Erro ao remover curso. Tente novamente.', 'Erro');
        }
      );
    };

    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal = false;
  }

  cancelConfirmation(): void {
    this.pendingAction = null;
    this.showConfirmModal = false;
  }

  // Filter methods
  get filteredUsuarios(): UserDTO[] {
    if (!this.searchUsuarios.trim()) {
      return this.usuarios;
    }
    const search = this.searchUsuarios.toLowerCase();
    return this.usuarios.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  }

  get filteredEscolas(): SchoolDTO[] {
    if (!this.searchEscolas.trim()) {
      return this.escolas;
    }
    const search = this.searchEscolas.toLowerCase();
    return this.escolas.filter(escola =>
      escola.name.toLowerCase().includes(search) ||
      escola.email.toLowerCase().includes(search) ||
      escola.city.toLowerCase().includes(search) ||
      escola.federativeUnit.toLowerCase().includes(search)
    );
  }

  get filteredCursos(): CursoDTO[] {
    if (!this.searchCursos.trim()) {
      return this.cursos;
    }
    const search = this.searchCursos.toLowerCase();
    return this.cursos.filter(curso =>
      curso.name.toLowerCase().includes(search) ||
      curso.description.toLowerCase().includes(search) ||
      curso.instructors.some(inst => inst.name.toLowerCase().includes(search))
    );
  }
}
