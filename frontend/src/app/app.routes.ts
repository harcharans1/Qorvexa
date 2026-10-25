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
      description: 'Explore Qorvexa and its available tools. Paid plans require billing integration.',
      items: [
        { icon: '✦', title: 'Starter', text: 'Get started with the available free experience.' },
        { icon: '↗', title: 'Future plans', text: 'Paid subscriptions can be added when billing is configured.' }
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
  {
    path: 'contact', loadComponent: () => import('./features/info-page/info-page').then(m => m.InfoPageComponent),
    data: { page: {
      eyebrow: 'Contact & Support', title: 'How can we help?',
      description: 'Questions, feedback, or a problem to report? Email our support team. A contact form is not connected yet, so this link opens your email app.',
      items: [
        { icon: '✉', title: 'Email support', text: 'Send questions, feedback, or bug reports to our support inbox.', link: 'mailto:hello@qorvexa.com?subject=Qorvexa%20Support' },
        { icon: '↗', title: 'Account help', text: 'For sign-in or account questions, include the email address associated with your account. Do not send passwords.', link: 'mailto:hello@qorvexa.com?subject=Qorvexa%20Account%20Help' }
      ]
    }}, title: 'Contact & Support | Qorvexa'
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
  { path: 'privacy', loadComponent: () => import('./features/legal/legal-page').then(m => m.LegalPageComponent), data: { page: 'privacy' }, title: 'Privacy | Qorvexa' },
  { path: 'terms', loadComponent: () => import('./features/legal/legal-page').then(m => m.LegalPageComponent), data: { page: 'terms' }, title: 'Terms | Qorvexa' },
  { path: '**', redirectTo: '' }
];
