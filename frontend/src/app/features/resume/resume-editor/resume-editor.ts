import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-editor.html',
  styleUrl: './resume-editor.css'
})
export class ResumeEditorComponent implements OnInit {
  title = 'Untitled Resume';
  summary = '';
  education: any[] = [];
  experience: any[] = [];
  skills = '';
  coverLetter = '';
  saving = false;
  resumeId: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.resumeId = this.route.snapshot.paramMap.get('id');
    if (this.resumeId && this.resumeId !== 'new') {
      const { data } = await this.supabase.client
        .from('resumes')
        .select('*')
        .eq('id', this.resumeId)
        .single();
      if (data) {
        this.title = data.title;
        this.summary = data.content?.summary || '';
        this.education = data.content?.education || [];
        this.experience = data.content?.experience || [];
        this.skills = data.content?.skills || '';
        this.coverLetter = data.content?.coverLetter || '';
      }
    }
    this.cdr.detectChanges();
  }

  addEducation() {
    this.education.push({ degree: '', school: '', year: '' });
  }

  removeEducation(i: number) {
    this.education.splice(i, 1);
  }

  addExperience() {
    this.experience.push({ role: '', company: '', duration: '', description: '' });
  }

  removeExperience(i: number) {
    this.experience.splice(i, 1);
  }

  async save() {
    this.saving = true;
    const user = await this.supabase.getUser();
    if (!user) return;

    const payload = {
      title: this.title,
      content: {
        summary: this.summary,
        education: this.education,
        experience: this.experience,
        skills: this.skills,
        coverLetter: this.coverLetter
      },
      user_id: user.id
    };

    if (this.resumeId && this.resumeId !== 'new') {
      await this.supabase.client.from('resumes').update(payload).eq('id', this.resumeId);
    } else {
      const { data } = await this.supabase.client.from('resumes').insert(payload).select().single();
      if (data) {
        this.resumeId = data.id;
        this.router.navigate(['/resume', data.id]);
      }
    }

    this.saving = false;
    alert('Saved!');
  }

  async downloadPdf() {
    const element = document.querySelector('.preview-side') as HTMLElement;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`${this.title || 'resume'}.pdf`);
  }
}