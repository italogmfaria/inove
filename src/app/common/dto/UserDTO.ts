import {CursoDTO} from "./CursoDTO";
import {UserRole} from "./UserRole";
import {SchoolDTO} from "./SchoolDTO";

export interface UserDTO {
  id: number;
  name: string;
  cpf: string;
  email: string;
  password: string;
  birthDate: Date;
  schoolId?: number;
  school?: SchoolDTO;
  studentCourses: CursoDTO[];
  adminCourses: CursoDTO[];
  instructorCourses: CursoDTO[];
  role: UserRole;
}

