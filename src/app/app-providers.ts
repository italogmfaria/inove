import {LoginService} from "./common/service/login.service";
import {CourseService} from "./common/service/course.service";
import {AuthService} from "./common/service/auth.service";

export const APP_PROVIDERS = [
  LoginService,
  CourseService,
  AuthService
];
