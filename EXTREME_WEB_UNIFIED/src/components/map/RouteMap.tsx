import { GoogleRouteMap } from './GoogleRouteMap';
import { FigmaRouteMap } from './FigmaRouteMap';
import { LeafletRouteMap } from './LeafletRouteMap';

interface RouteMapProps {
  startLocation: { lat: number; lng: number; label?: string };
  endLocation: { lat: number; lng: number; label?: string };
  className?: string;
  provider?: 'google' | 'leaflet' | 'mock' | 'figma'; 
  onClose?: () => void;
  showControls?: boolean;
  simulateNavigation?: boolean;
  onReachDestination?: () => void;
}

export function RouteMap({ provider = 'leaflet', ...props }: RouteMapProps) {
  if (provider === 'figma') {
    return <FigmaRouteMap className={props.className} onClose={props.onClose} />;
  }
  if (provider === 'leaflet') {
    return <LeafletRouteMap {...props} />;
  }
  return <GoogleRouteMap {...props} />;
}
