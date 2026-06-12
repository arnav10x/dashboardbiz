"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be 24 characters or less.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

type FormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setServerError(null)
    const username = data.username.trim().toLowerCase()

    const { data: existing } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("username", username)
      .maybeSingle()

    if (existing) {
      setIsLoading(false)
      return setServerError("That username is taken. Try another one.")
    }

    const { data: signupData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName, username },
      },
    })

    if (error) {
      setIsLoading(false)
      return setServerError(error.message)
    }

    if (signupData.user?.id) {
      await supabase.from("user_profiles").upsert({
        user_id: signupData.user.id,
        full_name: data.fullName.trim(),
        username,
        email: data.email.trim().toLowerCase(),
      }, { onConflict: "user_id" })
    }

    router.push("/onboarding")
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              placeholder="Your full name"
              type="text"
              autoCapitalize="words"
              autoCorrect="off"
              disabled={isLoading}
              className="input-base disabled:cursor-not-allowed disabled:opacity-50"
              {...register("fullName")}
            />
            {errors?.fullName && (
              <p className="px-1 text-xs" style={{ color: '#f43f5e' }}>
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="username">
              Unique Username
            </label>
            <input
              id="username"
              placeholder="alex_founder"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              className="input-base disabled:cursor-not-allowed disabled:opacity-50"
              {...register("username")}
            />
            {errors?.username && (
              <p className="px-1 text-xs" style={{ color: '#f43f5e' }}>
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="input-base disabled:cursor-not-allowed disabled:opacity-50"
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs" style={{ color: '#f43f5e' }}>
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              className="input-base disabled:cursor-not-allowed disabled:opacity-50"
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs" style={{ color: '#f43f5e' }}>
                {errors.password.message}
              </p>
            )}
          </div>
          {serverError && (
             <p className="text-sm" style={{ color: '#f43f5e' }}>{serverError}</p>
          )}
          <button
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 mt-2" style={{ background: 'var(--accent)', color: 'white' }}
          >
            {isLoading ? "Creating account…" : "Start the sprint →"}
          </button>
        </div>
      </form>
    </div>
  )
}
