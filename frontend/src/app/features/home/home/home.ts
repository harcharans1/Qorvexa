import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  faqs = [
    { q: 'What is QORVEXA?', a: 'QORVEXA is an AI-powered platform that helps you create professional resumes, learn new skills, and plan social media content — all in one place.', open: false },
    { q: 'Is there a free plan?', a: 'Yes. The Free plan includes basic resume building, limited learning access, and sample marketing tools. Exact limits are configurable and will be shown on the Pricing page.', open: false },
    { q: 'How does the AI work?', a: 'AI features are powered by a configurable backend provider. When not configured, the app clearly labels demo mode so you always know what is live versus sample content.', open: false },
    { q: 'Can I export my resume as PDF?', a: 'Yes. The Resume Builder supports polished PDF export once the feature is fully implemented in later phases.', open: false },
    { q: 'Is my data secure?', a: 'User data is stored securely and protected by authentication and Row Level Security. Never share passwords or secret keys.', open: false },
    { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. You can change your plan at any time from the dashboard. Changes take effect immediately.', open: false }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}