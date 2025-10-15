import { Component, OnInit, QueryList, ViewChildren, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verificar-codigo.component.html',
  styleUrl: './verificar-codigo.component.css'
})
export class VerificarCodigoComponent implements OnInit, OnDestroy {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  email: string = '';
  codeDigits: string[] = ['', '', '', '', '', ''];
  isLoading: boolean = false;
  isResending: boolean = false;
  canResend: boolean = false;
  countdown: number = 60;
  private countdownInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Obter e-mail dos parâmetros da rota
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.toastr.error('E-mail não encontrado. Redirecionando...', 'Erro');
        this.router.navigate(['/esqueci-senha']);
      }
    });

    // Iniciar contagem regressiva
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown(): void {
    this.canResend = false;
    this.countdown = 60;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  onInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover tudo que não é número
    value = value.replace(/[^0-9]/g, '');

    // Se tiver mais de 1 caractere, pegar apenas o último
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    // Atualizar o input e o array
    input.value = value;
    this.codeDigits[index] = value;

    // Se digitou um número, mover para o próximo campo
    if (value && index < 5) {
      const inputs = this.codeInputs.toArray();
      setTimeout(() => {
        inputs[index + 1]?.nativeElement.focus();
      }, 0);
    }
  }

  onFocus(event: any): void {
    // Selecionar o conteúdo do campo ao focar
    const input = event.target as HTMLInputElement;
    setTimeout(() => {
      input.select();
    }, 0);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const inputs = this.codeInputs.toArray();

    // Backspace
    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        // Se o campo está vazio, volta pro anterior
        event.preventDefault();
        this.codeDigits[index - 1] = '';
        inputs[index - 1].nativeElement.value = '';
        inputs[index - 1].nativeElement.focus();
      } else {
        // Se tem valor, permite o backspace deletar
        setTimeout(() => {
          this.codeDigits[index] = input.value;
        }, 0);
      }
    }

    // Delete
    if (event.key === 'Delete') {
      setTimeout(() => {
        input.value = '';
        this.codeDigits[index] = '';
      }, 0);
    }

    // Arrow Left
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputs[index - 1].nativeElement.focus();
    }

    // Arrow Right
    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      inputs[index + 1].nativeElement.focus();
    }

    // Se digitar um número em um campo que já tem valor, substituir
    if (/^[0-9]$/.test(event.key) && input.value) {
      input.value = '';
      this.codeDigits[index] = '';
    }
  }

  onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').replace(/[^0-9]/g, '') || '';

    if (pastedData.length > 0) {
      const inputs = this.codeInputs.toArray();

      for (let i = 0; i < pastedData.length && (index + i) < 6; i++) {
        this.codeDigits[index + i] = pastedData[i];
        inputs[index + i].nativeElement.value = pastedData[i];
      }

      // Focar no próximo campo vazio ou no último
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputs[nextIndex].nativeElement.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.codeDigits.every(digit => digit !== '');
  }

  verificarCodigo(): void {
    if (!this.isCodeComplete()) {
      this.toastr.warning('Por favor, digite o código completo.', 'Atenção');
      return;
    }

    const code = this.codeDigits.join('');
    this.isLoading = true;

    // Simular verificação de código (substituir por chamada real à API)
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Código verificado com sucesso!', 'Sucesso');
      // Navegar para redefinir senha
      this.router.navigate(['/redefinir-senha'], {
        queryParams: {
          email: this.email,
          code: code
        }
      });
    }, 1500);
  }

  reenviarCodigo(): void {
    this.isResending = true;

    // Simular reenvio de código (substituir por chamada real à API)
    setTimeout(() => {
      this.isResending = false;
      this.toastr.success('Código reenviado para seu e-mail!', 'Sucesso');
      this.codeDigits = ['', '', '', '', '', ''];
      this.startCountdown();

      // Limpar e focar no primeiro input
      setTimeout(() => {
        const inputs = this.codeInputs.toArray();
        inputs.forEach(input => input.nativeElement.value = '');
        if (inputs.length > 0) {
          inputs[0].nativeElement.focus();
        }
      }, 100);
    }, 1500);
  }

  voltarEmail(): void {
    this.router.navigate(['/esqueci-senha']);
  }
}
