import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './dashboard.html', styleUrl: './dashboard.css' })
export class DashboardComponent implements OnInit {
  name = 'there'; loading = true; resumeCount = 0; draftCount = 0; courseCount = 0; error = '';
  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}
  async ngOnInit() {
    try {
      const user = await this.supabase.getUser();
      if (user) {
        this.name = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'there';
        const [resumes, drafts, enrollments] = await Promise.all([
          this.supabase.client.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          this.supabase.client.from('marketing_drafts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          this.supabase.client.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);
        this.resumeCount = resumes.count || 0; this.draftCount = drafts.count || 0; this.courseCount = enrollments.count || 0;
      }
    } catch { this.error = 'Some dashboard information could not be loaded. Check your Supabase setup.'; }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }
}
