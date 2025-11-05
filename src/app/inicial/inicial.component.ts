import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InstructorService } from '../common/service/instructor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inicial',
  templateUrl: './inicial.component.html',
  styleUrls: ['./inicial.component.css']
})
export class InicialComponent implements OnInit {
  isMenuOpen = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private instructorService: InstructorService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Verifica se há um token de confirmação de instrutor na URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      // Verifica se está na rota de confirmação ou se tem o parâmetro action
      const isConfirmRoute = this.router.url.includes('confirmar-instrutor');
      const action = params['action'];

      if (token && (isConfirmRoute || action === 'confirmar-instrutor')) {
        this.confirmInstructor(token);
      }
    });
  }

  confirmInstructor(token: string): void {
    this.instructorService.confirmInstructor(token).subscribe({
      next: (response) => {
        // Extrai o nome do instrutor da resposta, se disponível
        const instructorName = this.extractNameFromResponse(response);
        const message = instructorName
          ? `Instrutor ${instructorName} cadastrado com sucesso!`
          : 'Instrutor cadastrado com sucesso!';

        this.toastr.success(message, 'Sucesso');

        // Remove os parâmetros da URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      },
      error: (error) => {
        console.error('Erro ao confirmar instrutor:', error);

        // Tratamento por STATUS HTTP
        if (error.status === 0) {
          this.toastr.error('Não foi possível conectar ao servidor. Verifique sua conexão.', 'Erro de Conexão');
        }
        else if (error.status === 400) {
          // Extrai a mensagem de erro do back-end
          let errorMessage = '';

          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          if (errorMessage.includes('já foi confirmado') ||
              errorMessage.includes('ja foi confirmado')) {
            this.toastr.warning('Este instrutor já foi confirmado anteriormente.', 'Já Confirmado');
          }
          else if (errorMessage.includes('E-mail já cadastrado') ||
              errorMessage.includes('e-mail') && errorMessage.includes('cadastrado')) {
            this.toastr.error('O e-mail informado já está cadastrado no sistema.', 'E-mail Duplicado');
          }
          else if (errorMessage.includes('CPF já cadastrado') ||
                   errorMessage.includes('cpf') && errorMessage.includes('cadastrado')) {
            this.toastr.error('O CPF informado já está cadastrado no sistema.', 'CPF Duplicado');
          }
          else if (errorMessage.includes('Token expirado') ||
                   errorMessage.includes('expirado')) {
            this.toastr.error('O link de confirmação expirou. Solicite um novo cadastro.', 'Link Expirado');
          }
          else if (errorMessage.includes('solicitação de cadastro') ||
                   errorMessage.includes('solicitação')) {
            this.toastr.warning(errorMessage, 'Solicitação Pendente');
          }
          else {
            const message = errorMessage || 'Verifique os dados e tente novamente.';
            this.toastr.warning(message, 'Erro de Validação');
          }
        }
        else if (error.status === 404) {
          this.toastr.error('Link de confirmação não encontrado ou inválido.', 'Não Confirmado');
        }
        else if (error.status === 409) {
          this.toastr.warning('Este instrutor já foi confirmado anteriormente.', 'Já Confirmado');
        }
        else if (error.status === 410) {
          this.toastr.error('O link de confirmação expirou. Solicite um novo cadastro.', 'Link Expirado');
        }
        else if (error.status >= 500) {
          this.toastr.error(
            'Ocorreu um erro no servidor. Tente novamente mais tarde.',
            'Erro no Servidor'
          );
        }
        else {
          const errorMessage = error.error?.message || error.error || '';
          const message = typeof errorMessage === 'string' && errorMessage ? errorMessage : 'Não foi possível confirmar o cadastro.';
          this.toastr.error(message, 'Erro');
        }

        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  extractNameFromResponse(response: string): string | null {
    const match = response.match(/Bem-vindo,?\s+([^!]+)/i) ||
                  response.match(/Instrutor\s+([^!]+)\s+cadastrado/i);
    return match ? match[1].trim() : null;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateAndCloseMenu(path: string) {
    this.navigateTo(path);
    this.isMenuOpen = false;
  }
}
