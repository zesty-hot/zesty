/**
 * Geocoding utilities for location search
 * Supports both Nominatim (free, no API key) and Geoapify (free tier with API key)
 */

export interface LocationSuggestion {
  value: string;
  label: string;
  type: string;
  coordinates?: [number, number];
}

// Option 1: Nominatim (OpenStreetMap) - Completely free, no API key needed
// Rate limit: 1 request/second
export async function searchLocationsNominatim(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=10` +
      `&featuretype=settlement`,
      {
        headers: {
          'User-Agent': 'Zesty-App/1.0'
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch locations');

    const data = await response.json();

    const results = data.map((place: any) => {
      let type = 'location';
      if (place.type === 'city' || place.type === 'town') type = 'city';
      else if (place.type === 'suburb' || place.type === 'neighbourhood' || place.type === 'quarter') type = 'suburb';
      else if (place.type === 'state' || place.type === 'region') type = 'state';
      else if (place.type === 'country') type = 'country';

      let label = place.display_name;
      if (place.address) {
        const parts = [];
        if (place.address.suburb) parts.push(place.address.suburb);
        else if (place.address.city) parts.push(place.address.city);
        else if (place.address.town) parts.push(place.address.town);
        else if (place.address.village) parts.push(place.address.village);

        if (place.address.state) parts.push(place.address.state);
        else if (place.address.country) parts.push(place.address.country);

        if (parts.length > 0) {
          label = parts.join(', ');
        }
      }

      return {
        value: place.place_id.toString(),
        label,
        type,
        coordinates: [parseFloat(place.lon), parseFloat(place.lat)] as [number, number],
      };
    })
      .filter((location: LocationSuggestion, index: number, self: LocationSuggestion[]) =>
        index === self.findIndex((l) => l.label.toLowerCase() === location.label.toLowerCase())
      );

    return results;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

// Option 2: Geoapify - Free tier with 3,000 requests/day (hard cap, no surprise billing)
// Get your free API key at: https://www.geoapify.com/
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

export async function searchLocationsGeoapify(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return [];
  if (!GEOAPIFY_API_KEY) {
    console.warn('Geoapify API key not set, falling back to Nominatim');
    return searchLocationsNominatim(query);
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?` +
      `text=${encodeURIComponent(query)}` +
      `&apiKey=${GEOAPIFY_API_KEY}` +
      `&limit=20` + // Fetch more results so we can filter
      `&type=city,suburb,district` // Only return city-level locations, not administrative areas
    );

    if (!response.ok) throw new Error('Failed to fetch locations');

    const data = await response.json();

    return data.features
      .filter((feature: any) => {
        const props = feature.properties;
        // Filter out councils and administrative areas
        // Only keep: city, suburb, district, neighbourhood, town, village
        const allowedTypes = ['city', 'suburb', 'district', 'neighbourhood', 'town', 'village', 'quarter'];
        return allowedTypes.includes(props.result_type);
      })
      .slice(0, 10) // Limit to 10 results after filtering
      .map((feature: any) => {
        const props = feature.properties;

        // Determine location type
        let type = 'location';
        if (props.result_type === 'city' || props.result_type === 'town' || props.result_type === 'village') type = 'city';
        else if (props.result_type === 'suburb' || props.result_type === 'neighbourhood' || props.result_type === 'district' || props.result_type === 'quarter') type = 'suburb';
        else if (props.result_type === 'state') type = 'state';
        else if (props.result_type === 'country') type = 'country';

        return {
          value: props.place_id || feature.properties.osm_id,
          label: props.formatted || props.name,
          type,
          coordinates: feature.geometry.coordinates as [number, number],
        };
      });
  } catch (error) {
    console.error('Error fetching locations from Geoapify:', error);
    // Fallback to Nominatim if Geoapify fails
    return searchLocationsNominatim(query);
  }
}

// Choose which geocoding service to use
// Default: Nominatim (completely free, no API key needed)
// To use Geoapify: Set NEXT_PUBLIC_GEOAPIFY_API_KEY in your .env file
export const searchLocations = GEOAPIFY_API_KEY ? searchLocationsGeoapify : searchLocationsNominatim;
