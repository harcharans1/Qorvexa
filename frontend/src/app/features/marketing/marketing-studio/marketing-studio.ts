import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { SupabaseService } from '../../../core/supabase.service';

type StudioTab = 'create' | 'drafts' | 'calendar' | 'brand';
interface MarketingDraft {
  id: string;
  title?: string | null;
  content: string;
  platform: string;
  status: string;
  scheduled_at?: string | null;
  created_at?: string | null;
}

@Component({
  selector: 'app-marketing-studio', standalone: true,
  imports: [CommonModule, FormsModule], templateUrl: './marketing-studio.html', styleUrl: './marketing-studio.css'
})
export class MarketingStudioComponent implements OnInit {
  topic = '';
  tone = 'Professional';
  platform = 'LinkedIn';
  language = 'English';
  contentType = 'Caption';
  goal = 'Build brand awareness';
  audience = '';
  callToAction = '';
  brandName = '';
  brandDescription = '';
  generated = '';
  loading = false;
  saving = false;
  draftsLoading = true;
  message = '';
  error = '';
  scheduledAt = '';
  activeTab: StudioTab = 'create';
  draftSearch = '';
  filterPlatform = 'All';
  filterStatus = 'All';
  drafts: MarketingDraft[] = [];
  readonly defaultSchedule = this.getDefaultSchedule();

  constructor(private readonly api: ApiService, private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.loadBrandKit();
    await this.loadDrafts();
  }

  get plannedCount(): number { return this.drafts.filter(d => d.status === 'Planned').length; }
  get publishedCount(): number { return this.drafts.filter(d => d.status === 'Published').length; }
  get platformsUsed(): number { return new Set(this.drafts.map(d => d.platform).filter(Boolean)).size; }
  get platformInitial(): string { return (this.platform || 'Q').slice(0, 1).toUpperCase(); }
  get previewHashtags(): string[] {
    return (this.generated.match(/#[\p{L}\p{N}_]+/gu) || []).slice(0, 6);
  }
  get filteredDrafts(): MarketingDraft[] {
    const q = this.draftSearch.trim().toLowerCase();
    return this.drafts.filter(d =>
      (this.filterPlatform === 'All' || d.platform === this.filterPlatform) &&
      (this.filterStatus === 'All' || (d.status || 'Draft') === this.filterStatus) &&
      (!q || `${d.title || ''} ${d.content || ''} ${d.platform || ''}`.toLowerCase().includes(q))
    );
  }
  get plannedDrafts(): MarketingDraft[] {
    return this.drafts.filter(d => d.status === 'Planned' && !!d.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
  }

  setTab(tab: StudioTab) {
    this.activeTab = tab;
    this.error = '';
    this.message = '';
  }

  async loadDrafts() {
    this.draftsLoading = true;
    try {
      const user = await this.supabase.getUser();
      if (user) {
        const { data, error } = await this.supabase.client.from('marketing_drafts')
          .select('id,title,content,platform,status,scheduled_at,created_at')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        this.drafts = (data || []) as MarketingDraft[];
      } else {
        this.drafts = [];
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not load saved drafts.';
    } finally {
      this.draftsLoading = false;
      this.cdr.detectChanges();
    }
  }

  async generate() {
    this.error = '';
    this.message = '';
    if (this.topic.trim().length < 3) { this.error = 'Please enter a topic with at least 3 characters.'; return; }
    this.loading = true;
    try {
      const topicWithBrand = [
        this.topic.trim(),
        this.brandName.trim() ? `Brand name: ${this.brandName.trim()}` : '',
        this.brandDescription.trim() ? `Brand context: ${this.brandDescription.trim()}` : ''
      ].filter(Boolean).join('\n');
      const data = await this.api.post<{ caption: string }>('ai/caption', {
        topic: topicWithBrand,
        tone: this.tone,
        platform: this.platform,
        language: this.language,
        contentType: this.contentType,
        goal: this.goal,
        audience: this.audience.trim(),
        callToAction: this.callToAction.trim()
      });
      this.generated = data.caption || '';
      if (!this.generated.trim()) this.error = 'The AI returned an empty response. Please try again.';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not generate content. Check your API setup.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async saveDraft() {
    this.error = '';
    this.message = '';
    if (!this.generated.trim()) { this.error = 'Generate content before saving a draft.'; return; }
    const user = await this.supabase.getUser();
    if (!user) { this.error = 'Please sign in again to save this draft.'; return; }
    if (this.scheduledAt && Number.isNaN(new Date(this.scheduledAt).getTime())) {
      this.error = 'Please choose a valid planning date and time.';
      return;
    }
    this.saving = true;
    try {
      const { error } = await this.supabase.client.from('marketing_drafts').insert({
        user_id: user.id,
        title: this.topic.trim().slice(0, 120) || `${this.platform} ${this.contentType}`,
        content: this.generated,
        platform: this.platform,
        status: this.scheduledAt ? 'Planned' : 'Draft',
        scheduled_at: this.scheduledAt ? new Date(this.scheduledAt).toISOString() : null
      });
      if (error) throw error;
      this.message = this.scheduledAt
        ? 'Post saved to your content planner. Automatic publishing is not connected.'
        : 'Draft saved to your account.';
      this.scheduledAt = '';
      await this.loadDrafts();
      this.activeTab = 'drafts';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not save this draft.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  useDraft(draft: MarketingDraft) {
    this.topic = draft.title || '';
    this.platform = draft.platform || 'LinkedIn';
    this.generated = draft.content || '';
    this.scheduledAt = '';
    this.activeTab = 'create';
    this.message = 'Draft loaded into the preview. Edit the topic or regenerate to create a new version.';
    this.error = '';
  }

  async deleteDraft(id: string) {
    const user = await this.supabase.getUser();
    if (!user || !confirm('Delete this saved draft? This cannot be undone.')) return;
    try {
      const { error } = await this.supabase.client.from('marketing_drafts').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      this.drafts = this.drafts.filter(d => d.id !== id);
      this.message = 'Draft deleted.';
      this.error = '';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not delete this draft.';
    }
  }

  async copy() { await this.copyDraft(this.generated); }

  async copyDraft(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      this.message = 'Content copied to clipboard.';
      this.error = '';
    } catch {
      this.error = 'Clipboard access was blocked. Select and copy the content manually.';
    }
  }

  saveBrandKit() {
    try {
      localStorage.setItem('qorvexa-marketing-brand-kit', JSON.stringify({
        brandName: this.brandName, brandDescription: this.brandDescription,
        audience: this.audience, tone: this.tone, language: this.language
      }));
      this.message = 'Brand kit saved in this browser.';
      this.error = '';
    } catch {
      this.error = 'Could not save brand preferences in this browser.';
    }
  }

  private loadBrandKit() {
    try {
      const saved = localStorage.getItem('qorvexa-marketing-brand-kit');
      if (!saved) return;
      const kit = JSON.parse(saved);
      this.brandName = kit.brandName || '';
      this.brandDescription = kit.brandDescription || '';
      this.audience = kit.audience || '';
      this.tone = kit.tone || 'Professional';
      this.language = kit.language || 'English';
    } catch { /* Ignore invalid local preferences and keep defaults. */ }
  }

  private getDefaultSchedule(): string {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
}
