import {RouterModule, RouterOutlet} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {routes} from "./app.routes";
import {HttpClientModule} from "@angular/common/http";


export const APP_IMPORTS = [
  RouterModule.forRoot(routes, {useHash: false}),
  BrowserModule,
  CommonModule,
  FormsModule,
  HttpClientModule,
  RouterOutlet
];
