import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
@Component({ selector: 'app-resume-list', standalone: true, imports: [CommonModule, RouterLink, DatePipe], templateUrl: './resume-list.html', styleUrl: './resume-list.css' })
export class ResumeListComponent implements OnInit {
  resumes: any[] = []; loading = true; error = ''; message = '';
  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}
  async ngOnInit() { await this.load(); }
  async load() {
    this.loading = true; this.error = '';
    try { const user = await this.supabase.getUser(); if (!user) return;
      const { data, error } = await this.supabase.client.from('resumes').select('id,title,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
      if (error) throw error; this.resumes = data || [];
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not load resumes.'; }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }
  async remove(id: string) {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    const user = await this.supabase.getUser(); if (!user) return;
    const { error } = await this.supabase.client.from('resumes').delete().eq('id', id).eq('user_id', user.id);
    if (error) { this.error = error.message; return; }
    this.resumes = this.resumes.filter(item => item.id !== id); this.message = 'Resume deleted.';
  }
}
