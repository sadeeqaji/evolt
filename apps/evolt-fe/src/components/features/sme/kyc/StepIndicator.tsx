import { User, Briefcase, ChevronRight } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-4 mb-12">
      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium transition-all ${
          currentStep === 1
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        }`}
      >
        <User className="w-4 h-4" />
        Personal Information
      </button>

      <ChevronRight
        className={`w-5 h-5 ${
          currentStep === 2 ? "text-foreground" : "text-muted-foreground"
        }`}
      />

      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium transition-all ${
          currentStep === 2
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "bg-secondary text-tab-inactive"
        }`}
      >
        <Briefcase className="w-4 h-4" />
        Complete KYB
      </button>
    </div>
  );
};
