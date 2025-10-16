import {RouterModule, RouterOutlet} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {routes} from "./app.routes";
import {HttpClientModule} from "@angular/common/http";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';


export const APP_IMPORTS = [
  RouterModule.forRoot(routes, {useHash: false}),
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  RouterOutlet,
  PdfViewerModule,
  NgxMaskDirective,
  NgxMaskPipe,
  ToastrModule.forRoot({
    timeOut: 3000,
    positionClass: 'toast-top-right',
    preventDuplicates: true,
  })
];
