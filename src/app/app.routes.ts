import { Routes } from '@angular/router';
import { InicialComponent } from "./inicial/inicial.component";
import { LoginComponent } from "./login/login.component";
import { CursosComponent } from "./cursos/cursos.component";
import { PerfilUsuarioComponent } from "./perfil-usuario/perfil-usuario.component";
import { PainelCursoComponent } from "./painel-curso/painel-curso.component";
import { PreviewCursoComponent } from "./preview-curso/preview-curso.component";
import { PainelAdminComponent } from "./painel-admin/painel-admin.component";
import { PainelInstrutorComponent } from "./painel-instrutor/painel-instrutor.component";
import { CadastroEscolaComponent } from "./cadastro-escola/cadastro-escola.component";
import { CadastroSecaoComponent } from "./cadastro-secao/cadastro-secao.component";
import { CadastroInstrutorComponent } from "./cadastro-instrutor/cadastro-instrutor.component";
import { AcessoPlataformaComponent } from "./acesso-plataforma/acesso-plataforma.component";
import { AguardeComponent } from "./aguarde/aguarde.component";
import { SejaInstrutorComponent } from "./seja-instrutor/seja-instrutor.component";
import { CadastroEstudanteComponent } from './cadastro-estudante/cadastro-estudante.component';
import { EsqueciSenhaComponent } from './esqueci-senha/esqueci-senha.component';
import { VerificarCodigoComponent } from './verificar-codigo/verificar-codigo.component';
import { RedefinirSenhaComponent } from './redefinir-senha/redefinir-senha.component';
import { AuthGuard } from './common/guards/auth.guard';
import { LoggedInGuard } from './common/guards/logged-in.guard';

export const routes: Routes = [
  { path: '', component: InicialComponent },
  { path: 'confirmar-instrutor', component: InicialComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'verificar-codigo', component: VerificarCodigoComponent },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent },
  { path: 'cursos', component: CursosComponent },
  { path: 'perfil-usuario', component: PerfilUsuarioComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'painel-curso/:courseId', component: PainelCursoComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'preview-curso/:id', component: PreviewCursoComponent },
  { path: 'painel-admin', component: PainelAdminComponent, canActivate: [AuthGuard], data: { role: 'ADMINISTRATOR' } },
  { path: 'painel-instrutor', component: PainelInstrutorComponent, canActivate: [AuthGuard], data: { role: 'INSTRUCTOR' } },
  { path: 'cadastro-escola', component: CadastroEscolaComponent },
  { path: 'cadastro-secao/:id', component: CadastroSecaoComponent, canActivate: [AuthGuard], data: { role: 'INSTRUCTOR' } },
  { path: 'cadastro-instrutor', component: CadastroInstrutorComponent },
  { path: 'cadastro-estudante', component: CadastroEstudanteComponent },
  { path: 'acesso-plataforma', component: AcessoPlataformaComponent },
  { path: 'aguarde', component: AguardeComponent },
  { path: 'seja-instrutor', component: SejaInstrutorComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
