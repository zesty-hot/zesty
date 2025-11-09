"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Stepper, Step, StepperIndicator, useStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Upload, Mars, Venus, Transgender, MapPin } from "lucide-react";
import { toastManager } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { searchLocations, type LocationSuggestion } from '@/lib/geocoding';

interface OnboardingData {
  dob: string;
  slug: string;
  image: File | null;
  ethnicity: string;
  gender: string;
  bodyType: string;
  suburb: string;
}

function StepContent() {
  const { currentStep, nextStep } = useStepper();
  const [data, setData] = useState<OnboardingData>({
    dob: "",
    slug: "",
    image: null,
    ethnicity: "",
    gender: "",
    bodyType: "",
    suburb: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useSession();
  
  // For suburb/city search
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced search for suburb suggestions
  useEffect(() => {
    if (searchQuery.length <= 1) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const results = await searchLocations(searchQuery);
      setLocationSuggestions(results);
      setIsLoadingSuggestions(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    } else if (currentStep === 3) {
      if (!data.ethnicity) {
        toastManager.add({ title: "Please select your ethnicity", type: "error" });
        return false;
      }
    } else if (currentStep === 4) {
      if (!data.gender) {
        toastManager.add({ title: "Please select your gender", type: "error" });
        return false;
      }
    } else if (currentStep === 5) {
      if (!data.bodyType) {
        toastManager.add({ title: "Please select your body type", type: "error" });
        return false;
      }
    } else if (currentStep === 6) {
      if (!data.suburb) {
        toastManager.add({ title: "Please select your suburb/city", type: "error" });
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
      formData.append("ethnicity", data.ethnicity);
      formData.append("gender", data.gender);
      formData.append("bodyType", data.bodyType);
      formData.append("suburb", data.suburb);
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
        <Button onClick={handleNext} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    );
  }

  if (currentStep === 3) {
    const ethnicities = [
      { id: "ASIAN", label: "Asian" },
      { id: "AFRICAN", label: "African" },
      { id: "HISPANIC", label: "Hispanic" },
      { id: "WHITE", label: "White" },
      { id: "DESI", label: "Desi" },
      { id: "ARABIC", label: "Arabic" },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h2 className="text-2xl font-bold">Select your ethnicity</h2>
          <p className="text-muted-foreground">
            This helps others find you
          </p>
        </div>
        <div className="grid gap-3">
          <ul className="items-center w-full text-sm font-medium dark:bg-neutral-800 border rounded-lg sm:flex sm:flex-wrap">
            {ethnicities.map((ethnicity, index) => (
              <li className={`w-full sm:w-1/3 ${index < ethnicities.length - 1 ? 'sm:border-r border-b sm:last:border-r-0' : ''}`} key={ethnicity.id}>
                <label htmlFor={`${ethnicity.id}-radio`} className="flex items-center ps-3 py-3 w-full cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    id={`${ethnicity.id}-radio`}
                    name="ethnicity"
                    value={ethnicity.id}
                    checked={data.ethnicity === ethnicity.id}
                    onChange={(e) => setData({ ...data, ethnicity: e.target.value })}
                    className="w-4 h-4 shrink-0"
                  />
                  <span className="ms-2 text-sm font-medium">{ethnicity.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={handleNext} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    );
  }

  if (currentStep === 4) {
    const genders = [
      { id: "MALE", label: "Male", icon: Mars },
      { id: "FEMALE", label: "Female", icon: Venus },
      { id: "TRANS", label: "Trans", icon: Transgender },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h2 className="text-2xl font-bold">Select your gender</h2>
          <p className="text-muted-foreground">
            Choose the option that best represents you
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {genders.map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className="relative flex cursor-pointer dark:bg-neutral-800 flex-col gap-4 rounded-md border border-input p-4 shadow-xs hover:border-primary/40 outline-none has-checked:border-primary/50"
              htmlFor={`${id}-radio`}
            >
              <div className="flex justify-between gap-2">
                <input
                  type="radio"
                  id={`${id}-radio`}
                  name="gender"
                  value={id}
                  checked={data.gender === id}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                  className="order-1 after:absolute after:inset-0"
                />
                <Icon className="opacity-60" size={22} aria-hidden="true" />
              </div>
              <span className="inline-flex items-center gap-2 text-sm/4">{label}</span>
            </label>
          ))}
        </div>
        <Button onClick={handleNext} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    );
  }

  if (currentStep === 5) {
    const bodyTypes = [
      {
        id: "REGULAR", label: "Regular", icon: (
          <svg xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            className="size-10"
            viewBox="173.53509521484375 5.148684024810791 176.9298095703125 499.9531555175781"
            version="1.1"
            fill="currentColor">
            <path d="M 248.912 6.445 C 225.028 13.033, 209.982 37.858, 215.118 62.201 C 217.616 74.040, 225.134 85.253, 234.982 91.829 C 244.541 98.212, 252.197 100.297, 264.336 99.824 C 273.622 99.463, 275.169 99.105, 282.238 95.683 C 295.651 89.189, 304.659 78.085, 308.511 63.297 C 314.834 39.023, 299.319 12.964, 274.632 6.390 C 268.329 4.712, 255.091 4.740, 248.912 6.445 M 218.300 112.840 C 195.504 120.813, 181.932 148.385, 175.279 200.240 C 173.928 210.771, 173.569 221.939, 173.539 254.500 C 173.504 291.240, 173.677 295.822, 175.199 298.602 C 178.655 304.911, 186.136 307.453, 192.443 304.460 C 199.646 301.042, 199.488 302.033, 199.599 259.543 C 199.672 231.686, 200.127 217.751, 201.301 207.500 C 202.947 193.134, 206.383 173.691, 207.977 169.728 C 208.511 168.400, 208.901 231.902, 208.942 327 C 208.989 435.024, 209.350 487.719, 210.060 490.277 C 210.637 492.355, 212.504 495.644, 214.210 497.586 C 224.866 509.722, 244.250 506.618, 250.447 491.782 C 251.816 488.505, 252 476.253, 252 388.532 L 252 289 262 289 L 272 289 272 388.532 C 272 497.445, 271.708 491.920, 277.803 498.342 C 284.137 505.016, 295.032 507.065, 302.885 503.059 C 307.855 500.523, 312.627 495.007, 313.940 490.277 C 314.650 487.722, 315.023 434.917, 315.093 327 C 315.206 155.286, 315.075 159.032, 319.932 188.317 C 323.648 210.721, 324.341 221.790, 324.421 260.043 C 324.509 301.980, 324.359 301.044, 331.557 304.460 C 337.864 307.453, 345.345 304.911, 348.801 298.602 C 350.323 295.822, 350.496 291.240, 350.461 254.500 C 350.431 221.939, 350.072 210.771, 348.721 200.240 C 343.717 161.236, 335.402 137.505, 321.941 123.800 C 317.606 119.388, 313.217 116.051, 309.388 114.258 L 303.500 111.500 263.500 111.261 C 227.024 111.042, 223.042 111.181, 218.300 112.840" stroke="none" fillRule="evenodd" />
          </svg>
        )
      },
      {
        id: "PLUS", label: "Plus", icon: (
          <svg xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            viewBox="129.4348907470703 10.186110496520996 265.3359680175781 482.8441467285156"
            fill="currentColor"
            className="size-10">
            <path d="M 253.500 11.109 C 246.346 12.141, 236.553 16.880, 230.419 22.280 C 221.539 30.096, 215 45.174, 215 57.831 C 215 65.008, 218.775 77.360, 222.719 83.090 C 226.247 88.215, 233.975 95.629, 239 98.709 C 243.766 101.630, 256.355 105, 262.500 105 C 274.438 105, 287.849 99.042, 296.635 89.834 C 305.696 80.338, 309 71.698, 309 57.500 C 309 42.744, 305.284 33.509, 295.399 23.702 C 288.583 16.941, 279.812 12.532, 270.308 11.091 C 262.334 9.881, 262.012 9.882, 253.500 11.109 M 224 115.975 C 208.179 119.316, 198.670 123.130, 187.109 130.770 C 153.925 152.699, 133.759 192.598, 129.983 243.790 C 128.547 263.255, 130.054 288.074, 133.089 294.934 C 136.854 303.446, 142.274 307.286, 150.524 307.286 C 160.951 307.286, 166.547 301.870, 168.061 290.316 C 168.552 286.567, 169.894 273.825, 171.044 262 C 173.799 233.657, 174.440 229.572, 178.261 216 C 182.094 202.385, 182.619 203.791, 181.094 223.586 C 179.560 243.510, 179.743 287.678, 181.491 319 C 183.070 347.310, 184.825 370.693, 185.526 372.774 C 185.762 373.474, 186.876 381.233, 188.002 390.014 C 189.127 398.796, 190.490 408.122, 191.031 410.740 C 196.617 437.785, 198.157 444.727, 200.294 452.500 C 206.483 475.008, 210.063 482.897, 216.500 488.206 C 224.343 494.675, 237.260 494.632, 244.339 488.114 C 252.437 480.659, 253.432 474.344, 256.565 410.500 C 259.943 341.654, 260.087 339.553, 261.519 338.086 C 262.590 336.989, 263.218 336.936, 264.318 337.849 C 265.409 338.755, 265.888 343.569, 266.400 358.763 C 266.765 369.618, 267.494 384.575, 268.019 392 C 268.544 399.425, 269.462 416.750, 270.059 430.500 C 270.655 444.250, 271.546 459.841, 272.038 465.146 C 273.784 483.963, 281.071 493, 294.500 493 C 305.789 493, 314.862 484.637, 319.451 470 C 320.400 466.975, 321.766 463.150, 322.488 461.500 C 323.210 459.850, 324.579 454.900, 325.530 450.500 C 326.482 446.100, 327.631 441.782, 328.083 440.904 C 328.535 440.026, 330.046 433.276, 331.440 425.904 C 332.835 418.532, 334.419 410.250, 334.961 407.500 C 338.152 391.318, 342.462 353.199, 344.007 327.500 C 346.768 281.578, 346.892 248.409, 344.427 215 C 344.041 209.775, 343.983 205.733, 344.297 206.017 C 346.113 207.662, 351.281 234.068, 353.028 250.629 C 355.238 271.573, 356.680 283.617, 358.013 292.252 C 359.576 302.377, 365.506 307.400, 375.717 307.245 C 385.768 307.094, 392.457 300.023, 394.188 287.720 C 395.370 279.325, 394.611 233.542, 393.191 227.500 C 392.674 225.300, 391.301 219, 390.141 213.500 C 381.725 173.588, 359.094 141.201, 328.821 125.743 C 316.277 119.338, 313.550 118.407, 299.097 115.593 C 286.934 113.226, 283.676 113.005, 261.638 113.062 C 239.054 113.120, 236.631 113.308, 224 115.975" stroke="none" fillRule="evenodd" />
          </svg>
        )
      },
      {
        id: "ATHLETE", label: "Athletic", icon: (
          <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="128.99037170410156 8.117077827453613 328.0350341796875 499.8729553222656"
            fill="currentColor"
            preserveAspectRatio="xMidYMid meet"
            className="size-10">
            <path d="M 248.500 9.402 C 236.912 13.077, 227.806 20.965, 222.693 31.759 C 219.730 38.015, 219.500 39.260, 219.500 49.052 C 219.500 59.237, 219.631 59.868, 223.266 67.223 C 236.113 93.218, 270.664 98.711, 290.503 77.912 C 298.296 69.741, 301.205 62.890, 301.776 51.354 C 302.119 44.427, 301.809 40.908, 300.499 36.854 C 296.137 23.365, 286.146 13.436, 273.068 9.595 C 266.645 7.709, 254.150 7.610, 248.500 9.402 M 192.989 104.854 C 184.821 107.495, 178.741 111.433, 172.617 118.047 C 166.363 124.802, 161.466 134.058, 160.005 141.886 C 159.395 145.155, 159 173.565, 159 214.136 L 159 281 156.500 281 C 154.119 281, 154 280.722, 154 275.174 C 154 266.662, 151.943 265, 141.408 265 C 128.299 265, 129 263.396, 129 293.402 C 129 323.846, 128.176 322, 141.772 322 C 150.057 322, 151.028 321.798, 152.443 319.777 C 153.375 318.448, 154 315.436, 154 312.277 L 154 307 157.837 307 C 160.927 307, 162.469 307.756, 165.753 310.880 C 173.811 318.545, 186.348 318.394, 193.961 310.541 C 196.843 307.566, 198.081 307, 201.696 307 L 206 307 206 312.277 C 206 320.089, 207.481 321.592, 216.003 322.432 C 224.490 323.268, 229.228 321.989, 230.853 318.424 C 231.610 316.763, 232 308.079, 232 292.907 L 232 269.909 229.545 267.455 C 227.326 265.235, 226.281 265, 218.618 265 C 210.656 265, 210.020 265.159, 208.073 267.635 C 206.561 269.557, 206 271.721, 206 275.635 C 206 280.929, 205.961 281, 203 281 L 200 281 200 215.135 C 200 150.015, 200.023 149.240, 202.073 146.635 C 203.212 145.186, 205.012 144, 206.073 144 C 207.952 144, 208 145.351, 208 198.500 L 208 253 221.550 253 C 231.893 253, 235.816 253.371, 238.128 254.566 C 243.644 257.419, 244 259.780, 244 293.500 C 244 335.396, 244.748 334, 222.297 334 C 208.343 334, 208.026 334.048, 207.475 336.250 C 207.166 337.488, 207.045 372.475, 207.206 414 L 207.500 489.500 209.855 494.238 C 214.306 503.195, 221.955 508.007, 231.718 507.990 C 242.363 507.972, 251.114 501.946, 254.573 492.252 C 255.656 489.219, 255.921 469.875, 255.956 391.250 L 256 294 260.481 294 L 264.962 294 265.231 392.250 L 265.500 490.500 267.662 494.500 C 270.455 499.666, 275.527 504.493, 280.218 506.449 C 285.476 508.642, 294.524 508.398, 300 505.916 C 306.048 503.174, 308.813 500.458, 311.623 494.500 L 313.980 489.500 313.990 316.750 C 314.001 132.846, 313.759 141.911, 318.559 145.418 C 320.406 146.768, 320.524 148.689, 321 185.198 L 321.500 223.560 324.055 228.521 C 329.024 238.171, 341.717 242.462, 350.897 237.597 C 352.766 236.607, 361.541 228.813, 370.397 220.277 C 382.596 208.520, 386.438 204.232, 386.245 202.591 C 386.075 201.141, 387.480 198.964, 390.495 196.004 C 392.973 193.573, 395 191.123, 395 190.561 C 395 189.998, 390.888 185.409, 385.863 180.362 L 376.725 171.187 372.713 174.093 C 370.072 176.006, 367.483 177, 365.141 177 C 361.907 177, 360.366 175.784, 348.291 163.709 C 335.316 150.734, 335 150.315, 335 146.074 C 335 141.948, 335.454 141.267, 344.088 132.464 C 352.039 124.356, 353.042 122.947, 352.107 121.200 C 350.137 117.520, 341.709 110.965, 334.124 107.216 L 326.607 103.500 262.553 103.286 C 203.486 103.088, 198.071 103.210, 192.989 104.854 M 367.720 126.250 C 354.534 139.043, 349.947 144.104, 349.970 145.837 C 350.003 148.384, 360.933 160.527, 364.097 161.531 C 366.370 162.252, 369.543 160.665, 373.709 156.724 L 376.917 153.688 394.871 172.094 L 412.825 190.500 408.912 194.538 C 403.024 200.615, 403.431 203.177, 411.521 210.945 C 417.170 216.369, 418.399 217.117, 420.713 216.536 C 423.321 215.881, 441.261 199.778, 451.750 188.676 C 458.525 181.505, 458.683 178.852, 452.750 171.869 C 445.224 163.010, 441.497 162.347, 434.877 168.688 L 431.254 172.158 413.218 153.835 L 395.183 135.512 399.685 130.698 C 405.392 124.597, 405.064 122.597, 397.062 114.750 C 388.198 106.057, 388.762 105.836, 367.720 126.250" stroke="none" fillRule="evenodd" />
          </svg>
        )
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h2 className="text-2xl font-bold">Select your body type</h2>
          <p className="text-muted-foreground">
            Choose the option that best describes you
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full">
          {bodyTypes.map(({ id, label, icon }) => (
            <label key={id} htmlFor={`${id}-radio`} className="cursor-pointer">
              <div className="relative flex items-center dark:bg-neutral-800 gap-3 w-full rounded-md border border-input p-4 shadow-xs hover:border-primary/40 transition-colors has-checked:border-primary/50">
                <input
                  type="radio"
                  id={`${id}-radio`}
                  name="body-type"
                  value={id}
                  checked={data.bodyType === id}
                  onChange={(e) => setData({ ...data, bodyType: e.target.value })}
                  className="shrink-0"
                />
                <div className="flex items-center gap-1 w-full justify-center md:justify-start">
                  {icon}
                  <div className="font-medium hidden sm:block text-sm text-center w-full justify-center">{label}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        <Button onClick={handleNext} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    );
  }

  if (currentStep === 6) {
    const handleLocationSelect = (value: string | null) => {
      if (!value) return;

      const location = locationSuggestions.find(l => l.value === value);
      if (location) {
        setData({ ...data, suburb: location.label });
        setSearchQuery(location.label);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Where are you located?</h2>
          <p className="text-muted-foreground">
            Select your suburb or city
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="suburb">Suburb/City</Label>
          <Combobox
            value={locationSuggestions.find(l => l.label === data.suburb)?.value || null}
            onValueChange={handleLocationSelect}
          >
            <div className="relative w-full">
              <ComboboxInput
                id="suburb"
                placeholder="Search for your suburb or city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                showTrigger={false}
              />
            </div>

            {searchQuery.length > 1 && (
              <ComboboxPopup>
                <ComboboxList>
                  {isLoadingSuggestions ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : locationSuggestions.length === 0 ? (
                    <ComboboxEmpty>
                      No locations found.
                    </ComboboxEmpty>
                  ) : (
                    locationSuggestions.map((location) => (
                      <ComboboxItem key={location.value} value={location.value} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <span>{location.label}</span>
                          <span className="text-xs text-muted-foreground capitalize">{location.type}</span>
                        </div>
                      </ComboboxItem>
                    ))
                  )}
                </ComboboxList>
              </ComboboxPopup>
            )}
          </Combobox>
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
    <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
      <Spinner className="size-8 text-muted-foreground"/>
    </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to Zesty!</CardTitle>
          <CardDescription>
            Let's set up your profile in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper totalSteps={7}>
            <StepperIndicator className="mb-8" />
            <StepContent />
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
}
