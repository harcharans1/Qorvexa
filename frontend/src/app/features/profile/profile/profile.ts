import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  fullName = '';
  email = '';
  loading = true;
  saving = false;
  message = '';

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) {
      this.email = user.email || '';
      this.fullName = user.user_metadata?.['full_name'] || '';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async save() {
    this.saving = true;
    const { error } = await this.supabase.client.auth.updateUser({
      data: { full_name: this.fullName }
    });
    this.saving = false;
    this.message = error ? error.message : 'Profile updated!';
    this.cdr.detectChanges();
  }
}