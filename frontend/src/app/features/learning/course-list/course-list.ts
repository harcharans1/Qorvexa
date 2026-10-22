import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseListComponent implements OnInit {
  courses: any[] = [];
  loading = true;

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const { data, error } = await this.supabase.client
      .from('courses')
      .select('*')
      .eq('is_published', true);

    this.courses = data || [];
    this.loading = false;
    this.cdr.detectChanges();
  }
}