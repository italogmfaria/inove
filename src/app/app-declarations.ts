import {AppComponent} from "./app.component";
import {AcessoPlataformaComponent} from "./acesso-plataforma/acesso-plataforma.component";
import {AguardeComponent} from "./aguarde/aguarde.component";
import {CadastroEscolaComponent} from "./cadastro-escola/cadastro-escola.component";
import {CadastroInstrutorComponent} from "./cadastro-instrutor/cadastro-instrutor.component";
import {CadastroSecaoComponent} from "./cadastro-secao/cadastro-secao.component";
import {CursosComponent} from "./cursos/cursos.component";
import {InicialComponent} from "./inicial/inicial.component";
import {LoginComponent} from "./login/login.component";
import {PainelAdminComponent} from "./painel-admin/painel-admin.component";
import {PainelCursoComponent} from "./painel-curso/painel-curso.component";
import {PainelInstrutorComponent} from "./painel-instrutor/painel-instrutor.component";
import {PerfilUsuarioComponent} from "./perfil-usuario/perfil-usuario.component";
import {PreviewCursoComponent} from "./preview-curso/preview-curso.component";
import {SejaInstrutorComponent} from "./seja-instrutor/seja-instrutor.component";
import { SafeUrlPipe } from "./common/pipes/safe-url.pipe";
import { CadastroEstudanteComponent } from "./cadastro-estudante/cadastro-estudante.component";

export const APP_DECLARATIONS = [
  AppComponent,
  AcessoPlataformaComponent,
  AguardeComponent,
  CadastroEscolaComponent,
  CadastroInstrutorComponent,
  CadastroSecaoComponent,
  CursosComponent,
  InicialComponent,
  LoginComponent,
  PainelAdminComponent,
  PainelCursoComponent,
  PainelInstrutorComponent,
  PerfilUsuarioComponent,
  PreviewCursoComponent,
  SejaInstrutorComponent,
  CadastroEstudanteComponent,
  SafeUrlPipe
];
