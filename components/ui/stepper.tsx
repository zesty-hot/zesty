"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(
  undefined
);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a Stepper");
  }
  return context;
}

interface StepperProps {
  children: React.ReactNode;
  initialStep?: number;
  className?: string;
  totalSteps: number;
}

function Stepper({ children, initialStep = 0, className, totalSteps }: StepperProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);

  const goToStep = React.useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = React.useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <StepperContext.Provider
      value={{ currentStep, totalSteps, goToStep, nextStep, prevStep }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </StepperContext.Provider>
  );
}

interface StepperIndicatorProps {
  className?: string;
}

function StepperIndicator({ className }: StepperIndicatorProps) {
  const { currentStep, totalSteps } = useStepper();

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                {
                  "border-primary bg-primary text-primary-foreground":
                    isCompleted || isCurrent,
                  "border-muted-foreground/25 text-muted-foreground":
                    !isCompleted && !isCurrent,
                }
              )}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 transition-all md:w-24",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/25"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface StepProps {
  children: React.ReactNode;
  className?: string;
}

function Step({ children, className }: StepProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export { Stepper, Step, StepperIndicator, useStepper };
