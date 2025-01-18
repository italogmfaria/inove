import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-instrutor',
  templateUrl: './cadastro-instrutor.component.html',
  styleUrl: './cadastro-instrutor.component.css'
})
export class CadastroInstrutorComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
