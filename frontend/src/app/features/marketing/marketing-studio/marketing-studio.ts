import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-marketing-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketing-studio.html',
  styleUrl: './marketing-studio.css'
})
export class MarketingStudioComponent {
  topic = '';
  tone = 'Professional';
  platform = 'LinkedIn';
  generated = '';

  async generate() {
  if (!this.topic) return;
  const res = await fetch('http://localhost:5041/api/Ai/caption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: this.topic, tone: this.tone, platform: this.platform })
  });
  const data = await res.json();
  this.generated = data.caption;
}

  copy() {
    navigator.clipboard.writeText(this.generated);
    alert('Copied!');
  }
}