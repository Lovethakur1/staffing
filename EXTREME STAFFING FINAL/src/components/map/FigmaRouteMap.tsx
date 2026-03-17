import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { 
  Car, 
  Bike, 
  Footprints, 
  MapPin, 
  X,
  Navigation,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Building2,
  Flag
} from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// Sangria Theme Colors
const THEME = {
  primary: "#5E1916", // Deep Wine
  primaryLight: "#7B2323",
  bg: "#F8F5F2",      // Warm Paper
  road: "#E2D9D0",    // Soft warm gray for roads
  water: "#D4E1E8",   // Soft blue-gray for water (if needed)
  success: "#10B981",
};

export function FigmaRouteMap({ className, onClose }: { className?: string, onClose?: () => void }) {
  const [transportMode, setTransportMode] = useState<'car' | 'bike' | 'walk'>('car');
  const [progress, setProgress] = useState(15); // Start slightly along the route so car isn't on top of start
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive SVG Path Data
  // We use a viewBox of 0 0 1000 600 to define our relative coordinate system
  const VIEWBOX_W = 1000;
  const VIEWBOX_H = 600;
  
  // A nice S-curve path for the "route"
  // Start: (150, 150), End: (850, 450)
  const routePath = "M 150 150 C 350 150, 400 450, 850 450";

  // Calculate car position based on progress (0-100)
  // This is a simplified Bezier point calculation for the specific curve above
  const getPointOnCurve = (t: number) => {
    // Cubic Bezier: P0(150,150), P1(350,150), P2(400,450), P3(850,450)
    // t is 0..1
    const p0 = {x: 150, y: 150};
    const p1 = {x: 350, y: 150};
    const p2 = {x: 400, y: 450};
    const p3 = {x: 850, y: 450};

    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = (ax * Math.pow(t, 3)) + (bx * Math.pow(t, 2)) + (cx * t) + p0.x;
    const y = (ay * Math.pow(t, 3)) + (by * Math.pow(t, 2)) + (cy * t) + p0.y;
    
    // Calculate angle (derivative)
    const tx = (3 * ax * Math.pow(t, 2)) + (2 * bx * t) + cx;
    const ty = (3 * ay * Math.pow(t, 2)) + (2 * by * t) + cy;
    const angle = Math.atan2(ty, tx) * (180 / Math.PI);

    return { x, y, angle };
  };

  const { x, y, angle } = getPointOnCurve(progress / 100);

  // Map Controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.8));

  return (
    <div className={cn("fixed inset-0 z-[99999] bg-[#F8F5F2] w-screen h-screen overflow-hidden font-sans flex flex-col", className)}>
      
      {/* HEADER - Mobile Only */}
      <div className="md:hidden absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
         <div className="bg-white/90 backdrop-blur rounded-2xl p-3 shadow-sm border border-black/5 pointer-events-auto">
             <div className="text-[10px] font-bold text-[#5E1916] uppercase tracking-wider">ETA</div>
             <div className="text-xl font-bold text-gray-900">10:45 AM</div>
         </div>
         <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full shadow-md pointer-events-auto bg-white"
            onClick={onClose}
         >
             <X className="w-5 h-5" />
         </Button>
      </div>

      {/* MAP AREA */}
      <div className="relative w-full h-full flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-[#EBE5DE]" ref={containerRef}>
         
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ 
             backgroundImage: 'radial-gradient(#5E1916 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
         }}></div>

         {/* The Scalable Map Container */}
         <motion.div 
            className="w-full h-full flex items-center justify-center origin-center"
            animate={{ scale: zoom }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
         >
             <div className="relative aspect-video w-full max-w-[1200px] select-none">
                 
                 <svg 
                    viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} 
                    className="w-full h-full drop-shadow-xl"
                    preserveAspectRatio="xMidYMid meet"
                 >
                     {/* Background Roads (Decorative) */}
                     <path d="M -100 300 L 1100 300" stroke="white" strokeWidth="40" fill="none" />
                     <path d="M 400 -100 L 400 800" stroke="white" strokeWidth="30" fill="none" />
                     
                     {/* Main Route Path (Background/Stroke) */}
                     <path 
                        d={routePath} 
                        stroke="white" 
                        strokeWidth="24" 
                        fill="none" 
                        strokeLinecap="round"
                        className="drop-shadow-sm"
                     />
                     <path 
                        d={routePath} 
                        stroke={THEME.primary} 
                        strokeWidth="6" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeDasharray="12 12"
                        className="animate-[dash_1s_linear_infinite]"
                     />

                     {/* Start Point Marker */}
                     <g transform="translate(150, 150)">
                         <circle r="20" fill={THEME.bg} stroke={THEME.primary} strokeWidth="4" />
                         <circle r="8" fill={THEME.primary} />
                     </g>

                     {/* End Point Marker */}
                     <g transform="translate(850, 450)">
                         <circle r="25" fill={THEME.primary} className="animate-pulse opacity-20" />
                         <circle r="20" fill={THEME.primary} stroke="white" strokeWidth="4" />
                         <path transform="translate(-12, -12) scale(1)" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" />
                     </g>
                 </svg>

                 {/* HTML Overlay Layers for Tooltips/Text (To keep text crisp) */}
                 <div className="absolute inset-0 pointer-events-none">
                     
                     {/* Start Label */}
                     <div className="absolute left-[15%] top-[25%] -translate-x-1/2 -translate-y-full pb-4">
                         <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start</span>
                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">Stark Tower</span>
                         </div>
                         <div className="w-0.5 h-4 bg-gray-300 mx-auto"></div>
                     </div>

                     {/* End Label */}
                     <div className="absolute left-[85%] top-[75%] -translate-x-1/2 translate-y-4 pt-4">
                         <div className="w-0.5 h-4 bg-[#5E1916] mx-auto"></div>
                         <div className="bg-[#5E1916] text-white px-4 py-2 rounded-xl shadow-lg flex flex-col items-center">
                            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Destination</span>
                            <span className="text-base font-bold whitespace-nowrap">Wayne Manor</span>
                         </div>
                     </div>

                     {/* CAR */}
                     <div 
                        className="absolute w-0 h-0 will-change-transform"
                        style={{ 
                            left: `${(x / VIEWBOX_W) * 100}%`, 
                            top: `${(y / VIEWBOX_H) * 100}%`,
                        }}
                     >
                         <div 
                            className="relative -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                            style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                         >
                            {/* Car Body */}
                            <div className="bg-black w-12 h-6 rounded-md shadow-xl flex items-center justify-center relative z-10">
                                <div className="w-8 h-4 bg-gray-800 rounded-sm"></div>
                            </div>
                            {/* Headlights */}
                            <div className="absolute top-1/2 left-full -translate-y-1/2 w-16 h-8 bg-gradient-to-r from-yellow-200/50 to-transparent blur-md -mt-4 transform rotate-6"></div>
                            <div className="absolute top-1/2 left-full -translate-y-1/2 w-16 h-8 bg-gradient-to-r from-yellow-200/50 to-transparent blur-md mt-4 transform -rotate-6"></div>
                         </div>
                     </div>

                 </div>

             </div>
         </motion.div>

         {/* Floating Zoom Controls (Desktop) */}
         <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-40">
            <div className="bg-white rounded-full shadow-lg p-1.5 flex flex-col gap-1 border border-gray-100">
                <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 rounded-full">
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="h-px bg-gray-100 w-full" />
                <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8 rounded-full">
                    <ZoomOut className="w-4 h-4" />
                </Button>
            </div>
            <Button size="icon" className="rounded-full shadow-lg bg-[#5E1916] hover:bg-[#4a1311]">
                <LocateFixed className="w-4 h-4 text-white" />
            </Button>
         </div>

      </div>

      {/* FOOTER - Controls Panel */}
      <div className="relative z-50 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
        <div className="max-w-4xl mx-auto w-full">
            
            {/* Desktop: Close button integrated in top right of footer area */}
            <div className="hidden md:block absolute top-0 right-0 -translate-y-full p-4">
                <Button variant="secondary" onClick={onClose} className="rounded-full shadow-lg bg-white">
                    <X className="w-4 h-4 mr-2" /> Close Map
                </Button>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-8 items-end">
                
                {/* Left: Route Status */}
                <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Route Progress</h2>
                            <p className="text-gray-500 text-sm">Main St. to Highland Dr.</p>
                        </div>
                        {/* Transport Toggles */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                             {(['car', 'bike', 'walk'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setTransportMode(mode)}
                                    className={cn(
                                        "p-2.5 rounded-lg transition-all duration-200",
                                        transportMode === mode ? "bg-white text-[#5E1916] shadow-sm scale-100" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {mode === 'car' && <Car className="w-5 h-5" />}
                                    {mode === 'bike' && <Bike className="w-5 h-5" />}
                                    {mode === 'walk' && <Footprints className="w-5 h-5" />}
                                </button>
                             ))}
                        </div>
                    </div>

                    {/* The Slider Control */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Start</span>
                            <span className="flex items-center gap-1"><Flag className="w-3 h-3" /> Finish</span>
                        </div>
                        <Slider 
                            value={[progress]} 
                            max={100} 
                            step={0.5} 
                            onValueChange={(vals) => setProgress(vals[0])}
                            className="cursor-pointer"
                        />
                         <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
                            <span>0 min</span>
                            <span className="text-[#5E1916] font-bold">12 min remaining</span>
                            <span>25 min</span>
                        </div>
                    </div>
                </div>

                {/* Right: Big CTA */}
                <div className="w-full md:w-auto">
                    <Button 
                        size="lg" 
                        className="w-full md:w-64 h-14 text-lg font-bold bg-[#5E1916] hover:bg-[#4a1311] shadow-xl shadow-red-900/10 rounded-xl"
                        onClick={onClose}
                    >
                        Arrived at Venue
                    </Button>
                </div>

            </div>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 24px);
        }
      `}</style>
    </div>
  );
}