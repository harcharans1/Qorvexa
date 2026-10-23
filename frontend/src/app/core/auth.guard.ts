import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  const user = await supabase.getUser();
  return user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const adminGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  if (!(await supabase.getUser())) return router.createUrlTree(['/login']);
  return (await supabase.isAdmin()) ? true : router.createUrlTree(['/dashboard']);
};
