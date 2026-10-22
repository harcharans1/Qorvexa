import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  stats = { users: 0, courses: 0, resumes: 0 };
  loading = true;

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    // Note: These counts work only if RLS allows or using service role later
    const { count: courses } = await this.supabase.client.from('courses').select('*', { count: 'exact', head: true });
    const { count: resumes } = await this.supabase.client.from('resumes').select('*', { count: 'exact', head: true });

    this.stats.courses = courses || 0;
    this.stats.resumes = resumes || 0;
    this.loading = false;
    this.cdr.detectChanges();
  }
}