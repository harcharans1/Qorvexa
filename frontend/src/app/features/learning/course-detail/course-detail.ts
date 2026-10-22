import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css'
})
export class CourseDetailComponent implements OnInit {
  course: any = null;
  lessons: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const { data: course } = await this.supabase.client
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    const { data: lessons } = await this.supabase.client
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('order_index');

    this.course = course;
    this.lessons = lessons || [];
    this.loading = false;
    this.cdr.detectChanges();
  }
}