import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Camera, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../ui/utils";

interface BiometricVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  actionName: string; // e.g., "Check In", "Start Travel"
}

export function BiometricVerification({ isOpen, onClose, onVerify, actionName }: BiometricVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera for verification");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        stopCamera();
        verifyBiometric();
      }
    }
  };

  const verifyBiometric = () => {
    setVerifying(true);
    // Mock verification process
    setTimeout(() => {
      setVerifying(false);
      // Simulate random success (mostly success for demo)
      const isSuccess = true; 
      
      if (isSuccess) {
        setVerificationStatus('success');
        setTimeout(() => {
          onVerify();
          reset();
        }, 1500);
      } else {
        setVerificationStatus('error');
      }
    }, 2000);
  };

  const reset = () => {
    setCapturedImage(null);
    setVerificationStatus('idle');
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Facial Verification Required</DialogTitle>
          <DialogDescription>
            Please verify your identity to {actionName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden border-4 border-primary/20 shadow-inner">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            )}
            
            {/* Overlay Grid for Face Positioning */}
            {!capturedImage && (
              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-full opacity-50 pointer-events-none" />
            )}

            {/* Status Overlays */}
            {verifying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  <span className="text-white font-medium text-sm">Verifying Identity...</span>
                </div>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-12 h-12 text-white" />
                  <span className="text-white font-bold">Verified</span>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="w-12 h-12 text-white" />
                  <span className="text-white font-bold">Verification Failed</span>
                  <Button variant="secondary" size="sm" onClick={reset} className="mt-2">Try Again</Button>
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            {!capturedImage 
              ? "Position your face within the circle and look at the camera" 
              : "Verifying biometrics against your profile..."}
          </p>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter className="sm:justify-center">
          {!capturedImage && (
            <Button onClick={capturePhoto} className="w-full sm:w-auto gap-2">
              <Camera className="w-4 h-4" />
              Capture & Verify
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}