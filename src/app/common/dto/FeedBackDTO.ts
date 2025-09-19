import { UserDTO } from "./UserDTO";
import { CursoDTO } from "./CursoDTO";

export interface FeedBackDTO {
  id: number;
  student: UserDTO;
  course?: CursoDTO;
  courseId?: number;
  comment: string;
}
