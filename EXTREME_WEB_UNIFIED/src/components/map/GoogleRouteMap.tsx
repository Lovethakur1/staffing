import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { MockRouteMap } from './MockRouteMap';

interface GoogleRouteMapProps {
  startLocation: { lat: number; lng: number; label?: string };
  endLocation: { lat: number; lng: number; label?: string };
  className?: string;
  apiKey?: string; // Optional: Pass in key or use default
}

// Default to a placeholder. User needs to replace this!
const DEFAULT_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

export function GoogleRouteMap({ 
  startLocation, 
  endLocation, 
  className,
  apiKey = DEFAULT_API_KEY 
}: GoogleRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // 1. Validation: Check if API Key is set
    if (apiKey === "YOUR_GOOGLE_MAPS_API_KEY" || !apiKey) {
      console.warn("Google Maps API Key is missing. Falling back to Mock Map.");
      setUseFallback(true);
      setLoading(false);
      return;
    }

    // 2. Script Loading Logic
    const loadGoogleMaps = () => {
      // Check if script already exists
      if (window.google?.maps) {
        initMap();
        return;
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        // Script is loading, wait for it
        const interval = setInterval(() => {
            if (window.google?.maps) {
                clearInterval(interval);
                initMap();
            }
        }, 100);
        return;
      }

      // Create Script
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => initMap();
      script.onerror = () => {
        setError("Failed to load Google Maps script.");
        setUseFallback(true);
        setLoading(false);
      };

      document.body.appendChild(script);
    };

    // 3. Map Initialization Logic
    const initMap = () => {
      if (!mapRef.current) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: startLocation,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
             {
               featureType: "poi",
               elementType: "labels",
               stylers: [{ visibility: "off" }]
             }
          ]
        });

        // Directions Service
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false, // We can let Google handle markers or do custom ones
          polylineOptions: {
            strokeColor: "#2563EB", // Tailwind blue-600
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });

        const request = {
          origin: startLocation,
          destination: endLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            setLoading(false);
          } else {
            console.error("Directions request failed due to " + status);
            // Fallback to simple centering if routing fails
            setLoading(false);
            // Just show markers manualy if route fails? 
            // For now, let's keep the map but show error
          }
        });

      } catch (e) {
        console.error("Error initializing map:", e);
        setError("Error initializing map.");
        setUseFallback(true);
        setLoading(false);
      }
    };

    loadGoogleMaps();
  }, [apiKey, startLocation, endLocation]);

  // Fallback Render
  if (useFallback) {
    return (
      <div className="relative w-full h-full">
        {/* Warning Banner */}
        {apiKey === DEFAULT_API_KEY && (
             <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 z-[100] flex items-center justify-center gap-2 border-b border-yellow-200">
                <AlertTriangle className="w-3 h-3" />
                <span>Demo Mode: Add valid Google Maps API Key to enable real map.</span>
             </div>
        )}
        <MockRouteMap startLocation={startLocation} endLocation={endLocation} className={className} />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-slate-100 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-500">Loading Google Maps...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" onClick={() => setUseFallback(true)}>Switch to Demo Map</Button>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// Type declaration for window.google
declare global {
  interface Window {
    google: any;
  }
}
