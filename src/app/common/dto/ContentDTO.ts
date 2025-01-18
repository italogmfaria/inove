import {ContentType} from "./ContentType";

export interface ContentDTO {
  id: number;
  description: string;
  title: string;
  contentType: ContentType;
  fileUrl: string;
  fileName: string;
  sectionId: number;
}
