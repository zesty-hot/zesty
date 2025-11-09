"use client";

import { useEffect, useState, useId } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchIcon,
  ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocations, type LocationSuggestion } from '@/lib/geocoding';

interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  suburb: string | null;
  venue: string | null;
  startTime: Date | string;
  endTime?: Date | string | null;
  status: 'OPEN' | 'INVITE_ONLY' | 'PAY_TO_JOIN' | 'REQUEST_TO_JOIN';
  price: number | null;
  maxAttendees: number | null;
  organizer: {
    id: string;
    slug: string | null;
    name: string | null;
    image: string | null;
    verified: boolean;
  };
  attendeeCount: number;
  distance?: number;
  distanceText?: string;
}

export default function Page() {
  const { lang } = useParams();
  const router = useRouter();
  const id = useId();
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [todayScrollPosition, setTodayScrollPosition] = useState(0);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced search for location suggestions
  useEffect(() => {
    if (!locationQuery || locationQuery.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const suggestions = await searchLocations(locationQuery);
      setLocationSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's events
      const todayResponse = await fetch('/api/events/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
          limit: 20,
        }),
      });

      // Fetch upcoming events
      const upcomingResponse = await fetch('/api/events/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: tomorrow.toISOString(),
          limit: 12,
        }),
      });

      if (todayResponse.ok) {
        const data = await todayResponse.json();
        setTodayEvents(data.events || []);
      }

      if (upcomingResponse.ok) {
        const data = await upcomingResponse.json();
        setUpcomingEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSearch = async (location: LocationSuggestion) => {
    if (!location.coordinates) return;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedLocation(location);

    try {
      const [lon, lat] = location.coordinates;
      const response = await fetch('/api/events/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          limit: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Events should already be sorted by distance from the API
        setSearchResults(data.events || []);
      }
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
    setHasSearched(false);
    setLocationQuery("");
    setSelectedLocation(null);
  };

  const scrollTodayEvents = (direction: 'left' | 'right') => {
    const container = document.getElementById('today-events-scroll');
    if (!container) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left'
      ? Math.max(0, todayScrollPosition - scrollAmount)
      : todayScrollPosition + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setTodayScrollPosition(newPosition);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <div className="z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center justify-between md:justify-start gap-2 md:shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl font-bold">Events</h1>
              </div>
            </div>

            <div className="flex-1 w-full">
              <Combobox
                value={selectedLocation?.value || null}
                onValueChange={(value) => {
                  if (!value) return;
                  const location = locationSuggestions.find(l => l.value === value);
                  if (location) {
                    handleLocationSearch(location);
                  }
                }}
              >
                <div className="relative w-full">
                  <ComboboxInput
                    size="lg"
                    className="peer ps-9 pe-9"
                    placeholder="Search by location..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    showTrigger={false}
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <SearchIcon size={16} aria-hidden="true" />
                  </div>
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Submit search"
                    type="submit"
                    onClick={() => {
                      if (locationSuggestions.length > 0) {
                        handleLocationSearch(locationSuggestions[0]);
                      }
                    }}
                  >
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </button>
                </div>
                {locationQuery.length >= 2 && (
                  <ComboboxPopup>
                    <ComboboxList>
                      {isLoadingSuggestions ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : locationSuggestions.length > 0 ? (
                        locationSuggestions.map((suggestion) => (
                          <ComboboxItem key={suggestion.value} value={suggestion.value} className="cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{suggestion.label}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0 capitalize">
                                {suggestion.type}
                              </Badge>
                            </div>
                          </ComboboxItem>
                        ))
                      ) : (
                        <ComboboxEmpty>
                          No locations found
                        </ComboboxEmpty>
                      )}
                    </ComboboxList>
                  </ComboboxPopup>
                )}
              </Combobox>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isSearching ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Finding events...</p>
            </div>
          </div>
        ) : hasSearched ? (
          // Search Results View
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1">Search Results</h2>
                <p className="text-muted-foreground">
                  {searchResults.length} {searchResults.length === 1 ? 'event' : 'events'} found
                </p>
              </div>
              <Button onClick={handleClearSearch} variant="outline">
                Clear Search
              </Button>
            </div>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl">
                <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-full p-6 mb-4">
                  <Calendar className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
                <Button onClick={handleClearSearch} variant="outline">
                  Browse All Events
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((event) => (
                  <EventCard key={event.id} event={event} lang={lang as string} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Default View
          <>
            {/* Happening Today - Vibrant Horizontal Section */}
            {todayEvents.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-1 flex items-center gap-2">
                      🔥 Happening Today
                    </h2>
                    <p className="text-muted-foreground">Don't miss out on these events</p>
                  </div>
                  {todayEvents.length > 4 && (
                    <div className="hidden sm:flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scrollTodayEvents("left")}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scrollTodayEvents("right")}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div
                  id="today-events-scroll"
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {todayEvents.map((event) => (
                    <TodayEventCard
                      key={event.id}
                      event={event}
                      lang={lang as string}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events - Colorful Feed */}
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-1">Upcoming Events</h2>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10">
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-full p-6 mb-4">
                    <Calendar className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create one!
                  </p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-5">
                  {upcomingEvents.map((event) => (
                    <FeedEventCard
                      key={event.id}
                      event={event}
                      lang={lang as string}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Compact card for "Happening Today" section
function TodayEventCard({ event, lang }: { event: Event; lang: string }) {
  const startTime = new Date(event.startTime);

  return (
    <Link href={`/${lang}/events/${event.slug}`}>
      <div className="group cursor-pointer snap-start shrink-0 w-[200px]">
        <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-muted mb-2">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          <div className="absolute top-2 left-2">
            <EventStatusBadge status={event.status} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-primary font-medium">
            {startTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {event.venue && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {event.venue}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{event.attendeeCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Single column feed card for upcoming events
function FeedEventCard({ event, lang }: { event: Event; lang: string }) {
  const startTime = new Date(event.startTime);
  const isToday = startTime.toDateString() === new Date().toDateString();

  return (
    <Link href={`/${lang}/events/${event.slug}`}>
      <div className="group cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card mb-4">
        <div className="flex flex-col sm:flex-row">
          {/* Event Image */}
          <div className="relative sm:w-64 aspect-video sm:aspect-square bg-muted shrink-0">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            <div className="absolute top-3 left-3">
              <EventStatusBadge status={event.status} />
            </div>

            {/* {event.organizer.verified && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white text-xs"
                >
                  ✓ Verified
                </Badge>
              </div>
            )} */}
          </div>

          {/* Event Details */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Date & Time */}
              <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                <Clock className="w-4 h-4" />
                {isToday ? (
                  <span>
                    Today at{" "}
                    {startTime.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                ) : (
                  <span>
                    {startTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {startTime.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {event.description}
                </p>
              )}
            </div>

            {/* Footer Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
              {event.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{event.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{event.attendeeCount} going</span>
              </div>
              {event.suburb && (
                <span className="text-xs">{event.suburb}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const badges = {
    OPEN: <Badge className="bg-green-600 hover:bg-green-700">Open</Badge>,
    INVITE_ONLY: (
      <Badge className="bg-purple-600 hover:bg-purple-700">Invite Only</Badge>
    ),
    PAY_TO_JOIN: (
      <Badge className="bg-yellow-600 hover:bg-yellow-700">Paid</Badge>
    ),
    REQUEST_TO_JOIN: (
      <Badge className="bg-blue-600 hover:bg-blue-700">Request to Join</Badge>
    ),
  };

  return badges[status as keyof typeof badges] || null;
}

// Regular card for upcoming events grid
function EventCard({ event, lang }: { event: Event; lang: string }) {
  const startTime = new Date(event.startTime);
  const isToday = startTime.toDateString() === new Date().toDateString();

  return (
    <Link href={`/${lang}/events/${event.slug}`}>
      <div className="group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-video bg-muted">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <div className="absolute top-3 left-3">
            <EventStatusBadge status={event.status} />
          </div>

          {/* {event.organizer.verified && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                ✓ Verified
              </Badge>
            </div>
          )} */}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-1">
              <Clock className="w-4 h-4" />
              {isToday ? (
                <span>Today at {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              ) : (
                <span>{startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              )}
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>

          {event.venue && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{event.attendeeCount} going</span>
            </div>
            {event.suburb && (
              <span className="text-xs text-muted-foreground">{event.suburb}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
