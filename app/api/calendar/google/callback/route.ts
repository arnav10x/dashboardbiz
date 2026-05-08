import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  if (!code || !userId) {
    return NextResponse.redirect(`${appUrl}/dashboard/calendar?google_error=missing_params`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${appUrl}/api/calendar/google/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const supabase = createClient();
    await supabase.from('user_oauth_tokens').upsert({
      user_id: userId,
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: expiresAt,
      scope: tokens.scope,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

    return NextResponse.redirect(`${appUrl}/dashboard/calendar?google_connected=1`);
  } catch (e: any) {
    console.error('Google OAuth callback error:', e);
    return NextResponse.redirect(`${appUrl}/dashboard/calendar?google_error=${encodeURIComponent(e.message)}`);
  }
}
