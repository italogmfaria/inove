import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../common/service/user.service';
import { SchoolDTO } from '../common/dto/SchoolDTO';
import { UserDTO } from '../common/dto/UserDTO';
import { CursoDTO } from '../common/dto/CursoDTO';
import { SchoolService } from '../common/service/school.service';
import { CourseService } from '../common/service/course.service';
import { UserRole } from '../common/dto/UserRole';
import { AuthService } from '../common/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CpfValidator } from '../common/validators/cpf.validator';

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

  // Reactive Forms
  addUserForm!: FormGroup;
  updateUserForm!: FormGroup;
  addSchoolForm!: FormGroup;
  updateSchoolForm!: FormGroup;
  addCourseForm!: FormGroup;
  updateCourseForm!: FormGroup;


  constructor(
    private router: Router,
    private userService: UserService,
    private schoolService: SchoolService,
    private courseService: CourseService,
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder
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
      this.authService.logout().subscribe({
        next: () => {
          this.toastr.success('Você foi desconectado com sucesso!', 'Logout Realizado');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.toastr.error('Erro ao fazer logout. Tente novamente.', 'Erro');
          console.error('Erro no logout:', err);
        }
      });
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

    let userPayload: any;

    if (this.newUser.role === 'STUDENT') {
        if (!this.newUser.schoolId) {
            this.toastr.warning('Por favor, selecione uma escola para o estudante.', 'Atenção');
            return;
        }
        userPayload = {
            name: this.newUser.name,
            email: this.newUser.email,
            cpf: this.newUser.cpf,
            password: this.newUser.password,
            birthDate: this.newUser.birthDate,
            school: {
                id: this.newUser.schoolId
            },
            role: 'STUDENT'
        };
    } else {
        userPayload = {
            name: this.newUser.name,
            email: this.newUser.email,
            cpf: this.newUser.cpf,
            password: this.newUser.password,
            role: this.newUser.role
        };
    }

    this.userService.addUser(userPayload).subscribe(
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
    this.addUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, CpfValidator.validate]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.STUDENT, [Validators.required]],
      schoolId: [null]
    });

    this.addUserForm.valueChanges.subscribe(values => {
      this.newUser.name = values.name;
      this.newUser.email = values.email;
      this.newUser.cpf = values.cpf;
      this.newUser.password = values.password;
      this.newUser.role = values.role;
      this.newUser.schoolId = values.schoolId;
    });

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
    this.updateUserForm = this.fb.group({
      name: [user.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: [user.email || '', [Validators.required, Validators.email]],
      cpf: [user.cpf || '', [CpfValidator.validate]]
    });

    // Subscribe to form value changes to update selectedUser
    this.updateUserForm.valueChanges.subscribe(values => {
      this.selectedUser.name = values.name;
      this.selectedUser.email = values.email;
      this.selectedUser.cpf = values.cpf;
    });

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
    this.addSchoolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      federativeUnit: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });

    this.addSchoolForm.valueChanges.subscribe(values => {
      this.newSchool.name = values.name;
      this.newSchool.email = values.email;
      this.newSchool.city = values.city;
      this.newSchool.federativeUnit = values.federativeUnit;
    });

    this.showNewSchoolModal = !this.showNewSchoolModal;
  }

  toggleSchoolModal(school: SchoolDTO): void {
    this.selectedSchool = { ...school };
    this.updateSchoolForm = this.fb.group({
      name: [school.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      email: [school.email || '', [Validators.required, Validators.email]],
      city: [school.city || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      federativeUnit: [school.federativeUnit || '', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });

    // Subscribe to form value changes to update selectedSchool
    this.updateSchoolForm.valueChanges.subscribe(values => {
      this.selectedSchool.name = values.name;
      this.selectedSchool.email = values.email;
      this.selectedSchool.city = values.city;
      this.selectedSchool.federativeUnit = values.federativeUnit;
    });

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
      name: this.newCourse.name,
      description: this.newCourse.description,
      instructors: [{
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role
      }]
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

    // Find the selected instructor from the list if one is selected
    const instructor = this.selectedInstructorId ?
      this.instrutores.find(i => i.id === Number(this.selectedInstructorId)) :
      null;

    const coursePayload = {
      name: this.selectedCourse.name,
      description: this.selectedCourse.description,
      instructors: instructor ? [{
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role
      }] : []
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
    this.addCourseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      instructorId: [null, [Validators.required]]
    });

    // Subscribe to form value changes to update newCourse
    this.addCourseForm.valueChanges.subscribe(values => {
      this.newCourse.name = values.name;
      this.newCourse.description = values.description;
      this.selectedInstructorId = values.instructorId;
    });

    this.showAddCourseModal = true;
  }

  openUpdateCourseModal(course: CursoDTO): void {
    this.getInstructors();
    this.selectedCourse = { ...course };
    const currentInstructor = course.instructors && course.instructors.length > 0 ? course.instructors[0] : null;
    this.selectedInstructorId = currentInstructor ? currentInstructor.id : null;
    this.updateCourseForm = this.fb.group({
      name: [course.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: [course.description || '', [Validators.required, Validators.maxLength(255)]],
      instructorId: [this.selectedInstructorId]
    });

    // Subscribe to form value changes to update selectedCourse
    this.updateCourseForm.valueChanges.subscribe(values => {
      this.selectedCourse.name = values.name;
      this.selectedCourse.description = values.description;
      this.selectedInstructorId = values.instructorId;
    });

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
      this.courseService.deleteCourse(course.id).subscribe(
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

  // Métodos de validação
  getErrorMessage(fieldName: string, formType: 'user' | 'school' | 'course'): string {
    let form: FormGroup | undefined;

    if (formType === 'user') {
      form = this.showAddUserModal ? this.addUserForm : this.updateUserForm;
    } else if (formType === 'school') {
      form = this.showNewSchoolModal ? this.addSchoolForm : this.updateSchoolForm;
    } else if (formType === 'course') {
      form = this.showAddCourseModal ? this.addCourseForm : this.updateCourseForm;
    }

    const field = form?.get(fieldName);

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

  isFieldInvalid(fieldName: string, formType: 'user' | 'school' | 'course'): boolean {
    let form: FormGroup | undefined;

    if (formType === 'user') {
      form = this.showAddUserModal ? this.addUserForm : this.updateUserForm;
    } else if (formType === 'school') {
      form = this.showNewSchoolModal ? this.addSchoolForm : this.updateSchoolForm;
    } else if (formType === 'course') {
      form = this.showAddCourseModal ? this.addCourseForm : this.updateCourseForm;
    }

    const field = form?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
