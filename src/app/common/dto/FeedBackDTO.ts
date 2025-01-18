class UserDTO {
}

export interface FeedBackDTO {
  id: number;
  student: UserDTO;
  courseId: number;
  comment: string;
}
