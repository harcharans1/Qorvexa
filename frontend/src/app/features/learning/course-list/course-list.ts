import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

type LearningCourse = {
  id: string; title: string; description?: string; category?: string; thumbnail_url?: string;
  difficulty?: string; lessonCount: number; completedCount: number; enrolled: boolean;
  progress: number; enrolledAt?: string; created_at?: string;
};

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseListComponent implements OnInit {
  courses: LearningCourse[] = [];
  loading = true;
  error = '';
  notice = '';
  searchTerm = '';
  selectedCategory = 'All';
  sortBy = 'newest';
  enrolledOnly = false;
  busyCourseId = '';
  fullName = 'Learner';

  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    try {
      const user = await this.supabase.getUser();
      if (user) {
        const { data: profile } = await this.supabase.client.from('profiles')
          .select('full_name').eq('id', user.id).maybeSingle();
        this.fullName = profile?.full_name?.trim() || user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'Learner';
      }

      const { data: rawCourses, error: courseError } = await this.supabase.client.from('courses')
        .select('id,title,description,category,thumbnail_url,difficulty,created_at')
        .eq('is_published', true).order('created_at', { ascending: false });
      if (courseError) throw courseError;
      const source = rawCourses || [];
      const ids = source.map((course: any) => course.id);

      let lessons: any[] = [];
      let enrollments: any[] = [];
      let progress: any[] = [];
      if (ids.length) {
        const { data: lessonRows, error: lessonsError } = await this.supabase.client.from('lessons')
          .select('id,course_id').in('course_id', ids);
        if (lessonsError) throw lessonsError;
        lessons = lessonRows || [];

        const user = await this.supabase.getUser();
        if (user) {
          const { data: enrollmentRows, error: enrollmentError } = await this.supabase.client.from('enrollments')
            .select('course_id,enrolled_at').eq('user_id', user.id).in('course_id', ids);
          if (enrollmentError) throw enrollmentError;
          enrollments = enrollmentRows || [];
          const lessonIds = lessons.map((lesson: any) => lesson.id);
          if (lessonIds.length) {
            const { data: progressRows, error: progressError } = await this.supabase.client.from('lesson_progress')
              .select('lesson_id,completed').eq('user_id', user.id).eq('completed', true).in('lesson_id', lessonIds);
            if (progressError) throw progressError;
            progress = progressRows || [];
          }
        }
      }

      this.courses = source.map((course: any) => {
        const courseLessons = lessons.filter((lesson: any) => lesson.course_id === course.id);
        const completedIds = new Set(progress.filter((p: any) => courseLessons.some((l: any) => l.id === p.lesson_id)).map((p: any) => p.lesson_id));
        const enrollment = enrollments.find((e: any) => e.course_id === course.id);
        const count = courseLessons.length;
        return {
          ...course,
          lessonCount: count,
          completedCount: completedIds.size,
          enrolled: !!enrollment,
          progress: count ? Math.round(completedIds.size / count * 100) : 0,
          enrolledAt: enrollment?.enrolled_at
        } as LearningCourse;
      });
    } catch (e) {
      this.error = e instanceof Error && e.message ? e.message : 'Courses could not load. Check Supabase configuration and database policies.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get categories(): string[] {
    return ['All', ...Array.from(new Set(this.courses.map(c => c.category?.trim()).filter((c): c is string => !!c)))];
  }

  get filteredCourses(): LearningCourse[] {
    const query = this.searchTerm.trim().toLowerCase();
    const filtered = this.courses.filter(course => {
      const matchesSearch = !query || [course.title, course.description, course.category, course.difficulty]
        .some(value => (value || '').toLowerCase().includes(query));
      const matchesCategory = this.selectedCategory === 'All' || course.category === this.selectedCategory;
      return matchesSearch && matchesCategory && (!this.enrolledOnly || course.enrolled);
    });
    return filtered.sort((a, b) => this.sortBy === 'title'
      ? a.title.localeCompare(b.title)
      : this.sortBy === 'popular'
        ? Number(b.enrolled) - Number(a.enrolled) || a.title.localeCompare(b.title)
        : new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  get enrolledCourses(): LearningCourse[] { return this.courses.filter(c => c.enrolled); }
  get completedCourses(): LearningCourse[] { return this.enrolledCourses.filter(c => c.lessonCount > 0 && c.progress === 100); }
  get completedLessons(): number { return this.enrolledCourses.reduce((sum, course) => sum + course.completedCount, 0); }
  get overallProgress(): number {
    const enrolled = this.enrolledCourses.filter(c => c.lessonCount > 0);
    const total = enrolled.reduce((sum, c) => sum + c.lessonCount, 0);
    return total ? Math.round(enrolled.reduce((sum, c) => sum + c.completedCount, 0) / total * 100) : 0;
  }
  get continueCourse(): LearningCourse | undefined {
    return this.enrolledCourses.find(c => c.progress < 100) || this.enrolledCourses[0];
  }
  get featuredCourses(): LearningCourse[] { return this.courses.slice(0, 4); }

  chooseCategory(category: string) { this.selectedCategory = category; this.enrolledOnly = false; }
  showMyLearning() { this.enrolledOnly = true; this.selectedCategory = 'All'; }
  showAllCourses() { this.enrolledOnly = false; }

  async enroll(course: LearningCourse) {
    const user = await this.supabase.getUser();
    if (!user) {
      this.notice = 'Please log in to enroll and save your learning progress.';
      return;
    }
    this.busyCourseId = course.id;
    this.notice = '';
    try {
      const { error } = await this.supabase.client.from('enrollments').upsert(
        { user_id: user.id, course_id: course.id },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      );
      if (error) throw error;
      course.enrolled = true;
      this.notice = `You're enrolled in ${course.title}. Start learning when you're ready.`;
      this.cdr.detectChanges();
    } catch (e) {
      this.notice = e instanceof Error ? e.message : 'Enrollment failed. Please try again.';
    } finally {
      this.busyCourseId = '';
      this.cdr.detectChanges();
    }
  }

  courseArt(course: LearningCourse): string {
    const key = (course.category || '').toLowerCase();
    if (key.includes('ai') || key.includes('intelligence')) return 'art-ai';
    if (key.includes('web') || key.includes('develop') || key.includes('program')) return 'art-code';
    if (key.includes('design')) return 'art-design';
    if (key.includes('market') || key.includes('business')) return 'art-marketing';
    return 'art-general';
  }
}
