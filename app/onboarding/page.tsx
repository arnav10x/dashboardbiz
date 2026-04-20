"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress"
import { StepOne, StepOneData } from "@/components/onboarding/StepOne"
import { StepTwo, StepTwoData } from "@/components/onboarding/StepTwo"
import { StepThree, StepThreeData } from "@/components/onboarding/StepThree"
import { StepFour, StepFourData } from "@/components/onboarding/StepFour"
import { StepFive } from "@/components/onboarding/StepFive"
import { OnboardingData } from "@/types/onboarding"
import { completeOnboarding } from "@/lib/onboarding"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [data, setData] = React.useState<Partial<OnboardingData>>({})

  const handleNext = (stepData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...stepData }))
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const handleComplete = async (offerStatement: string) => {
    const finalData = { ...data, offerStatement } as OnboardingData
    try {
      await completeOnboarding(finalData)
      router.push("/dashboard")
      router.refresh()
    } catch (e) {
      console.error(e)
      alert("Failed to save profile. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 py-12">
      <div className="mx-auto w-full max-w-[480px]">
        <OnboardingProgress currentStep={step} totalSteps={5} />
        
        <div className="mt-8">
          {step === 1 && <StepOne onNext={handleNext} initialData={data} />}
          {step === 2 && <StepTwo onNext={handleNext} onBack={handleBack} initialData={data} />}
          {step === 3 && <StepThree onNext={handleNext} onBack={handleBack} initialData={data} />}
          {step === 4 && <StepFour onNext={handleNext} onBack={handleBack} initialData={data} />}
          {step === 5 && <StepFive onComplete={handleComplete} onBack={handleBack} data={data} />}
        </div>
      </div>
    </div>
  )
}
