import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Search, Crosshair, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
}

interface LocationMapPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (location: LocationData) => void;
  className?: string;
}

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function LocationMapPicker({
  initialLatitude = 40.7128,
  initialLongitude = -74.0060,
  onLocationSelect,
  className = '',
}: LocationMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLatitude, initialLongitude]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [locationDetails, setLocationDetails] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      const address = data.address || {};
      
      // Build street address from available components (handle various country formats)
      const streetParts: string[] = [];
      
      // House number + road/street
      if (address.house_number) streetParts.push(address.house_number);
      
      // Prefer road, then street, then pedestrian for street name
      const streetName = address.road || address.street || address.pedestrian || '';
      if (streetName) streetParts.push(streetName);
      
      // If no street found, try neighbourhood/suburb/locality (common in India)
      if (streetParts.length === 0) {
        const locality = address.neighbourhood || address.suburb || address.locality || 
                        address.residential || address.hamlet || address.village || '';
        if (locality) streetParts.push(locality);
      }
      
      // Add sector/block info if available (common in Indian addresses)
      if (address.suburb && !streetParts.includes(address.suburb)) {
        streetParts.push(address.suburb);
      }
      
      // Determine city - check multiple fields for different countries
      const city = address.city || address.town || address.municipality || 
                   address.city_district || address.county || address.village || 
                   address.state_district || '';
      
      // Get state/region
      const state = address.state || address.region || address.province || '';
      
      // Get postal code
      const zipCode = address.postcode || address.postal_code || '';
      
      // Build formatted street address
      let streetAddress = streetParts.join(', ');
      
      // If street address is still empty or looks wrong, use a sensible fallback
      if (!streetAddress || streetAddress.length < 3) {
        // Try to extract from display_name
        const displayParts = (data.display_name || '').split(',').map((s: string) => s.trim());
        // Take first 1-2 parts that are not the city/state/country
        const relevantParts = displayParts.filter((part: string) => 
          part.toLowerCase() !== city.toLowerCase() && 
          part.toLowerCase() !== state.toLowerCase() &&
          part.toLowerCase() !== (address.country || '').toLowerCase() &&
          part !== zipCode
        ).slice(0, 2);
        streetAddress = relevantParts.join(', ');
      }
      
      const locationData: LocationData = {
        latitude: lat,
        longitude: lng,
        address: streetAddress,
        city: city,
        state: state,
        zipCode: zipCode,
        formattedAddress: data.display_name || '',
      };
      
      setLocationDetails(locationData);
      onLocationSelect(locationData);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Still update with coordinates even if geocoding fails
      const locationData: LocationData = {
        latitude: lat,
        longitude: lng,
        address: '',
        city: '',
        state: '',
        zipCode: '',
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
      setLocationDetails(locationData);
      onLocationSelect(locationData);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [onLocationSelect]);

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  // Search for location by address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      if (data.length === 0) {
        setError('Location not found. Please try a different search term.');
        return;
      }
      
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      setPosition([lat, lng]);
      
      const address = result.address || {};
      
      // Build street address from available components (handle various country formats)
      const streetParts: string[] = [];
      
      // House number + road/street
      if (address.house_number) streetParts.push(address.house_number);
      
      // Prefer road, then street, then pedestrian for street name
      const streetName = address.road || address.street || address.pedestrian || '';
      if (streetName) streetParts.push(streetName);
      
      // If no street found, try neighbourhood/suburb/locality (common in India)
      if (streetParts.length === 0) {
        const locality = address.neighbourhood || address.suburb || address.locality || 
                        address.residential || address.hamlet || address.village || '';
        if (locality) streetParts.push(locality);
      }
      
      // Add sector/block info if available (common in Indian addresses)
      if (address.suburb && !streetParts.includes(address.suburb)) {
        streetParts.push(address.suburb);
      }
      
      // Determine city - check multiple fields for different countries
      const city = address.city || address.town || address.municipality || 
                   address.city_district || address.county || address.village || 
                   address.state_district || '';
      
      // Get state/region
      const state = address.state || address.region || address.province || '';
      
      // Get postal code
      const zipCode = address.postcode || address.postal_code || '';
      
      // Build formatted street address
      let streetAddress = streetParts.join(', ');
      
      // If street address is still empty or looks wrong, use a sensible fallback
      if (!streetAddress || streetAddress.length < 3) {
        // Try to extract from display_name
        const displayParts = (result.display_name || '').split(',').map((s: string) => s.trim());
        // Take first 1-2 parts that are not the city/state/country
        const relevantParts = displayParts.filter((part: string) => 
          part.toLowerCase() !== city.toLowerCase() && 
          part.toLowerCase() !== state.toLowerCase() &&
          part.toLowerCase() !== (address.country || '').toLowerCase() &&
          part !== zipCode
        ).slice(0, 2);
        streetAddress = relevantParts.join(', ');
      }
      
      const locationData: LocationData = {
        latitude: lat,
        longitude: lng,
        address: streetAddress,
        city: city,
        state: state,
        zipCode: zipCode,
        formattedAddress: result.display_name || '',
      };
      
      setLocationDetails(locationData);
      onLocationSelect(locationData);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsSearching(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
        setIsSearching(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to get your location. Please enable location services or search manually.');
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for an address or place..."
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={isSearching}
          title="Use my current location"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: '300px' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapRecenter center={position} />
        </MapContainer>
        
        {/* Loading Overlay */}
        {(isSearching || isReverseGeocoding) && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-background p-3 rounded-lg shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">
                {isSearching ? 'Searching location...' : 'Getting address...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Click on the map to select a location, or search by address above
      </p>

      {/* Selected Location Details */}
      {locationDetails && (
        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Selected Location</p>
              <p className="text-muted-foreground break-words">
                {locationDetails.formattedAddress}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
            <div>
              <span className="font-medium">Latitude:</span> {locationDetails.latitude.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Longitude:</span> {locationDetails.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationMapPicker;
