import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';

type Tab = 'courses' | 'lessons' | 'messages' | 'requests';

@Component({ selector: 'app-admin-dashboard', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './admin-dashboard.html', styleUrl: './admin-dashboard.css' })
export class AdminDashboardComponent implements OnInit {
  tab: Tab = 'courses';
  courses: any[] = []; lessons: any[] = []; messages: any[] = []; requests: any[] = [];
  title = ''; description = ''; category = 'Career'; difficulty = 'beginner'; videoUrl = '';
  lessonCourseId = ''; lessonTitle = ''; lessonContent = ''; lessonVideo = '';
  loading = true; saving = false; error = ''; message = '';

  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}
  private get db() { return this.supabase.client; }

  async ngOnInit() { await Promise.all([this.loadCourses(), this.loadMessages(), this.loadRequests()]); this.loading = false; this.cdr.detectChanges(); }
  setTab(t: Tab) { this.tab = t; this.error = ''; this.message = ''; }
  get newMessages() { return this.messages.filter(m => m.status === 'new').length; }
  get nextOrder() { return this.lessons.length ? Math.max(...this.lessons.map(l => l.order_index || 0)) + 1 : 1; }

  async loadCourses() {
    try { const { data, error } = await this.db.from('courses').select('*').order('created_at', { ascending: false }); if (error) throw error; this.courses = data || []; if (!this.lessonCourseId && this.courses.length) { this.lessonCourseId = this.courses[0].id; await this.loadLessons(); } }
    catch (e) { this.fail(e, 'Could not load courses.'); } finally { this.cdr.detectChanges(); }
  }
  async loadLessons() {
    if (!this.lessonCourseId) { this.lessons = []; return; }
    const { data, error } = await this.db.from('lessons').select('*').eq('course_id', this.lessonCourseId).order('order_index');
    if (error) this.fail(error, 'Could not load lessons.'); else this.lessons = data || [];
    this.cdr.detectChanges();
  }
  async loadMessages() { const { data, error } = await this.db.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(100); if (error) this.fail(error, 'Could not load messages.'); else this.messages = data || []; }
  async loadRequests() { const { data, error } = await this.db.from('plan_requests').select('*').order('created_at', { ascending: false }).limit(200); if (error) this.fail(error, 'Could not load plan requests.'); else this.requests = data || []; }

  async createCourse() {
    this.error = ''; this.message = '';
    if (!this.title.trim()) { this.error = 'Course title is required.'; return; }
    this.saving = true;
    try {
      const { error } = await this.db.from('courses').insert({ title: this.title.trim(), description: this.description.trim(), category: this.category, difficulty: this.difficulty, video_url: this.videoUrl.trim() || null, is_published: false });
      if (error) throw error;
      this.title = ''; this.description = ''; this.videoUrl = ''; this.message = 'Course created as a draft. Add lessons, then publish.';
      await this.loadCourses();
    } catch (e) { this.fail(e, 'Could not create course.'); } finally { this.saving = false; this.cdr.detectChanges(); }
  }
  async togglePublished(c: any) {
    const { error } = await this.db.from('courses').update({ is_published: !c.is_published }).eq('id', c.id);
    if (error) { this.fail(error, 'Update failed.'); return; }
    c.is_published = !c.is_published; this.message = c.is_published ? 'Course published.' : 'Course unpublished.';
  }
  async deleteCourse(c: any) {
    if (!confirm(`Delete "${c.title}" and all its lessons?`)) return;
    const { error } = await this.db.from('courses').delete().eq('id', c.id);
    if (error) { this.fail(error, 'Delete failed.'); return; }
    this.courses = this.courses.filter(x => x.id !== c.id); if (this.lessonCourseId === c.id) { this.lessonCourseId = ''; this.lessons = []; } this.message = 'Course deleted.';
  }
  async addLesson() {
    this.error = ''; this.message = '';
    if (!this.lessonCourseId || !this.lessonTitle.trim()) { this.error = 'Choose a course and enter a lesson title.'; return; }
    this.saving = true;
    try {
      const { error } = await this.db.from('lessons').insert({ course_id: this.lessonCourseId, title: this.lessonTitle.trim(), content: this.lessonContent.trim() || null, video_url: this.lessonVideo.trim() || null, order_index: this.nextOrder });
      if (error) throw error;
      this.lessonTitle = ''; this.lessonContent = ''; this.lessonVideo = ''; this.message = 'Lesson added.'; await this.loadLessons();
    } catch (e) { this.fail(e, 'Could not add lesson.'); } finally { this.saving = false; this.cdr.detectChanges(); }
  }
  async deleteLesson(l: any) {
    if (!confirm(`Delete lesson "${l.title}"?`)) return;
    const { error } = await this.db.from('lessons').delete().eq('id', l.id);
    if (error) { this.fail(error, 'Delete failed.'); return; }
    this.lessons = this.lessons.filter(x => x.id !== l.id); this.message = 'Lesson deleted.';
  }
  async setStatus(m: any, status: string) {
    const { error } = await this.db.from('contact_messages').update({ status }).eq('id', m.id);
    if (error) { this.fail(error, 'Update failed.'); return; }
    m.status = status;
  }
  private fail(e: unknown, fallback: string) { this.error = e instanceof Error ? e.message : (e as any)?.message || fallback; this.cdr.detectChanges(); }
}
