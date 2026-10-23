import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({ selector: 'app-legal-page', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './legal-page.html', styleUrl: './legal-page.css' })
export class LegalPageComponent {
  page: 'privacy' | 'terms';
  constructor(route: ActivatedRoute) { this.page = route.snapshot.data['page'] === 'terms' ? 'terms' : 'privacy'; }
}
