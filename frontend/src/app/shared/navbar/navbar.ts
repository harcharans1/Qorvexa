import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

@Component({ selector: 'app-navbar', standalone: true, imports: [CommonModule, RouterLink, RouterLinkActive], templateUrl: './navbar.html', styleUrl: './navbar.css' })
export class NavbarComponent {
  menuOpen = false;
  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {}
  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }
  async logout() {
    await this.supabase.signOut();
    this.closeMenu();
    await this.router.navigate(['/']);
  }
}
