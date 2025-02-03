import {RouterModule, RouterOutlet} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {routes} from "./app.routes";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import { PdfViewerModule } from "ng2-pdf-viewer";


export const APP_IMPORTS = [
  RouterModule.forRoot(routes, {useHash: false}),
  BrowserModule,
  CommonModule,
  FormsModule,
  HttpClientModule,
  RouterOutlet,
  PdfViewerModule
];
