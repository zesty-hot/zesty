"use client";

import { useState, useEffect } from "react";
// Stripe imports removed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Stripe key removed


interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // clientSecret removed
  price: number;
  creatorName: string;
  onSuccess: () => void;
}

function CheckoutForm({ onSuccess, price, onClose }: { onSuccess: () => void; price: number; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSuccess();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-md text-center">
        <p className="text-sm text-muted-foreground mb-2">Total to pay</p>
        <p className="text-3xl font-bold">${(price / 100).toFixed(2)}</p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            `Confirm Payment`
          )}
        </Button>
      </div>
    </div>
  );
}

export function PaymentModal({
  isOpen,
  onClose,
  // clientSecret removed
  price,
  creatorName,
  onSuccess,
}: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {creatorName}</DialogTitle>
          <DialogDescription>
            Complete your subscription to unlock exclusive content.
          </DialogDescription>
        </DialogHeader>
        <CheckoutForm onSuccess={onSuccess} price={price} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
