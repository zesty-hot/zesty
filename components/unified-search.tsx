"use client";

import { useId, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, Funnel, SearchIcon, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterComponent, { type FilterData } from '@/app/[lang]/escorts/(client-renders)/filter';
import { searchLocations, type LocationSuggestion } from '@/lib/geocoding';

interface UserSuggestion {
  value: string;
  label: string;
  slug: string;
  image?: string | null;
}

type SearchMode = 'location' | 'username';

interface UnifiedSearchProps {
  defaultFilters: FilterData;
  onLocationSearch: (location: LocationSuggestion, filters: FilterData) => void;
  onUsernameSearch: (username: string, filters: FilterData) => void;
  onClearSearch?: () => void;
  searchType?: 'escorts' | 'vip' | 'live'; // Determines which API endpoints to use
  lang: string; // Language/locale for navigation
}

// Search for users by slug/username
async function searchUsers(query: string, searchType: 'escorts' | 'vip' | 'live'): Promise<UserSuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const endpoint = searchType === 'escorts' 
      ? '/api/escorts/search-users'
      : searchType === 'vip'
      ? '/api/vip/search-creators'
      : '/api/live/search'; // For live, we'll use the main search endpoint
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error('Failed to fetch users');

    const data = await response.json();
    return data.users || data.creators || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default function UnifiedSearch({
  defaultFilters,
  onLocationSearch,
  onUsernameSearch,
  onClearSearch,
  searchType = 'escorts',
  lang
}: UnifiedSearchProps) {
  const router = useRouter();
  const id = useId();
  const [searchMode, setSearchMode] = useState<SearchMode>('location');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [filters, setFilters] = useState<FilterData>(defaultFilters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Debounced search for suggestions
  useEffect(() => {
    if (searchQuery.length <= 1) {
      setLocationSuggestions([]);
      setUserSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      
      if (searchMode === 'location') {
        const results = await searchLocations(searchQuery);
        setLocationSuggestions(results);
      } else {
        const results = await searchUsers(searchQuery, searchType);
        setUserSuggestions(results);
      }
      
      setIsLoadingSuggestions(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode, searchType]);

  // Calculate active filter count
  const activeFilterCount =
    filters.gender.length +
    filters.bodyType.length +
    filters.race.length +
    ((filters.age[0] !== 18 || filters.age[1] !== 100) ? 1 : 0) +
    ((filters.sortBy && filters.sortBy !== 'distance') ? 1 : 0);

  const handleFilterChange = (newFilters: FilterData) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setIsDialogOpen(false);
    
    // Re-trigger search with new filters only if a location has been selected
    if (searchMode === 'location' && selectedLocation) {
      onLocationSearch(selectedLocation, filters);
    }
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setIsDialogOpen(false);
    
    // Re-trigger search with default filters only if a location has been selected
    if (searchMode === 'location' && selectedLocation) {
      onLocationSearch(selectedLocation, defaultFilters);
    }
  };

  const handleLocationSelect = (value: string | null) => {
    if (!value) return;

    const location = locationSuggestions.find(l => l.value === value);
    if (location) {
      setSelectedLocation(location);
      setSearchQuery(location.label);
      onLocationSearch(location, filters);
    }
  };

  const handleUsernameSelect = (value: string | null) => {
    if (!value) return;

    const user = userSuggestions.find(u => u.value === value);
    if (user) {
      // Navigate directly to the user's profile page
      const basePath = searchType === 'escorts' ? 'escorts' : searchType === 'vip' ? 'vip' : 'live';
      router.push(`/${lang}/${basePath}/${user.slug}`);
      return;
    }
  };

  const handleModeChange = (mode: string) => {
    setSearchMode(mode as SearchMode);
    setSearchQuery("");
    setSelectedLocation(null);
    setSelectedUsername(null);
    setLocationSuggestions([]);
    setUserSuggestions([]);
    
    // Clear search results
    if (onClearSearch) {
      onClearSearch();
    }
  };

  const currentSuggestions = searchMode === 'location' ? locationSuggestions : userSuggestions;
  const handleSelect = searchMode === 'location' ? handleLocationSelect : handleUsernameSelect;
  const selectedValue = searchMode === 'location' 
    ? selectedLocation?.value || null 
    : userSuggestions.find(u => u.slug === selectedUsername)?.value || null;

  return (
    <section className="mb-4 w-full space-y-2">
      {/* Search Mode Tabs - Full width on mobile, natural width on desktop */}
      <Tabs value={searchMode} onValueChange={handleModeChange} className="w-full md:w-auto">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
          <TabsTrigger value="location" className="gap-2">
            <SearchIcon size={16} />
            <span className="truncate">Location</span>
          </TabsTrigger>
          <TabsTrigger value="username" className="gap-2">
            <User size={16} />
            <span className="truncate">Username</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Input and Filter Button - Always on same line */}
      <div className="flex flex-row w-full gap-2">
        {/* Search Input */}
        <div className="relative flex flex-1 min-w-0">
        <Combobox
          value={selectedValue}
          onValueChange={handleSelect}
        >
          <div className="relative w-full">
            <ComboboxInput
              size="lg"
              id={id}
              className="peer ps-9 pe-9"
              placeholder={
                searchMode === 'location' 
                  ? "Search by city, state, or region" 
                  : "Search by username or slug"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              showTrigger={false}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              {searchMode === 'location' ? (
                <SearchIcon size={16} />
              ) : (
                <User size={16} />
              )}
            </div>
            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Submit search"
              type="submit"
            >
              <ArrowRightIcon size={16} aria-hidden="true" />
            </button>
          </div>

          {searchQuery.length > 1 && (
            <ComboboxPopup>
              <ComboboxList>
                {isLoadingSuggestions ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : currentSuggestions.length === 0 ? (
                  <ComboboxEmpty>
                    {searchMode === 'location' ? 'No locations found.' : 'No users found.'}
                  </ComboboxEmpty>
                ) : (
                  <>
                    {searchMode === 'location' ? (
                      locationSuggestions.map((location) => (
                        <ComboboxItem key={location.value} value={location.value} className="cursor-pointer">
                          <div className="flex items-center justify-between w-full">
                            <span>{location.label}</span>
                            <span className="text-xs text-muted-foreground capitalize">{location.type}</span>
                          </div>
                        </ComboboxItem>
                      ))
                    ) : (
                      userSuggestions.map((user) => (
                        <ComboboxItem key={user.value} value={user.value} className="cursor-pointer">
                          <div className="flex items-center gap-2 w-full">
                            {user.image ? (
                              <img 
                                src={user.image} 
                                alt={user.slug} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {user.slug[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium">{user.label}</span>
                              <span className="text-xs text-muted-foreground">@{user.slug}</span>
                            </div>
                          </div>
                        </ComboboxItem>
                      ))
                    )}
                  </>
                )}
              </ComboboxList>
            </ComboboxPopup>
          )}
        </Combobox>
      </div>

      {/* Filter Button */}
      <div className="flex shrink-0">
        <TooltipProvider delay={100}>
          <Tooltip>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <TooltipTrigger render={
                <DialogTrigger render={
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={`relative ${searchMode === 'username' ? 'cursor-not-allowed! pointer-events-auto!' : ''}`}
                    disabled={searchMode === 'username'}
                  >
                    <Settings />
                    {activeFilterCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 left-full min-w-5 -translate-x-3.5 border-background px-1 py-[0.145rem] text-xs font-medium">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                } />
              } />
              <TooltipContent side="bottom" className="max-sm:hidden">
                <p>{searchMode === 'username' ? 'Filters not available for username search' : 'Advanced filtering'}</p>
              </TooltipContent>
              <DialogContent className="sm:min-w-2xl rounded-2xl select-none cursor-default">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                  <DialogDescription>Refine your search results</DialogDescription>
                </DialogHeader>

                <FilterComponent
                  filterData={filters}
                  onFilterChange={handleFilterChange}
                  pageType={searchType}
                />

                <DialogFooter className="md:gap-6">
                  <Button type="button" variant="destructive-outline" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                  <Button type="button" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    </section>
  );
}
