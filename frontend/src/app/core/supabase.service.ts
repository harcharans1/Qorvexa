import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://lobubnlgulpkgwohkdiz.supabase.co'; // apna URL
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnVibmxndWxwa2d3b2hrZGl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjU5NDEzNywiZXhwIjoyMTA4MTcwMTM3fQ.GkQhCI_xjV3B4ExiVuxJ5iy9OguX9PEYz3ZGmB99E38'; // apni Anon Key

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  get client() {
    return this.supabase;
  }

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}