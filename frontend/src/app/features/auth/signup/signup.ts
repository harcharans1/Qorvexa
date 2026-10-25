import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';
  success = '';

  constructor(private router: Router, private supabase: SupabaseService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.error = ''; this.success = '';
    if (!this.fullName.trim() || !this.email.trim() || !this.password) { this.error = 'All fields are required.'; return; }
    if (this.password.length < 8) { this.error = 'Password must be at least 8 characters.'; return; }
    this.loading = true;
    try {
      const { data, error } = await this.supabase.signUp(this.email, this.password, this.fullName);
      if (error) { this.error = error.message; return; }
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        this.error = 'An account with this email already exists. Please sign in instead.';
        return;
      }
      this.success = data.session ? 'Account created. Opening your dashboard…' : 'Account created! Check your email to confirm, then sign in.';
      if (data.session) await this.router.navigate(['/dashboard']);
    } catch { this.error = 'Sign up failed. Please check your connection and try again.'; }
    finally { this.loading = false; }
  }
}