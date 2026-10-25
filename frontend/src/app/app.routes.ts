import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home/home').then(m => m.HomeComponent), title: 'Qorvexa — AI tools for your next chapter' },
  {
    path: 'products', loadComponent: () => import('./features/info-page/info-page').then(m => m.InfoPageComponent),
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
    path: 'features', loadComponent: () => import('./features/info-page/info-page').then(m => m.InfoPageComponent),
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
    path: 'pricing', loadComponent: () => import('./features/info-page/info-page').then(m => m.InfoPageComponent),
    data: { page: {
      eyebrow: 'Pricing', title: 'Start free',
      description: 'Qorvexa is currently available on the free plan. Paid plans are coming soon; no paid billing is currently offered.',
      items: [
        { icon: '✦', title: 'Free plan', text: 'Explore the currently available Qorvexa experience at no charge.' },
        { icon: '↗', title: 'Paid plans — Coming soon', text: 'Paid subscriptions will be announced only after billing is configured.' }
      ]
    }}, title: 'Pricing | Qorvexa'
  },
  {
    path: 'about', loadComponent: () => import('./features/info-page/info-page').then(m => m.InfoPageComponent),
    data: { page: {
      eyebrow: 'About Qorvexa', title: 'Your next chapter starts here',
      description: 'Qorvexa brings career, learning and creative tools together.',
      items: [
        { icon: '◎', title: 'Our mission', text: 'Make useful AI tools easier to access.' },
        { icon: '✦', title: 'Our approach', text: 'Keep digital workflows simple and practical.' }
      ]
    }}, title: 'About | Qorvexa'
  },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent), title: 'Sign in | Qorvexa' },
  { path: 'signup', loadComponent: () => import('./features/auth/signup/signup').then(m => m.SignupComponent), title: 'Create account | Qorvexa' },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent), title: 'Reset password | Qorvexa' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard], title: 'Dashboard | Qorvexa' },
  { path: 'resume', loadComponent: () => import('./features/resume/resume-list/resume-list').then(m => m.ResumeListComponent), canActivate: [authGuard], title: 'My resumes | Qorvexa' },
  { path: 'resume/new', loadComponent: () => import('./features/resume/resume-editor/resume-editor').then(m => m.ResumeEditorComponent), canActivate: [authGuard], title: 'Create resume | Qorvexa' },
  { path: 'resume/:id', loadComponent: () => import('./features/resume/resume-editor/resume-editor').then(m => m.ResumeEditorComponent), canActivate: [authGuard], title: 'Edit resume | Qorvexa' },
  { path: 'learn', loadComponent: () => import('./features/learning/course-list/course-list').then(m => m.CourseListComponent), title: 'Learning | Qorvexa' },
  { path: 'learn/:id', loadComponent: () => import('./features/learning/course-detail/course-detail').then(m => m.CourseDetailComponent), canActivate: [authGuard], title: 'Course | Qorvexa' },
  { path: 'marketing', loadComponent: () => import('./features/marketing/marketing-studio/marketing-studio').then(m => m.MarketingStudioComponent), canActivate: [authGuard], title: 'Marketing studio | Qorvexa' },
  { path: 'profile', loadComponent: () => import('./features/profile/profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard], title: 'Profile | Qorvexa' },
  { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent), canActivate: [adminGuard], title: 'Admin | Qorvexa' },
  {
    path: 'contact', loadComponent: () => import('./features/info-page/info-page').then(m => m.InfoPageComponent),
    data: { page: {
      eyebrow: 'Contact & Support', title: 'How can we help?',
      description: 'For questions, feedback, or to report an issue, email hello@qorvexa.com. Please do not send passwords or sensitive personal information.',
      items: [
        { icon: '✉', title: 'Email support', text: 'hello@qorvexa.com', link: 'mailto:hello@qorvexa.com' }
      ]
    }}, title: 'Contact & Support | Qorvexa'
  },
  { path: 'privacy', loadComponent: () => import('./features/legal/legal-page').then(m => m.LegalPageComponent), data: { page: 'privacy' }, title: 'Privacy | Qorvexa' },
  { path: 'terms', loadComponent: () => import('./features/legal/legal-page').then(m => m.LegalPageComponent), data: { page: 'terms' }, title: 'Terms | Qorvexa' },
  { path: '**', redirectTo: '' }
];
