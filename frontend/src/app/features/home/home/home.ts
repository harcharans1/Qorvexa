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
  products = [
    { icon: '▤', tone: 'blue', name: 'AI Resume Builder', text: 'Create a polished resume, write a stronger summary, and prepare for your next opportunity.', link: '/resume', tag: 'Career', bullets: ['Resume editor', 'PDF download', 'AI assistance'] },
    { icon: '✦', tone: 'cyan', name: 'AI Learning Platform', text: 'Explore practical learning paths and build skills at your own pace.', link: '/learn', tag: 'Learn', bullets: ['Explore courses', 'Track progress', 'Keep learning'] },
    { icon: '↗', tone: 'purple', name: 'Marketing Studio', text: 'Create social content ideas, organize drafts, and plan campaigns in one place.', link: '/marketing', tag: 'Create', bullets: ['Captions & hashtags', 'Saved drafts', 'Content planning'] },
    { icon: '◎', tone: 'mint', name: 'ATS Resume Review', text: 'Review resume content and identify opportunities to make it clearer and more relevant.', link: '/resume', tag: 'Improve', bullets: ['Review your resume', 'Spot improvement areas', 'Prepare with confidence'] }
  ];

  steps = [
    { number: '01', icon: '◎', title: 'Choose your goal', text: 'Pick a tool for your career, learning, or brand.' },
    { number: '02', icon: '▤', title: 'Add your details', text: 'Share the information that helps the tool fit your needs.' },
    { number: '03', icon: '✦', title: 'Create and improve', text: 'Review your result, make it yours, and save your work.' }
  ];

  faqs = [
    { q: 'What is Qorvexa?', a: 'Qorvexa brings career, learning, and social content tools together in one workspace.' },
    { q: 'Is there a free plan?', a: 'You can create an account and explore available features. Availability of AI actions may depend on the service configuration.' },
    { q: 'How does the AI resume builder work?', a: 'Add your resume information, review the suggested content, make corrections, and download your resume when the feature is available.' },
    { q: 'Can Qorvexa publish social posts automatically?', a: 'Marketing Studio supports creating and organizing content. Automatic publishing requires supported social platform integrations.' },
    { q: 'Can I use Qorvexa on mobile?', a: 'The interface is responsive and adapts to mobile, tablet, and desktop screens.' },
    { q: 'Are paid plans available?', a: 'The pricing section currently describes a starter experience. Paid billing should only be offered after a payment provider is configured.' }
  ];
}
