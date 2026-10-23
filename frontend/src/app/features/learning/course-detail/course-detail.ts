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
  enrolled = false;
  completedLessonIds = new Set<string>();
  actionMessage = '';
  actionError = '';
  busy = false;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading = false; return; }
    try {
      const { data: course, error: courseError } = await this.supabase.client
        .from('courses').select('*').eq('id', id).single();
      if (courseError) throw courseError;
      const { data: lessons, error: lessonError } = await this.supabase.client
        .from('lessons').select('*').eq('course_id', id).order('order_index');
      if (lessonError) throw lessonError;
      this.course = course;
      this.lessons = lessons || [];
      const user = await this.supabase.getUser();
      if (user) {
        const { data: enrollment } = await this.supabase.client.from('enrollments')
          .select('id').eq('course_id', id).eq('user_id', user.id).maybeSingle();
        this.enrolled = !!enrollment;
        const lessonIds = this.lessons.map(l => l.id);
        if (lessonIds.length) {
          const { data: progress } = await this.supabase.client.from('lesson_progress')
            .select('lesson_id,completed').eq('user_id', user.id).in('lesson_id', lessonIds).eq('completed', true);
          this.completedLessonIds = new Set((progress || []).map(p => p.lesson_id));
        }
      }
    } catch (e) { this.actionError = e instanceof Error ? e.message : 'Could not load this course.'; }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }

  get progressPercent(): number {
    return this.lessons.length ? Math.round(this.completedLessonIds.size / this.lessons.length * 100) : 0;
  }

  async enroll() {
    const user = await this.supabase.getUser();
    if (!user || !this.course) { this.actionError = 'Please sign in to enroll.'; return; }
    this.busy = true; this.actionError = ''; this.actionMessage = '';
    try {
      const { error } = await this.supabase.client.from('enrollments').upsert(
        { user_id: user.id, course_id: this.course.id }, { onConflict: 'user_id,course_id', ignoreDuplicates: true });
      if (error) throw error;
      this.enrolled = true; this.actionMessage = 'You are enrolled in this course.';
    } catch (e) { this.actionError = e instanceof Error ? e.message : 'Could not enroll in this course.'; }
    finally { this.busy = false; this.cdr.detectChanges(); }
  }

  async toggleLesson(lessonId: string) {
    const user = await this.supabase.getUser();
    if (!user || !this.enrolled) { this.actionError = 'Enroll in this course first.'; return; }
    const completed = !this.completedLessonIds.has(lessonId);
    this.busy = true; this.actionError = ''; this.actionMessage = '';
    try {
      const { error } = await this.supabase.client.from('lesson_progress').upsert({
        user_id: user.id, lesson_id: lessonId, completed, completed_at: completed ? new Date().toISOString() : null
      }, { onConflict: 'user_id,lesson_id' });
      if (error) throw error;
      if (completed) this.completedLessonIds.add(lessonId); else this.completedLessonIds.delete(lessonId);
      this.actionMessage = 'Learning progress saved.';
    } catch (e) { this.actionError = e instanceof Error ? e.message : 'Could not save lesson progress.'; }
    finally { this.busy = false; this.cdr.detectChanges(); }
  }
}