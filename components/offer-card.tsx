"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { LeaveReviewButton } from "@/components/leave-review-button";
import { Clock, DollarSign, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface OfferCardProps {
  offer: any;
  type: "sent" | "received";
  onUpdate?: () => void;
}

export function OfferCard({ offer, type, onUpdate }: OfferCardProps) {
  const [loading, setLoading] = useState(false);

  const otherUser = type === "sent" ? offer.worker : offer.client;

  const handleRespond = async (action: "accept" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this offer?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/escorts/offers/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          action,
        }),
      });

      if (response.ok) {
        alert(`Offer ${action}ed successfully!`);
        onUpdate?.();
      } else {
        const error = await response.json();
        alert(`Failed to ${action} offer: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      alert(`Failed to ${action} offer. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm("Mark this service as complete?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/escorts/offers/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id }),
      });

      if (response.ok) {
        alert("Service marked as complete!");
        onUpdate?.();
      } else {
        const error = await response.json();
        alert(`Failed to mark as complete: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error marking as complete:", error);
      alert("Failed to mark as complete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (offer.status) {
      case "OFFER":
        return <Badge variant="outline" size="lg">Pending Response</Badge>;
      case "PENDING":
        return <Badge variant="default" size="lg">Accepted</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-600" size="lg">Completed</Badge>;
      case "DISPUTED":
        return <Badge variant="destructive" size="lg">Disputed</Badge>;
      case "RELEASED":
        return <Badge className="bg-blue-600" size="lg">Released</Badge>;
      case "REJECTED":
        return <Badge variant="secondary" size="lg">Rejected</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" size="lg">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="lg">{offer.status}</Badge>;
    }
  };

  const canRespond = type === "received" && offer.status === "OFFER";
  const canComplete = type === "received" && offer.status === "PENDING";
  const canReview = type === "sent" && (offer.status === "CONFIRMED" || offer.status === "RELEASED");

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {otherUser.images?.[0]?.url ? (
            <img
              src={otherUser.images[0].url}
              alt={otherUser.slug || "User"}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="font-semibold">{otherUser.slug?.[0]?.toUpperCase() || "?"}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold">{otherUser.slug || "Unknown User"}</h3>
            <p className="text-sm text-muted-foreground">
              {type === "sent" ? "Offer sent" : "Offer received"} {formatDistanceToNow(new Date(offer.createdAt))}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid gap-2 mb-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Service:</span>
          <span className="font-medium">{offer.service.replace(/_/g, " ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{offer.durationMin} minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-bold text-lg">${offer.amount}</span>
        </div>
        {offer.scheduledFor && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(offer.scheduledFor).toLocaleString()}</span>
          </div>
        )}
        {offer.isAsap && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 font-medium">ASAP</span>
          </div>
        )}
        {offer.extras && offer.extras.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Extras:</span>
            <span>{offer.extras.join(", ").replace(/_/g, " ")}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        {canRespond && !loading && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleRespond("accept")}
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Offer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRespond("reject")}
              disabled={loading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </>
        )}

        {canComplete && !loading && (
          <Button
            size="sm"
            variant="default"
            onClick={handleComplete}
            disabled={loading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
        )}

        {canReview && (
          <LeaveReviewButton
            offerId={offer.id}
            workerName={otherUser.slug || "Worker"}
            onReviewSubmitted={onUpdate}
          />
        )}

        {loading && <Spinner className="w-4 h-4" />}
      </div>

      {/* Status Messages */}
      {offer.status === "CONFIRMED" && (
        <p className="text-xs text-muted-foreground mt-3">
          Payment will be automatically released in 48 hours if no dispute is raised.
        </p>
      )}
      {offer.status === "DISPUTED" && offer.disputeReason && (
        <div className="mt-3 p-3 bg-red-50 rounded-md">
          <p className="text-sm font-semibold text-red-800 mb-1">Dispute Reason:</p>
          <p className="text-sm text-red-700">{offer.disputeReason}</p>
        </div>
      )}
    </Card>
  );
}
