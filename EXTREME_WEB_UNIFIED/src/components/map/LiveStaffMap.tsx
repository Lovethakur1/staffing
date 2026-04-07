import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { X, Maximize2, Minimize2, RefreshCw, MapPin, Navigation, Users, Crosshair, Phone, Clock } from 'lucide-react';

interface StaffLocation {
  shiftId: string;
  staffId: string;
  staffName: string;
  staffAvatar?: string;
  staffPhone?: string;
  status: string;
  lat: number | null;
  lng: number | null;
  travelEnabled: boolean;
  travelStartTime?: string;
  travelArrivalTime?: string;
  clockIn?: string;
  clockOut?: string;
  travelHomeStart?: string;
  travelHomeEnd?: string;
}

interface ArrivedStaffNotification {
  id: string;
  staffName: string;
  timestamp: number;
}

// Geofence radius in meters
const VENUE_RADIUS_METERS = 100;

// Calculate distance between two coordinates in meters
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface LiveStaffMapProps {
  eventId: string;
  venueLat?: number | null;
  venueLng?: number | null;
  venueName?: string;
  onClose?: () => void;
  className?: string;
  selectedStaffId?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  TRAVEL_TO_VENUE: '#0ea5e9',  // sky-500
  ARRIVED: '#14b8a6',          // teal-500
  IN_PROGRESS: '#22c55e',      // green-500
  ONGOING: '#22c55e',
  BREAK: '#a855f7',            // purple-500
  COMPLETED: '#3b82f6',        // blue-500
  TRAVEL_HOME: '#f97316',      // orange-500
  CONFIRMED: '#eab308',        // yellow-500
  PENDING: '#6b7280',          // gray-500
};

const STATUS_LABELS: Record<string, string> = {
  TRAVEL_TO_VENUE: 'Traveling',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'Working',
  ONGOING: 'Working',
  BREAK: 'On Break',
  COMPLETED: 'Completed',
  TRAVEL_HOME: 'Going Home',
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending',
};

function createStaffIcon(name: string, status: string, isSelected: boolean) {
  const color = STATUS_COLORS[status] || '#6b7280';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const size = isSelected ? 48 : 40;
  const totalHeight = size + 24; // icon + name label
  const ring = isSelected ? 'box-shadow: 0 0 0 4px rgba(255,255,255,0.9), 0 0 0 6px ' + color + ';' : '';

  return L.divIcon({
    className: 'custom-staff-icon',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:${size}px; height:${size}px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}; opacity:0.25; ${status === 'TRAVEL_TO_VENUE' || status === 'TRAVEL_HOME' ? 'animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;' : ''}"></div>
        <div style="position:relative; width:${size - 8}px; height:${size - 8}px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:${color}; border:3px solid white; ${ring} z-index:10; cursor:pointer;">
          <span style="color:white; font-weight:700; font-size:${isSelected ? 14 : 12}px; letter-spacing:0.5px;">${initials}</span>
        </div>
        <div style="position:absolute; top:${size + 2}px; left:50%; transform:translateX(-50%); background:white; padding:2px 8px; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,0.15); white-space:nowrap; z-index:20; border:1px solid ${color}30;">
          <span style="font-size:10px; font-weight:600; color:#333;">${name.split(' ')[0]}</span>
        </div>
      </div>
    `,
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, size / 2],
  });
}

function createVenueIcon() {
  return L.divIcon({
    className: 'custom-staff-icon',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:52px; height:52px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#dc2626; opacity:0.15;"></div>
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:linear-gradient(135deg, #dc2626, #b91c1c); border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:10;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="position:absolute; top:54px; left:50%; transform:translateX(-50%); background:#dc2626; padding:2px 10px; border-radius:10px; white-space:nowrap; z-index:20;">
          <span style="font-size:10px; font-weight:700; color:white;">VENUE</span>
        </div>
      </div>
    `,
    iconSize: [52, 72],
    iconAnchor: [26, 26],
  });
}

