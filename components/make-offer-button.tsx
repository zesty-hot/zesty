"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign, Calendar, Plus } from "lucide-react";

interface ServiceOption {
  durationMin: number;
  price: number;
}

interface Service {
  id: string;
  category: string;
  label: string | null;
  options: ServiceOption[];
}

interface Extra {
  id: string;
  name: string;
  price: number;
}

interface PrivateAd {
  id: string;
  title: string;
  description: string;
  workerId: string;
  services: Service[];
  extras: Extra[];
  daysAvailable: string[];
}

interface MakeOfferButtonProps {
  ad: PrivateAd;
  chatId?: string;
  onOfferMade?: () => void;
}

export function MakeOfferButton({ ad, chatId, onOfferMade }: MakeOfferButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isAsap, setIsAsap] = useState(false);

  const calculateTotal = () => {
    let total = selectedOption?.price || 0;

    for (const extraId of selectedExtras) {
      const extra = ad.extras.find(e => e.id === extraId);
      if (extra) {
        total += extra.price;
      }
    }

    return total;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedOption(service.options[0] || null);
  };

  const toggleExtra = (extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter(id => id !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, extraId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedOption) {
      alert("Please select a service");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/escorts/offers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: ad.workerId,
          adId: ad.id,
          service: selectedService.category,
          durationMin: selectedOption.durationMin,
          extras: selectedExtras.map(id => ad.extras.find(e => e.id === id)?.name),
          scheduledFor: isAsap ? null : scheduledFor || null,
          isAsap,
          amount: calculateTotal(),
          chatId: chatId || null,
        }),
      });

      if (response.ok) {
        setOpen(false);
        onOfferMade?.();
        alert("Offer sent successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to send offer: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending offer:", error);
      alert("Failed to send offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="w-full"
        render={(props) => (
          <Button {...props} className="w-full">
            <DollarSign className="w-4 h-4 mr-2" />
            Make an Offer
          </Button>
        )}
      />
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>{ad.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 space-y-6 pr-2">
            {/* Service Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Service *</Label>
              <div className="grid gap-3">
                {ad.services.map((service) => (
                  <Card
                    key={service.id}
                    className={`p-4 cursor-pointer transition-colors ${selectedService?.id === service.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                      }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {service.label || service.category.replace(/_/g, " ")}
                      </h4>
                      <Badge variant={selectedService?.id === service.id ? "default" : "outline"}>
                        {service.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {service.options.map((option, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {option.durationMin}min - ${option.price}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Duration & Price Options */}
            {selectedService && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Duration *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {selectedService.options.map((option, idx) => (
                    <Card
                      key={idx}
                      className={`p-4 cursor-pointer transition-colors ${selectedOption === option
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                        }`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{option.durationMin} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold">{option.price}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Extras */}
            {ad.extras.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Add Extras (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ad.extras.map((extra) => (
                    <Card
                      key={extra.id}
                      className={`p-3 cursor-pointer transition-colors ${selectedExtras.includes(extra.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                        }`}
                      onClick={() => toggleExtra(extra.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{extra.name.replace(/_/g, " ")}</span>
                        <span className="text-sm font-semibold">+${extra.price}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduling */}
            <div>
              <Label className="text-base font-semibold mb-3 block">When?</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="asap"
                    checked={isAsap}
                    onChange={(e) => setIsAsap(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="asap" className="cursor-pointer">
                    ASAP / Now
                  </Label>
                </div>

                {!isAsap && (
                  <div>
                    <Label htmlFor="scheduledFor">Select Date & Time</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <Card className="p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ${calculateTotal()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: A non-refundable $5 credit fee will be charged when the offer is accepted.
              </p>
            </Card>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedService || !selectedOption}>
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Send Offer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
