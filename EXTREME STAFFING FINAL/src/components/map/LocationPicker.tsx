import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { MapPin, Search, Crosshair, Check } from "lucide-react";
import { Input } from "../ui/input";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: Location) => void;
  initialLocation?: Location;
}

export function LocationPicker({ isOpen, onClose, onConfirm, initialLocation }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || "");
  const [isSearching, setIsSearching] = useState(false);
  
  // Mock simulation of "finding" a location
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 }); // Percentage
  
  useEffect(() => {
    if (isOpen && initialLocation) {
      setSearchQuery(initialLocation.address);
    }
  }, [isOpen, initialLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate API search delay
    setTimeout(() => {
      setIsSearching(false);
      // Randomize pin slightly to show "result"
      setPinPosition({ x: 45 + Math.random() * 10, y: 45 + Math.random() * 10 });
    }, 800);
  };

  const handleConfirm = () => {
    onConfirm({
      lat: 40.7128, // Mock Coords
      lng: -74.0060,
      address: searchQuery || "Selected Location"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 bg-white z-10 border-b">
          <DialogTitle>Confirm Event Location</DialogTitle>
          <DialogDescription>
            Drag the pin to the exact entrance location for staff navigation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-[400px] bg-slate-100 group">
          {/* Map Background (Placeholder Pattern) */}
          <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
              backgroundSize: '20px 20px'
          }}></div>
          
          {/* Mock Map Roads/Features */}
          <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-300 -translate-y-1/2 rotate-12"></div>
          <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-gray-300"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gray-200 rounded-lg transform rotate-6 border border-gray-300"></div>

          {/* Draggable Pin Area */}
          <div className="absolute inset-0 cursor-crosshair">
            <div 
                className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-500 ease-out"
                style={{ 
                    left: `${pinPosition.x}%`, 
                    top: `${pinPosition.y}%` 
                }}
            >
                <div className="relative">
                    <MapPin className="w-10 h-10 text-red-600 fill-red-600 drop-shadow-xl animate-bounce" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg text-xs font-bold whitespace-nowrap">
                        {searchQuery || "Event Location"}
                    </div>
                </div>
            </div>
          </div>

          {/* Search Bar Overlay */}
          <div className="absolute top-4 left-4 right-4 max-w-sm bg-white rounded-lg shadow-xl p-2 flex gap-2">
            <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue or address..."
                className="border-0 focus-visible:ring-0 bg-transparent h-9"
            />
            <Button size="sm" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Search className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="bg-white shadow-lg" onClick={() => setPinPosition({ x: 50, y: 50 })}>
                <Crosshair className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-gray-50 flex items-center justify-between sm:justify-between">
           <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              GPS Coordinates: 40.7128° N, 74.0060° W
           </div>
           <div className="flex gap-2">
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button onClick={handleConfirm} className="bg-[#5E1916] hover:bg-[#4a1311]">
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Location
               </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
