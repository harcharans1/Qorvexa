import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-reset-password', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html', styleUrl: '../login/login.css'
})
export class ResetPasswordComponent {
  password = ''; confirmPassword = ''; loading = false; error = ''; success = '';
  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {}

  async submit() {
    this.error = ''; this.success = '';
    if (this.password.length < 8) { this.error = 'Password must be at least 8 characters.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    this.loading = true;
    try {
      const { error } = await this.supabase.client.auth.updateUser({ password: this.password });
      if (error) throw error;
      this.success = 'Password updated. Redirecting to sign in…';
      await this.supabase.signOut();
      setTimeout(() => this.router.navigate(['/login']), 900);
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not update your password. Request a new reset email.'; }
    finally { this.loading = false; }
  }
}