export default function LiveStaffMap({
  eventId,
  venueLat,
  venueLng,
  venueName,
  onClose,
  className = '',
  selectedStaffId,
}: LiveStaffMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const venueMarkerRef = useRef<L.Marker | null>(null);
  const venueCircleRef = useRef<L.Circle | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const initialFitDone = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enteredStaffRef = useRef<Set<string>>(new Set()); // Track staff who already entered

  const [staffLocations, setStaffLocations] = useState<StaffLocation[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [focusedStaffId, setFocusedStaffId] = useState<string | null>(selectedStaffId || null);
  const [arrivedNotifications, setArrivedNotifications] = useState<ArrivedStaffNotification[]>([]);

  // Trigger arrival animation when staff enters venue radius
  const triggerArrivalAnimation = useCallback((staffName: string, staffId: string, lat: number, lng: number) => {
    if (!mapRef.current || !mapContainerRef.current) return;

    // Flash the venue radius circle
    if (venueCircleRef.current) {
      const circleElement = venueCircleRef.current.getElement();
      if (circleElement) {
        circleElement.classList.add('venue-radius-flash');
        setTimeout(() => circleElement.classList.remove('venue-radius-flash'), 1000);
      }
    }

    // Create burst animation at staff location
    const point = mapRef.current.latLngToContainerPoint([lat, lng]);
    const burst = document.createElement('div');
    burst.className = 'staff-arrival-marker';
    burst.style.left = `${point.x - 30}px`;
    burst.style.top = `${point.y - 30}px`;
    mapContainerRef.current.appendChild(burst);
    setTimeout(() => burst.remove(), 1500);

    // Add notification
    const notifId = `${staffId}-${Date.now()}`;
    setArrivedNotifications(prev => [...prev, {
      id: notifId,
      staffName,
      timestamp: Date.now(),
    }]);

    // Remove notification after 4 seconds
    setTimeout(() => {
      setArrivedNotifications(prev => prev.filter(n => n.id !== notifId));
    }, 4000);
  }, []);

  // Check if staff is within venue radius and trigger animation
  const checkAndTriggerArrival = useCallback((staff: StaffLocation) => {
    if (!venueLat || !venueLng || !staff.lat || !staff.lng) return;
    
    const staffId = staff.staffId || staff.shiftId;
    const distance = getDistanceMeters(staff.lat, staff.lng, venueLat, venueLng);
    const isInRadius = distance <= VENUE_RADIUS_METERS;
    const wasAlreadyIn = enteredStaffRef.current.has(staffId);

    if (isInRadius && !wasAlreadyIn) {
      // Staff just entered the radius!
      enteredStaffRef.current.add(staffId);
      triggerArrivalAnimation(staff.staffName, staffId, staff.lat, staff.lng);
      console.log(`[LiveStaffMap] ${staff.staffName} entered venue radius (${Math.round(distance)}m)`);
    } else if (!isInRadius && wasAlreadyIn) {
      // Staff left the radius
      enteredStaffRef.current.delete(staffId);
      console.log(`[LiveStaffMap] ${staff.staffName} left venue radius (${Math.round(distance)}m)`);
    }
  }, [venueLat, venueLng, triggerArrivalAnimation]);

  // Fetch initial staff locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.get(`/events/${eventId}/staff-locations`);
      setStaffLocations(res.data.staff || []);
    } catch (err) {
      console.error('Failed to fetch staff locations:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = venueLat && venueLng
      ? [venueLat, venueLng]
      : [40.7128, -74.006]; // NYC fallback

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
    }).setView(defaultCenter, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add venue marker
    if (venueLat && venueLng) {
      const venueMarker = L.marker([venueLat, venueLng], { icon: createVenueIcon() })
        .addTo(map)
        .bindPopup(`<div style="text-align:center; padding:4px;"><strong>${venueName || 'Event Venue'}</strong></div>`);
      venueMarkerRef.current = venueMarker;

      // Add geofence radius circle
      const venueCircle = L.circle([venueLat, venueLng], {
        radius: VENUE_RADIUS_METERS,
        color: '#dc2626',
        fillColor: '#dc2626',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '8, 4',
        className: 'venue-radius-circle',
      }).addTo(map);
      venueCircleRef.current = venueCircle;

      // Add pulse circle (animated)
      const pulseCircle = L.circle([venueLat, venueLng], {
        radius: VENUE_RADIUS_METERS,
        color: '#dc2626',
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: 3,
        opacity: 0.6,
        className: 'venue-pulse-circle',
      }).addTo(map);
      pulseCircleRef.current = pulseCircle;
    }

    mapRef.current = map;

    // Ensure Leaflet recalculates container size after render
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 500);

    // Inject animation CSS + fix leaflet divIcon pointer events
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      @keyframes venue-pulse {
        0% { 
          stroke-opacity: 0.6;
          stroke-width: 3px;
        }
        50% {
          stroke-opacity: 0.3;
          stroke-width: 5px;
        }
        100% {
          stroke-opacity: 0.6;
          stroke-width: 3px;
        }
      }
      @keyframes arrival-burst {
        0% { 
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(2.5);
          opacity: 0.6;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
      @keyframes radius-flash {
        0% { 
          fill-opacity: 0.08;
        }
        25% {
          fill-opacity: 0.3;
          fill: #22c55e;
        }
        50% {
          fill-opacity: 0.4;
          fill: #22c55e;
        }
        100% {
          fill-opacity: 0.08;
          fill: #dc2626;
        }
      }
      @keyframes notification-slide {
        0% { 
          transform: translateX(100%);
          opacity: 0;
        }
        10% {
          transform: translateX(0);
          opacity: 1;
        }
        90% {
          transform: translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      .venue-pulse-circle {
        animation: venue-pulse 2s ease-in-out infinite;
      }
      .venue-radius-flash {
        animation: radius-flash 1s ease-out forwards;
      }
      .staff-arrival-marker {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, #22c55e 0%, transparent 70%);
        animation: arrival-burst 1.5s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
      }
      .arrival-notification {
        animation: notification-slide 4s ease-in-out forwards;
      }
      .custom-staff-icon {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-container {
        cursor: grab !important;
        touch-action: none !important;
      }
      .leaflet-container:active {
        cursor: grabbing !important;
      }
      .leaflet-grab {
        cursor: grab !important;
      }
      .leaflet-dragging .leaflet-grab {
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapRef.current = null;
      style.remove();
    };
  }, [venueLat, venueLng, venueName]);

  // Fetch initial data + start polling as reliable fallback
  useEffect(() => {
    fetchLocations();

    // Poll every 10 seconds as fallback for socket issues
    pollingRef.current = setInterval(() => {
      fetchLocations();
    }, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchLocations]);

  // Setup Socket.io for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[LiveStaffMap] No auth token found, socket will not connect');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace('/api', '');
    console.log('[LiveStaffMap] Connecting socket to:', socketUrl);

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[LiveStaffMap] Socket connected, id:', socket.id);
      setConnected(true);
    });

    socket.on('connect_error', (err) => {
      console.error('[LiveStaffMap] Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[LiveStaffMap] Socket disconnected:', reason);
      setConnected(false);
    });

    // Listen for real-time location updates
    socket.on('staff:location', (data: {
      staffId: string;
      staffName: string;
      shiftId: string;
      eventId: string;
      lat: number;
      lng: number;
      status: string;
      timestamp: string;
    }) => {
      console.log('[LiveStaffMap] Received staff:location', data.staffName, data.lat, data.lng, 'eventId:', data.eventId);
      // Only process updates for this event
      if (data.eventId !== eventId) return;

      setStaffLocations(prev => {
        const idx = prev.findIndex(s => s.staffId === data.staffId || s.shiftId === data.shiftId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], lat: data.lat, lng: data.lng, status: data.status };
          return updated;
        }
        // New staff appearing
        return [...prev, {
          shiftId: data.shiftId,
          staffId: data.staffId,
          staffName: data.staffName,
          status: data.status,
          lat: data.lat,
          lng: data.lng,
          travelEnabled: true,
        }];
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId]);

  // Update markers when staffLocations changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentMarkers = markersRef.current;

    // Track which staff IDs are still present
    const activeIds = new Set<string>();

    staffLocations.forEach(staff => {
      if (!staff.lat || !staff.lng) return;
      const key = staff.staffId || staff.shiftId;
      activeIds.add(key);

      // Check if staff entered venue radius
      checkAndTriggerArrival(staff);

      const isSelected = selectedStaffId === staff.staffId;
      const icon = createStaffIcon(staff.staffName || 'Staff', staff.status, isSelected);

      const popupContent = `
        <div style="min-width:180px; padding:4px;">
          <div style="font-weight:700; font-size:14px; margin-bottom:4px;">${staff.staffName || 'Staff'}</div>
          <div style="display:inline-block; padding:2px 8px; border-radius:12px; background:${STATUS_COLORS[staff.status] || '#6b7280'}20; color:${STATUS_COLORS[staff.status] || '#6b7280'}; font-size:12px; font-weight:600; margin-bottom:6px;">
            ${STATUS_LABELS[staff.status] || staff.status}
          </div>
          ${staff.staffPhone ? `<div style="font-size:12px; color:#666; margin-top:4px;">📞 ${staff.staffPhone}</div>` : ''}
          ${staff.clockIn ? `<div style="font-size:12px; color:#666; margin-top:2px;">🕐 In: ${new Date(staff.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
          ${staff.clockOut ? `<div style="font-size:12px; color:#666;">🕐 Out: ${new Date(staff.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
        </div>
      `;

      const existing = currentMarkers.get(key);
      if (existing) {
        existing.setLatLng([staff.lat, staff.lng]);
        existing.setIcon(icon);
        existing.getPopup()?.setContent(popupContent);
      } else {
        const marker = L.marker([staff.lat, staff.lng], { icon })
          .addTo(map)
          .bindPopup(popupContent);
        currentMarkers.set(key, marker);
      }
    });

    // Remove markers for staff no longer in the list
    currentMarkers.forEach((marker, key) => {
      if (!activeIds.has(key)) {
        map.removeLayer(marker);
        currentMarkers.delete(key);
      }
    });

    // Only fit bounds on initial load, not on every update (prevents map jumping)
    if (!initialFitDone.current) {
      const allLatLngs: L.LatLngExpression[] = [];
      if (venueLat && venueLng) allLatLngs.push([venueLat, venueLng]);
      staffLocations.forEach(s => {
        if (s.lat && s.lng) allLatLngs.push([s.lat, s.lng]);
      });
      if (allLatLngs.length > 1) {
        map.fitBounds(L.latLngBounds(allLatLngs as [number, number][]), { padding: [60, 60], maxZoom: 16 });
        initialFitDone.current = true;
      } else if (allLatLngs.length === 1) {
        initialFitDone.current = true;
      }
    }
  }, [staffLocations, selectedStaffId, venueLat, venueLng, checkAndTriggerArrival]);

  // When selectedStaffId changes (from parent), fly to that staff
  useEffect(() => {
    if (!mapRef.current || !selectedStaffId) return;
    setFocusedStaffId(selectedStaffId);
    const staff = staffLocations.find(s => s.staffId === selectedStaffId);
    if (staff?.lat && staff?.lng) {
      mapRef.current.flyTo([staff.lat, staff.lng], 16, { duration: 1 });
      const marker = markersRef.current.get(staff.staffId || staff.shiftId);
      if (marker) marker.openPopup();
    }
  }, [selectedStaffId]);

  // Auto-follow focused staff when their location updates
  useEffect(() => {
    if (!mapRef.current || !focusedStaffId) return;
    const staff = staffLocations.find(s => s.staffId === focusedStaffId);
    if (staff?.lat && staff?.lng) {
      mapRef.current.panTo([staff.lat, staff.lng], { animate: true, duration: 0.5 });
    }
  }, [staffLocations, focusedStaffId]);

  // Invalidate size when expanded changes
  useEffect(() => {
    setTimeout(() => mapRef.current?.invalidateSize(), 300);
  }, [expanded]);

  const trackingStaff = staffLocations.filter(s =>
    s.lat && s.lng && ['TRAVEL_TO_VENUE', 'TRAVEL_HOME'].includes(s.status)
  );
  const onSiteStaff = staffLocations.filter(s =>
    ['ARRIVED', 'IN_PROGRESS', 'ONGOING', 'BREAK'].includes(s.status)
  );

  const handleRecenterStaff = (staff: StaffLocation) => {
    setFocusedStaffId(staff.staffId);
    if (staff.lat && staff.lng && mapRef.current) {
      mapRef.current.flyTo([staff.lat, staff.lng], 17, { duration: 1 });
      const marker = markersRef.current.get(staff.staffId || staff.shiftId);
      if (marker) setTimeout(() => marker.openPopup(), 500);
    }
  };

  const handleShowAll = () => {
    setFocusedStaffId(null);
    if (!mapRef.current) return;
    const allLatLngs: L.LatLngExpression[] = [];
    if (venueLat && venueLng) allLatLngs.push([venueLat, venueLng]);
    staffLocations.forEach(s => {
      if (s.lat && s.lng) allLatLngs.push([s.lat, s.lng]);
    });
    if (allLatLngs.length > 1) {
      mapRef.current.fitBounds(L.latLngBounds(allLatLngs as [number, number][]), { padding: [60, 60], maxZoom: 16 });
    } else if (venueLat && venueLng) {
      mapRef.current.flyTo([venueLat, venueLng], 14, { duration: 1 });
    }
    initialFitDone.current = true;
  };

  return (
    <div className={`relative bg-white rounded-xl border shadow-sm overflow-hidden ${expanded ? 'fixed inset-4 z-50' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2.5 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-sm">Live Staff Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Users className="w-3 h-3" />
              {staffLocations.length} staff
            </Badge>
            {trackingStaff.length > 0 && (
              <Badge className="text-xs gap-1 bg-sky-100 text-sky-700 border-sky-200">
                <Navigation className="w-3 h-3" />
                {trackingStaff.length} traveling
              </Badge>
            )}
            {onSiteStaff.length > 0 && (
              <Badge className="text-xs gap-1 bg-green-100 text-green-700 border-green-200">
                {onSiteStaff.length} on-site
              </Badge>
            )}
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
              title={connected ? 'Live updates connected' : 'Connecting...'} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={fetchLocations} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} title={expanded ? 'Minimize' : 'Maximize'}>
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Body: Staff sidebar + Map */}
      <div className="flex" style={{ height: expanded ? 'calc(100% - 48px)' : '550px' }}>
        {/* Staff Sidebar */}
        <div className="w-80 flex-shrink-0 border-r bg-gray-50/50 flex flex-col">
          <div className="p-3 border-b bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff Members</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleShowAll}>
                <Users className="w-3 h-3 mr-1" /> Show All
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {staffLocations.map(staff => {
              const color = STATUS_COLORS[staff.status] || '#6b7280';
              const label = STATUS_LABELS[staff.status] || staff.status;
              const hasLocation = !!(staff.lat && staff.lng);
              const isFocused = focusedStaffId === staff.staffId;
              const initials = (staff.staffName || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              return (
                <div
                  key={staff.staffId || staff.shiftId}
                  className={`rounded-lg border p-3 transition-all cursor-pointer ${
                    isFocused
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleRecenterStaff(staff)}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 border-2" style={{ borderColor: color }}>
                        <AvatarFallback className="text-white text-xs font-bold" style={{ backgroundColor: color }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online pulse for traveling */}
                      {(staff.status === 'TRAVEL_TO_VENUE' || staff.status === 'TRAVEL_HOME') && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-sky-500 border-2 border-white animate-pulse" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{staff.staffName || 'Staff'}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: color + '20', color }}
                        >
                          {label}
                        </span>
                        {!hasLocation && (
                          <span className="text-[10px] text-gray-400">No GPS</span>
                        )}
                      </div>
                    </div>

                    {/* Recenter Button */}
                    <Button
                      variant={isFocused ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 w-8 p-0 flex-shrink-0 ${!hasLocation ? 'opacity-40' : ''}`}
                      disabled={!hasLocation}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecenterStaff(staff);
                      }}
                      title={`Recenter on ${staff.staffName}`}
                    >
                      <Crosshair className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Extra details when focused */}
                  {isFocused && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      {staff.staffPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          {staff.staffPhone}
                        </div>
                      )}
                      {staff.clockIn && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          Checked in: {new Date(staff.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {staff.travelStartTime && !staff.travelArrivalTime && (
                        <div className="flex items-center gap-1.5 text-xs text-sky-600">
                          <Navigation className="w-3 h-3" />
                          Left at: {new Date(staff.travelStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {staffLocations.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No staff assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1, touchAction: 'none' }} />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading staff locations...</span>
              </div>
            </div>
          )}

          {/* No location data */}
          {!loading && staffLocations.filter(s => s.lat && s.lng).length === 0 && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur rounded-lg p-6 text-center shadow">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No location data yet</p>
                <p className="text-xs text-gray-400 mt-1">Staff locations will appear once they start travel</p>
              </div>
            </div>
          )}

          {/* Arrival notifications */}
          <div className="absolute top-4 right-4 z-[1002] space-y-2 pointer-events-none">
            {arrivedNotifications.map((notif) => (
              <div
                key={notif.id}
                className="arrival-notification flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{notif.staffName}</p>
                  <p className="text-xs opacity-90">Arrived at venue!</p>
                </div>
              </div>
            ))}
          </div>

          {/* Geofence indicator legend */}
          {venueLat && venueLng && (
            <div className="absolute bottom-4 left-4 z-[1002] bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-red-500 bg-red-500/10"></div>
                <span>Venue geofence ({VENUE_RADIUS_METERS}m radius)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded backdrop */}
      {expanded && (
        <div className="fixed inset-0 bg-black/50 -z-10" onClick={() => setExpanded(false)} />
      )}
    </div>
  );
}
