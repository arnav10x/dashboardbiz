"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const stepOneSchema = z.object({
  serviceCategory: z.string().min(1, "Please select a category"),
  service: z.string().min(3, "Please describe your exact service (min 3 chars)"),
})

export type StepOneData = z.infer<typeof stepOneSchema>

const CATEGORIES = [
  "SMMA", "Web Design", "AI Automation", 
  "Copywriting", "Video Editing", "Freelance Dev", 
  "Appointment Setting", "Other"
]

export function StepOne({ onNext, initialData }: { onNext: (data: StepOneData) => void, initialData: Partial<StepOneData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      serviceCategory: initialData.serviceCategory || "",
      service: initialData.service || "",
    }
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">What service do you offer?</h2>
        <p className="text-zinc-400">The mechanism you will use to deliver value.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Broad Category</label>
          <select 
            className="flex h-11 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            {...register("serviceCategory")}
          >
            <option value="" disabled>Select your business model...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.serviceCategory && <p className="text-xs text-red-500">{errors.serviceCategory.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Specific Service Description</label>
          <input 
            type="text"
            placeholder="e.g. Meta Ads for local businesses, short-form TikTok edits..."
            className="flex h-11 w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            {...register("service")}
          />
          {errors.service && <p className="text-xs text-red-500">{errors.service.message}</p>}
        </div>
      </div>

      <button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors">
        Continue
      </button>
    </form>
  )
}
