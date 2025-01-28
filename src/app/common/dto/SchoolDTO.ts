import {UserDTO} from "./UserDTO";

export interface SchoolDTO {
  id: number;
  name: string;
  city: string;
  email: string;
  // password: string;
  federativeUnit: string;
  students: UserDTO[];
}
