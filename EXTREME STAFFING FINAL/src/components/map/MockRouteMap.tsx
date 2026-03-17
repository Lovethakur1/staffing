import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Plus, Minus, Move } from 'lucide-react';

interface MockRouteMapProps {
  startLocation: { lat: number; lng: number; label?: string };
  endLocation: { lat: number; lng: number; label?: string };
  className?: string;
}

export function MockRouteMap({ startLocation, endLocation, className }: MockRouteMapProps) {
  // Interaction State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Fixed "Demo" points (percentages of the container)
  // We simulate a route from bottom-left to top-right
  const startPoint = { x: 30, y: 70 }; // %
  const endPoint = { x: 70, y: 30 }; // %

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom Handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-[#e5e7eb] overflow-hidden cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Transform Container */}
      <div 
        className="w-full h-full absolute inset-0 transition-transform duration-75 ease-out origin-center"
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
      >
        {/* Mock Map Background (SVG Grid) */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-40">
           <defs>
             <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
               <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="2"/>
             </pattern>
             <pattern id="grid-thick" width="200" height="200" patternUnits="userSpaceOnUse">
               <path d="M 200 0 L 0 0 0 200" fill="none" stroke="white" strokeWidth="4"/>
             </pattern>
           </defs>
           <rect width="100%" height="100%" fill="#f3f4f6" />
           <rect width="100%" height="100%" fill="url(#grid)" />
           <rect width="100%" height="100%" fill="url(#grid-thick)" />
           
           {/* Mock Green Areas (Parks) */}
           <path d="M 100 300 Q 250 100 400 250 T 600 400" fill="none" stroke="#d1fae5" strokeWidth="80" opacity="0.5" />
           <circle cx="20%" cy="80%" r="150" fill="#d1fae5" opacity="0.6" />
           <circle cx="80%" cy="20%" r="120" fill="#d1fae5" opacity="0.6" />
           
           {/* Mock River */}
           <path d="M -50 400 C 150 450, 350 350, 600 500" fill="none" stroke="#bfdbfe" strokeWidth="40" opacity="0.8" />
        </svg>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
            </defs>
            {/* Dashed Route Path */}
            <path 
                d={`M ${startPoint.x}% ${startPoint.y}% Q 50% 50% ${endPoint.x}% ${endPoint.y}%`}
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="6" 
                strokeDasharray="12,12"
                strokeLinecap="round"
                className="drop-shadow-md"
            />
             {/* Solid Route Path (Background) */}
             <path 
                d={`M ${startPoint.x}% ${startPoint.y}% Q 50% 50% ${endPoint.x}% ${endPoint.y}%`}
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                strokeOpacity="0.3"
            />
        </svg>

        {/* Markers */}
        <div 
            className="absolute -translate-x-1/2 -translate-y-full" 
            style={{ left: `${startPoint.x}%`, top: `${startPoint.y}%` }}
        >
            <div className="relative group">
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce-slow">
                    <Navigation className="w-5 h-5 fill-current" />
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Start: {startLocation.label || "Start"}
                </div>
            </div>
        </div>

        <div 
            className="absolute -translate-x-1/2 -translate-y-full" 
            style={{ left: `${endPoint.x}%`, top: `${endPoint.y}%` }}
        >
            <div className="relative group">
                <div className="bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
                    <MapPin className="w-6 h-6 fill-current" />
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Dest: {endLocation.label || "Venue"}
                </div>
            </div>
        </div>
      </div>

      {/* Map Controls (Overlay) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[100]">
        <button 
            onClick={handleZoomIn}
            className="bg-white p-2 rounded shadow-md hover:bg-gray-50 border border-gray-200 active:bg-gray-100 transition-colors"
            title="Zoom In"
        >
            <Plus className="w-5 h-5 text-gray-700" />
        </button>
        <button 
            onClick={handleZoomOut}
            className="bg-white p-2 rounded shadow-md hover:bg-gray-50 border border-gray-200 active:bg-gray-100 transition-colors"
            title="Zoom Out"
        >
            <Minus className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Attribution-like Mock */}
      <div className="absolute bottom-1 right-1 text-[10px] text-gray-400 bg-white/50 px-1 pointer-events-none">
        © MapData (Demo Mode)
      </div>

      {/* Instructions Overlay (Fades out) */}
      <div className="absolute top-4 left-4 pointer-events-none">
         <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-md shadow-sm border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>Interactive Map Preview</span>
         </div>
      </div>
    </div>
  );
}