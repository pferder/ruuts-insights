
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type Step = {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

type StepWizardProps = {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
};

export const StepWizard = ({ 
  steps, 
  currentStep, 
  onStepClick,
  className 
}: StepWizardProps) => {
  return (
    <nav className={cn("mb-8", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = isCompleted && onStepClick;
          
          return (
            <li 
              key={step.id} 
              className={cn(
                "flex items-center", 
                index < steps.length - 1 ? "w-full" : ""
              )}
            >
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={isClickable ? () => onStepClick(index) : undefined}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0",
                    isActive 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground",
                    isClickable ? "cursor-pointer hover:bg-primary/90" : ""
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.icon || index + 1}</span>
                  )}
                </button>
                
                <div className="mt-2 text-center">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isActive || isCompleted 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-full h-0.5 mx-2", 
                    index < currentStep 
                      ? "bg-primary" 
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
