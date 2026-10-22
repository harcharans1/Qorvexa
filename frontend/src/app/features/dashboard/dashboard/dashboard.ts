import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  userName = 'User';
  loading = true;

  constructor(private supabase: SupabaseService, private router: Router) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) {
      this.userName = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'User';
    }
    this.loading = false;
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}