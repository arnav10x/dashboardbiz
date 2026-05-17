import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check Your Email | Founder OS',
}

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 py-12 text-[#fafafa]">
      <div className="mx-auto w-full max-w-[400px] space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
        <p className="text-base text-zinc-400">
          We've sent you a confirmation link. Please click the link to verify your account and start your 30-day roadmap.
        </p>
        <div className="pt-4">
          <a
            href="/login"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-400"
          >
            Return to login
          </a>
        </div>
      </div>
    </div>
  )
}
