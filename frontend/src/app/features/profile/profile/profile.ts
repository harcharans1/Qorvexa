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
  plan = 'free';
  subscriptionStatus = 'active';

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) {
      this.email = user.email || '';
      this.fullName = user.user_metadata?.['full_name'] || '';
      const { data: subscription } = await this.supabase.client.from('subscriptions').select('plan,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      this.plan = subscription?.plan || 'free';
      this.subscriptionStatus = subscription?.status || 'active';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async save() {
    this.saving = true;
    try {
      const { error } = await this.supabase.client.auth.updateUser({ data: { full_name: this.fullName.trim() } });
      if (error) throw error;
      const user = await this.supabase.getUser();
      if (user) {
        const { error: profileError } = await this.supabase.client.from('profiles').update({ full_name: this.fullName.trim() }).eq('id', user.id);
        if (profileError) throw profileError;
      }
      this.message = 'Profile updated!';
    } catch (e) { this.message = e instanceof Error ? e.message : 'Could not update profile.'; }
    finally { this.saving = false; }
    this.cdr.detectChanges();
  }
}