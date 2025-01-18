import {UserDTO} from "./UserDTO";
import {FeedBackDTO} from "./FeedBackDTO";
import {SectionDTO} from "./SectionDTO";

export interface CursoDTO {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  lastUpdateDate: string;
  students: UserDTO[];
  admins: UserDTO[];
  instructors: UserDTO[];
  feedBacks: FeedBackDTO[];
  sections: SectionDTO[];
}
