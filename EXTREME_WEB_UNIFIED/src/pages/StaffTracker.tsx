import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { MapPin, Navigation, RefreshCw, Users, Radio, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StaffLocation {
  shiftId: string;
  eventId: string;
  eventTitle?: string;
  staffId: string;
  staffName: string;
  lat: number;
  lng: number;
  status: string;
  timestamp: Date;
}

const STATUS_COLORS: Record<string, string> = {
  TRAVEL_TO_VENUE: "bg-purple-100 text-purple-700",
  TRAVEL_HOME: "bg-indigo-100 text-indigo-700",
  ARRIVED: "bg-cyan-100 text-cyan-700",
  IN_PROGRESS: "bg-green-100 text-green-700",
  BREAK: "bg-orange-100 text-orange-700",
};

const STATUS_LABELS: Record<string, string> = {
  TRAVEL_TO_VENUE: "Traveling to Venue",
  TRAVEL_HOME: "Traveling Home",
  ARRIVED: "Arrived",
  IN_PROGRESS: "Working",
  BREAK: "On Break",
};

export function StaffTracker() {
  const [locations, setLocations] = useState<Map<string, StaffLocation>>(new Map());
  const [connected, setConnected] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const leafletRef = useRef<any>(null);

  // Connect socket for live updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("staff:location", (data: StaffLocation) => {
      setLocations((prev) => {
        const next = new Map(prev);
        next.set(data.staffId, { ...data, timestamp: new Date(data.timestamp) });
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css-tracker")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-tracker";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically
    const initMap = async () => {
      const L = await import("leaflet");
      leafletRef.current = L;

      if (mapRef.current) return; // Already initialized

      const map = L.map(mapContainerRef.current!, {
        center: [25.2048, 55.2708], // Default: Dubai
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !mapLoaded) return;
    const L = leafletRef.current;

    // Remove stale markers
    markersRef.current.forEach((marker, staffId) => {
      if (!locations.has(staffId)) {
        mapRef.current.removeLayer(marker);
        markersRef.current.delete(staffId);
      }
    });

    // Update/add markers
    locations.forEach((loc, staffId) => {
      const isTravel = loc.status === "TRAVEL_TO_VENUE" || loc.status === "TRAVEL_HOME";
      const markerColor = isTravel ? "#7C3AED" : "#059669";

      const icon = L.divIcon({
        className: "staff-tracker-marker",
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${markerColor};border:3px solid white;
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:bold;font-size:12px;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        ">${loc.staffName.split(" ").map((n) => n[0]).join("")}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const existing = markersRef.current.get(staffId);
      if (existing) {
        existing.setLatLng([loc.lat, loc.lng]);
        existing.setIcon(icon);
        existing.setPopupContent(
          `<b>${loc.staffName}</b><br/>${STATUS_LABELS[loc.status] || loc.status}<br/>${loc.eventTitle || ""}<br/><small>${new Date(loc.timestamp).toLocaleTimeString()}</small>`
        );
      } else {
        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(
            `<b>${loc.staffName}</b><br/>${STATUS_LABELS[loc.status] || loc.status}<br/>${loc.eventTitle || ""}<br/><small>${new Date(loc.timestamp).toLocaleTimeString()}</small>`
          );
        markersRef.current.set(staffId, marker);
      }
    });

    // Fit bounds if we have markers
    if (locations.size > 0) {
      const bounds = Array.from(locations.values()).map((l) => [l.lat, l.lng] as [number, number]);
      if (bounds.length === 1) {
        mapRef.current.setView(bounds[0], 14);
      } else if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [locations, mapLoaded]);

  function recenterMap() {
    if (!mapRef.current || locations.size === 0) return;
    const bounds = Array.from(locations.values()).map((l) => [l.lat, l.lng] as [number, number]);
    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], 14);
    } else {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  const activeStaff = Array.from(locations.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const travelingCount = activeStaff.filter(
    (s) => s.status === "TRAVEL_TO_VENUE" || s.status === "TRAVEL_HOME"
  ).length;

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Staff Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time location tracking for traveling staff
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={connected ? "default" : "destructive"} className="gap-1">
            <Radio className="h-3 w-3" />
            {connected ? "Live" : "Disconnected"}
          </Badge>
          <Button variant="outline" size="sm" onClick={recenterMap}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Recenter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeStaff.length}</p>
              <p className="text-xs text-gray-500">Active Staff</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Navigation className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{travelingCount}</p>
              <p className="text-xs text-gray-500">Traveling</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {activeStaff.length > 0
                  ? `${Math.round((Date.now() - new Date(activeStaff[0].timestamp).getTime()) / 1000)}s`
                  : "--"}
              </p>
              <p className="text-xs text-gray-500">Last Update</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border shadow-sm relative">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: 400 }} />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Staff list sidebar */}
        <div className="w-80 flex flex-col">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Active Staff ({activeStaff.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto pb-4" style={{ maxHeight: "calc(100% - 60px)" }}>
              {activeStaff.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Navigation className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No staff currently traveling</p>
                  <p className="text-xs mt-1">Locations will appear when staff start travel</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeStaff.map((staff) => (
                    <div
                      key={staff.staffId}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (mapRef.current) {
                          mapRef.current.setView([staff.lat, staff.lng], 15);
                          const marker = markersRef.current.get(staff.staffId);
                          if (marker) marker.openPopup();
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{staff.staffName}</span>
                        <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[staff.status] || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[staff.status] || staff.status}
                        </Badge>
                      </div>
                      {staff.eventTitle && (
                        <p className="text-xs text-gray-500 truncate">{staff.eventTitle}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        Updated: {new Date(staff.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
