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

  constructor(private router: Router, private supabase: SupabaseService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Email and password are required.';
      return;
    }

    this.loading = true;
    const { data, error } = await this.supabase.signIn(this.email, this.password);
    this.loading = false;

    if (error) {
      this.error = error.message;
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}