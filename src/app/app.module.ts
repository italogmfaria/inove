import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";

import {APP_PROVIDERS} from "./app-providers";
import {AppComponent} from "./app.component";
import {APP_DECLARATIONS} from "./app-declarations";
import {APP_IMPORTS} from "./app-imports";

@NgModule({
  declarations: [
    APP_DECLARATIONS
  ],
  imports: [
    APP_IMPORTS
  ],
  providers: APP_PROVIDERS,
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
}
