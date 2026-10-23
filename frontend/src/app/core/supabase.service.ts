import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const url = environment.supabaseUrl;
    const key = environment.supabaseAnonKey;
    if (!url || url.includes('YOUR_PROJECT_REF') || !key || key.includes('YOUR_SUPABASE')) {
      console.warn('Qorvexa: configure public Supabase URL and anon/publishable key in src/environments/environment.ts.');
    }
    this.supabase = createClient(url, key);
  }

  get client(): SupabaseClient { return this.supabase; }

  async signUp(email: string, password: string, fullName: string) {
    return this.supabase.auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: { data: { full_name: fullName.trim() } }
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  }

  async signOut() { return this.supabase.auth.signOut(); }
  async getUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getUser();
    if (!user) return false;
    const { data, error } = await this.supabase.client
      .from('profiles').select('role').eq('id', user.id).maybeSingle();
    return !error && data?.role === 'admin';
  }
}
