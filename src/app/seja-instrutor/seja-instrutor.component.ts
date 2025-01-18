import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seja-instrutor',
  templateUrl: './seja-instrutor.component.html',
  styleUrl: './seja-instrutor.component.css'
})
export class SejaInstrutorComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
