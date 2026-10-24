import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
import jsPDF from 'jspdf';

type ResumeRecord = {
  id: string;
  title: string | null;
  content?: any;
  created_at?: string | null;
  updated_at?: string | null;
};

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './resume-list.html',
  styleUrl: './resume-list.css'
})
export class ResumeListComponent implements OnInit {
  resumes: ResumeRecord[] = [];
  loading = true;
  error = '';
  message = '';
  searchTerm = '';
  sortBy: 'latest' | 'oldest' | 'title' = 'latest';
  statusFilter: 'all' | 'complete' | 'needs-work' = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  deletingId = '';
  duplicatingId = '';
  downloadingId = '';
  favoriteIds = new Set<string>();
  private userId = '';

  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    try {
      const stored = localStorage.getItem('qorvexa_resume_favorites');
      if (stored) this.favoriteIds = new Set<string>(JSON.parse(stored));
    } catch { /* Ignore invalid local preference data. */ }
    await this.load();
  }

  async load() {
    this.loading = true; this.error = '';
    try {
      const user = await this.supabase.getUser();
      if (!user) { this.resumes = []; return; }
      this.userId = user.id;
      const { data, error } = await this.supabase.client
        .from('resumes')
        .select('id,title,content,created_at,updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      this.resumes = (data || []) as ResumeRecord[];
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not load resumes.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get filteredResumes(): ResumeRecord[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.resumes
      .filter(r => !term || (r.title || 'Untitled Resume').toLowerCase().includes(term))
      .filter(r => this.statusFilter === 'all' ||
        (this.statusFilter === 'complete' ? this.completeness(r) >= 3 : this.completeness(r) < 3))
      .sort((a, b) => {
        if (this.sortBy === 'title') return this.titleOf(a).localeCompare(this.titleOf(b));
        const av = new Date(a.updated_at || a.created_at || 0).getTime();
        const bv = new Date(b.updated_at || b.created_at || 0).getTime();
        return this.sortBy === 'oldest' ? av - bv : bv - av;
      });
  }

  get recentCount(): number {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.resumes.filter(r => new Date(r.updated_at || r.created_at || 0).getTime() >= cutoff).length;
  }

  titleOf(r: ResumeRecord): string { return (r.title || '').trim() || 'Untitled Resume'; }

  completeness(r: ResumeRecord): number {
    const c = r.content || {};
    return [!!String(c.summary || '').trim(),
      Array.isArray(c.education) && c.education.some((x: any) => x.degree || x.school),
      Array.isArray(c.experience) && c.experience.some((x: any) => x.role || x.company),
      !!String(c.skills || '').trim()].filter(Boolean).length;
  }

  statusLabel(r: ResumeRecord): string {
    return this.completeness(r) >= 3 ? 'Good progress' : 'Keep improving';
  }

  toggleFavorite(id: string) {
    if (this.favoriteIds.has(id)) this.favoriteIds.delete(id);
    else this.favoriteIds.add(id);
    this.favoriteIds = new Set(this.favoriteIds);
    try { localStorage.setItem('qorvexa_resume_favorites', JSON.stringify([...this.favoriteIds])); } catch {}
  }

  async duplicate(resume: ResumeRecord) {
    if (!this.userId || this.duplicatingId) return;
    this.duplicatingId = resume.id; this.error = ''; this.message = '';
    try {
      const payload = {
        user_id: this.userId,
        title: `${this.titleOf(resume)} (Copy)`,
        content: resume.content || {}
      };
      const { error } = await this.supabase.client.from('resumes').insert(payload);
      if (error) throw error;
      this.message = 'Resume duplicated successfully.';
      await this.load();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not duplicate this resume.';
    } finally { this.duplicatingId = ''; this.cdr.detectChanges(); }
  }

  async remove(resume: ResumeRecord) {
    if (!confirm(`Delete "${this.titleOf(resume)}"? This cannot be undone.`)) return;
    if (!this.userId) return;
    this.deletingId = resume.id; this.error = ''; this.message = '';
    try {
      const { error } = await this.supabase.client.from('resumes').delete()
        .eq('id', resume.id).eq('user_id', this.userId);
      if (error) throw error;
      this.resumes = this.resumes.filter(item => item.id !== resume.id);
      this.favoriteIds.delete(resume.id);
      this.message = 'Resume deleted.';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Could not delete this resume.';
    } finally { this.deletingId = ''; this.cdr.detectChanges(); }
  }

  downloadPdf(resume: ResumeRecord) {
    this.downloadingId = resume.id; this.error = ''; this.message = '';
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const left = 18, right = 192, lineHeight = 6;
      let y = 22;
      const c = resume.content || {};
      const addSection = (heading: string, body: string) => {
        if (!body.trim()) return;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(76, 78, 201);
        doc.text(heading, left, y); y += 7;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(35, 42, 61);
        const lines = doc.splitTextToSize(body, right - left);
        for (const line of lines) {
          if (y > 278) { doc.addPage(); y = 20; }
          doc.text(line, left, y); y += lineHeight;
        }
        y += 5;
      };
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(25, 35, 65);
      const titleLines = doc.splitTextToSize(this.titleOf(resume), right - left);
      doc.text(titleLines, left, y); y += titleLines.length * 9 + 5;
      doc.setDrawColor(91, 92, 226); doc.setLineWidth(1); doc.line(left, y - 2, right, y - 2);
      addSection('PROFESSIONAL SUMMARY', String(c.summary || ''));
      const education = Array.isArray(c.education) ? c.education.map((x: any) =>
        [x.degree, x.school, x.year].filter(Boolean).join(' | ')).filter(Boolean).join('\n') : '';
      addSection('EDUCATION', education);
      const experience = Array.isArray(c.experience) ? c.experience.map((x: any) =>
        [x.role, x.company, x.duration, x.description].filter(Boolean).join(' | ')).filter(Boolean).join('\n\n') : '';
      addSection('EXPERIENCE', experience);
      addSection('SKILLS', String(c.skills || ''));
      addSection('COVER LETTER', String(c.coverLetter || ''));
      const safeName = this.titleOf(resume).replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'resume';
      doc.save(`${safeName}.pdf`);
      this.message = 'PDF download started.';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'PDF export failed.';
    } finally { this.downloadingId = ''; this.cdr.detectChanges(); }
  }

  trackById(_index: number, resume: ResumeRecord) { return resume.id; }
}
