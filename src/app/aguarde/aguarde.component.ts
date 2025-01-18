import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aguarde',
  templateUrl: './aguarde.component.html',
  styleUrl: './aguarde.component.css'
})
export class AguardeComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
