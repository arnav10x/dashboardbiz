"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { RefreshCcw, Loader2 } from "lucide-react"
import { OnboardingData } from "@/types/onboarding"

const stepFiveSchema = z.object({
  offerStatement: z.string().min(10, "Offer statement is required"),
})

type StepFiveData = z.infer<typeof stepFiveSchema>

export function StepFive({ 
  onComplete, 
  onBack, 
  data 
}: { 
  onComplete: (offer: string) => Promise<void>, 
  onBack: () => void, 
  data: Partial<OnboardingData> 
}) {
  const [offer, setOffer] = React.useState<string>("")
  const [isGenerating, setIsGenerating] = React.useState(true)
  const [generateCount, setGenerateCount] = React.useState(0)
  const [isSaving, setIsSaving] = React.useState(false)

  const { register, handleSubmit, setValue } = useForm<StepFiveData>({
    resolver: zodResolver(stepFiveSchema),
  })

  const generateOffer = React.useCallback(async () => {
    if (generateCount >= 3) return
    
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: data.service,
          niche: data.niche,
          result: data.result,
          price: data.price
        }),
      })
      const result = await res.json()
      if (result.offerStatement) {
        setOffer(result.offerStatement)
        setValue("offerStatement", result.offerStatement)
        setGenerateCount(prev => prev + 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }, [data, generateCount, setValue])

  React.useEffect(() => {
    generateOffer()
  }, [generateOffer])

  const onSubmit = async (formData: StepFiveData) => {
    setIsSaving(true)
    try {
      await onComplete(formData.offerStatement)
    } catch {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Your Grand Slam Offer</h2>
        <p className="text-zinc-400">Our AI formulated this tailored offer based on your inputs. Tweak it or accept it.</p>
      </div>

      <div className="space-y-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center p-8 border border-zinc-800 bg-[#18181b] rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm text-zinc-400">Synthesizing market data...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-[#18181b] px-3 py-3 text-base text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 resize-none font-medium leading-relaxed"
              {...register("offerStatement")}
            />
            {generateCount < 3 && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={generateOffer}
                  className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  Regenerate ({3 - generateCount} left)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button 
          type="button" 
          onClick={onBack} 
          disabled={isGenerating || isSaving}
          className="w-1/3 h-11 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 font-medium rounded-md transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button 
          type="submit" 
          disabled={isGenerating || isSaving}
          className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit & Start Journey"}
        </button>
      </div>
    </form>
  )
}
