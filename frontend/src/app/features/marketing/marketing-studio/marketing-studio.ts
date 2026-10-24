import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-marketing-studio', standalone: true,
  imports: [CommonModule, FormsModule], templateUrl: './marketing-studio.html', styleUrl: './marketing-studio.css'
})
export class MarketingStudioComponent implements OnInit {
  topic = ''; tone = 'Professional'; platform = 'LinkedIn'; generated = '';
  loading = false; saving = false; draftsLoading = true; message = ''; error = '';
  scheduledAt = ''; drafts: any[] = [];
  constructor(private readonly api: ApiService, private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() { await this.loadDrafts(); }

  async loadDrafts() {
    this.draftsLoading = true;
    try {
      const user = await this.supabase.getUser();
      if (user) {
        const { data, error } = await this.supabase.client.from('marketing_drafts').select('id,title,content,platform,status,scheduled_at,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
        if (error) throw error;
        this.drafts = data || [];
      }
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not load saved drafts.'; }
    finally { this.draftsLoading = false; this.cdr.detectChanges(); }
  }

  async generate() {
    this.error = ''; this.message = ''; this.generated = '';
    if (this.topic.trim().length < 3) { this.error = 'Please enter a topic with at least 3 characters.'; return; }
    this.loading = true;
    try {
      const data = await this.api.post<{ caption: string }>('ai/caption', {
        topic: this.topic.trim(), tone: this.tone, platform: this.platform
      });
      this.generated = data.caption;
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not generate caption. Check your API setup.';
    } finally { this.loading = false; }
  }

  async saveDraft() {
    this.error = ''; this.message = '';
    if (!this.generated.trim()) return;
    const user = await this.supabase.getUser();
    if (!user) { this.error = 'Please sign in again to save this draft.'; return; }
    this.saving = true;
    try {
      const { error } = await this.supabase.client.from('marketing_drafts').insert({
        user_id: user.id, title: this.topic.trim().slice(0, 120), content: this.generated,
        platform: this.platform, status: this.scheduledAt ? 'Planned' : 'Draft',
        scheduled_at: this.scheduledAt ? new Date(this.scheduledAt).toISOString() : null
      });
      if (error) throw error;
      this.message = this.scheduledAt ? 'Post saved to your content calendar. (Publishing is not connected.)' : 'Draft saved to your account.';
      this.scheduledAt = '';
      await this.loadDrafts();
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not save draft.'; }
    finally { this.saving = false; }
  }

  async deleteDraft(id: string) {
    const user = await this.supabase.getUser();
    if (!user || !confirm('Delete this saved draft?')) return;
    const { error } = await this.supabase.client.from('marketing_drafts').delete().eq('id', id).eq('user_id', user.id);
    if (error) { this.error = error.message; return; }
    this.drafts = this.drafts.filter(d => d.id !== id);
    this.message = 'Draft deleted.';
  }

  async copy() {
    try { await navigator.clipboard.writeText(this.generated); this.message = 'Caption copied.'; }
    catch { this.error = 'Clipboard access was blocked. Select and copy the caption manually.'; }
  }
}
