import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';
import { RevealDirective } from '../../core/reveal.directive';

type Plan = { id: 'free' | 'pro' | 'business'; name: string; monthly: number; yearly: number; blurb: string; hot?: boolean; items: { t: string; on: boolean }[] };

@Component({
  selector: 'app-pricing-page', standalone: true, imports: [CommonModule, RouterLink, RevealDirective],
  template: `
<div class="pg">
  <section class="pg-hero"><div class="pg-wrap">
    <span class="eyebrow">✦ Pricing</span>
    <h1>Simple pricing that <span class="grad-text">grows with you</span></h1>
    <p>Start free today. Paid plans are rolling out soon, so join the priority list and be first in line.</p>
    <div class="pg-toggle" role="group" aria-label="Billing period"><button type="button" [class.on]="!yearly" (click)="yearly=false">Monthly</button><button type="button" [class.on]="yearly" (click)="yearly=true">Yearly · save 20%</button></div>
  </div></section>
  <section class="pg-section"><div class="pg-wrap">
    <p class="success" *ngIf="message" role="status">{{ message }}</p><p class="error" *ngIf="error" role="alert">{{ error }}</p>
    <div class="pg-grid">
      <article class="pg-card pg-plan" appReveal *ngFor="let p of plans" [class.hot]="p.hot">
        <span class="tag" *ngIf="p.hot">MOST POPULAR</span>
        <h3>{{ p.name }}</h3><p>{{ p.blurb }}</p>
        <div class="amt">{{ price(p) === 0 ? '₹0' : '₹' + price(p) }}<small> / month</small></div>
        <ul><li *ngFor="let i of p.items" [class.no]="!i.on">{{ i.t }}</li></ul>
        <a *ngIf="p.id==='free'" routerLink="/signup" class="btn btn-secondary full">Start free</a>
        <button *ngIf="p.id!=='free'" type="button" class="btn btn-primary full" (click)="join(p)" [disabled]="busy===p.id">{{ busy===p.id ? 'Saving…' : 'Join priority list' }}</button>
      </article>
    </div>
    <p class="muted" style="text-align:center;margin-top:18px">Billing is not live yet. Joining the list reserves your spot, and you are never charged without confirming.</p>
  </div></section>
  <section class="pg-section"><div class="pg-wrap">
    <div class="pg-head"><h2>Compare plans</h2></div>
    <div class="pg-scroll"><table class="pg-table"><thead><tr><th>Feature</th><th>Free</th><th>Pro</th><th>Business</th></tr></thead>
      <tbody><tr *ngFor="let r of rows"><td>{{ r[0] }}</td><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td></tr></tbody></table></div>
  </div></section>
  <section class="pg-section"><div class="pg-wrap pg-faq" style="max-width:800px">
    <div class="pg-head"><h2>Questions</h2></div>
    <details *ngFor="let f of faqs"><summary>{{ f.q }}</summary><p>{{ f.a }}</p></details>
  </div></section>
</div>`
})
export class PricingPageComponent {
  yearly = false; busy = ''; message = ''; error = '';
  plans: Plan[] = [
    { id: 'free', name: 'Free', monthly: 0, yearly: 0, blurb: 'Everything you need to get started.', items: [
      { t: '3 saved resumes', on: true }, { t: '8 resume templates', on: true }, { t: 'PDF export', on: true }, { t: 'Learning hub', on: true }, { t: 'Limited AI requests', on: true }, { t: 'Priority support', on: false }] },
    { id: 'pro', name: 'Pro', monthly: 499, yearly: 399, hot: true, blurb: 'For active job seekers and creators.', items: [
      { t: 'Unlimited resumes', on: true }, { t: 'Higher AI limits', on: true }, { t: 'Cover letters & interview prep', on: true }, { t: 'Content planner', on: true }, { t: 'Email support', on: true }, { t: 'Team seats', on: false }] },
    { id: 'business', name: 'Business', monthly: 1499, yearly: 1199, blurb: 'For teams and small agencies.', items: [
      { t: 'Everything in Pro', on: true }, { t: 'Team workspace', on: true }, { t: 'Shared brand kits', on: true }, { t: 'Priority support', on: true }, { t: 'Custom onboarding', on: true }, { t: 'Admin controls', on: true }] }
  ];
  rows = [['Saved resumes', '3', 'Unlimited', 'Unlimited'], ['AI requests / day', 'Limited', 'High', 'Highest'], ['Cover letters & interview prep', '✓', '✓', '✓'], ['Content planner', '✓', '✓', '✓'], ['Team seats', '–', '–', '✓'], ['Support', 'Community', 'Email', 'Priority']];
  faqs = [
    { q: 'Can I really use Qorvexa for free?', a: 'Yes. The Free plan is available today with no credit card.' },
    { q: 'When will paid plans launch?', a: 'Billing is not connected yet. Priority-list members are notified first.' },
    { q: 'Will I be charged by joining the list?', a: 'No. It only records your interest.' },
    { q: 'Can I cancel anytime?', a: 'Yes, once paid plans launch you will be able to cancel any time.' }
  ];
  constructor(private readonly supabase: SupabaseService, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}
  price(p: Plan) { return this.yearly ? p.yearly : p.monthly; }
  async join(p: Plan) {
    this.message = ''; this.error = '';
    const user = await this.supabase.getUser();
    if (!user) { await this.router.navigate(['/signup']); return; }
    this.busy = p.id;
    try {
      const { error } = await this.supabase.client.from('plan_requests').upsert(
        { user_id: user.id, plan: p.id, billing_cycle: this.yearly ? 'yearly' : 'monthly' }, { onConflict: 'user_id,plan' });
      if (error) throw error;
      this.message = `You're on the ${p.name} priority list. We'll email you when it launches.`;
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not save your request.'; }
    finally { this.busy = ''; this.cdr.detectChanges(); }
  }
}
