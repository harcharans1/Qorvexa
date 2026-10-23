import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');
  constructor(private readonly supabase: SupabaseService) {}

  async post<T>(path: string, body: unknown): Promise<T> {
    const { data } = await this.supabase.client.auth.getSession();
    const token = data.session?.access_token;
    const response = await fetch(`${this.base}/${path.replace(/^\//, '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.message || result?.title || `Request failed (${response.status})`);
    return result as T;
  }
}
