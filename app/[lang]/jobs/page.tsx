"use client";

import { useEffect, useState, useId } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import {
  Briefcase,
  MapPin,
  Users,
  Clock,
  Loader2,
  Plus,
  Search,
  SearchIcon,
  ArrowRightIcon,
  DollarSign,
  Calendar,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocations, type LocationSuggestion } from '@/lib/geocoding';

interface Job {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'ACTOR' | 'DIRECTOR' | 'CAMERA_OPERATOR' | 'EDITOR' | 'PRODUCTION_STAFF' | 'MODEL' | 'OTHER';
  payAmount: number;
  payType: string;
  lengthHours: number | null;
  lengthDays: number | null;
  suburb: string | null;
  venue: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  coverImage: string | null;
  status: 'OPEN' | 'CLOSED' | 'FILLED' | 'CANCELLED';
  maxApplicants: number | null;
  studio: {
    id: string;
    slug: string;
    name: string;
    logo: string | null;
    verified: boolean;
  };
  applicationCount: number;
  distance?: number;
  distanceText?: string;
}

const JOB_TYPES = [
  { value: 'ACTOR', label: 'Actor' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'CAMERA_OPERATOR', label: 'Camera Operator' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'PRODUCTION_STAFF', label: 'Production Staff' },
  { value: 'MODEL', label: 'Model' },
  { value: 'OTHER', label: 'Other' },
];

export default function Page() {
  const { lang } = useParams();
  const router = useRouter();
  const id = useId();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);

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
    fetchJobs();
  }, [selectedJobType]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'OPEN',
          type: selectedJobType || undefined,
          limit: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          status: 'OPEN',
          type: selectedJobType || undefined,
          limit: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.jobs || []);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
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
    fetchJobs();
  };

  const displayJobs = hasSearched ? searchResults : jobs;

  if (isLoading && !hasSearched) {
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
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <h1 className="text-xl font-bold">Studio Ads</h1>
              </div>
            </div>

            <div className="flex-1 w-full flex gap-2">
              <div className="flex-1">
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

              <Select value={selectedJobType || "all"} onValueChange={(value) => setSelectedJobType(value === "all" ? null : value)}>
                <SelectTrigger className="w-[210px]">
                  <Filter className="w-4 h-4 mr-2" />
                  {JOB_TYPES.find((type) => type.value === selectedJobType)?.label || "All Jobs"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">All Jobs</SelectItem>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isSearching ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : hasSearched && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Search Results</h2>
            <Button onClick={handleClearSearch} variant="outline" size="sm">
              Clear Search
            </Button>
          </div>
        )}

        {displayJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border rounded-xl bg-muted/30">
            <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">
              {hasSearched ? 'Try adjusting your search criteria' : 'Check back later for new opportunities'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {displayJobs.map((job) => (
              <JobCard key={job.id} job={job} lang={lang as string} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, lang }: { job: Job; lang: string }) {
  const startDate = new Date(job.startDate);
  const isUrgent = new Date(startDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // Within 7 days

  const duration = job.lengthDays 
    ? `${job.lengthDays} day${job.lengthDays > 1 ? 's' : ''}`
    : job.lengthHours
    ? `${job.lengthHours} hour${job.lengthHours > 1 ? 's' : ''}`
    : 'TBD';

  return (
    <Link href={`/${lang}/jobs/${job.slug}`}>
      <div className="group cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card mb-4">
        <div className="flex flex-col sm:flex-row">
          {/* Job Image or Studio Logo */}
          <div className="relative sm:w-48 aspect-video sm:aspect-square bg-muted shrink-0">
            {job.coverImage ? (
              <img
                src={job.coverImage}
                alt={job.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            {isUrgent && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-red-600 hover:bg-red-700">Urgent</Badge>
              </div>
            )}

            <div className="absolute top-2 right-2">
              <JobTypeBadge type={job.type} />
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Title */}
              <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {job.title}
              </h3>

              {/* Studio */}
              <div className="flex items-center gap-2 mb-3">
                {job.studio.logo && (
                  <img src={job.studio.logo} alt={job.studio.name} className="w-6 h-6 rounded" />
                )}
                <span className="text-sm font-medium">{job.studio.name}</span>
                {job.studio.verified && (
                  <Badge variant="secondary" className="h-5 text-xs bg-blue-500 text-white">
                    ✓
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {job.description}
              </p>
            </div>

            {/* Footer Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
              <div className="flex items-center gap-1 text-primary font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>${(job.payAmount / 100).toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{duration}</span>
              </div>
              {job.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{job.venue}</span>
                </div>
              )}
              {job.suburb && (
                <span className="text-xs">{job.suburb}</span>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  {startDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {job.distanceText && (
                <span className="text-xs font-medium text-primary">{job.distanceText} away</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function JobTypeBadge({ type }: { type: string }) {
  const badges: Record<string, React.ReactNode> = {
    ACTOR: <Badge className="bg-purple-600 hover:bg-purple-700">Actor</Badge>,
    DIRECTOR: <Badge className="bg-orange-600 hover:bg-orange-700">Director</Badge>,
    CAMERA_OPERATOR: <Badge className="bg-blue-600 hover:bg-blue-700">Camera</Badge>,
    EDITOR: <Badge className="bg-green-600 hover:bg-green-700">Editor</Badge>,
    PRODUCTION_STAFF: <Badge className="bg-yellow-600 hover:bg-yellow-700">Production</Badge>,
    MODEL: <Badge className="bg-pink-600 hover:bg-pink-700">Model</Badge>,
    OTHER: <Badge className="bg-gray-600 hover:bg-gray-700">Other</Badge>,
  };

  return badges[type] || null;
}
