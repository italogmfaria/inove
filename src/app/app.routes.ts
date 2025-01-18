import {Routes} from '@angular/router';
import {InicialComponent} from "./inicial/inicial.component";
import {LoginComponent} from "./login/login.component";
import {CursosComponent} from "./cursos/cursos.component";
import {PerfilUsuarioComponent} from "./perfil-usuario/perfil-usuario.component";
import {PainelCursoComponent} from "./painel-curso/painel-curso.component";
import {PreviewCursoComponent} from "./preview-curso/preview-curso.component";
import {PainelAdminComponent} from "./painel-admin/painel-admin.component";
import {PainelInstrutorComponent} from "./painel-instrutor/painel-instrutor.component";
import {CadastroEscolaComponent} from "./cadastro-escola/cadastro-escola.component";
import {CadastroSecaoComponent} from "./cadastro-secao/cadastro-secao.component";
import {PainelEscolaComponent} from "./painel-escola/painel-escola.component";
import {CadastroInstrutorComponent} from "./cadastro-instrutor/cadastro-instrutor.component";
import {AcessoPlataformaComponent} from "./acesso-plataforma/acesso-plataforma.component";
import {AguardeComponent} from "./aguarde/aguarde.component";
import {SejaInstrutorComponent} from "./seja-instrutor/seja-instrutor.component";

export const routes: Routes = [
  {path: '', component: InicialComponent},
  {path: 'login', component: LoginComponent},
  {path: 'cursos', component: CursosComponent},
  {path: 'perfil-usuario', component: PerfilUsuarioComponent},
  {path: 'painel-curso', component: PainelCursoComponent},
  {path: 'preview-curso/:id', component: PreviewCursoComponent},
  {path: 'painel-admin', component: PainelAdminComponent},
  {path: 'painel-instrutor', component: PainelInstrutorComponent},
  {path: 'cadastro-escola', component: CadastroEscolaComponent},
  {path: 'cadastro-secao', component: CadastroSecaoComponent},
  {path: 'painel-escola', component: PainelEscolaComponent},
  {path: 'cadastro-instrutor', component: CadastroInstrutorComponent},
  {path: 'acesso-plataforma', component: AcessoPlataformaComponent},
  {path: 'aguarde', component: AguardeComponent},
  {path: 'seja-instrutor', component: SejaInstrutorComponent},
  {path: '**', redirectTo: '', pathMatch: 'full'}
];

