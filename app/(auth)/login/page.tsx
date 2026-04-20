import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Founder OS',
  description: 'Log into your Founder OS dashboard.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 py-12 text-[#fafafa]">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Founder OS</h1>
          <p className="text-sm text-zinc-400">
            Log in to execute your daily actions.
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <a href="/signup" className="underline underline-offset-4 hover:text-[#fafafa]">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
