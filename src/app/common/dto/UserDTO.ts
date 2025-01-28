import {CursoDTO} from "./CursoDTO";
import {UserRole} from "./UserRole";

export interface UserDTO {
  id: number;
  name: string;
  cpf: string;
  email: string;
  password: string;
  birthDate: Date;
  schoolId: number;
  studentCourses: CursoDTO[];
  adminCourses: CursoDTO[];
  instructorCourses: CursoDTO[];
  role: UserRole;
}

