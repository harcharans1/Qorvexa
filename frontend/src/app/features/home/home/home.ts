import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-home', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './home.html', styleUrl: './home.css' })
export class HomeComponent {
  products = [
    { icon: '✦', name: 'AI Resume Builder', text: 'Create a polished resume, tailor your summary, and review it against a job description.', link: '/resume', tag: 'Career' },
    { icon: '⌁', name: 'Learning Hub', text: 'Build practical skills with structured courses and track your learning progress.', link: '/learn', tag: 'Learn' },
    { icon: '↗', name: 'Marketing Studio', text: 'Generate platform-aware captions, save drafts, and plan your content calendar.', link: '/marketing', tag: 'Create' }
  ];
  steps = [
    { number: '01', title: 'Create your account', text: 'Start with a free account and keep your work in one place.' },
    { number: '02', title: 'Choose your goal', text: 'Build a resume, learn something new, or create social content.' },
    { number: '03', title: 'Make steady progress', text: 'Save your work and return whenever you are ready.' }
  ];
  faqs = [
    { q: 'Is Qorvexa free to start?', a: 'The starter experience is designed to be free. Paid plans are not active until a billing provider is connected.' },
    { q: 'Does the AI write everything for me?', a: 'AI helps create drafts and suggestions. Always review outputs and keep personal, resume, and business details accurate.' },
    { q: 'Can Qorvexa publish posts automatically?', a: 'Not yet. The Marketing Studio can save drafts and planned dates, but automatic publishing needs separate platform integrations.' }
  ];
}
