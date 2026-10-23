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
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'resume', component: ResumeListComponent, canActivate: [authGuard] },
  { path: 'resume/new', component: ResumeEditorComponent, canActivate: [authGuard] },
  { path: 'resume/:id', component: ResumeEditorComponent, canActivate: [authGuard] },
  { path: 'products', component: HomeComponent },
  { path: 'learn', component: CourseListComponent },
  { path: 'learn/:id', component: CourseDetailComponent, canActivate: [authGuard] },
  { path: 'marketing', component: MarketingStudioComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
