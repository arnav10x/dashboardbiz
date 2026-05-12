"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setIsLoading(false)
      setError(authError.message)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-base"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-base"
          required
        />
      </div>

      {error && (
        <p className="text-xs" style={{ color: 'var(--accent)' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 mt-1"
        style={{ background: 'var(--accent)', color: 'white' }}
      >
        {isLoading ? "Signing in…" : "Sign in →"}
      </button>
    </form>
  )
}
