"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Plus, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  attendeeCount: number;
  isPublished: boolean;
}

export default function EventsManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [status]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events/my-events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect(`/${lang}`);
  }

  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= new Date());
  const pastEvents = events.filter(e => new Date(e.eventDate) < new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${lang}/dash`}>
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Calendar className="w-8 h-8 text-green-500" />
                  Events
                </h1>
                <p className="text-muted-foreground mt-1">
                  Create and manage your events
                </p>
              </div>
            </div>
            <Link href={`/${lang}/events/create`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Events Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any events yet. Start by creating your first event to connect with your community and organize gatherings.
            </p>
            <Link href={`/${lang}/events/create`}>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{event.title}</h3>
                            <Badge variant={event.isPublished ? "default" : "secondary"}>
                              {event.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.eventDate).toLocaleDateString()} at{" "}
                              {new Date(event.eventDate).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendeeCount || 0} attending
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/${lang}/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/${lang}/events/edit/${event.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <Card key={event.id} className="p-6 opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{event.title}</h3>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.eventDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendeeCount || 0} attended
                            </span>
                          </div>
                        </div>

                        <Link href={`/${lang}/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/10 border-green-500/20">
          <h3 className="font-semibold text-lg mb-3">Event Planning Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Provide clear details about date, time, and location</li>
            <li>✓ Use eye-catching images to promote your event</li>
            <li>✓ Promote your event across social media platforms</li>
            <li>✓ Keep attendees updated with any changes or announcements</li>
            <li>✓ Engage with attendees before and after the event</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
