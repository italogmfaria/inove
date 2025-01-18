import {ContentDTO} from "./ContentDTO";

export interface SectionDTO {
  id: number;
  title: string;
  description: string;
  courseId: number;
  contents: ContentDTO[];
}
