import { Check } from "lucide-react"

export function OnboardingProgress({ currentStep, totalSteps = 5 }: { currentStep: number, totalSteps?: number }) {
  return (
    <div className="mb-10 w-full relative">
      <div className="absolute top-1/2 left-0 h-0.5 w-full bg-zinc-800 -translate-y-1/2 z-0"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-300 ease-in-out" 
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      ></div>
      
      <div className="relative z-10 flex items-center justify-between w-full">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div 
              key={stepNum} 
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300 ${
                isActive 
                  ? "border-indigo-500 bg-[#09090b] text-indigo-500" 
                  : isCompleted
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-zinc-800 bg-[#09090b] text-zinc-600"
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4 text-white font-bold" /> : stepNum}
            </div>
          )
        })}
      </div>
    </div>
  )
}
