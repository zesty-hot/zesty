"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Settings,
  Share2,
  MoreVertical,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";

interface Attendee {
  id: string;
  status: string;
  user: {
    zesty_id: string;
    slug: string;
    title: string;
    images: { url: string }[];
  };
}

interface EventDetails {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  location: string | null;
  suburb: string | null;
  venue: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  price: number | null;
  maxAttendees: number | null;
  attendees: Attendee[];
  isOrganizer: boolean;
}

export default function EventManagementDashboard() {
  const { lang, id: slug } = useParams<{ lang: string; id: string }>();
  const router = useRouter();
  const { status: sessionStatus } = useSupabaseSession();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchEventDetails();
    } else if (sessionStatus === "unauthenticated") {
      router.push(`/${lang}`);
      toastManager.add({
        title: "Access Denied",
        description: "You must be logged in to view this page.",
        type: "error",
      });
    }
  }, [sessionStatus, slug]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // First fetch event details (public endpoint usually, but we need organizer view)
      // We'll use the public endpoint for now and check isOrganizer flag
      // Or we can create a specific organizer endpoint. 
      // The public endpoint `/api/events/[slug]` returns isOrganizer.
      const response = await fetch(`/api/events/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();

      if (!data.isOrganizer) {
        toastManager.add({
          title: "Access Denied",
          description: "You are not the organizer of this event.",
          type: "error",
        });
        router.push(`/${lang}/dash/events`);
        return;
      }

      setEvent(data);

      // Fetch full attendee list (organizer only)
      const attendeesResponse = await fetch(`/api/events/${slug}/attendees`);
      if (attendeesResponse.ok) {
        const attendeesData = await attendeesResponse.json();
        setAttendees(attendeesData);
      }
    } catch (error) {
      console.error("Error:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to load event details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/events/${slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setEvent(prev => prev ? { ...prev, status: newStatus } : null);
      toastManager.add({
        title: "Success",
        description: "Event status updated.",
        type: "success",
      });
    } catch (error) {
      console.error("Error:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to update status.",
        type: "error",
      });
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b backdrop-blur sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${lang}/dash/events`}>
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold truncate max-w-[200px] sm:max-w-md">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {event.status.replace(/_/g, " ")}
                  </Badge>
                  <span>•</span>
                  <span>{new Date(event.startTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/${lang}/events/${event.slug}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.coverImage && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {event.description || "No description provided."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Attendees</span>
                      </div>
                      <span className="font-bold">{attendees.length} / {event.maxAttendees || "∞"}</span>
                    </div>
                    {event.price && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>Price</span>
                        </div>
                        <span className="font-bold">${(event.price / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location & Time</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium">Start</p>
                        <p className="text-muted-foreground">
                          {new Date(event.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {event.endTime && (
                      <div className="flex gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">End</p>
                          <p className="text-muted-foreground">
                            {new Date(event.endTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">
                          {event.venue && <span className="block">{event.venue}</span>}
                          {event.location || event.suburb || "TBD"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-row">
                  <div className="flex-1">Guest List</div>
                  <div className="flex gap-2">
                    <InviteUserButton eventSlug={event.slug} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendees.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No attendees yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                            {attendee.user.images[0] ? (
                              <img src={attendee.user.images[0].url} alt={attendee.user.slug} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 m-auto mt-2.5 opacity-50" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{attendee.user.title || attendee.user.slug}</p>
                            <p className="text-xs text-muted-foreground">@{attendee.user.slug}</p>
                          </div>
                        </div>
                        <Badge variant={
                          attendee.status === 'GOING' ? 'default' :
                            attendee.status === 'PENDING' ? 'outline' : 'secondary'
                        }>
                          {attendee.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <EventEditForm event={event} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { Label } from "@/components/ui/label";
import { InviteUserButton } from "@/components/invite-user-button";

function EventEditForm({ event }: { event: EventDetails }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState(event.coverImage || "");
  const [status, setStatus] = useState(event.status);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      startTime: formData.get("startTime") ? new Date(formData.get("startTime") as string).toISOString() : undefined,
      endTime: formData.get("endTime") ? new Date(formData.get("endTime") as string).toISOString() : null,
      venue: formData.get("venue"),
      suburb: formData.get("suburb"),
      location: formData.get("location"),
      price: formData.get("price") ? Math.round(parseFloat(formData.get("price") as string) * 100) : undefined,
      maxAttendees: formData.get("maxAttendees") ? parseInt(formData.get("maxAttendees") as string) : null,
      coverImage: coverImage,
      status: status,
    };

    try {
      const response = await fetch(`/api/events/${event.slug}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update event");

      toastManager.add({
        title: "Success",
        description: "Event updated successfully.",
        type: "success",
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to update event.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <input
              id="title"
              name="title"
              defaultValue={event.title}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={event.description}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <input
                id="startTime"
                type="datetime-local"
                name="startTime"
                defaultValue={formatDateForInput(event.startTime)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <input
                id="endTime"
                type="datetime-local"
                name="endTime"
                defaultValue={formatDateForInput(event.endTime)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Name</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="venue"
                  name="venue"
                  defaultValue={event.venue || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb</Label>
              <input
                id="suburb"
                name="suburb"
                defaultValue={event.suburb || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Full Address</Label>
            <input
              id="location"
              name="location"
              defaultValue={event.location || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="status">Event Type</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger className="w-full h-10">
                {
                  status === "OPEN" && (
                    <SelectValue placeholder="Open (Public)" />
                  )
                }
                {
                  status === "INVITE_ONLY" && (
                    <SelectValue placeholder="Invitation Only" />
                  )
                }
                {
                  status === "PAY_TO_JOIN" && (
                    <SelectValue placeholder="Pay to Join" />
                  )
                }
                {
                  status === "REQUEST_TO_JOIN" && (
                    <SelectValue placeholder="Request to Join" />
                  )
                }
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open (Public)</SelectItem>
                <SelectItem value="INVITE_ONLY">Invitation Only</SelectItem>
                <SelectItem value="PAY_TO_JOIN">Pay to Join</SelectItem>
                <SelectItem value="REQUEST_TO_JOIN">Request to Join</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Control who can see and join your event.</p>
          </div>

          <div className={status === "PAY_TO_JOIN" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-2"}>
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max Attendees</Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="maxAttendees"
                  type="number"
                  name="maxAttendees"
                  defaultValue={event.maxAttendees || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                />
              </div>
            </div>

            {status === "PAY_TO_JOIN" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    name="price"
                    defaultValue={event.price ? (event.price / 100).toFixed(2) : ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
            />
            <p className="text-xs text-muted-foreground">Upload a cover image for your event.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form >
  );
}
