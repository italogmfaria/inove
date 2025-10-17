import { Component, OnInit, QueryList, ViewChildren, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PasswordRecoveryService } from '../common/service/password-recovery.service';

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
    private toastr: ToastrService,
    private passwordRecoveryService: PasswordRecoveryService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.toastr.error('E-mail não encontrado. Redirecionando...', 'Erro');
        this.router.navigate(['/esqueci-senha']);
      }
    });

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

    value = value.replace(/[^0-9]/g, '');

    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    input.value = value;
    this.codeDigits[index] = value;

    if (value && index < 5) {
      const inputs = this.codeInputs.toArray();
      setTimeout(() => {
        inputs[index + 1]?.nativeElement.focus();
      }, 0);
    }
  }

  onFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    setTimeout(() => {
      input.select();
    }, 0);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const inputs = this.codeInputs.toArray();

    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        event.preventDefault();
        this.codeDigits[index - 1] = '';
        inputs[index - 1].nativeElement.value = '';
        inputs[index - 1].nativeElement.focus();
      } else {
        setTimeout(() => {
          this.codeDigits[index] = input.value;
        }, 0);
      }
    }

    if (event.key === 'Delete') {
      setTimeout(() => {
        input.value = '';
        this.codeDigits[index] = '';
      }, 0);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputs[index - 1].nativeElement.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      inputs[index + 1].nativeElement.focus();
    }

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

    this.passwordRecoveryService.verifyRecoveryCode(this.email, code).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Código verificado com sucesso!', 'Sucesso');
        this.router.navigate(['/redefinir-senha'], {
          queryParams: {
            email: this.email,
            code: code
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao verificar código:', error);
        this.toastr.error('Código inválido ou expirado.', 'Erro');
        // Limpar os campos
        this.codeDigits = ['', '', '', '', '', ''];
        setTimeout(() => {
          const inputs = this.codeInputs.toArray();
          inputs.forEach(input => input.nativeElement.value = '');
          if (inputs.length > 0) {
            inputs[0].nativeElement.focus();
          }
        }, 100);
      }
    });
  }

  reenviarCodigo(): void {
    this.isResending = true;

    this.passwordRecoveryService.requestRecoveryCode(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.toastr.success('Código reenviado para seu e-mail!', 'Sucesso');
        this.codeDigits = ['', '', '', '', '', ''];
        this.startCountdown();

        setTimeout(() => {
          const inputs = this.codeInputs.toArray();
          inputs.forEach(input => input.nativeElement.value = '');
          if (inputs.length > 0) {
            inputs[0].nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        this.isResending = false;
        console.error('Erro ao reenviar código:', error);
        this.toastr.error('Erro ao reenviar código. Tente novamente.', 'Erro');
      }
    });
  }

  voltarEmail(): void {
    this.router.navigate(['/esqueci-senha']);
  }
}
