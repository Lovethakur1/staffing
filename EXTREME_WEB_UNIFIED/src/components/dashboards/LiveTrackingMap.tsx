import React, { useState, useEffect, useMemo, useRef } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Briefcase, MapPin, Navigation, Coffee, Home, Building2, Car } from "lucide-react";

// Icon Component Helper
const Icon = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("relative shrink-0", className)}>
    <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
      <g>{children}</g>
    </svg>
  </div>
);

interface LiveTrackingMapProps {
  staff?: {
    name: string;
    role?: string;
    image?: string;
  };
  destinationName?: string;
  eta?: string;
  /**
   * If true, simulates full door-to-door shift: Commute -> Work -> Return
   * If false, simulates standard one-way travel tracking
   */
  fullShiftSimulation?: boolean;
}

// Waypoints extracted from the SVG path
const WAYPOINTS = [
  { x: 191, y: 134 },
  { x: 303, y: 119 },
  { x: 305, y: 187 },
  { x: 436, y: 231 },
  { x: 490, y: 351 },
  { x: 600, y: 384 },
  { x: 735, y: 384 }
];

type SimulationPhase = 'commuting-to' | 'checking-in' | 'working' | 'break' | 'checking-out' | 'commuting-back' | 'complete';

export function LiveTrackingMap({
  staff,
  destinationName = "Downtown Convention Center",
  eta = "15 mins",
  fullShiftSimulation = true
}: LiveTrackingMapProps) {
  const [zoom, setZoom] = useState(1);

  // Simulation State
  const [phase, setPhase] = useState<SimulationPhase>('commuting-to');
  const [progress, setProgress] = useState(0); // 0.0 to 1.0 position on path
  const [speed, setSpeed] = useState(60);

  // Accumulated Times (in simulated minutes)
  const [metrics, setMetrics] = useState({
    travelTime: 0,
    workTime: 0,
    breakTime: 0,
    totalTime: 0
  });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.8));

  // Calculate total path length for uniform movement
  const totalLength = useMemo(() => {
    let len = 0;
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      const dx = WAYPOINTS[i + 1].x - WAYPOINTS[i].x;
      const dy = WAYPOINTS[i + 1].y - WAYPOINTS[i].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }, []);

  // Location Name Generator
  const getLocationName = (p: number, currentPhase: SimulationPhase) => {
    if (currentPhase === 'working') return "At Venue";
    if (currentPhase === 'checking-in') return "Arriving at Venue";
    if (currentPhase === 'checking-out') return "Leaving Venue";
    if (currentPhase === 'break') return "Break Area";

    // Commuting
    const effectiveP = currentPhase === 'commuting-back' ? p : p; // p is already directional

    if (effectiveP < 0.1) return "Home Drive";
    if (effectiveP < 0.3) return "Residential Area";
    if (effectiveP < 0.6) return "Highway E40";
    if (effectiveP < 0.8) return "City Center";
    return "Convention Blvd";
  };

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    // Simulation Parameters
    const COMMUTE_DURATION = 8000; // ms (one way)
    const WORK_DURATION = 6000;    // ms
    const BREAK_DURATION = 2000;   // ms

    // Time Multipliers (1ms real = X min simulated)
    const TRAVEL_TIME_MULTIPLIER = 0.01; // Fast accumulating travel time
    const WORK_TIME_MULTIPLIER = 0.1;    // Faster accumulating work time

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (!fullShiftSimulation) {
        // Simple loop mode (original behavior)
        setProgress(prev => {
          const next = prev + (deltaTime / 20000);
          return next > 1 ? 0 : next;
        });
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      setPhase(currentPhase => {
        let nextPhase = currentPhase;

        switch (currentPhase) {
          case 'commuting-to':
            setProgress(p => {
              const next = p + (deltaTime / COMMUTE_DURATION);
              if (next >= 1) return 1;
              return next;
            });
            setMetrics(m => ({
              ...m,
              travelTime: m.travelTime + (deltaTime * TRAVEL_TIME_MULTIPLIER),
              totalTime: m.totalTime + (deltaTime * TRAVEL_TIME_MULTIPLIER)
            }));
            if (progress >= 1) nextPhase = 'checking-in';
            break;

          case 'checking-in':
            // Hold for 1.5s
            if (!phaseTimer.current) phaseTimer.current = time;
            if (time - phaseTimer.current > 1500) {
              phaseTimer.current = 0;
              nextPhase = 'working';
            }
            break;

          case 'working':
            // Work for duration
            if (!phaseTimer.current) phaseTimer.current = time;
            setMetrics(m => ({
              ...m,
              workTime: m.workTime + (deltaTime * WORK_TIME_MULTIPLIER),
              totalTime: m.totalTime + (deltaTime * WORK_TIME_MULTIPLIER)
            }));

            // Insert a break in the middle
            if (time - phaseTimer.current > (WORK_DURATION / 2) && time - phaseTimer.current < (WORK_DURATION / 2) + 100) {
              // short trigger for break
            }

            if (time - phaseTimer.current > WORK_DURATION) {
              phaseTimer.current = 0;
              nextPhase = 'break';
            }
            break;

          case 'break':
            if (!phaseTimer.current) phaseTimer.current = time;
            setMetrics(m => ({
              ...m,
              breakTime: m.breakTime + (deltaTime * WORK_TIME_MULTIPLIER),
              totalTime: m.totalTime + (deltaTime * WORK_TIME_MULTIPLIER)
            }));
            if (time - phaseTimer.current > BREAK_DURATION) {
              phaseTimer.current = 0;
              nextPhase = 'checking-out';
            }
            break;

          case 'checking-out':
            if (!phaseTimer.current) phaseTimer.current = time;
            if (time - phaseTimer.current > 1500) {
              phaseTimer.current = 0;
              nextPhase = 'commuting-back';
            }
            break;

          case 'commuting-back':
            setProgress(p => {
              const next = p - (deltaTime / COMMUTE_DURATION);
              if (next <= 0) return 0;
              return next;
            });
            setMetrics(m => ({
              ...m,
              travelTime: m.travelTime + (deltaTime * TRAVEL_TIME_MULTIPLIER),
              totalTime: m.totalTime + (deltaTime * TRAVEL_TIME_MULTIPLIER)
            }));
            if (progress <= 0) nextPhase = 'complete';
            break;

          case 'complete':
            if (!phaseTimer.current) phaseTimer.current = time;
            if (time - phaseTimer.current > 2000) {
              // Reset everything
              phaseTimer.current = 0;
              setMetrics({ travelTime: 0, workTime: 0, breakTime: 0, totalTime: 0 });
              nextPhase = 'commuting-to';
            }
            break;
        }

        // Speed Fluctuation
        if (currentPhase.includes('commuting')) {
          if (Math.random() > 0.9) setSpeed(prev => Math.max(45, Math.min(75, prev + (Math.random() - 0.5) * 5)));
        } else {
          setSpeed(0);
        }

        return nextPhase;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const phaseTimer = { current: 0 };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [fullShiftSimulation, progress]);

  // Calculate Position & Rotation
  const { x, y, rotation } = useMemo(() => {
    const currentDist = progress * totalLength;
    let accumDist = 0;

    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      const p1 = WAYPOINTS[i];
      const p2 = WAYPOINTS[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segmentLen = Math.sqrt(dx * dx + dy * dy);

      if (accumDist + segmentLen >= currentDist || i === WAYPOINTS.length - 2) {
        const segmentProgress = (currentDist - accumDist) / segmentLen;

        // Calculate base angle
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // If returning, flip the angle
        if (phase === 'commuting-back') {
          angle += 180;
        }

        return {
          x: p1.x + dx * segmentProgress,
          y: p1.y + dy * segmentProgress,
          rotation: angle
        };
      }
      accumDist += segmentLen;
    }
    return { x: WAYPOINTS[0].x, y: WAYPOINTS[0].y, rotation: 0 };
  }, [progress, totalLength, phase]);

  // Format Time Helper
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return hours > 0 ? `${hours}h ${m}m` : `${m}m`;
  };

  const getStatusText = () => {
    switch (phase) {
      case 'commuting-to': return "Commuting to Event";
      case 'checking-in': return "Checking In...";
      case 'working': return "On Duty / Working";
      case 'break': return "On Break";
      case 'checking-out': return "Checking Out...";
      case 'commuting-back': return "Returning Home";
      case 'complete': return "Shift Complete";
      default: return "Offline";
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-[#f8fafc] rounded-xl overflow-hidden shadow-sm border border-slate-200 font-sans flex flex-col">

      {/* ZOOMABLE MAP CONTAINER */}
      <div className="relative flex-grow w-full overflow-hidden group bg-[#f8fafc]">

        <div
          className="w-full h-full transition-transform duration-300 ease-in-out origin-center relative"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* 1. Map Background */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <div className="relative w-[872px] h-[528px]">
              {/* Background Layer with Map Image */}
              <div className="absolute inset-0 w-full h-full bg-slate-200">
                {/* Overlay to ensure readability */}
                <div className="absolute inset-0 bg-white/20" />
              </div>

              {/* SVG Route Layer */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 872.672 528">
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_8007_2431" x1="218.166" x2="29634.1" y1="100.375" y2="47165.8">
                      <stop stopColor={phase === 'commuting-back' ? "#64748b" : "#4338CA"} stopOpacity="0.8" />
                      <stop offset="1" stopColor={phase === 'commuting-back' ? "#94a3b8" : "#6366F1"} />
                    </linearGradient>
                  </defs>
                  <path d={""} stroke="url(#paint0_linear_8007_2431)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6.54504" />

                  {/* Static Waypoints */}
                  <path d={""} fill="white" stroke="#4338CA" strokeWidth="3.27252" />
                  <path d={""} fill="white" stroke="#4338CA" strokeWidth="3.27252" />
                  <path d={""} fill="white" stroke="#4338CA" strokeWidth="3.27252" />
                  <path d={""} fill="#4338CA" stroke="white" strokeWidth="2.18168" />
                </svg>
              </div>

              {/* Destination Card (Right) */}
              <div className="absolute left-[597.67px] top-[414px] w-[192px] h-[62px] z-20">
                <div className="absolute bg-white flex gap-3 h-[54px] items-center left-0 pl-[11px] pr-px py-px rounded-[12px] top-[8px] w-[192px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] border border-[#f1f5f9]">
                  {/* Check-in Pulse when active */}
                  <div className={clsx(
                    "relative rounded-full shrink-0 w-[32px] h-[32px] flex items-center justify-center transition-colors duration-500",
                    (phase === 'working' || phase === 'checking-in') ? "bg-green-100" : "bg-[#eef2ff]"
                  )}>
                    {phase === 'checking-in' && <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>}
                    <Building2 className={clsx("w-4 h-4", (phase === 'working') ? "text-green-600" : "text-[#4F39F6]")} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-[#0f172b] text-[12px] leading-[15px]">{destinationName}</p>
                    <div className="flex items-center gap-1">
                      <span className={clsx("w-1.5 h-1.5 rounded-full", (phase === 'working' || phase === 'break') ? "bg-green-500" : "bg-slate-300")} />
                      <p className="font-normal text-[#62748e] text-[10px] leading-[12.5px]">Event Location</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bg-[#4f39f6] h-[32px] left-[140px] top-[-32px] w-[2px]" />
              </div>

              {/* Origin Card (Left) */}
              <div className="absolute left-[162.67px] top-[36px] w-[160px] h-[100px] z-20">
                <div className="absolute bg-white flex gap-3 h-[54px] items-center left-0 pl-[11px] pr-px py-px rounded-[12px] top-0 w-[160px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] border border-[#f1f5f9]">
                  <div className="bg-[#eef2ff] relative rounded-full shrink-0 w-[32px] h-[32px] flex items-center justify-center">
                    <Home className="w-4 h-4 text-[#4F39F6]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-[#0f172b] text-[12px] leading-[15px]">{staff?.name || "Staff"}'s Home</p>
                    <p className="font-normal text-[#62748e] text-[10px] leading-[12.5px]">Starting Point</p>
                  </div>
                </div>
                <div className="absolute bg-[#4f39f6] h-[48px] left-[29px] top-[54px] w-[2px]" />
                <div className="absolute bg-[#4f39f6] border-2 border-white left-[24px] rounded-full shadow-sm size-[12px] top-[92px]" />
              </div>

              {/* Animated Vehicle Marker */}
              <motion.div
                className="absolute z-30 flex flex-col items-center justify-center pointer-events-none"
                style={{ left: 0, top: 0 }}
                animate={{
                  x: x - 24,
                  y: y - 24,
                }}
                transition={{ duration: 0.1, ease: "linear" }}
              >
                {/* Location Label (Floating above car) */}
                <div className="absolute -top-8 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap backdrop-blur-sm">
                  {getLocationName(progress, phase)}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45"></div>
                </div>

                {/* Ping Animation Rings (Only when moving) */}
                {speed > 0 && (
                  <>
                    <div className="absolute bg-[rgba(97,95,255,0.2)] opacity-0 rounded-full size-[224px] animate-ping" />
                    <div className="absolute bg-[rgba(97,95,255,0.3)] rounded-full size-[80px]" />
                  </>
                )}

                {/* Vehicle Icon */}
                <motion.div
                  className={clsx(
                    "flex items-center justify-center rounded-full size-[48px] border-[3px] border-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-colors duration-300 relative z-10",
                    phase === 'commuting-back' ? "bg-slate-700" : "bg-[#4f39f6]"
                  )}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 0.1, ease: "linear" }}
                >
                  <div className="flex items-center justify-center relative shrink-0 size-[40px] transform rotate-45">
                    <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
                      <path d={""} fill="white" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35" />
                    </svg>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
          <div className="bg-white rounded-lg shadow-sm border border-[#f1f5f9] flex flex-col overflow-hidden w-[34px]">
            <button onClick={handleZoomIn} className="h-[32px] w-full flex items-center justify-center hover:bg-slate-50 text-[#45556C] border-b border-[#f1f5f9]">
              <Icon className="w-4 h-4"><path d="M3.33333 8H12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" /><path d="M8 3.33333V12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" /></Icon>
            </button>
            <button onClick={handleZoomOut} className="h-[32px] w-full flex items-center justify-center hover:bg-slate-50 text-[#45556C]">
              <Icon className="w-4 h-4"><path d="M3.33333 8H12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" /></Icon>
            </button>
          </div>
          <button onClick={() => setZoom(1)} className="h-[32px] w-[32px] bg-white rounded-lg shadow-sm border border-[#f1f5f9] flex items-center justify-center hover:bg-slate-50 relative">
            <Icon className="w-4 h-4"><path d={""} fill="#0F172B" stroke="#0F172B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" /></Icon>
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* BOTTOM STATS PANEL */}
      <div className="relative z-50 bg-white border-t border-slate-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Status & Location */}
          <div className="flex items-start gap-3">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
              (phase === 'working' || phase === 'checking-in' || phase === 'break') ? "bg-green-100 text-green-600" : "bg-[#eef2ff] text-[#4F39F6]"
            )}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[10px] font-bold text-[#0f172b] uppercase tracking-[0.25px]">Current Status</p>
              <p className="text-[13px] font-medium text-[#45556c] whitespace-nowrap overflow-hidden text-ellipsis">
                {getStatusText()}
              </p>
            </div>
          </div>

          {/* Travel Time */}
          <div className="flex items-start gap-3 relative lg:before:content-[''] lg:before:absolute lg:before:-left-3 lg:before:top-1 lg:before:h-8 lg:before:w-[1px] lg:before:bg-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[10px] font-bold text-[#0f172b] uppercase tracking-[0.25px]">Travel Time</p>
              <p className="text-[13px] font-medium text-[#45556c]">
                {formatDuration(metrics.travelTime)}
              </p>
            </div>
          </div>

          {/* Working Time */}
          <div className="flex items-start gap-3 relative lg:before:content-[''] lg:before:absolute lg:before:-left-3 lg:before:top-1 lg:before:h-8 lg:before:w-[1px] lg:before:bg-slate-100">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
              phase === 'working' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
            )}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[10px] font-bold text-[#0f172b] uppercase tracking-[0.25px]">Work / Break</p>
              <div className="flex items-center gap-1">
                <p className="text-[13px] font-medium text-[#45556c]">{formatDuration(metrics.workTime)}</p>
                {metrics.breakTime > 0 && (
                  <span className="text-[11px] text-slate-400">
                    (+{formatDuration(metrics.breakTime)} break)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Total Shift Time */}
          <div className="flex items-start gap-3 relative lg:before:content-[''] lg:before:absolute lg:before:-left-3 lg:before:top-1 lg:before:h-8 lg:before:w-[1px] lg:before:bg-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[10px] font-bold text-[#0f172b] uppercase tracking-[0.25px]">Total Time</p>
              <p className="text-[13px] font-bold text-slate-900">
                {formatDuration(metrics.totalTime)}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
