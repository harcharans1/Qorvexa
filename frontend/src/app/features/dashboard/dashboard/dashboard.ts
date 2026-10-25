import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';

type ActivityItem = { id: string; title: string; detail: string; date: string; route: string; kind: 'resume' | 'course' | 'marketing'; status?: string };

@Component({
  selector: 'app-dashboard', standalone: true, imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html', styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  name = 'there';
  email = '';
  avatarUrl = '';
  plan = 'Free';
  loading = true;
  error = '';
  searchTerm = '';
  showNotifications = false;
  darkMode = false;
  resumeCount = 0;
  draftCount = 0;
  plannedCount = 0;
  publishedCount = 0;
  courseCount = 0;
  completedLessons = 0;
  atsReviewCount: number | null = null;
  recentActivity: ActivityItem[] = [];

  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.darkMode = this.readThemePreference();
    try {
      const user = await this.supabase.getUser();
      if (!user) {
        this.error = 'Your session could not be verified. Please sign in again.';
        return;
      }
      this.name = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'there';
      this.email = user.email || '';
      this.avatarUrl = user.user_metadata?.['avatar_url'] || '';

      const db = this.supabase.client;
      const [profile, resumes, drafts, enrollments, progress, subscription, recentResumes, recentDrafts] = await Promise.all([
        db.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle(),
        db.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        db.from('marketing_drafts').select('id,status', { count: 'exact' }).eq('user_id', user.id),
        db.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        db.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
        db.from('subscriptions').select('plan,status').eq('user_id', user.id).maybeSingle(),
        db.from('resumes').select('id,title,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(4),
        db.from('marketing_drafts').select('id,title,platform,status,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(4)
      ]);

      if (profile.data?.full_name) this.name = profile.data.full_name;
      if (profile.data?.avatar_url) this.avatarUrl = profile.data.avatar_url;
      this.resumeCount = resumes.count ?? 0;
      this.draftCount = drafts.count ?? 0;
      this.plannedCount = (drafts.data || []).filter((d: any) => d.status === 'Planned').length;
      this.publishedCount = (drafts.data || []).filter((d: any) => d.status === 'Published').length;
      this.courseCount = enrollments.count ?? 0;
      this.completedLessons = progress.count ?? 0;
      if (subscription.data?.plan && subscription.data.status !== 'cancelled' && subscription.data.status !== 'expired') {
        this.plan = subscription.data.plan.charAt(0).toUpperCase() + subscription.data.plan.slice(1);
      }

      const activities: ActivityItem[] = [];
      for (const r of (recentResumes.data || []) as any[]) {
        activities.push({ id: `resume-${r.id}`, title: r.title || 'Untitled Resume', detail: 'Resume updated', date: r.updated_at, route: `/resume/${r.id}`, kind: 'resume' });
      }
      for (const d of (recentDrafts.data || []) as any[]) {
        activities.push({ id: `marketing-${d.id}`, title: d.title || `${d.platform || 'Social'} draft`, detail: `${d.platform || 'Marketing'} · ${d.status || 'Draft'}`, date: d.updated_at, route: '/marketing', kind: 'marketing', status: d.status });
      }
      this.recentActivity = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

      const failures = [resumes, drafts, enrollments, progress].filter(result => result.error);
      if (failures.length) this.error = 'Some dashboard data could not be loaded. Check the table permissions and Supabase connection.';
    } catch {
      this.error = 'Dashboard data could not be loaded. Check your Supabase configuration and try refreshing.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get filteredActivity(): ActivityItem[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.recentActivity;
    return this.recentActivity.filter(item => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(q));
  }

  get firstName(): string { return this.name.split(' ')[0] || this.name; }
  get initials(): string { return this.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'Q'; }
  get formattedToday(): string { return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()); }
  formatDate(value: string): string { return value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value)) : ''; }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    try { localStorage.setItem('qorvexa-dashboard-theme', this.darkMode ? 'dark' : 'light'); } catch { /* Storage may be unavailable. */ }
  }
  private readThemePreference(): boolean {
    try { return localStorage.getItem('qorvexa-dashboard-theme') === 'dark'; } catch { return false; }
  }
}
