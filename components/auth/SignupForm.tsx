"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

type FormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
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

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      return setServerError(result.error)
    }

    router.push("/confirm")
    router.refresh()
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              placeholder="Leo Founder"
              type="text"
              autoCapitalize="words"
              autoCorrect="off"
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("fullName")}
            />
            {errors?.fullName && (
              <p className="px-1 text-xs text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="email">
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
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          {serverError && (
             <p className="text-sm text-red-500">{serverError}</p>
          )}
          <button
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 mt-2"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </div>
      </form>
    </div>
  )
}
