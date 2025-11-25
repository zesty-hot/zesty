"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "./payment-modal";
import { toastManager } from "@/components/ui/toast";

interface VIPFollowButtonProps {
  vipPageId: string;
  isFree: boolean;
  price: number;
  isSubscribed: boolean;
  creatorName: string;
  onSubscriptionChange: () => void;
  activeDiscount?: {
    discountPercent: number;
    discountedPrice: number;
  } | null;
}

export function VIPFollowButton({
  vipPageId,
  isFree,
  price,
  isSubscribed,
  creatorName,
  onSubscriptionChange,
  activeDiscount,
}: VIPFollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isHoveringSubscribed, setIsHoveringSubscribed] = useState(false);
  const [subscribed, setSubscribed] = useState<boolean>(isSubscribed);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const displayPrice = activeDiscount ? activeDiscount.discountedPrice : price;

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/vip/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vipPageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      if (isFree) {
        // Free subscription success
        toastManager.add({
          title: "Success",
          description: "Followed successfully!",
          type: "success",
        });
        onSubscriptionChange();
        setSubscribed(true);
      } else {
        // Paid subscription - open modal
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setSubscriptionId(data.subscriptionId);
          setIsPaymentModalOpen(true);
        } else {
          // Maybe already subscribed?
          if (data.message === "Already subscribed") {
            toastManager.add({
              title: "Info",
              description: "You are already subscribed.",
              type: "info",
            });
            onSubscriptionChange();
            setSubscribed(true);
          }
        }
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toastManager.add({
        title: "Error",
        description: error.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/vip/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vipPageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe");
      }

      toastManager.add({
        title: "Success",
        description: "Unsubscribed successfully",
        type: "success",
      });
      setSubscribed(false);
      onSubscriptionChange();
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      toastManager.add({
        title: "Error",
        description: error.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);

    // Verify subscription
    if (subscriptionId) {
      try {
        await fetch("/api/vip/verify-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        });
      } catch (e) {
        console.error("Verification failed", e);
      }
    }

    toastManager.add({
      title: "Success",
      description: "Subscription successful!",
      type: "success",
    });
    setSubscribed(true);
    onSubscriptionChange();
  };

  if (subscribed) {
    return (
      <Button
        size="lg"
        variant={isHoveringSubscribed ? "destructive" : "outline"}
        className="w-full relative overflow-hidden transition-colors"
        onMouseEnter={() => setIsHoveringSubscribed(true)}
        onMouseLeave={() => setIsHoveringSubscribed(false)}
        onClick={handleUnsubscribe}
        disabled={isLoading}
      >
        <span
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            isHoveringSubscribed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Subscribed
            </>
          )}
        </span>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHoveringSubscribed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <X className="w-4 h-4 mr-2" />
              Unsubscribe
            </>
          )}
        </span>
      </Button>
    );
  }

  return (
    <>
      <div className="space-y-2 w-full">
        <Button
          size="lg"
          className={cn(
            "w-full",
            !isFree && "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          )}
          onClick={handleFollow}
          disabled={isLoading}
        >
          {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </span>
          )}
          <span className={cn("flex items-center justify-center", isLoading ? "opacity-0" : "opacity-100")}>
            {isFree ? (
              "Follow for Free"
            ) : (
              `Subscribe $${(displayPrice / 100).toFixed(2)}/month`
            )}
          </span>
        </Button>
        {!isFree && activeDiscount && (
          <p className="text-xs text-muted-foreground text-center">
            <span className="line-through">${(price / 100).toFixed(2)}</span> Save{" "}
            {activeDiscount.discountPercent}%
          </p>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientSecret={clientSecret || ""}
        price={displayPrice}
        creatorName={creatorName}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
