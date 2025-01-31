import {LoginService} from "./common/service/login.service";
import {CourseService} from "./common/service/course.service";
import {AuthService} from "./common/service/auth.service";
import { SectionService } from "./common/service/section.service";
import { ContentService } from "./common/service/content.service";
import { SchoolService } from "./common/service/school.service";
import { StudentService } from "./common/service/student.service";

export const APP_PROVIDERS = [
  LoginService,
  CourseService,
  AuthService,
  SectionService,
  ContentService,
  SchoolService,
  StudentService
];
