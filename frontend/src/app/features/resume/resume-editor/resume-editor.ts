import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
import { ApiService } from '../../../core/api.service';

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-editor.html',
  styleUrl: './resume-editor.css'
})
export class ResumeEditorComponent implements OnInit {
  title = 'Untitled Resume';
  selectedTemplate = 'Modern Pro';
  readonly templates = ['Modern Pro', 'Classic', 'Creative', 'Minimal', 'Executive', 'Tech', 'Elegant', 'Academic'];
  fullName = '';
  email = '';
  phone = '';
  location = '';
  website = '';
  linkedIn = '';
  summary = '';
  education: any[] = [];
  experience: any[] = [];
  skills = '';
  coverLetter = '';
  saving = false;
  aiLoading = false;
  message = '';
  error = '';
  jobDescription = '';
  atsReview = '';
  atsLoading = false;
  pdfLoading = false;
  resumeId: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: ApiService
  ) {}

  async ngOnInit() {
    this.resumeId = this.route.snapshot.paramMap.get('id');
    const requestedTemplate = this.route.snapshot.queryParamMap.get('template');
    if (requestedTemplate && this.templates.includes(requestedTemplate)) {
      this.selectedTemplate = requestedTemplate;
      if (!this.resumeId || this.resumeId === 'new') this.title = `${requestedTemplate} Resume`;
    }
    if (this.resumeId && this.resumeId !== 'new') {
      const user = await this.supabase.getUser();
      if (!user) { this.router.navigate(['/login']); return; }
      const { data, error } = await this.supabase.client
        .from('resumes').select('*').eq('id', this.resumeId).eq('user_id', user.id).maybeSingle();
      if (error) this.error = 'Could not load this resume.';
      if (data) {
        this.title = data.title;
        this.selectedTemplate = this.templates.includes(data.content?.template) ? data.content.template : 'Modern Pro';
        this.fullName = data.content?.fullName || '';
        this.email = data.content?.email || '';
        this.phone = data.content?.phone || '';
        this.location = data.content?.location || '';
        this.website = data.content?.website || '';
        this.linkedIn = data.content?.linkedIn || '';
        this.summary = data.content?.summary || '';
        this.education = data.content?.education || [];
        this.experience = data.content?.experience || [];
        this.skills = data.content?.skills || '';
        this.coverLetter = data.content?.coverLetter || '';
      }
    }
    this.cdr.detectChanges();
  }

  templateClass(): string { return 'template-' + this.selectedTemplate.toLowerCase().replace(/\s+/g, '-'); }

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

  async generateSummary() {
    this.error = ''; this.message = '';
    if (!this.title.trim() && !this.skills.trim()) {
      this.error = 'Add a resume title or skills before generating a summary.'; return;
    }
    this.aiLoading = true;
    try {
      const result = await this.api.post<{ text: string }>('ai/resume-summary', {
        targetRole: this.title, skills: this.skills, experience: this.experience,
        education: this.education, existingSummary: this.summary
      });
      this.summary = result.text;
      this.message = 'AI summary generated. Review it for accuracy before saving.';
    } catch (e) { this.error = e instanceof Error ? e.message : 'AI summary generation failed.'; }
    finally { this.aiLoading = false; }
  }

  async reviewAts() {
    this.error = ''; this.message = ''; this.atsReview = '';
    const resumeText = [this.title, this.fullName, this.email, this.phone, this.location, this.website, this.linkedIn, this.summary, this.skills,
      ...this.education.map(x => `${x.degree} ${x.school} ${x.year}`),
      ...this.experience.map(x => `${x.role} ${x.company} ${x.duration} ${x.description}`)].join('\n');
    if (!this.jobDescription.trim()) { this.error = 'Paste the target job description first.'; return; }
    this.atsLoading = true;
    try {
      const result = await this.api.post<{ review: string; isEstimate: boolean }>('ai/ats-review', {
        resumeText, jobDescription: this.jobDescription.trim()
      });
      this.atsReview = result.review;
      this.message = 'Review is an estimate. Verify all suggestions and keep resume details truthful.';
    } catch (e) { this.error = e instanceof Error ? e.message : 'ATS review failed.'; }
    finally { this.atsLoading = false; this.cdr.detectChanges(); }
  }

  async save() {
    this.saving = true; this.error = ''; this.message = '';
    try {
      const user = await this.supabase.getUser();
      if (!user) { this.router.navigate(['/login']); return; }
      const payload = {
        title: this.title.trim() || 'Untitled Resume',
        content: { fullName: this.fullName, email: this.email, phone: this.phone, location: this.location, website: this.website, linkedIn: this.linkedIn, summary: this.summary, education: this.education, experience: this.experience, skills: this.skills, coverLetter: this.coverLetter, template: this.selectedTemplate },
        user_id: user.id
      };
      if (this.resumeId && this.resumeId !== 'new') {
        const { error } = await this.supabase.client.from('resumes').update(payload)
          .eq('id', this.resumeId).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { data, error } = await this.supabase.client.from('resumes').insert(payload).select('id').single();
        if (error) throw error;
        if (data) { this.resumeId = data.id; await this.router.navigate(['/resume', data.id]); }
      }
      this.message = 'Resume saved successfully.';
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not save the resume. Please try again.'; }
    finally { this.saving = false; this.cdr.detectChanges(); }
  }

  async downloadPdf() {
    const element = document.querySelector('.resume-paper') as HTMLElement;
    if (!element || this.pdfLoading) return;

    this.pdfLoading = true;
    this.error = '';
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * width) / canvas.width;
      let remaining = imageHeight;
      let y = 0;
      pdf.addImage(imgData, 'PNG', 0, y, width, imageHeight);
      remaining -= pageHeight;
      while (remaining > 0) { y = remaining - imageHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, y, width, imageHeight); remaining -= pageHeight; }
      const safeName = (this.title || 'resume').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'resume';
      pdf.save(`${safeName}.pdf`);
    } catch { this.error = 'PDF export failed. Try again after the preview loads.'; }
    finally { this.pdfLoading = false; this.cdr.detectChanges(); }
  }
}