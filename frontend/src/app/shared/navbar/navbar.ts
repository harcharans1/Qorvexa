import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../core/supabase.service';

@Component({ selector: 'app-navbar', standalone: true, imports: [CommonModule, RouterLink, RouterLinkActive], templateUrl: './navbar.html', styleUrl: './navbar.css' })
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  isLoggedIn = false;
  private authSubscription?: { unsubscribe: () => void };

  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {}

  async ngOnInit() {
    this.isLoggedIn = !!(await this.supabase.getUser());
    const { data } = this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session?.user;
    });
    this.authSubscription = data.subscription;
  }

  ngOnDestroy() { this.authSubscription?.unsubscribe(); }
  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  async logout() {
    const { error } = await this.supabase.signOut();
    if (error) return;
    this.isLoggedIn = false;
    this.closeMenu();
    await this.router.navigate(['/']);
  }
}
