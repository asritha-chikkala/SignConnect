"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function GlobalLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Track route changes using useEffect on pathname
  useEffect(() => {
    // Pathname changed - navigation completed
    if (isLoading) {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setShowProgress(false);
        setProgress(0);
      }, 400);
    }
  }, [pathname]);

  const handleStart = () => {
    setIsLoading(true);
    setShowProgress(true);
    setProgress(0);
    
    // Simulate progress
    let progressValue = 0;
    const interval = setInterval(() => {
      if (progressValue < 90) {
        progressValue += Math.random() * 15;
        setProgress(Math.min(progressValue, 90));
      }
    }, 300);
    
    return interval;
  };

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    // Handle link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          // Check if it's a navigation within the app
          const currentPath = window.location.pathname;
          // Handle both absolute and relative paths
          let newPath = href;
          if (href.startsWith('/')) {
            // Relative path
            newPath = href;
          } else if (href.startsWith(window.location.origin)) {
            // Absolute path
            newPath = new URL(href).pathname;
          } else {
            // External link - don't show loading
            return;
          }
          
          if (newPath !== currentPath && !newPath.includes('http')) {
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            progressInterval = handleStart() as any;
          }
        }
      }
    };

    // Handle page load complete
    const handleLoadComplete = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setShowProgress(false);
        setProgress(0);
      }, 400);
    };

    // Handle beforeunload
    const handleBeforeUnload = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setIsLoading(true);
      setShowProgress(true);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('load', handleLoadComplete);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('load', handleLoadComplete);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999]"
        >
          {/* Progress Bar */}
          <div className="h-0.5 bg-white/5 w-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Loading Indicator */}
          <div className="bg-black/80 backdrop-blur-sm py-2 px-4 flex items-center justify-center gap-3 border-b border-white/5">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs text-white/70">
              {progress < 30 ? 'Loading...' : 
               progress < 60 ? 'Loading content...' : 
               progress < 90 ? 'Almost there...' : 
               'Done!'}
            </span>
            <span className="text-xs text-white/30">{Math.round(Math.min(progress, 100))}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}