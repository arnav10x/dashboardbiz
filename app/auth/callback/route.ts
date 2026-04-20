import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check onboarding to determine redirect logically
      const { user } = data
      let redirectPath = next
      
      if (user) {
        const { data: profile } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
          
        if (!profile) {
          redirectPath = '/onboarding'
        } else if (next === '/onboarding') {
          // If profile exists but next is onboarding (like an old confirmation link), force dashboard
          redirectPath = '/dashboard'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalhost = process.env.NODE_ENV === 'development'

      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Redirect to an error page if the code is invalid
  return NextResponse.redirect(`${origin}/login?error=Invalid+magic+link`)
}
