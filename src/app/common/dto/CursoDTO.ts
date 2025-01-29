import { UserDTO } from "./UserDTO";
import { FeedBackDTO } from "./FeedBackDTO";
import { SectionDTO } from "./SectionDTO";

export interface CursoDTO {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  lastUpdateDate: string;
  students: UserDTO[];
  admins: UserDTO[];
  instructors: UserDTO[];  // ✅ Certifica que instrutores são do tipo UserDTO
  feedBacks: FeedBackDTO[];
  sections: SectionDTO[];
}
