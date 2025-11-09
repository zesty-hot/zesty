"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Stepper, Step, StepperIndicator, useStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Upload } from "lucide-react";
import { toastManager } from "@/components/ui/toast";

interface OnboardingData {
  dob: string;
  slug: string;
  image: File | null;
}

function StepContent() {
  const { currentStep, nextStep } = useStepper();
  const [data, setData] = useState<OnboardingData>({
    dob: "",
    slug: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({ ...data, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (currentStep === 0) {
      if (!data.dob) {
        toastManager.add({ title: "Please enter your date of birth", type: "error" });
        return false;
      }
      const age = calculateAge(new Date(data.dob));
      if (age < 18) {
        toastManager.add({ title: "You must be at least 18 years old", type: "error" });
        return false;
      }
    } else if (currentStep === 1) {
      if (!data.slug) {
        toastManager.add({ title: "Please choose a username", type: "error" });
        return false;
      }
      if (data.slug.length < 3) {
        toastManager.add({ title: "Username must be at least 3 characters", type: "error" });
        return false;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(data.slug)) {
        toastManager.add({ title: "Username can only contain letters, numbers, hyphens, and underscores", type: "error" });
        return false;
      }
    } else if (currentStep === 2) {
      if (!data.image) {
        toastManager.add({ title: "Please upload at least one photo", type: "error" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    }
  };

  const handleComplete = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("dob", data.dob);
      formData.append("slug", data.slug);
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete onboarding");
      }

      // Update the session
      await update();
      
      toastManager.add({ title: "Welcome! Your profile is ready 🎉", type: "success" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
      toastManager.add({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to complete onboarding",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (currentStep === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">When were you born?</h2>
          <p className="text-muted-foreground">
            We need to verify you're at least 18 years old
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={data.dob}
            onChange={(e) => setData({ ...data, dob: e.target.value })}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <Button onClick={handleNext} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Choose your username</h2>
          <p className="text-muted-foreground">
            This will be your unique identifier on the platform
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Username</Label>
          <Input
            id="slug"
            type="text"
            placeholder="johndoe"
            value={data.slug}
            onChange={(e) => setData({ ...data, slug: e.target.value.toLowerCase() })}
          />
          <p className="text-xs text-muted-foreground">
            Letters, numbers, hyphens, and underscores only. Minimum 3 characters.
          </p>
        </div>
        <Button onClick={handleNext} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h2 className="text-2xl font-bold">Upload your photo</h2>
          <p className="text-muted-foreground">
            Add at least one photo to complete your profile
          </p>
        </div>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="flex justify-center">
            <Label
              htmlFor="image"
              className="cursor-pointer rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
            >
              {imagePreview ? "Change Photo" : "Upload Photo"}
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        <Button 
          onClick={handleComplete} 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Completing..." : "Complete Setup"}
        </Button>
      </div>
    );
  }

  return null;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already onboarded or not authenticated
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to Zesty!</CardTitle>
          <CardDescription>
            Let's set up your profile in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper totalSteps={3}>
            <StepperIndicator className="mb-8" />
            <StepContent />
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
}
