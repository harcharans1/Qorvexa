/** Public browser configuration only. Never put service_role or secret keys here. */
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY',
  apiBaseUrl: 'https://localhost:7033/api'
};
