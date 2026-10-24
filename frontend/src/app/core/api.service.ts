import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = (environment.apiBaseUrl || '').replace(/\/$/, '');
  constructor(private readonly supabase: SupabaseService) {}

  async post<T>(path: string, body: unknown): Promise<T> {
    if (!this.base || !/^https?:\/\//i.test(this.base)) {
      throw new Error('Backend API URL is not configured. Set apiBaseUrl in the Angular environment.');
    }

    const { data, error: sessionError } = await this.supabase.client.auth.getSession();
    if (sessionError) throw new Error('Could not verify your session. Please sign in again.');
    const token = data.session?.access_token;
    if (!token) throw new Error('Please sign in again before using this AI tool.');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(`${this.base}/${path.replace(/^\//, '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const contentType = response.headers.get('content-type') || '';
      const result: any = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : { message: await response.text().catch(() => '') };
      if (!response.ok) {
        if (response.status === 401) throw new Error('Your session expired. Please sign in again.');
        if (response.status === 503) throw new Error(result?.message || 'AI service is not configured yet.');
        throw new Error(result?.message || result?.title || `Request failed (${response.status})`);
      }
      return result as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('The AI request took too long. Please try again.');
      }
      if (error instanceof TypeError) {
        throw new Error('Could not reach the backend API. Check the API deployment and CORS settings.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
