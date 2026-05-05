"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, X } from "lucide-react";

export default function AgeVerify() {
  const [showModal, setShowModal] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age in this session
    const ageVerified = sessionStorage.getItem("age_verified");

    if (!ageVerified) {
      // Small delay to ensure page has loaded
      setTimeout(() => {
        setShowModal(true);
      }, 100);
    }
  }, []);

  const handleAgree = () => {
    setIsClosing(true);
    setTimeout(() => {
      sessionStorage.setItem("age_verified", "true");
      setShowModal(false);
      setIsClosing(false);
    }, 300);
  };

  const handleDisagree = () => {
    // Redirect to a safe page or show message
    window.location.href = "https://www.google.com";
  };

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isClosing ? "opacity-0" : "opacity-100"
        }`}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative bg-card border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all duration-300 ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Age Verification Required</h2>
          <p className="text-muted-foreground">
            This website contains adult content. You must be 18 years or older
            to access this site.
          </p>
          <p className="text-sm text-muted-foreground">
            By clicking "I Agree", you confirm that you are of legal age to
            view adult content in your jurisdiction.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8">
          <Button
            onClick={handleAgree}
            size="lg"
            className="w-full font-semibold"
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            I Agree - I am 18 or Older
          </Button>
          <Button
            onClick={handleDisagree}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <X className="w-5 h-5 mr-2" />
            I Disagree - Exit
          </Button>
        </div>

        {/* Legal disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          This verification will remain active for your current browsing
          session only.
        </p>
      </div>
    </div>
  );
}