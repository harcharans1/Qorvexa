import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';
  message = '';
  resetLoading = false;

  constructor(private router: Router, private supabase: SupabaseService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.error = ''; this.message = '';
    if (!this.email.trim() || !this.password) { this.error = 'Email and password are required.'; return; }
    this.loading = true;
    try {
      const { error } = await this.supabase.signIn(this.email, this.password);
      if (error) { this.error = error.message; return; }
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      await this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard');
    } catch { this.error = 'Sign in failed. Please check your connection and try again.'; }
    finally { this.loading = false; }
  }

  async resetPassword() {
    this.error = ''; this.message = '';
    if (!this.email.trim()) { this.error = 'Enter your email first, then choose Forgot password.'; return; }
    this.resetLoading = true;
    try {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(this.email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) this.error = error.message;
      else this.message = 'If an account exists for this email, a password reset email will be sent.';
    } catch { this.error = 'Could not request a reset email. Please try again.'; }
    finally { this.resetLoading = false; }
  }
}