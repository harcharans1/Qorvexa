import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home/home';
import { LoginComponent } from './features/auth/login/login';
import { SignupComponent } from './features/auth/signup/signup';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ResumeListComponent } from './features/resume/resume-list/resume-list';
import { ResumeEditorComponent } from './features/resume/resume-editor/resume-editor';
import { CourseListComponent } from './features/learning/course-list/course-list';
import { CourseDetailComponent } from './features/learning/course-detail/course-detail';
import { MarketingStudioComponent } from './features/marketing/marketing-studio/marketing-studio';
import { ProfileComponent } from './features/profile/profile/profile';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'resume', component: ResumeListComponent },
  { path: 'resume/new', component: ResumeEditorComponent },
  { path: 'resume/:id', component: ResumeEditorComponent },
  { path: 'products', component: HomeComponent },
  { path: 'learn', component: CourseListComponent },
  { path: 'learn/:id', component: CourseDetailComponent },
  { path: 'marketing', component: MarketingStudioComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];

