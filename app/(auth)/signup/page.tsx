import { SignupForm } from '@/components/auth/SignupForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Founder OS',
  description: 'Start your 30-day journey to your first paying clients.',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 py-12 text-[#fafafa]">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Founder OS</h1>
          <p className="text-sm text-zinc-400">
            Commit to the 30-day performance sprint.
          </p>
        </div>
        <SignupForm />
        <p className="px-8 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <a href="/login" className="underline underline-offset-4 hover:text-[#fafafa]">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
