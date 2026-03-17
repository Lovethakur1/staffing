import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, RefreshCw, ScanFace } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../ui/utils";

interface BiometricScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  action: string;
}

export function BiometricScanner({ isOpen, onClose, onVerified, action }: BiometricScannerProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgress(0);
      // Auto-start scanning for that seamless "Face ID" feel
      const timer = setTimeout(() => {
        handleScan();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleScan = () => {
    setStatus('scanning');
    setProgress(0);
    
    const duration = 2000; // 2 seconds scan
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        completeScan();
      }
    }, intervalTime);
  };

  const completeScan = () => {
    const success = true; 
    
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } else {
      setStatus('error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-950 border-none text-slate-900 dark:text-slate-50 p-0 overflow-hidden shadow-2xl aspect-[9/16] rounded-3xl">
        <DialogTitle className="sr-only">Biometric Verification</DialogTitle>
        <DialogDescription className="sr-only">Verify your identity</DialogDescription>

        <div className="relative flex flex-col items-center justify-between h-full w-full bg-white dark:bg-slate-950 py-12 px-6">
          
          {/* Top Text Section */}
          <div className="text-center space-y-2 z-20">
            <h2 className="text-[#5E1916] font-semibold text-xl tracking-wide uppercase">
              Identity Verification
            </h2>
            <p className="text-slate-500 text-sm">
              Please look at the camera to verify
            </p>
          </div>

          {/* Central Face Scanner Visual */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
            
            {/* Animated Ring */}
            {status === 'scanning' && (
               <motion.div 
                 className="absolute inset-0 rounded-full border-4 border-[#5E1916] border-t-transparent"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               />
            )}

            {/* Face Image / Icon */}
            <div className="relative w-56 h-56 rounded-full overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900">
               {status === 'idle' || status === 'error' ? (
                 <ScanFace className="w-24 h-24 text-slate-300 dark:text-slate-600" strokeWidth={1} />
               ) : (
                 <>
                   <img 
                     src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=400&h=400" 
                     alt="User Face" 
                     className={cn(
                       "w-full h-full object-cover transition-opacity duration-500",
                       status === 'success' ? "opacity-100" : "opacity-80"
                     )}
                   />
                   {status === 'scanning' && (
                     <div className="absolute inset-0 bg-[#5E1916]/10" />
                   )}
                 </>
               )}
            </div>

            {/* Scan Line Animation */}
            {status === 'scanning' && (
              <motion.div 
                initial={{ top: "0%", opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-full h-1 bg-[#5E1916] shadow-[0_0_15px_rgba(94,25,22,0.5)] z-30"
              />
            )}

            {/* Success/Error Overlay */}
            <AnimatePresence>
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm rounded-full"
                >
                  <CheckCircle className="w-16 h-16 text-[#5E1916]" />
                  <p className="mt-2 text-[#5E1916] font-bold tracking-wide">VERIFIED</p>
                </motion.div>
              )}
              
              {status === 'error' && (
                 <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm rounded-full"
                >
                  <XCircle className="w-16 h-16 text-red-500" />
                  <p className="mt-2 text-red-500 font-bold tracking-wide">FAILED</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleScan()}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Retry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Footer */}
          <div className="w-full text-center z-20 space-y-4">
             {status === 'scanning' && (
               <div className="flex flex-col items-center gap-2">
                 <p className="text-[#5E1916] text-xs font-medium animate-pulse">Scanning facial features...</p>
                 <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-[#5E1916]"
                     initial={{ width: "0%" }}
                     animate={{ width: `${progress}%` }}
                   />
                 </div>
               </div>
             )}
             
             {status === 'idle' && (
               <p className="text-slate-400 text-xs">Secure Authentication</p>
             )}
             
             {status === 'success' && (
                <p className="text-[#5E1916] text-xs font-medium">Access Granted</p>
             )}
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}