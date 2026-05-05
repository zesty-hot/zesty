"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface EventInviteProps {
  invite: {
    id: string;
    status: 'PENDING' | 'GOING' | 'MAYBE' | 'DECLINED' | 'INVITED';
    event: {
      title: string;
      slug: string;
      startTime: string;
      coverImage: string | null;
      location: string | null;
      venue: string | null;
    };
  };
}

export function EventInviteCard({ invite }: EventInviteProps) {
  const event = invite.event;
  const eventDate = new Date(event.startTime);

  return (
    <Card className="overflow-hidden max-w-md mx-auto w-full bg-card">
      {event.coverImage && (
        <div className="relative h-32 w-full">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white">
              Event Invite
            </Badge>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {!event.coverImage && (
          <div className="flex justify-between items-start">
            <Badge variant="outline">Event Invite</Badge>
          </div>
        )}

        <h3 className="font-bold text-lg leading-tight">{event.title}</h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {eventDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {eventDate.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          </div>

          {(event.venue || event.location) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {event.venue || event.location}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Link href={`/en/events/${event.slug}`} className="w-full block">
            <Button className="w-full">
              View Event
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
