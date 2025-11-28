"use client";

import { useId, useState, useEffect, useCallback } from "react"
import { ArrowRightIcon, Funnel, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UnifiedSearch from "@/components/unified-search";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import FilterComponent, { type FilterData } from '@/app/[lang]/escorts/(client-renders)/filter';
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { BodyType, PrivateAdDaysAvailable, PrivateAdCustomerCategory, PrivateAdExtraType, PrivateAdServiceCategory, Race } from "@prisma/client";
import { type LocationSuggestion } from '@/lib/geocoding';

export interface EscortProfileData {
  liveStreamPage: boolean;
  isLive: boolean;
  ad: {
    id: string;
    title: string;
    description: string;
    acceptsGender: PrivateAdCustomerCategory[];
    acceptsRace: Race[];
    acceptsBodyType: BodyType[];
    acceptsAgeRange: number[];
    daysAvailable: PrivateAdDaysAvailable[];
    followers: any[];
    services: ({
      options: {
        id: string;
        serviceId: string;
        durationMin: number;
        price: number;
      }[];
    } & {
      id: string;
      label: string | null;
      createdAt: Date;
      privateAdId: string;
      category: PrivateAdServiceCategory;
    })[];
    extras: {
      active: boolean;
      id: string;
      price: number;
      name: PrivateAdExtraType;
      privateAdId: string;
    }[];
  }
  slug: string
  location: string
  distance: string
  price: string
  age: number
  gender: string
  bodyType?: BodyType
  race?: Race
  vip: boolean
  images: {
    NSFW: boolean; url: string; default: boolean
  }[]
  averageRating: number
  lastActive: string
}

// Fetch a random featured profile from the API
async function fetchFeaturedProfile(): Promise<EscortProfileData | null> {
  try {
    const response = await fetch('/api/escorts/featured', {
      cache: 'no-store' // Always get a fresh random profile
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching featured profile:', error);
    return null;
  }
}

// Fetch profiles from API with filters and pagination
async function fetchProfiles(
  location: LocationSuggestion | null,
  filters: FilterData,
  page: number,
  limit: number = 30
): Promise<{ profiles: EscortProfileData[], total: number, totalPages: number }> {
  if (!location || !location.coordinates) {
    return { profiles: [], total: 0, totalPages: 0 };
  }

  try {
    const response = await fetch('/api/escorts/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        longitude: location.coordinates[0],
        latitude: location.coordinates[1],
        filters,
        page,
        limit
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return { profiles: [], total: 0, totalPages: 0 };
  }
}

// Default/initial filter values
const defaultFilters: FilterData = {
  gender: [],
  age: [18, 100],
  bodyType: [],
  race: [],
  sortBy: 'distance',
};

export default function Page() {
  const { lang } = useParams();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Results state
  const [profiles, setProfiles] = useState<EscortProfileData[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResultsTitle, setSearchResultsTitle] = useState<string>('Results');

  // Store last search parameters for pagination
  const [lastSearch, setLastSearch] = useState<{
    type: 'location' | 'username';
    location?: LocationSuggestion;
    slug?: string;
    filters: FilterData;
  } | null>(null);

  // Featured profile state
  const [featuredProfile, setFeaturedProfile] = useState<EscortProfileData | null>(null);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Featured carousel state
  const [imageRotation, setImageRotation] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch featured profile on mount
  useEffect(() => {
    const loadFeaturedProfile = async () => {
      setIsLoadingFeatured(true);
      const profile = await fetchFeaturedProfile();
      console.log(profile);
      setFeaturedProfile(profile);
      setIsLoadingFeatured(false);
    };

    loadFeaturedProfile();
  }, []);

  // Rotate images every 3 seconds with fade transition
  useEffect(() => {
    if (!featuredProfile || featuredProfile.images.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setImageRotation((prev) => (prev + 1) % featuredProfile.images.length);
        setIsTransitioning(false);
      }, 300); // Half of the transition duration
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredProfile]);

  // Handle location search
  const handleLocationSearch = async (location: LocationSuggestion, filters: FilterData) => {
    setHasSearched(true);
    setSearchResultsTitle(`Results in ${location.label}`);
    setIsLoadingProfiles(true);
    setCurrentPage(1);

    // Store search parameters for pagination
    setLastSearch({ type: 'location', location, filters });

    const result = await fetchProfiles(location, filters, 1);
    setProfiles(result.profiles);
    setTotalResults(result.total);
    setTotalPages(result.totalPages);
    setIsLoadingProfiles(false);
  };

  // Handle username search
  const handleUsernameSearch = async (slug: string, filters: FilterData) => {
    setHasSearched(true);
    setSearchResultsTitle(`Search results for @${slug}`);
    setIsLoadingProfiles(true);
    setCurrentPage(1);

    // Store search parameters for pagination (filters not used for username search)
    setLastSearch({ type: 'username', slug, filters: defaultFilters });

    try {
      const response = await fetch('/api/escorts/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          page: 1,
          limit: 30
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setProfiles(result.profiles);
        setTotalResults(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('Error searching by username:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Clear search results
  const handleClearSearch = () => {
    setProfiles([]);
    setTotalResults(0);
    setTotalPages(1);
    setCurrentPage(1);
    setHasSearched(false);
    setLastSearch(null);
  };

  // Pagination handler
  const performSearch = async (page: number) => {
    if (!lastSearch) return;

    setIsLoadingProfiles(true);
    setCurrentPage(page);

    try {
      if (lastSearch.type === 'location' && lastSearch.location) {
        const result = await fetchProfiles(lastSearch.location, lastSearch.filters, page);
        setProfiles(result.profiles);
        setTotalResults(result.total);
        setTotalPages(result.totalPages);
      } else if (lastSearch.type === 'username' && lastSearch.slug) {
        const response = await fetch('/api/escorts/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: lastSearch.slug,
            page,
            limit: 30
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setProfiles(result.profiles);
          setTotalResults(result.total);
          setTotalPages(result.totalPages);
        }
      }
    } catch (error) {
      console.error('Error in pagination:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Navigate to profile page with pre-loaded data
  const handleProfileClick = (e: React.MouseEvent, profile: EscortProfileData) => {
    e.preventDefault();
    // Store the profile data in sessionStorage for quick access
    sessionStorage.setItem(`profile_${profile.slug}`, JSON.stringify(profile));
    router.push(`/${lang}/escorts/${profile.slug}`);
    return;
  };

  // Only compute rotated images if we have a featured profile
  const rotatedImages = featuredProfile ? [
    ...featuredProfile.images.slice(imageRotation),
    ...featuredProfile.images.slice(0, imageRotation)
  ] : [];

  return (
    <article className="container mx-auto px-4">
      <section className="flex flex-col justify-center mb-4">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
          className="w-24 h-24 mx-auto text-neutral-600 -mb-4"
          viewBox="0 0 600 600">
          <path d="M0 0 C4.75545579 2.74413187 8.41360876 6.42736098 12.1328125 10.4296875 C14.09975426 12.45534394 16.01556516 14.22941302 18.16040039 16.04199219 C23.39801946 20.60172061 28.25347399 25.53167517 33.13433266 30.46473312 C34.83423488 32.18223754 36.53783859 33.89599247 38.24247742 35.60879517 C43.0824153 40.47302001 47.9164668 45.34306513 52.74633789 50.21728516 C55.71446881 53.21215569 58.68741925 56.20217077 61.66341209 59.18922806 C62.79323866 60.32526269 63.92116413 61.46319132 65.04714394 62.60303879 C66.61456641 64.18962283 68.18800278 65.770001 69.76293945 67.34912109 C70.65592239 68.24956146 71.54890533 69.15000183 72.46894836 70.07772827 C74.65760863 72.31549372 74.65760863 72.31549372 77.75 73.125 C80.52619955 72.36923619 80.52619955 72.36923619 83.4375 71.1875 C84.43136719 70.80722656 85.42523438 70.42695313 86.44921875 70.03515625 C87.20847656 69.73480469 87.96773437 69.43445313 88.75 69.125 C89.57968751 70.78437502 90.40925176 72.44381176 91.23828125 74.10351562 C91.96146458 75.5485674 92.68676649 76.99256064 93.4140625 78.43554688 C95.17886626 81.94363241 96.91794908 85.45538003 98.55859375 89.0234375 C101.691205 95.69380142 104.71065558 100.84330639 110.24609375 105.76953125 C110.74238281 106.21683594 111.23867188 106.66414063 111.75 107.125 C111.75 107.455 111.75 107.785 111.75 108.125 C103.48235889 108.21823215 95.21494233 108.28903168 86.94690323 108.33224869 C83.10650129 108.3530048 79.26646253 108.38109877 75.42626953 108.42675781 C71.71092987 108.47064916 67.99593654 108.49422681 64.28035736 108.50450897 C62.8723481 108.51182366 61.46435491 108.52610434 60.05649567 108.54792023 C48.59379429 108.71826189 37.66419006 107.45557597 28.52758789 99.92602539 C21.78415615 93.09368149 17.08528589 83.95813348 12.125 75.8125 C11.43422363 74.69053223 10.74344727 73.56856445 10.03173828 72.41259766 C6.63677657 66.89728519 3.28884642 61.35983501 0.03125 55.76171875 C-0.8337915 54.29955933 -0.8337915 54.29955933 -1.71630859 52.80786133 C-2.80002534 50.97332699 -3.8663255 49.12836141 -4.91259766 47.2722168 C-6.24581851 45.03461082 -7.46657213 43.02325622 -9.25 41.125 C-12.50311496 40.3801687 -12.50311496 40.3801687 -15.25 41.125 C-15.66294312 42.01554077 -15.66294312 42.01554077 -16.08422852 42.92407227 C-17.19469629 45.02058892 -18.33691054 46.57007002 -19.90234375 48.33984375 C-20.42610596 48.93708252 -20.94986816 49.53432129 -21.48950195 50.1496582 C-22.04984131 50.780896 -22.61018066 51.41213379 -23.1875 52.0625 C-24.36778828 53.40832752 -25.54746538 54.75469127 -26.7265625 56.1015625 C-27.31856445 56.77606445 -27.91056641 57.45056641 -28.52050781 58.14550781 C-31.06132132 61.05359871 -33.56762106 63.98997493 -36.0625 66.9375 C-36.50899902 67.46359863 -36.95549805 67.98969727 -37.41552734 68.53173828 C-40.95925216 72.72884146 -44.35495568 77.03148051 -47.69140625 81.39453125 C-48.20574219 81.96558594 -48.72007812 82.53664063 -49.25 83.125 C-49.91 83.125 -50.57 83.125 -51.25 83.125 C-51.518125 83.7025 -51.78625 84.28 -52.0625 84.875 C-53.27929189 87.18050043 -54.55333879 89.14556192 -56.25 91.125 C-56.91 91.125 -57.57 91.125 -58.25 91.125 C-58.5193335 91.71361816 -58.78866699 92.30223633 -59.06616211 92.90869141 C-64.84453048 103.7265978 -76.84658595 114.25990855 -88.4375 118 C-98.70571932 120.42703366 -109.06136241 119.45383145 -119.25 117.125 C-117.82505239 112.86556201 -115.74331063 110.06848315 -112.8125 106.6875 C-111.901885 105.62259695 -110.9930975 104.55612905 -110.0859375 103.48828125 C-109.61639648 102.9360791 -109.14685547 102.38387695 -108.66308594 101.81494141 C-106.35431614 99.05383143 -104.14691307 96.21578899 -101.9375 93.375 C-97.93482553 88.24155393 -93.86667206 83.16746856 -89.75 78.125 C-85.71786488 73.18560493 -81.73179098 68.21688335 -77.8125 63.1875 C-73.69336506 57.90338784 -69.46337832 52.72042896 -65.1875 47.5625 C-60.26371135 41.62081911 -55.49756734 35.59804303 -50.82421875 29.45703125 C-47.78798605 25.49678017 -44.64720364 21.62227936 -41.5 17.75 C-40.96882568 17.09572021 -40.43765137 16.44144043 -39.89038086 15.76733398 C-38.35134058 13.88003142 -36.80179918 12.00181819 -35.25 10.125 C-34.73308594 9.48844482 -34.21617187 8.85188965 -33.68359375 8.19604492 C-25.20500447 -2.04668122 -12.58530251 -5.54069922 0 0 Z " transform="translate(201.25,252.875)" />
          <path d="M0 0 C6.68179136 5.10504369 10.68884914 11.70768338 12 20 C12.02698441 22.48309153 11.99091927 24.96717026 11.9140625 27.44921875 C11.89314041 28.17056503 11.87221832 28.89191132 11.85066223 29.63511658 C11.78095285 31.98611534 11.70301288 34.33676343 11.625 36.6875 C11.57516446 38.32404272 11.52577041 39.96059894 11.47680664 41.59716797 C11.16028117 51.96659623 10.74662687 62.33064989 10.30737305 72.69555664 C9.84564153 84.4607767 9.90536967 96.22798734 10 108 C18.55587502 107.47691292 26.33228319 105.42852974 34.52148438 102.99609375 C40.49807448 101.32504715 45.90977028 100.22715916 52 102 C55.65519887 104.7997268 57.97364526 107.48403915 59 112 C59.21054891 115.2424532 59.23540615 117.97846448 58 121 C53.60391538 125.70458792 49.00937074 128.18963145 42.93359375 130.0703125 C42.1776442 130.31868866 41.42169464 130.56706482 40.64283752 130.82296753 C38.24582629 131.6060384 35.84208654 132.36555485 33.4375 133.125 C31.85303437 133.64045007 30.26904523 134.15736725 28.68554688 134.67578125 C-1.17467003 144.39321168 -1.17467003 144.39321168 -8 143 C-14.09840044 139.8932677 -17.88032303 135.47485817 -20 129 C-20.315338 126.2503917 -20.5421098 123.57122472 -20.68603516 120.81323242 C-20.73509506 120.00295593 -20.78415497 119.19267944 -20.83470154 118.35784912 C-20.99418805 115.69079345 -21.14168627 113.0232187 -21.2890625 110.35546875 C-21.39756609 108.501691 -21.50681926 106.64795699 -21.61679077 104.79426575 C-21.90372919 99.92359833 -22.18049462 95.0524043 -22.45513916 90.18103027 C-22.73738353 85.20691697 -23.0292539 80.23336957 -23.3203125 75.25976562 C-23.889626 65.50703994 -24.44819299 55.75373076 -25 46 C-26.32 45.67 -27.64 45.34 -29 45 C-31.16926659 48.25389988 -31.24080049 49.13395957 -31.1953125 52.88671875 C-31.18564453 54.2934082 -31.18564453 54.2934082 -31.17578125 55.72851562 C-31.15902344 56.70498047 -31.14226562 57.68144531 -31.125 58.6875 C-31.11597656 59.67556641 -31.10695313 60.66363281 -31.09765625 61.68164062 C-31.0740843 64.12133765 -31.04118022 66.56054697 -31 69 C-52.31958763 80 -52.31958763 80 -57 80 C-65.21165416 63.09261142 -73.24720275 46.12399977 -81 29 C-77.19106629 24.83076175 -73.2847422 22.18069393 -68.375 19.4375 C-61.03018483 15.23758429 -53.86643739 10.81072524 -46.77294922 6.19897461 C-32.91972886 -2.69846247 -15.51068946 -9.71926752 0 0 Z " transform="translate(383,218)" />
          <path d="M0 0 C6.2751655 3.85899776 9.89731354 9.1363667 13.47265625 15.453125 C15.0577671 18.17417008 16.76312166 20.78653239 18.51391602 23.40307617 C27.0970048 36.31030782 32.99801397 49.58834347 30.140625 65.31640625 C28.8217599 70.30925269 26.4282296 72.01949582 22.140625 74.56640625 C16.6174616 77.38329332 11.2722762 78.62852275 5.140625 79.31640625 C5.44742188 78.713125 5.75421875 78.10984375 6.0703125 77.48828125 C7.22674563 75.14165052 8.192759 72.75377595 9.140625 70.31640625 C8.63273437 70.71472656 8.12484375 71.11304688 7.6015625 71.5234375 C0.88423159 76.69351803 -4.36246981 79.58391442 -12.859375 80.31640625 C-10.984375 75.56640625 -10.984375 75.56640625 -9.859375 73.31640625 C-9.819383 71.31680613 -9.81590701 69.31593383 -9.859375 67.31640625 C-10.18808594 67.7753125 -10.51679688 68.23421875 -10.85546875 68.70703125 C-15.41754254 74.5919828 -20.27459722 77.5618682 -27.66015625 78.77734375 C-30.06260901 79.02880274 -32.44634608 79.21565348 -34.859375 79.31640625 C-34.44945312 78.80851562 -34.03953125 78.300625 -33.6171875 77.77734375 C-30.46651156 73.75231755 -28.12141439 70.36456379 -26.859375 65.31640625 C-27.1996875 65.76371094 -27.54 66.21101563 -27.890625 66.671875 C-35.62229935 76.31590497 -44.31426661 78.95708722 -56.35546875 80.671875 C-64.40360124 81.17403504 -72.46155806 78.25416749 -79.859375 75.31640625 C-80.189375 74.65640625 -80.519375 73.99640625 -80.859375 73.31640625 C-79.92085693 73.14250366 -79.92085693 73.14250366 -78.96337891 72.96508789 C-76.13645533 72.43947238 -73.31041562 71.90924764 -70.484375 71.37890625 C-69.00710938 71.10530273 -69.00710938 71.10530273 -67.5 70.82617188 C-66.08847656 70.56030273 -66.08847656 70.56030273 -64.6484375 70.2890625 C-63.77912598 70.12672119 -62.90981445 69.96437988 -62.01416016 69.79711914 C-59.82475134 69.39981635 -59.82475134 69.39981635 -57.859375 68.31640625 C-58.849375 68.31640625 -59.839375 68.31640625 -60.859375 68.31640625 C-59.60303054 64.8372985 -58.38077179 62.04222241 -55.859375 59.31640625 C-52.95532227 58.03955078 -52.95532227 58.03955078 -49.42578125 56.94921875 C-48.47601662 56.64611282 -48.47601662 56.64611282 -47.50706482 56.33688354 C-45.48252237 55.69195785 -43.45305485 55.06508402 -41.421875 54.44140625 C-24.45513522 50.15300373 -24.45513522 50.15300373 -11.171875 40.12890625 C-8.32479887 34.02802883 -7.58932902 27.48547021 -9.578125 20.95703125 C-12.17391849 15.38863554 -16.05466822 11.53585296 -21.859375 9.31640625 C-27.69883387 8.0317253 -33.00220937 8.55037855 -38.859375 9.31640625 C-29.47422288 -3.2794558 -14.51504069 -6.89704748 0 0 Z " transform="translate(456.859375,303.68359375)" />
          <path d="M0 0 C8.22414852 3.63392609 10.98558503 11.86119796 14.4375 19.5625 C15.50336394 21.90779862 16.56978987 24.2528419 17.63671875 26.59765625 C17.91085602 27.20272003 18.18499329 27.80778381 18.46743774 28.43118286 C20.41821951 32.73542387 22.39688324 37.02591603 24.39453125 41.30859375 C24.95108398 42.50178223 25.50763672 43.6949707 26.08105469 44.92431641 C26.63180664 46.10429199 27.18255859 47.28426758 27.75 48.5 C31.83566808 57.26035936 35.86759901 66.03749807 39.64160156 74.9375 C41.03543528 78.64301342 41.03543528 78.64301342 44 81 C45.5797773 81.20772782 47.16607612 81.36717433 48.75390625 81.5 C49.69041016 81.5825 50.62691406 81.665 51.59179688 81.75 C53.57614443 81.91699309 55.56051959 82.08365849 57.54492188 82.25 C58.48013672 82.3325 59.41535156 82.415 60.37890625 82.5 C61.2407251 82.5721875 62.10254395 82.644375 62.99047852 82.71875 C65 83 65 83 66 84 C66.16684902 85.43018792 66.27588515 86.86722253 66.359375 88.3046875 C67.06933018 98.58785721 67.77848108 106.95206866 73 116 C62.02434299 115.12314387 51.04727422 114.15218385 40.125 112.75 C39.32481445 112.66516357 38.52462891 112.58032715 37.70019531 112.49291992 C30.70595644 111.52395404 26.12384476 108.52424862 21.46289062 103.26586914 C15.75924553 95.47946491 12.40060272 86.00427456 8.625 77.1875 C7.03956732 73.51167414 5.44956026 69.83783439 3.859375 66.1640625 C3.45850677 65.23547928 3.05763855 64.30689606 2.6446228 63.35017395 C-0.07087181 57.07933928 -2.87407123 50.85439683 -5.734375 44.6484375 C-6.48160461 43.0155282 -7.22851873 41.38247448 -7.97509766 39.74926758 C-9.03635433 37.42788439 -10.10270709 35.10986747 -11.18963623 32.80038452 C-18.88443067 16.43583718 -18.88443067 16.43583718 -17 9 C-12.82002502 2.12669421 -8.14131289 -0.71415025 0 0 Z " transform="translate(289,245)" />
          <path d="M0 0 C6.01586291 4.8074363 9.75507197 11.32327242 11.7890625 18.6796875 C12.86131512 30.01314833 11.70683504 38.08888796 4.5390625 46.9296875 C-2.2029391 54.14607301 -9.36447741 57.20819878 -19.0859375 57.9921875 C-28.34491952 57.66667641 -36.4463042 53.94366808 -43.2109375 47.6796875 C-50.22463953 38.43241301 -51.03074434 30.01842435 -50.2109375 18.6796875 C-48.31746101 10.47822933 -43.87727208 4.67941579 -37.4609375 -0.5703125 C-25.31366521 -7.11115142 -12.05376617 -7.19818545 0 0 Z " transform="translate(453.2109375,218.3203125)" />
          <path d="M0 0 C1.63232422 2.25976562 1.63232422 2.25976562 3.5546875 5.40625 C3.89750763 5.96437378 4.24032776 6.52249756 4.59353638 7.09753418 C5.3214795 8.28591316 6.04589507 9.47645888 6.76708984 10.66894531 C7.85634138 12.4691627 8.95636689 14.26239232 10.05859375 16.0546875 C13.64549134 21.9169063 17.06115564 27.78380565 20 34 C16.44609611 35.62369183 12.88050966 37.22007359 9.3125 38.8125 C8.32443359 39.26431641 7.33636719 39.71613281 6.31835938 40.18164062 C-8.16663359 46.60378961 -21.22858125 47.40812533 -36.8125 47.1875 C-38.68032768 47.17241725 -40.54816722 47.15873524 -42.41601562 47.14648438 C-46.9443089 47.1137831 -51.47201982 47.06220191 -56 47 C-49.78133059 39.73291166 -49.78133059 39.73291166 -46.81640625 36.3515625 C-46.28523193 35.74304443 -45.75405762 35.13452637 -45.20678711 34.50756836 C-44.08033908 33.21788153 -42.9521589 31.92970614 -41.82250977 30.64282227 C-38.81203641 27.18818771 -36.04109476 23.71463625 -33.4375 19.9375 C-30.15759291 15.63362191 -26.35735698 13.8655222 -21.48046875 11.68359375 C-16.48440421 9.26686668 -11.90671626 6.26759642 -7.25610352 3.25024414 C-2.19663779 0 -2.19663779 0 0 0 Z " transform="translate(196,313)" />
          <path d="M0 0 C0.78773804 0.02644089 1.57547607 0.05288177 2.38708496 0.0801239 C4.87348541 0.16705526 7.35828499 0.27648413 9.84375 0.38671875 C11.54161148 0.45006454 13.23952897 0.51192748 14.9375 0.57226562 C19.07376148 0.72246002 23.2087443 0.89281984 27.34375 1.07421875 C25.58612075 4.74636465 23.41417424 7.73105036 20.90625 10.94921875 C20.12378906 11.95726562 19.34132812 12.9653125 18.53515625 14.00390625 C18.04974365 14.5860791 17.56433105 15.16825195 17.06420898 15.76806641 C15.62781546 17.6934493 14.52734147 19.51787957 13.37524414 21.61083984 C10.46529008 26.5000232 7.57736553 31.11306102 1.88192749 32.80596924 C-5.17991339 33.82703229 -12.24824497 33.3503513 -19.34375 32.94921875 C-21.50956383 32.87889907 -23.6755975 32.81503718 -25.84179688 32.7578125 C-31.11812331 32.60445864 -36.38615322 32.37110258 -41.65625 32.07421875 C-38.79730546 25.94176736 -35.86784388 20.42891802 -31.40625 15.32421875 C-30.92953857 14.7720166 -30.45282715 14.21981445 -29.96166992 13.65087891 C-21.86374825 4.55066574 -12.28253547 -0.61493907 0 0 Z " transform="translate(75.65625,327.92578125)" />
          <path d="M0 0 C3.51460872 7.82046027 7.02355864 15.64340276 10.52301025 23.47065735 C12.15743489 27.1244756 13.80198217 30.7734527 15.45703125 34.41796875 C16.09663147 35.84102123 16.73598498 37.26418464 17.375 38.6875 C17.91898437 39.88761719 18.46296875 41.08773437 19.0234375 42.32421875 C19.34570312 43.20722656 19.66796875 44.09023438 20 45 C19 47 19 47 16.6875 48.1875 C13.88010429 49.03624754 12.698065 48.99928333 10 48 C10 47.34 10 46.68 10 46 C9.4225 45.7525 8.845 45.505 8.25 45.25 C5.67060021 43.81700012 3.93878408 42.21575324 2 40 C2 39.34 2 38.68 2 38 C0.515 37.505 0.515 37.505 -1 37 C-1 36.34 -1 35.68 -1 35 C-2.32 34.34 -3.64 33.68 -5 33 C-5 32.34 -5 31.68 -5 31 C-5.5887793 30.73719238 -6.17755859 30.47438477 -6.78417969 30.20361328 C-9.10339241 28.94383819 -10.60949403 27.61995979 -12.453125 25.7421875 C-13.071875 25.11699219 -13.690625 24.49179687 -14.328125 23.84765625 C-14.96234375 23.19667969 -15.5965625 22.54570312 -16.25 21.875 C-16.8996875 21.21628906 -17.549375 20.55757813 -18.21875 19.87890625 C-19.81711727 18.25703357 -21.41061897 16.6306719 -23 15 C-21.81006949 11.43020848 -20.95445113 11.04036929 -17.8515625 9.08203125 C-17.01109375 8.55029297 -16.170625 8.01855469 -15.3046875 7.47070312 C-14.42039063 6.92349609 -13.53609375 6.37628906 -12.625 5.8125 C-11.7484375 5.25369141 -10.871875 4.69488281 -9.96875 4.11914062 C-3.39019574 0 -3.39019574 0 0 0 Z " transform="translate(267,269)" />
          <path d="M0 0 C1.10102642 8.35600408 1.10094304 16.58807963 1 25 C-1.04224637 24.88485851 -3.08380159 24.75742674 -5.125 24.625 C-6.26195312 24.55539062 -7.39890625 24.48578125 -8.5703125 24.4140625 C-12.06989634 23.99156149 -14.80838655 23.50752806 -18 22 C-19.71484375 19.50390625 -19.71484375 19.50390625 -20.9375 16.5625 C-21.35902344 15.59441406 -21.78054688 14.62632812 -22.21484375 13.62890625 C-23 11 -23 11 -22 8 C-20.08227539 6.92504883 -20.08227539 6.92504883 -17.59765625 5.95703125 C-16.26250977 5.43012695 -16.26250977 5.43012695 -14.90039062 4.89257812 C-13.96388672 4.53615234 -13.02738281 4.17972656 -12.0625 3.8125 C-10.66354492 3.26045898 -10.66354492 3.26045898 -9.23632812 2.69726562 C-2.31551484 0 -2.31551484 0 0 0 Z " transform="translate(353,296)" />
        </svg>
        <p className="text-muted-foreground text-center w-full">Find a verified companion near you.</p>
      </section>

      {/* Unified Search Component */}
      <div className="lg:mx-10 xl:mx-40">
        <UnifiedSearch
          defaultFilters={defaultFilters}
          onLocationSearch={handleLocationSearch}
          onUsernameSearch={handleUsernameSearch}
          onClearSearch={handleClearSearch}
          searchType="escorts"
          lang={lang as string}
        />
      </div>

      {/* Show Featured section only when no search has been performed */}
      {!hasSearched && (
        <section className="md:max-w-[60%] mx-auto my-8">
          <h2 className="text-2xl font-bold mb-4">Featured profile</h2>

          {isLoadingFeatured ? (
            <div className="grid gap-4">
              {/* Main featured image skeleton */}
              <Skeleton className="w-full aspect-square md:aspect-16/10 rounded-lg" />

              {/* Thumbnail grid skeleton */}
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-lg" />
                ))}
              </div>

              <Skeleton className="h-14 rounded-lg w-full" />
            </div>
          ) : !featuredProfile ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No featured profiles available.</p>
            </div>
          ) : (
            <Link
              href={`/${lang}/escorts/${featuredProfile.slug}`}
              className="block transition-transform hover:scale-[1.02]"
              onClick={(e) => handleProfileClick(e, featuredProfile)}
            >
              <div className="grid gap-4">
                {/* Main featured image */}
                <div className="relative w-full aspect-square md:aspect-16/10 overflow-hidden rounded-lg bg-muted group">
                  <img
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                      isTransitioning ? 'opacity-0' : 'opacity-100',
                      (rotatedImages[0].NSFW === true && false) ? 'blur-xl group-hover:blur-0' : ''
                    )}
                    src={rotatedImages[0].url}
                    alt={featuredProfile.slug}
                  />
                  {(rotatedImages[0].NSFW === true && false) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                      <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium">NSFW</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                    <h3 className="text-white text-xl font-semibold">{featuredProfile.slug}</h3>
                    <p className="text-white/90 text-sm">{featuredProfile.location}</p>
                    <p className="text-white font-bold mt-1">{featuredProfile.price}</p>
                  </div>
                </div>

                {/* Thumbnail grid */}
                <div className="grid grid-cols-5 gap-4">
                  {rotatedImages.slice(1, 6).map((image, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg aspect-square bg-muted group">
                      <img
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                          (image.NSFW === true && false) ? 'blur-xl group-hover:blur-0' : ''
                        )}
                        src={image.url}
                        alt={`${featuredProfile.slug} - Image ${index + 2}`}
                      />
                      {(image.NSFW === true && false) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                          <div className="bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-medium">
                            NSFW
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-semibold">{featuredProfile.averageRating.toFixed(1)} ⭐</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="font-semibold">{featuredProfile.lastActive}</span>
                  </div>
                </div>

                <div className="flex">
                  <span>View Full Profile</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 ml-2 my-auto" aria-hidden="true">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>

              </div>
            </Link>
          )}
        </section>
      )}

      {/* Search results section - only show when search has been performed */}
      {hasSearched && (
        <section className="mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {searchResultsTitle}
            </h2>
            <p className="text-muted-foreground">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            </p>
          </div>

          {isLoadingProfiles ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No profiles match your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearSearch}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => {
                  const defaultImage = profile.images.find((img) => img.default);
                  return (
                    <Link
                      key={profile.slug}
                      href={`/${lang}/escorts/${profile.slug}`}
                      className="block transition-transform hover:scale-[1.02]"
                      onClick={(e) => handleProfileClick(e, profile)}
                    >
                      <div className="rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative aspect-square overflow-hidden bg-muted group">
                          <img
                            className={cn(
                              "w-full h-full object-cover transition-all duration-300",
                              (defaultImage?.NSFW === true && false) ? 'blur-xl group-hover:blur-0' : ''
                            )}
                            src={defaultImage?.url}
                            alt={profile.slug}
                          />
                          {(defaultImage?.NSFW === true && false) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                              <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                                <p className="text-sm font-medium">NSFW</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-1">{profile.slug}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{profile.location} ({profile.distance})</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Age: {profile.age}</span>
                            <span className="font-bold text-primary">{profile.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center border px-3 py-2 rounded-lg">
                  <Pagination>
                    <PaginationContent className="w-full justify-between">
                      <PaginationItem>
                        <PaginationLink
                          className={cn(
                            "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                            buttonVariants({ variant: "outline" })
                          )}
                          onClick={() => currentPage > 1 && performSearch(currentPage - 1)}
                          aria-label="Go to previous page"
                          aria-disabled={currentPage === 1 ? true : undefined}
                          role={currentPage === 1 ? "link" : undefined}
                        >
                          <ChevronLeftIcon size={16} aria-hidden="true" />
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <p className="text-sm text-muted-foreground" aria-live="polite">
                          Page <span className="text-foreground">{currentPage}</span> of{" "}
                          <span className="text-foreground">{totalPages}</span>
                        </p>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          className={cn(
                            "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                            buttonVariants({ variant: "outline" })
                          )}
                          onClick={() => currentPage < totalPages && performSearch(currentPage + 1)}
                          aria-label="Go to next page"
                          aria-disabled={currentPage === totalPages ? true : undefined}
                          role={currentPage === totalPages ? "link" : undefined}
                        >
                          <ChevronRightIcon size={16} aria-hidden="true" />
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </article>
  );
}