import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const iconFix = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  });
};

interface MapInnerProps {
  startLocation: { lat: number; lng: number; label?: string };
  endLocation: { lat: number; lng: number; label?: string };
}

// Component to handle view updates
function MapController({ start, end }: { start: { lat: number; lng: number }, end: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // Invalidate size to ensure map renders correctly if container resized
    map.invalidateSize();

    const bounds = L.latLngBounds([
      [start.lat, start.lng],
      [end.lat, end.lng]
    ]);
    
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, start, end]);

  return null;
}

export default function MapInner({ startLocation, endLocation }: MapInnerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    iconFix();
    // Delay rendering slightly to ensure container has dimensions
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const centerLat = (startLocation.lat + endLocation.lat) / 2;
  const centerLng = (startLocation.lng + endLocation.lng) / 2;

  if (!ready) return <div className="w-full h-full bg-slate-100 flex items-center justify-center">Initializing Map...</div>;

  return (
    <div className="w-full h-full relative isolate">
       {/* CSS Overrides for Tailwind Conflict */}
       <style>{`
         .leaflet-pane img, 
         .leaflet-tile, 
         .leaflet-marker-icon, 
         .leaflet-marker-shadow {
             max-width: none !important;
             max-height: none !important;
         }
         .leaflet-container {
             width: 100% !important;
             height: 100% !important;
             z-index: 1;
         }
       `}</style>
       
       <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
       
       <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[startLocation.lat, startLocation.lng]}>
          <Popup>
            <div className="font-semibold text-sm">Start: {startLocation.label || "Start"}</div>
          </Popup>
        </Marker>

        <Marker position={[endLocation.lat, endLocation.lng]}>
          <Popup>
            <div className="font-semibold text-sm">Dest: {endLocation.label || "Venue"}</div>
          </Popup>
        </Marker>

        <Polyline
          positions={[
            [startLocation.lat, startLocation.lng],
            [endLocation.lat, endLocation.lng]
          ]}
          pathOptions={{ color: 'blue', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
        />

        <MapController start={startLocation} end={endLocation} />
      </MapContainer>
    </div>
  );
}
