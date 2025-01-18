import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthInterceptor} from "./common/interceptors/AuthInterceptor";

export const APP_PROVIDERS = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
];
