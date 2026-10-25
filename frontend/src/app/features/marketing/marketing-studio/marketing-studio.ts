import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-marketing-studio', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], templateUrl: './marketing-studio.html', styleUrl: './marketing-studio.css'
})
export class MarketingStudioComponent implements OnInit {
  topic = '';
  tone = 'Professional';
  platform = 'Instagram';
  contentType = 'Post Caption';
  audience = 'General Audience';
  language = 'English';
  callToAction = 'Get Started';
  keywords = '';
  brandInfo = '';
  generated = '';
  loading = false;
  saving = false;
  draftsLoading = true;
  message = '';
  error = '';
  scheduledAt = '';
  drafts: any[] = [];
  activeTab = 'AI Content';
  brandName = 'Qorvexa';
  brandDescription = 'AI Tools for a Brighter You';
  brandVoice = 'Professional';
  brandLanguage = 'English';
  brandAudience = 'Everyone';
  brandSaved = false;
  showAdvanced = false;
  draftSearch = '';
  draftFilter = 'All';

  constructor(private readonly api: ApiService, private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.loadBrandKit();
    await this.loadDrafts();
  }

  get plannedCount() { return this.drafts.filter(d => /planned/i.test(d.status || '') || !!d.scheduled_at).length; }
  get publishedCount() { return this.drafts.filter(d => /published/i.test(d.status || '')).length; }
  get platformCount() { return new Set(this.drafts.map(d => d.platform).filter(Boolean)).size; }
  get hashtagText() { return '#' + (this.topic || 'Qorvexa').replace(/\s+/g, '') + ' #SocialMedia #ContentCreator #Marketing'; }
  get filteredDrafts() {
    const q = this.draftSearch.trim().toLowerCase();
    return this.drafts.filter(d => {
      const matchesQuery = !q || String(d.title || '').toLowerCase().includes(q) || String(d.content || '').toLowerCase().includes(q);
      const matchesFilter = this.draftFilter === 'All' || String(d.status || 'Draft').toLowerCase() === this.draftFilter.toLowerCase();
      return matchesQuery && matchesFilter;
    });
  }

  setTab(tab: string) { this.activeTab = tab; this.message = ''; this.error = ''; }
  selectPlatform(platform: string) { this.platform = platform; }

  private loadBrandKit() {
    try {
      const saved = localStorage.getItem('qorvexa-marketing-brand-kit');
      if (saved) {
        const kit = JSON.parse(saved);
        this.brandName = kit.brandName || this.brandName;
        this.brandDescription = kit.brandDescription || this.brandDescription;
        this.brandVoice = kit.brandVoice || this.brandVoice;
        this.brandLanguage = kit.brandLanguage || this.brandLanguage;
        this.brandAudience = kit.brandAudience || this.brandAudience;
        this.brandSaved = true;
      }
    } catch { /* Ignore invalid local brand preferences. */ }
  }

  saveBrandKit() {
    try {
      localStorage.setItem('qorvexa-marketing-brand-kit', JSON.stringify({
        brandName: this.brandName, brandDescription: this.brandDescription,
        brandVoice: this.brandVoice, brandLanguage: this.brandLanguage, brandAudience: this.brandAudience
      }));
      this.brandSaved = true;
      this.message = 'Brand Kit saved on this device.';
      this.error = '';
    } catch {
      this.error = 'Could not save Brand Kit in this browser.';
    }
  }

  async loadDrafts() {
    this.draftsLoading = true;
    try {
      const user = await this.supabase.getUser();
      if (user) {
        const { data, error } = await this.supabase.client.from('marketing_drafts').select('id,title,content,platform,status,scheduled_at,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
        if (error) throw error;
        this.drafts = data || [];
      } else {
        this.drafts = [];
      }
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not load saved drafts.'; }
    finally { this.draftsLoading = false; this.cdr.detectChanges(); }
  }

  async generate() {
    this.error = ''; this.message = ''; this.generated = '';
    if (this.topic.trim().length < 3) { this.error = 'Please enter a topic with at least 3 characters.'; return; }
    this.loading = true;
    try {
      const context = [
        this.topic.trim(),
        `Content type: ${this.contentType}`,
        `Target audience: ${this.audience}`,
        `Language: ${this.language}`,
        `Call to action: ${this.callToAction}`,
        this.keywords.trim() ? `Keywords: ${this.keywords.trim()}` : '',
        this.brandInfo.trim() ? `Brand information: ${this.brandInfo.trim()}` : '',
        `Brand name: ${this.brandName}`,
        `Brand description: ${this.brandDescription}`,
        `Brand voice: ${this.brandVoice}`,
        `Brand language: ${this.brandLanguage}`,
        `Brand audience: ${this.brandAudience}`
      ].filter(Boolean).join('\n');
      const data = await this.api.post<{ caption: string }>('ai/caption', {
        topic: context, tone: this.tone, platform: this.platform
      });
      this.generated = data.caption;
      this.activeTab = 'AI Content';
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
      this.message = this.scheduledAt ? 'Post saved to your content planner. Automatic publishing is not connected.' : 'Draft saved to your account.';
      this.scheduledAt = '';
      await this.loadDrafts();
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not save draft.'; }
    finally { this.saving = false; }
  }

  async markPublished(draft: any) {
    const user = await this.supabase.getUser();
    if (!user) { this.error = 'Please sign in again to update this post.'; return; }
    const { error } = await this.supabase.client.from('marketing_drafts').update({ status: 'Published', scheduled_at: null })
      .eq('id', draft.id).eq('user_id', user.id);
    if (error) { this.error = error.message; return; }
    this.drafts = this.drafts.map(d => d.id === draft.id ? { ...d, status: 'Published', scheduled_at: null } : d);
    this.message = 'Marked as published in Qorvexa. This does not publish to a social network.';
  }

  async deleteDraft(id: string) {
    const user = await this.supabase.getUser();
    if (!user || !confirm('Delete this saved draft?')) return;
    const { error } = await this.supabase.client.from('marketing_drafts').delete().eq('id', id).eq('user_id', user.id);
    if (error) { this.error = error.message; return; }
    this.drafts = this.drafts.filter(d => d.id !== id);
    this.message = 'Draft deleted.';
  }

  useDraft(draft: any) {
    this.topic = draft.title || '';
    this.generated = draft.content || '';
    this.platform = draft.platform || 'Instagram';
    this.activeTab = 'AI Content';
    this.message = 'Draft loaded into the editor.';
  }

  async copy() {
    try { await navigator.clipboard.writeText(this.generated); this.message = 'Caption copied.'; }
    catch { this.error = 'Clipboard access was blocked. Select and copy the caption manually.'; }
  }

  async copyText(text: string, label = 'Content') {
    try { await navigator.clipboard.writeText(text); this.message = `${label} copied.`; }
    catch { this.error = 'Clipboard access was blocked. Select and copy the text manually.'; }
  }
}
