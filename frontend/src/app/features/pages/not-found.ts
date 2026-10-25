import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found', standalone: true, imports: [RouterLink],
  template: `<section class="pg-404"><div><div class="big grad-text">404</div><h2>This page took a wrong turn</h2><p class="muted">The page you are looking for does not exist or has moved.</p>
  <div class="pg-actions"><a routerLink="/" class="btn btn-primary">Back to home</a><a routerLink="/dashboard" class="btn btn-secondary">Go to dashboard</a></div></div></section>`
})
export class NotFoundComponent {}
