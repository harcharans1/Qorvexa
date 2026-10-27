import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './workspace-layout.html',
  styleUrl: './workspace-layout.css'
})
export class WorkspaceLayoutComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authSubscription?: { unsubscribe: () => void };
  private routeSubscription?: Subscription;

  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = !!(await this.supabase.getUser());
    const { data } = this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session?.user;
    });
    this.authSubscription = data.subscription;
    this.routeSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      // Keep the shell mounted while only the child route changes.
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  async openFeature(path: string): Promise<void> {
    if (!this.isLoggedIn) {
      await this.router.navigate(['/login'], { queryParams: { returnUrl: path } });
      return;
    }
    await this.router.navigateByUrl(path);
  }
}
