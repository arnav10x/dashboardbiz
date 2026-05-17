"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const stepTwoSchema = z.object({
  niche: z.string().min(3, "Please specify a niche (min 3 chars)"),
})

export type StepTwoData = z.infer<typeof stepTwoSchema>

export function StepTwo({ onNext, onBack, initialData }: { onNext: (data: StepTwoData) => void, onBack: () => void, initialData: Partial<StepTwoData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: { niche: initialData.niche || "" }
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Who is your target client?</h2>
        <p className="text-zinc-400">Be painfully specific. "Everyone" is a recipe for $0.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Specific Niche</label>
          <input 
            type="text"
            placeholder="e.g. local gyms, dental practices, D2C e-commerce brands"
            className="flex h-11 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            {...register("niche")}
          />
          {errors.niche && <p className="text-xs text-red-500">{errors.niche.message}</p>}
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
