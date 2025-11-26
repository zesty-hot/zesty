"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ImageUpload } from "@/components/image-upload";

export default function CreateEventPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    suburb: "",
    venue: "",
    coverImage: "",
    status: "OPEN",
    price: "",
    maxAttendees: "",
  });

  const [dates, setDates] = useState<{
    startTime: Date | undefined;
    endTime: Date | undefined;
  }>({
    startTime: undefined,
    endTime: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, coverImage: url }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title || formData.title.length < 3) {
        throw new Error("Title must be at least 3 characters");
      }
      if (!dates.startTime) {
        throw new Error("Start time is required");
      }

      const payload = {
        ...formData,
        startTime: dates.startTime.toISOString(),
        endTime: dates.endTime ? dates.endTime.toISOString() : undefined,
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        coverImage: formData.coverImage || undefined,
      };

      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
      }

      toastManager.add({
        title: "Success",
        description: "Event created successfully!",
        type: "success",
      });

      router.push(`/${lang}/dash/events`);
      router.refresh();
    } catch (error) {
      console.error("Error creating event:", error);
      toastManager.add({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b backdrop-blur sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dash/events`}>
              <Button variant="ghost" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Create New Event</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-8">

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Summer Pool Party"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell people what your event is about..."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <DateTimePicker
                    date={dates.startTime}
                    setDate={(date) => setDates(prev => ({ ...prev, startTime: date }))}
                    label="Pick start time"
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time (Optional)</Label>
                  <DateTimePicker
                    date={dates.endTime}
                    setDate={(date) => setDates(prev => ({ ...prev, endTime: date }))}
                    label="Pick end time"
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
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="venue"
                      name="venue"
                      placeholder="e.g. Club X or My House"
                      className="pl-9"
                      value={formData.venue}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb / City</Label>
                  <Input
                    id="suburb"
                    name="suburb"
                    placeholder="e.g. Sydney"
                    value={formData.suburb}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Full Address / Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="123 Example St, Sydney NSW 2000"
                  value={formData.location}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">This will be visible to attendees.</p>
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
                  value={formData.status}
                  onValueChange={(val) => handleSelectChange("status", val)}
                >
                  <SelectTrigger>
                    {
                      formData.status === "OPEN" && (
                        <SelectValue placeholder="Open (Public)" />
                      )
                    }
                    {
                      formData.status === "INVITE_ONLY" && (
                        <SelectValue placeholder="Invitation Only" />
                      )
                    }
                    {
                      formData.status === "PAY_TO_JOIN" && (
                        <SelectValue placeholder="Pay to Join" />
                      )
                    }
                    {
                      formData.status === "REQUEST_TO_JOIN" && (
                        <SelectValue placeholder="Request to Join" />
                      )
                    }

                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open (Public)</SelectItem>
                    <SelectItem value="INVITE_ONLY">Intivation Only</SelectItem>
                    <SelectItem value="PAY_TO_JOIN">Pay to Join</SelectItem>
                    <SelectItem value="REQUEST_TO_JOIN">Request to Join</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Control who can see and join your event.</p>
              </div>

              {formData.status === "PAY_TO_JOIN" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-9"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    min="1"
                    className="pl-9"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Leave blank for unlimited.</p>
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
                  value={formData.coverImage}
                  onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground">Upload a cover image for your event.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/${lang}/dash/events`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}