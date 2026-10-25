import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../core/reveal.directive';

@Component({
  selector: 'app-about-page', standalone: true, imports: [CommonModule, RouterLink, RevealDirective],
  template: `
<div class="pg">
  <section class="pg-hero"><div class="pg-wrap">
    <span class="eyebrow">✦ About Qorvexa</span>
    <h1>Making useful AI <span class="grad-text">simple for everyone</span></h1>
    <p>Qorvexa brings career, learning and creative tools into one clear workspace, so progress feels achievable.</p>
  </div></section>
  <section class="pg-section"><div class="pg-wrap pg-grid">
    <div class="pg-card" appReveal *ngFor="let v of values"><span class="pg-ico">{{ v.icon }}</span><h3>{{ v.t }}</h3><p>{{ v.d }}</p></div>
  </div></section>
  <section class="pg-section"><div class="pg-wrap">
    <div class="pg-head"><h2>Our journey</h2></div>
    <div class="pg-grid"><div class="pg-card" appReveal *ngFor="let m of milestones"><b class="grad-text">{{ m.when }}</b><h3>{{ m.t }}</h3><p>{{ m.d }}</p></div></div>
  </div></section>
  <div class="pg-wrap"><section class="pg-cta"><h2>Join Qorvexa today</h2><p>Free to start. No credit card required.</p><div class="pg-actions"><a routerLink="/signup" class="btn">Create free account →</a><a routerLink="/contact" class="btn">Talk to us</a></div></section></div>
</div>`
})
export class AboutPageComponent {
  values = [
    { icon: '◎', t: 'Our mission', d: 'Make practical AI tools easy to reach for students, job seekers and creators.' },
    { icon: '✦', t: 'Honest by design', d: 'AI output is a draft. We tell you what is an estimate and never invent your credentials.' },
    { icon: '♙', t: 'Privacy first', d: 'Your work is stored with row-level security so only you can read it.' }
  ];
  milestones = [
    { when: 'Step 1', t: 'Resume tools', d: 'Templates, live preview, AI summary and PDF export.' },
    { when: 'Step 2', t: 'Learning hub', d: 'Courses, lessons and progress tracking.' },
    { when: 'Step 3', t: 'Marketing studio', d: 'AI captions, planner and brand kit.' },
    { when: 'Now', t: 'Career AI', d: 'Cover letters, interview prep and LinkedIn writing.' }
  ];
}
