"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const stepFourSchema = z.object({
  price: z.coerce.number()
    .min(100, "Price must be at least $100")
    .max(10000, "Price cannot exceed $10,000 for your first clients"),
  monthlyGoal: z.coerce.number()
    .min(500, "Monthly goal must be at least $500"),
})

export type StepFourData = z.infer<typeof stepFourSchema>

export function StepFour({ onNext, onBack, initialData }: { onNext: (data: StepFourData) => void, onBack: () => void, initialData: Partial<StepFourData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepFourData>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: { 
      price: initialData.price,
      monthlyGoal: initialData.monthlyGoal 
    }
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Economics & Goals</h2>
        <p className="text-zinc-400">Set your minimum acceptable pricing floor.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Base Price per Month / Engagement ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input 
              type="number"
              placeholder="1000"
              className="flex h-11 w-full rounded-md border border-zinc-800 bg-[#18181b] pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              {...register("price")}
            />
          </div>
          {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Target 30-Day Revenue ($)</label>
          <select 
            className="flex h-11 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            {...register("monthlyGoal")}
          >
            <option value="" disabled>Select target...</option>
            <option value={1000}>$1,000</option>
            <option value={2500}>$2,500</option>
            <option value={5000}>$5,000</option>
            <option value={10000}>$10,000</option>
          </select>
          {errors.monthlyGoal && <p className="text-xs text-red-500">{errors.monthlyGoal.message}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="w-1/3 h-11 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 font-medium rounded-md transition-colors">
          Back
        </button>
        <button type="submit" className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors">
          Generate Offer
        </button>
      </div>
    </form>
  )
}
