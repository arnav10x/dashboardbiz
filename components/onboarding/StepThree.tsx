"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const stepThreeSchema = z.object({
  result: z.string().min(5, "Please describe the result in detail"),
})

export type StepThreeData = z.infer<typeof stepThreeSchema>

export function StepThree({ onNext, onBack, initialData }: { onNext: (data: StepThreeData) => void, onBack: () => void, initialData: Partial<StepThreeData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: { result: initialData.result || "" }
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">What result do you deliver?</h2>
        <p className="text-zinc-400">Clients buy outcomes, not services. What is the transformation?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">The Outcome</label>
          <input 
            type="text"
            placeholder="e.g. book 10-15 qualified sales calls per month"
            className="flex h-11 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            {...register("result")}
          />
          {errors.result && <p className="text-xs text-red-500">{errors.result.message}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="w-1/3 h-11 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 font-medium rounded-md transition-colors">
          Back
        </button>
        <button type="submit" className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors">
          Continue
        </button>
      </div>
    </form>
  )
}
