import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Qorvexa';
  showWorkspaceFooter = true;
  private routeSubscription?: Subscription;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const update = (url: string) => {
      const path = url.split('?')[0];
      this.showWorkspaceFooter = !(/^\/(dashboard|career|resume(?:\/|$)|marketing|profile|admin)/.test(path));
    };
    update(this.router.url);
    this.routeSubscription = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => update(event.urlAfterRedirects));
  }

  ngOnDestroy(): void { this.routeSubscription?.unsubscribe(); }
}
