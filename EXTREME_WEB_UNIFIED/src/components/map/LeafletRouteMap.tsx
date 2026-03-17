import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  X, 
  Plus, 
  Minus, 
  Compass, 
  Locate, 
  Search,
  Maximize
} from 'lucide-react';
import { cn } from '../ui/utils';

interface LeafletRouteMapProps {
  startLocation: { lat: number; lng: number; label?: string };
  endLocation: { lat: number; lng: number; label?: string };
  className?: string;
  onClose?: () => void;
  showControls?: boolean;
  simulateNavigation?: boolean;
  onReachDestination?: () => void;
}

export function LeafletRouteMap({ 
  startLocation, 
  endLocation, 
  className, 
  onClose,
  showControls = true,
  simulateNavigation = false,
  onReachDestination
}: LeafletRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const [rotation, setRotation] = useState(0);
  const simulationRef = useRef<number | null>(null);

  // Inject CSS manually
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);
    }
  }, []);

  // Initialize Map & Static Elements
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Only initialize if not already done
    if (!mapInstanceRef.current) {
        const start: [number, number] = [startLocation.lat, startLocation.lng];
        const end: [number, number] = [endLocation.lat, endLocation.lng];

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView(start, 13);

        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Custom "Premium" Markers
        const createMarkerIcon = (color: string, type: 'start' | 'end') => {
            const isStart = type === 'start';
            return L.divIcon({
              className: 'bg-transparent',
              html: `
                <div class="relative flex items-center justify-center w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 group">
                   ${!isStart ? `<div class="absolute w-full h-full rounded-full opacity-30 animate-ping" style="background-color: ${color}"></div>` : ''}
                   
                   <div class="relative w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-lg z-10" style="background-color: ${color}">
                      ${isStart 
                        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
                        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
                      }
                   </div>
                   
                   <div class="absolute -bottom-6 bg-white/90 backdrop-blur px-2 py-0.5 rounded shadow-sm text-[10px] font-bold whitespace-nowrap border border-gray-100 z-20">
                      ${isStart ? (startLocation.label || "Start") : (endLocation.label || "Event")}
                   </div>

                   ${!isStart ? '<div class="absolute -bottom-1 w-2 h-4 bg-black/40 rounded-full blur-[2px]"></div>' : ''}
                </div>
              `,
              iconSize: [48, 48],
              iconAnchor: [24, 24]
          });
        };

        L.marker(start, { icon: createMarkerIcon('#3B82F6', 'start') }).addTo(map);
        L.marker(end, { icon: createMarkerIcon('#5E1916', 'end') }).addTo(map);

        // Route Polyline
        const mockRoute = [
            start, 
            [start[0] + (end[0]-start[0])*0.2, start[1] + (end[1]-start[1])*0.1], 
            [start[0] + (end[0]-start[0])*0.5, start[1] + (end[1]-start[1])*0.4],
            [start[0] + (end[0]-start[0])*0.8, start[1] + (end[1]-start[1])*0.9],
            end
        ] as L.LatLngExpression[];

        // Inner line
        routePolylineRef.current = L.polyline(mockRoute, { color: '#5E1916', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map);
        // Outer glow/border
        L.polyline(mockRoute, { color: '#ffffff', weight: 9, opacity: 0.4, lineCap: 'round', lineJoin: 'round' }).addTo(map);

        const bounds = L.latLngBounds([start, end]);
        map.fitBounds(bounds, { padding: [80, 80] });
    }

    // Cleanup on unmount
    return () => {
      if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
      if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Handle Simulation separately
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (simulateNavigation) {
        const start: [number, number] = [startLocation.lat, startLocation.lng];
        const end: [number, number] = [endLocation.lat, endLocation.lng];
        
        // Remove existing user marker if any
        if (userMarkerRef.current) userMarkerRef.current.remove();

        // Create User Marker
        const userIcon = L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2">
                 <div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg relative z-10"></div>
                 <div class="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const userMarker = L.marker(start, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        userMarkerRef.current = userMarker;

        // Animate along the path
        let startTime: number | null = null;
        const duration = 5000; // 5 seconds travel time

        // Reconstruct mock route points (same as in init)
        const mockRoute = [
            start, 
            [start[0] + (end[0]-start[0])*0.2, start[1] + (end[1]-start[1])*0.1], 
            [start[0] + (end[0]-start[0])*0.5, start[1] + (end[1]-start[1])*0.4],
            [start[0] + (end[0]-start[0])*0.8, start[1] + (end[1]-start[1])*0.9],
            end
        ];
        
        const points = mockRoute.map(p => Array.isArray(p) ? L.latLng(p[0], p[1]) : p as L.LatLng);
        
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Calculate total distance
            const totalDist = points.reduce((acc, curr, i) => {
                if (i === 0) return 0;
                return acc + points[i-1].distanceTo(curr);
            }, 0);

            const currentDist = totalDist * progress;
            
            // Find current position
            let accumulated = 0;
            let currentPos = points[0];

            for (let i = 1; i < points.length; i++) {
                const segmentDist = points[i-1].distanceTo(points[i]);
                if (accumulated + segmentDist >= currentDist) {
                    const segmentProgress = (currentDist - accumulated) / segmentDist;
                    const lat = points[i-1].lat + (points[i].lat - points[i-1].lat) * segmentProgress;
                    const lng = points[i-1].lng + (points[i].lng - points[i-1].lng) * segmentProgress;
                    currentPos = L.latLng(lat, lng);
                    break;
                }
                accumulated += segmentDist;
            }

            // Update marker
            userMarker.setLatLng(currentPos);
            
            // Pan map to follow user
            map.panTo(currentPos, { animate: true, duration: 0.1 });

            if (progress < 1) {
                simulationRef.current = requestAnimationFrame(animate);
            } else {
                // Done - ensure marker is at end
                userMarker.setLatLng(points[points.length - 1]);
                if (onReachDestination) onReachDestination();
            }
        };

        simulationRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup simulation only
    return () => {
       if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
    };
  }, [simulateNavigation, startLocation, endLocation]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
      if (mapInstanceRef.current) {
          const bounds = L.latLngBounds([
              [startLocation.lat, startLocation.lng],
              [endLocation.lat, endLocation.lng]
          ]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80] });
          setRotation(0);
      }
  };

  return (
    <div className={cn("relative w-full h-full bg-gray-50 overflow-hidden", className)}>
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-full relative z-0" />

        {/* UI Overlay */}
        {showControls && (
            <>
                {/* Search Island - Adjusted to avoid top header collision */}
                <div className="absolute top-24 left-4 right-16 z-[500] pointer-events-none flex justify-center md:top-6">
                    <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl flex items-center p-1.5 pr-4 border border-white/20 pointer-events-auto max-w-sm w-full transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                        <div className="h-9 w-9 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                        <Input 
                            className="border-0 shadow-none focus-visible:ring-0 h-9 bg-transparent text-sm font-medium placeholder:text-gray-400" 
                            placeholder="Search along route..." 
                        />
                    </div>
                </div>

                {/* Right Floating Controls Stack */}
                <div className="absolute bottom-36 right-4 z-[500] flex flex-col gap-3">
                    
                    {/* Compass */}
                    <div className="group relative flex items-center justify-end">
                       <Button 
                          className="w-12 h-12 rounded-full bg-white text-gray-700 shadow-xl border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all duration-300"
                          size="icon"
                          onClick={() => setRotation(r => r + 45)}
                          style={{ transform: `rotate(${rotation}deg)` }}
                       >
                          <Compass className="w-6 h-6 text-[#5E1916]" strokeWidth={2.5} />
                       </Button>
                    </div>

                    {/* Recenter */}
                    <Button 
                        className="w-12 h-12 rounded-full bg-white text-gray-700 shadow-xl border border-gray-100 hover:bg-gray-50 hover:text-[#5E1916] active:scale-95 transition-all"
                        size="icon"
                        onClick={handleRecenter}
                    >
                        <Locate className="w-6 h-6" />
                    </Button>

                    {/* Zoom Group */}
                    <div className="flex flex-col bg-white rounded-full shadow-xl border border-gray-100 overflow-hidden">
                        <Button 
                            variant="ghost" 
                            className="w-12 h-12 rounded-none hover:bg-gray-50 active:bg-gray-100 text-gray-700" 
                            size="icon" 
                            onClick={handleZoomIn}
                        >
                            <Plus className="w-6 h-6" />
                        </Button>
                        <div className="h-[1px] w-full bg-gray-100" />
                        <Button 
                            variant="ghost" 
                            className="w-12 h-12 rounded-none hover:bg-gray-50 active:bg-gray-100 text-gray-700" 
                            size="icon" 
                            onClick={handleZoomOut}
                        >
                            <Minus className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </>
        )}

        {/* Close Button (Premium style) */}
        {onClose && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-4 z-[1000] rounded-full shadow-lg bg-white/80 hover:bg-white backdrop-blur text-gray-700 hover:text-red-600 transition-all active:scale-95 w-11 h-11"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
            </Button>
        )}

    </div>
  );
}
