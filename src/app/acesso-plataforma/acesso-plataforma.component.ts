import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acesso-plataforma',
  templateUrl: './acesso-plataforma.component.html',
  styleUrl: './acesso-plataforma.component.css'
})
export class AcessoPlataformaComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
