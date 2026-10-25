import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

type Kind = 'cover-letter' | 'interview' | 'linkedin' | 'follow-up';
type Saved = { kind: Kind; role: string; text: string; at: string };

@Component({
  selector: 'app-career-hub', standalone: true, imports: [CommonModule, FormsModule],
  template: `
<div class="pg"><section class="pg-hero" style="padding-bottom:30px"><div class="pg-wrap"><span class="eyebrow">✦ Career AI</span>
  <h1>Your personal <span class="grad-text">career assistant</span></h1><p>Cover letters, interview practice, LinkedIn writing and follow-ups, drafted in seconds.</p></div></section>
<section class="pg-section" style="padding-top:10px"><div class="pg-wrap">
  <div class="pg-tabs" role="tablist"><button *ngFor="let t of tools" role="tab" [class.on]="kind===t.id" (click)="select(t.id)">{{ t.icon }} {{ t.label }}</button></div>
  <div class="pg-split">
    <form class="pg-card pg-form" (ngSubmit)="generate()">
      <h3>{{ current.label }}</h3><p class="muted">{{ current.help }}</p>
      <label for="k-role">Target role *</label><input id="k-role" name="role" [(ngModel)]="role" maxlength="160" placeholder="e.g. Frontend Developer">
      <label for="k-company">Company <small class="muted">(optional)</small></label><input id="k-company" name="company" [(ngModel)]="company" maxlength="160" placeholder="e.g. Acme Corp">
      <label for="k-bg">Your background / key skills</label><textarea id="k-bg" name="bg" rows="4" [(ngModel)]="background" maxlength="5000" placeholder="Experience, achievements, skills (only true facts)"></textarea>
      <label for="k-jd" *ngIf="kind!=='linkedin'">Job description <small class="muted">(optional)</small></label><textarea id="k-jd" *ngIf="kind!=='linkedin'" name="jd" rows="4" [(ngModel)]="jobDescription" maxlength="8000"></textarea>
      <label for="k-tone">Tone</label><select id="k-tone" name="tone" [(ngModel)]="tone"><option>Professional</option><option>Friendly</option><option>Bold</option><option>Innovative</option></select>
      <p class="error" *ngIf="error" role="alert">{{ error }}</p>
      <button class="btn btn-primary full" type="submit" [disabled]="loading" style="margin-top:14px">{{ loading ? 'Writing…' : 'Generate with AI ✦' }}</button>
    </form>
    <div class="pg-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3 style="margin:0">Result</h3>
        <div class="actions"><button class="btn btn-secondary" type="button" (click)="copy()" [disabled]="!output">{{ copied ? 'Copied ✓' : 'Copy' }}</button><button class="btn btn-secondary" type="button" (click)="download()" [disabled]="!output">Download .txt</button></div></div>
      <div class="skeleton" *ngIf="loading" style="height:220px;margin-top:16px"></div>
      <pre class="pg-out" *ngIf="!loading" style="margin-top:16px">{{ output || 'Your AI draft will appear here. Always review and personalise it before sending.' }}</pre>
      <p class="muted" *ngIf="output" style="font-size:.85rem">{{ wordCount }} words · AI drafts can contain mistakes, so verify every claim.</p>
    </div>
  </div>
  <div *ngIf="history.length" style="margin-top:34px"><h3>Recent drafts <button class="link-button" style="display:inline;margin-left:10px" (click)="clearHistory()">Clear</button></h3>
    <div class="pg-grid"><button type="button" class="pg-card" style="text-align:left;cursor:pointer" *ngFor="let h of history" (click)="load(h)"><b>{{ label(h.kind) }}</b><p>{{ h.role }} · {{ h.at | date:'short' }}</p></button></div></div>
</div></section></div>`
})
export class CareerHubComponent implements OnInit {
  tools: { id: Kind; label: string; icon: string; help: string }[] = [
    { id: 'cover-letter', label: 'Cover letter', icon: '✉', help: 'A tailored letter using your real background.' },
    { id: 'interview', label: 'Interview prep', icon: '❓', help: 'Likely questions with strong sample answers.' },
    { id: 'linkedin', label: 'LinkedIn bio', icon: 'in', help: 'A headline and About section that gets noticed.' },
    { id: 'follow-up', label: 'Follow-up email', icon: '↩', help: 'A polite post-interview thank-you or follow-up.' }
  ];
  kind: Kind = 'cover-letter'; role = ''; company = ''; background = ''; jobDescription = ''; tone = 'Professional';
  output = ''; loading = false; error = ''; copied = false; history: Saved[] = [];
  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}
  get current() { return this.tools.find(t => t.id === this.kind)!; }
  get wordCount() { return this.output.trim().split(/\s+/).filter(Boolean).length; }
  ngOnInit() { try { this.history = JSON.parse(localStorage.getItem('qorvexa-career-history') || '[]'); } catch { this.history = []; } }
  select(k: Kind) { this.kind = k; this.output = ''; this.error = ''; }
  label(k: Kind) { return this.tools.find(t => t.id === k)?.label || k; }
  async generate() {
    this.error = ''; this.copied = false;
    if (!this.role.trim()) { this.error = 'Please enter the target role.'; return; }
    this.loading = true;
    try {
      const r = await this.api.post<{ text: string }>('ai/career', { kind: this.kind, role: this.role.trim(), company: this.company.trim(), background: this.background.trim(), jobDescription: this.jobDescription.trim(), tone: this.tone });
      this.output = r.text;
      this.history = [{ kind: this.kind, role: this.role.trim(), text: r.text, at: new Date().toISOString() }, ...this.history].slice(0, 6);
      try { localStorage.setItem('qorvexa-career-history', JSON.stringify(this.history)); } catch { /* storage unavailable */ }
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not generate. Please try again.'; }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }
  load(h: Saved) { this.kind = h.kind; this.role = h.role; this.output = h.text; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  clearHistory() { this.history = []; try { localStorage.removeItem('qorvexa-career-history'); } catch { /* ignore */ } }
  async copy() { try { await navigator.clipboard.writeText(this.output); this.copied = true; setTimeout(() => { this.copied = false; this.cdr.detectChanges(); }, 1800); } catch { this.error = 'Clipboard blocked. Select the text and copy manually.'; } }
  download() {
    const url = URL.createObjectURL(new Blob([this.output], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = `${this.kind}-${this.role.replace(/\W+/g, '-').toLowerCase() || 'draft'}.txt`; a.click(); URL.revokeObjectURL(url);
  }
}
