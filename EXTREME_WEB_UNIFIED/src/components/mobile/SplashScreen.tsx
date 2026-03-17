import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XtremeLogo } from "../XtremeLogo";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30); // 1.5 seconds loading time

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <XtremeLogo size="xl" className="h-32 w-auto" />
        </motion.div>

        {/* Loading Bar */}
        <div className="w-48 space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full bg-[#5E1916]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <p className="text-center text-xs font-medium text-[#5E1916] tracking-widest">
            LOADING
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-slate-400">
          POWERED BY XTREME STAFFING
        </p>
      </div>
    </div>
  );
}
