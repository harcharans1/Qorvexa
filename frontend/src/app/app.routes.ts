import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home/home';
import { LoginComponent } from './features/auth/login/login';
import { SignupComponent } from './features/auth/signup/signup';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ResumeListComponent } from './features/resume/resume-list/resume-list';
import { ResumeEditorComponent } from './features/resume/resume-editor/resume-editor';
import { CourseListComponent } from './features/learning/course-list/course-list';
import { CourseDetailComponent } from './features/learning/course-detail/course-detail';
import { MarketingStudioComponent } from './features/marketing/marketing-studio/marketing-studio';
import { ProfileComponent } from './features/profile/profile/profile';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard';
import { LegalPageComponent } from './features/legal/legal-page';
import { adminGuard, authGuard } from './core/auth.guard';
import { InfoPageComponent } from './features/info-page/info-page';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Qorvexa — AI tools for your next chapter' },
  {
    path: 'products', component: InfoPageComponent,
    data: { page: {
      eyebrow: 'Our Products', title: 'AI tools for your next chapter',
      description: 'Explore tools for your career, learning and social media marketing.',
      items: [
        { icon: '✦', title: 'AI Resume Builder', text: 'Create and improve your resume.', link: '/resume' },
        { icon: '⌁', title: 'Learning Hub', text: 'Discover courses and build new skills.', link: '/learn' },
        { icon: '↗', title: 'Marketing Studio', text: 'Create social media content ideas.', link: '/marketing' }
      ]
    }}, title: 'Products | Qorvexa'
  },
  {
    path: 'features', component: InfoPageComponent,
    data: { page: {
      eyebrow: 'Features', title: 'Everything in one workspace',
      description: 'Discover tools that help you learn, create and grow.',
      items: [
        { icon: '✦', title: 'AI assistance', text: 'Get ideas and useful suggestions.' },
        { icon: '◈', title: 'Organized workspace', text: 'Keep your work in one place.' },
        { icon: '↗', title: 'Progress', text: 'Continue working toward your goals.' }
      ]
    }}, title: 'Features | Qorvexa'
  },
  {
    path: 'pricing', component: InfoPageComponent,
    data: { page: {
      eyebrow: 'Pricing', title: 'Start free',
      description: 'Explore Qorvexa and its available tools. Paid plans require billing integration.',
      items: [
        { icon: '✦', title: 'Starter', text: 'Get started with the available free experience.' },
        { icon: '↗', title: 'Future plans', text: 'Paid subscriptions can be added when billing is configured.' }
      ]
    }}, title: 'Pricing | Qorvexa'
  },
  {
    path: 'about', component: InfoPageComponent,
    data: { page: {
      eyebrow: 'About Qorvexa', title: 'Your next chapter starts here',
      description: 'Qorvexa brings career, learning and creative tools together.',
      items: [
        { icon: '◎', title: 'Our mission', text: 'Make useful AI tools easier to access.' },
        { icon: '✦', title: 'Our approach', text: 'Keep digital workflows simple and practical.' }
      ]
    }}, title: 'About | Qorvexa'
  },
  { path: 'login', component: LoginComponent, title: 'Sign in | Qorvexa' },
  { path: 'signup', component: SignupComponent, title: 'Create account | Qorvexa' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'Reset password | Qorvexa' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], title: 'Dashboard | Qorvexa' },
  { path: 'resume', component: ResumeListComponent, canActivate: [authGuard], title: 'My resumes | Qorvexa' },
  { path: 'resume/new', component: ResumeEditorComponent, canActivate: [authGuard], title: 'Create resume | Qorvexa' },
  { path: 'resume/:id', component: ResumeEditorComponent, canActivate: [authGuard], title: 'Edit resume | Qorvexa' },
  { path: 'learn', component: CourseListComponent, title: 'Learning | Qorvexa' },
  { path: 'learn/:id', component: CourseDetailComponent, canActivate: [authGuard], title: 'Course | Qorvexa' },
  { path: 'marketing', component: MarketingStudioComponent, canActivate: [authGuard], title: 'Marketing studio | Qorvexa' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard], title: 'Profile | Qorvexa' },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard], title: 'Admin | Qorvexa' },
  { path: 'privacy', component: LegalPageComponent, data: { page: 'privacy' }, title: 'Privacy | Qorvexa' },
  { path: 'terms', component: LegalPageComponent, data: { page: 'terms' }, title: 'Terms | Qorvexa' },
  { path: '**', redirectTo: '' }
];
