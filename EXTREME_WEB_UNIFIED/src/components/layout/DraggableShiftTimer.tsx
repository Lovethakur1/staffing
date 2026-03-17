import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Square, Clock, MapPin, GripVertical, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAppState } from "../../contexts/AppStateContext";
import api from "../../services/api";
import { toast } from "sonner";

interface DraggableShiftTimerProps {
    userRole: string;
}

export function DraggableShiftTimer({ userRole }: DraggableShiftTimerProps) {
    const {
        activeShift,
        currentTimer,
        currentShiftStatus,
        setActiveShift,
        setTimerStartTime,
        setCurrentTimer,
        setIsAnyShiftActive,
        setCurrentShiftStatus,
        startBreak,
        endBreak,
        totalBreakMinutes,
    } = useAppState();

    // Dragging state
    const [pos, setPos] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 180 });
    const [dragging, setDragging] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const onMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        dragOffset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        };
        e.preventDefault();
    };

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging) return;
        const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 300);
        const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 60);
        setPos({ x: newX, y: newY });
    }, [dragging]);

    const onMouseUp = useCallback(() => setDragging(false), []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, onMouseMove, onMouseUp]);

    // Only show for staff with an active shift — placed after all hooks
    if (userRole !== 'staff' || !activeShift) return null;

    const handleClockOut = async () => {
        setClockLoading(true);
        try {
            const res = await api.post(`/shifts/${activeShift.id}/clock-out`);
            const { totalHours, totalPay } = res.data;
            setActiveShift(null);
            setTimerStartTime(null);
            setCurrentTimer('00:00:00');
            setIsAnyShiftActive(false);
            setCurrentShiftStatus('not-started');
            toast.success(`Clocked out! ${Number(totalHours || 0).toFixed(2)}h — $${Number(totalPay || 0).toFixed(2)}`);
        } catch {
            toast.error('Failed to clock out. Please try again.');
        } finally {
            setClockLoading(false);
        }
    };

    const getStatusColor = () => {
        switch (currentShiftStatus) {
            case 'in-progress': return 'bg-green-500';
            case 'break': return 'bg-amber-500';
            default: return 'bg-blue-500';
        }
    };

    const getStatusLabel = () => {
        switch (currentShiftStatus) {
            case 'in-progress': return 'Working';
            case 'break': return 'On Break';
            case 'traveling-to': return 'Traveling';
            case 'arrived': return 'Arrived';
            default: return 'Active';
        }
    };

    return (
        <div
            ref={cardRef}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                zIndex: 9999,
                width: collapsed ? 'auto' : '280px',
                userSelect: 'none',
                cursor: dragging ? 'grabbing' : 'default',
            }}
            className="drop-shadow-2xl"
        >
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
                {/* Header / Drag Handle */}
                <div
                    onMouseDown={onMouseDown}
                    className="flex items-center justify-between px-3 py-2 bg-[#5E1916] cursor-grab active:cursor-grabbing select-none"
                >
                    <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-white/60" />
                        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
                        <span className="text-white text-xs font-semibold">{getStatusLabel()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className="text-white/70 hover:text-white p-0.5 rounded"
                        >
                            {collapsed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                        </button>
                    </div>
                </div>

                {/* Timer and Body */}
                {!collapsed && (
                    <div className="p-3 space-y-2">
                        {/* Timer display */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                <Clock className="h-3 w-3" />
                                <span className="truncate max-w-[140px]">{activeShift.role || 'Event Staff'}</span>
                            </div>
                            <span className="font-mono text-lg font-bold text-[#5E1916]">{currentTimer}</span>
                        </div>

                        {/* Location */}
                        {(activeShift as any).event?.location || activeShift.location ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{(activeShift as any).event?.location || activeShift.location}</span>
                            </div>
                        ) : null}

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${currentShiftStatus === 'in-progress'
                                    ? 'border-green-500 text-green-700'
                                    : currentShiftStatus === 'break'
                                        ? 'border-amber-500 text-amber-700'
                                        : 'border-blue-500 text-blue-700'
                                    }`}
                            >
                                {currentShiftStatus.replace(/-/g, ' ')}
                            </Badge>

                            {/* Break Time Warning Limit */}
                            {totalBreakMinutes > 0 && (
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${totalBreakMinutes >= 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'text-amber-600 border-amber-200'}`}>
                                    {Math.round(totalBreakMinutes)}/60m Break Used
                                </Badge>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5 pt-1">
                            {currentShiftStatus === 'in-progress' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-7 text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
                                    onClick={startBreak}
                                >
                                    <Pause className="h-3 w-3 mr-1" />
                                    Break
                                </Button>
                            )}
                            {currentShiftStatus === 'break' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={`flex-1 h-7 text-xs ${totalBreakMinutes >= 60 ? 'border-red-500 text-red-700 hover:bg-red-50' : 'border-green-500 text-green-700 hover:bg-green-50'}`}
                                    onClick={endBreak}
                                >
                                    <Play className="h-3 w-3 mr-1" />
                                    Resume
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="flex-1 h-7 text-xs bg-[#5E1916] hover:bg-[#4a1010] text-white"
                                onClick={handleClockOut}
                                disabled={clockLoading}
                            >
                                <Square className="h-3 w-3 mr-1" />
                                {clockLoading ? '...' : 'Clock Out'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Collapsed view — just timer */}
                {collapsed && (
                    <div
                        onMouseDown={onMouseDown}
                        className="flex items-center gap-2 px-3 py-1.5 cursor-grab"
                    >
                        <span className="font-mono text-sm font-bold text-[#5E1916]">{currentTimer}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
