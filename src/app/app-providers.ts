import {LoginService} from "./common/service/login.service";
import {CourseService} from "./common/service/course.service";
import {AuthService} from "./common/service/auth.service";
import { SectionService } from "./common/service/section.service";
import { ContentService } from "./common/service/content.service";

export const APP_PROVIDERS = [
  LoginService,
  CourseService,
  AuthService,
  SectionService,
  ContentService
];
