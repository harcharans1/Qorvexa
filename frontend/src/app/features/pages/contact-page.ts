import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-contact-page', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="pg">
  <section class="pg-hero"><div class="pg-wrap"><span class="eyebrow">✦ Contact</span>
    <h1>We'd love to <span class="grad-text">hear from you</span></h1><p>Questions, feedback or need help? Send a message and we will reply as soon as we can.</p></div></section>
  <section class="pg-section"><div class="pg-wrap pg-split">
    <form class="pg-card pg-form" (ngSubmit)="send()" *ngIf="!sent; else thanks">
      <div class="pg-two"><div><label for="c-name">Name</label><input id="c-name" name="name" [(ngModel)]="name" maxlength="100" required autocomplete="name"></div>
      <div><label for="c-email">Email</label><input id="c-email" name="email" type="email" [(ngModel)]="email" maxlength="200" required autocomplete="email"></div></div>
      <label for="c-topic">Topic</label>
      <select id="c-topic" name="topic" [(ngModel)]="topic"><option>General question</option><option>Technical support</option><option>Feedback</option><option>Partnership</option><option>Billing</option></select>
      <label for="c-msg">Message <small class="muted">({{ message.length }}/2000)</small></label>
      <textarea id="c-msg" name="message" rows="6" [(ngModel)]="message" maxlength="2000" required placeholder="How can we help?"></textarea>
      <p class="error" *ngIf="error" role="alert">{{ error }}</p>
      <button class="btn btn-primary full" type="submit" [disabled]="busy" style="margin-top:14px">{{ busy ? 'Sending…' : 'Send message →' }}</button>
    </form>
    <ng-template #thanks><div class="pg-card" style="text-align:center"><span class="pg-ico" style="margin:0 auto">✓</span><h3>Message sent</h3><p>Thanks {{ name }}, we will reply to {{ email }} soon.</p><button class="btn btn-secondary" style="margin-top:16px" (click)="reset()">Send another</button></div></ng-template>
    <div style="display:grid;gap:16px">
      <div class="pg-card"><span class="pg-ico">✉</span><h3>Email</h3><p><a href="mailto:hello&#64;qorvexa.com?subject=Qorvexa%20Support">hello&#64;qorvexa.com</a></p></div>
      <div class="pg-card"><span class="pg-ico">⏱</span><h3>Response time</h3><p>We usually reply within one to two business days.</p></div>
      <div class="pg-card"><span class="pg-ico">?</span><h3>Quick answers</h3><p>Check <a routerLink="/pricing">Pricing</a> and <a routerLink="/features">Features</a> for common questions.</p></div>
    </div>
  </div></section>
</div>`
})
export class ContactPageComponent implements OnInit {
  name = ''; email = ''; topic = 'General question'; message = ''; busy = false; sent = false; error = '';
  private userId: string | null = null;
  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}
  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) { this.userId = user.id; this.email = user.email || ''; this.name = user.user_metadata?.['full_name'] || ''; this.cdr.detectChanges(); }
  }
  reset() { this.sent = false; this.message = ''; }
  async send() {
    this.error = '';
    if (!this.name.trim() || !/^\S+@\S+\.\S+$/.test(this.email.trim()) || this.message.trim().length < 10) { this.error = 'Please add your name, a valid email and a message of at least 10 characters.'; return; }
    this.busy = true;
    try {
      const { error } = await this.supabase.client.from('contact_messages').insert({
        name: this.name.trim(), email: this.email.trim().toLowerCase(), topic: this.topic, message: this.message.trim(), user_id: this.userId });
      if (error) throw error;
      this.sent = true;
    } catch (e) { this.error = (e instanceof Error ? e.message : 'Could not send your message.') + ' You can also email hello@qorvexa.com.'; }
    finally { this.busy = false; this.cdr.detectChanges(); }
  }
}
