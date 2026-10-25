import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  productsOpen = false;
  accountOpen = false;
  notificationsOpen = false;
  isLoggedIn = false;
  searchQuery = '';
  displayName = 'Your account';
  userInitial = 'Q';
  private authSubscription?: { unsubscribe: () => void };

  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {}

  async ngOnInit() {
    const { data } = this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session?.user;
      this.setUser(session?.user);
    });
    this.authSubscription = data.subscription;
    try {
      const user = await this.supabase.getUser();
      this.isLoggedIn = !!user;
      this.setUser(user);
    } catch {
      this.isLoggedIn = false;
    }
  }

  private setUser(user: any) {
    if (!user) return;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Your account';
    this.displayName = String(name).replace(/[._-]+/g, ' ');
    this.userInitial = this.displayName.trim().charAt(0).toUpperCase() || 'Q';
  }

  ngOnDestroy() { this.authSubscription?.unsubscribe(); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.products-item, .account-wrap, .notification-wrap')) return;
    this.productsOpen = false; this.accountOpen = false; this.notificationsOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.productsOpen = false; this.accountOpen = false; this.notificationsOpen = false; }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  toggleProducts(event: Event) { event.stopPropagation(); this.productsOpen = !this.productsOpen; this.accountOpen = false; this.notificationsOpen = false; }
  toggleAccount() { this.accountOpen = !this.accountOpen; this.productsOpen = false; this.notificationsOpen = false; }
  toggleNotifications() { this.notificationsOpen = !this.notificationsOpen; this.productsOpen = false; this.accountOpen = false; }
  closeMenu() { this.menuOpen = false; this.productsOpen = false; this.accountOpen = false; this.notificationsOpen = false; }
  inputValue(event: Event) { return (event.target as HTMLInputElement).value; }

  async submitSearch(event: Event) {
    event.preventDefault();
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return;
    this.closeMenu();
    if (/resume|cv|ats|career/.test(query)) await this.router.navigate(['/resume']);
    else if (/learn|course|lesson|skill|training/.test(query)) await this.router.navigate(['/learn']);
    else if (/market|social|caption|hashtag|content/.test(query)) await this.router.navigate(['/marketing']);
    else if (/profile|account|setting/.test(query)) await this.router.navigate(['/profile']);
    else await this.router.navigate(['/products']);
  }

  async logout() {
    const { error } = await this.supabase.signOut();
    if (error) return;
    this.isLoggedIn = false;
    this.closeMenu();
    await this.router.navigate(['/']);
  }
}
