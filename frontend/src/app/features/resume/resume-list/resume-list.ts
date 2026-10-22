import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resume-list.html',
  styleUrl: './resume-list.css'
})
export class ResumeListComponent implements OnInit {
  resumes: any[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const { data, error } = await this.supabase.client
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    this.resumes = data || [];
    this.loading = false;
    this.cdr.detectChanges(); // Force UI update
  }

  createNew() {
    this.router.navigate(['/resume/new']);
  }

  async deleteResume(id: string) {
    if (!confirm('Delete this resume?')) return;
    await this.supabase.client.from('resumes').delete().eq('id', id);
    this.resumes = this.resumes.filter(r => r.id !== id);
    this.cdr.detectChanges();
  }
}