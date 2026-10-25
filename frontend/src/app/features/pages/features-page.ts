import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../core/reveal.directive';

@Component({
  selector: 'app-features-page', standalone: true, imports: [CommonModule, RouterLink, RevealDirective],
  template: `
<div class="pg">
  <section class="pg-hero"><div class="pg-wrap">
    <span class="eyebrow">✦ Features</span>
    <h1>Everything you need to <span class="grad-text">grow your career</span></h1>
    <p>Resume building, AI career tools, structured learning and content planning, all in one connected workspace.</p>
    <div class="pg-actions"><a routerLink="/signup" class="btn btn-primary">Start free →</a><a routerLink="/pricing" class="btn btn-secondary">See pricing</a></div>
    <div class="pg-stats"><div><b>8</b><span>Resume templates</span></div><div><b>4</b><span>AI career tools</span></div><div><b>5</b><span>Social platforms</span></div><div><b>PDF</b><span>One-click export</span></div></div>
  </div></section>
  <section class="pg-section"><div class="pg-wrap">
    <div class="pg-head"><h2>Built for your next step</h2><p>Every tool saves to your account so you can pick up where you left off.</p></div>
    <div class="pg-grid">
      <a class="pg-card" appReveal *ngFor="let f of features" [routerLink]="f.link"><span class="pg-ico">{{ f.icon }}</span><h3>{{ f.title }}</h3><p>{{ f.text }}</p></a>
    </div>
  </div></section>
  <section class="pg-section"><div class="pg-wrap">
    <div class="pg-head"><h2>How it works</h2></div>
    <div class="pg-grid"><div class="pg-card" appReveal *ngFor="let s of steps; let i = index"><span class="pg-ico">{{ i + 1 }}</span><h3>{{ s.t }}</h3><p>{{ s.d }}</p></div></div>
  </div></section>
  <div class="pg-wrap"><section class="pg-cta"><h2>Ready to build your next chapter?</h2><p>Create a free account in under a minute.</p><div class="pg-actions"><a routerLink="/signup" class="btn">Get started free →</a></div></section></div>
</div>`
})
export class FeaturesPageComponent {
  features = [
    { icon: '▤', title: 'AI Resume Builder', text: 'Eight templates, live preview, AI summary and one-click PDF export.', link: '/resume' },
    { icon: '◎', title: 'ATS Job Match', text: 'Paste a job description and get keyword gaps and improvement ideas.', link: '/resume/new' },
    { icon: '✉', title: 'Cover Letter Writer', text: 'Tailored cover letters from your role, company and background.', link: '/career' },
    { icon: '❓', title: 'Interview Prep', text: 'Role-specific questions with model answers to practise with.', link: '/career' },
    { icon: '⌁', title: 'Learning Hub', text: 'Enroll in courses, watch lessons and track your progress.', link: '/learn' },
    { icon: '↗', title: 'Marketing Studio', text: 'Captions, hashtags and a content planner for every platform.', link: '/marketing' },
    { icon: '▦', title: 'Smart Dashboard', text: 'See resumes, courses and drafts at a glance with recent activity.', link: '/dashboard' },
    { icon: '◈', title: 'Brand Kit', text: 'Save brand voice, language and audience to keep content consistent.', link: '/marketing' },
    { icon: '♙', title: 'Secure Account', text: 'Row-level security keeps your data private to you.', link: '/profile' }
  ];
  steps = [
    { t: 'Create your account', d: 'Sign up free with email and password.' },
    { t: 'Pick a tool', d: 'Resume, learning, marketing or career AI.' },
    { t: 'Create and refine', d: 'Let AI draft, then edit until it sounds like you.' },
    { t: 'Save and share', d: 'Download a PDF or copy your content anywhere.' }
  ];
}
