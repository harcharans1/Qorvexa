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

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Qorvexa — AI tools for your next chapter' },
  { path: 'products', component: HomeComponent, title: 'Products | Qorvexa' },
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
