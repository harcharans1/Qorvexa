import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
@Component({ selector: 'app-admin-dashboard', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './admin-dashboard.html', styleUrl: './admin-dashboard.css' })
export class AdminDashboardComponent implements OnInit {
  courses: any[] = []; title = ''; description = ''; category = 'Career'; difficulty = 'beginner'; loading = true; saving = false; error = ''; message = '';
  constructor(private readonly supabase: SupabaseService, private readonly cdr: ChangeDetectorRef) {}
  async ngOnInit() { await this.load(); }
  async load() { this.loading = true; try { const { data, error } = await this.supabase.client.from('courses').select('*').order('created_at', { ascending: false }); if (error) throw error; this.courses = data || []; } catch (e) { this.error = e instanceof Error ? e.message : 'Could not load courses.'; } finally { this.loading = false; this.cdr.detectChanges(); } }
  async createCourse() { this.error = ''; this.message = ''; if (!this.title.trim()) { this.error = 'Course title is required.'; return; } this.saving = true; try { const { error } = await this.supabase.client.from('courses').insert({ title: this.title.trim(), description: this.description.trim(), category: this.category, difficulty: this.difficulty, is_published: false }); if (error) throw error; this.title = ''; this.description = ''; this.message = 'Course created as a draft. Publish it when ready.'; await this.load(); } catch (e) { this.error = e instanceof Error ? e.message : 'Could not create course.'; } finally { this.saving = false; } }
  async togglePublished(course: any) { const { error } = await this.supabase.client.from('courses').update({ is_published: !course.is_published }).eq('id', course.id); if (error) { this.error = error.message; return; } course.is_published = !course.is_published; this.message = course.is_published ? 'Course published.' : 'Course unpublished.'; }
}
