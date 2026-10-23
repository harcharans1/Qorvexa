import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './info-page.html',
  styleUrl: './info-page.css'
})
export class InfoPageComponent {
  page: any;

  constructor(private readonly route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.page = data['page'];
    });
  }
}
