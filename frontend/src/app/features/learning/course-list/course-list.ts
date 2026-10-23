import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
@Component({ selector: 'app-course-list', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './course-list.html', styleUrl: './course-list.css' })
export class CourseListComponent implements OnInit {
  courses: any[] = []; loading = true; error = '';
  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}
  async ngOnInit() {
    try { const { data, error } = await this.supabase.client.from('courses').select('id,title,description,category,thumbnail_url,difficulty').eq('is_published', true).order('created_at', { ascending: false });
      if (error) throw error; this.courses = data || [];
    } catch (e) { this.error = 'Courses could not load. Configure Supabase and run database/schema.sql first.'; }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }
}
