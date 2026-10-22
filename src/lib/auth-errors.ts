export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email.trim());
}
export function authErrorMessage(error: unknown): string {
  const e = error as { message?: string; status?: number; code?: string } | null;
  const message = e?.message ?? String(error);
  if (/failed to fetch|network|load failed|fetch failed/i.test(message))
    return "Unable to reach the sign-in service. Check your connection and try again. If this persists, the site owner must verify the Vercel VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY settings, then redeploy. Browser privacy tools may also block the connection.";
  if (e?.status === 429 || /rate.limit/i.test(message))
    return "Too many attempts. Wait a few minutes before trying again.";
  if (/email.not.confirmed/i.test(message) || e?.code === "email_not_confirmed")
    return "Please verify your email using the confirmation link before signing in.";
  if (/invalid.login.credentials/i.test(message))
    return "The email or password is incorrect. Please try again.";
  if (/signup.*disabled|signups.*not allowed/i.test(message))
    return "Account creation is currently unavailable. The site owner must review sign-up settings.";
  return message;
}
export function browserAuthConfigError(url?: string, key?: string): string | null {
  if (!url || !key)
    return "Sign-in is not configured on this deployment. The site owner must set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel and redeploy.";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:")
      return "The sign-in service URL must use HTTPS. Ask the site owner to correct VITE_SUPABASE_URL and redeploy.";
    if (parsed.hostname.endsWith(".supabase.com"))
      return "The sign-in service hostname is incorrect: backend API addresses end in .co, not .com. The site owner must correct VITE_SUPABASE_URL in Vercel using the existing backend URL and redeploy.";
  } catch {
    return "The sign-in service URL is invalid. Ask the site owner to correct VITE_SUPABASE_URL and redeploy.";
  }
  if (key.startsWith("sb_secret_"))
    return "An unsafe sign-in key was configured. Remove it from browser settings and use the publishable key.";
  return null;
}