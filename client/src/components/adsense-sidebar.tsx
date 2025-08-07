import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdSenseVerticalBanner } from "@/components/adsense-banner";
import { Button } from "@/components/ui/button";

interface AdSenseSidebarProps {
  adSlot: string;
  position?: "left" | "right";
  autoShow?: boolean;
  showAfterDelay?: number;
}

export default function AdSenseSidebar({ 
  adSlot, 
  position = "right", 
  autoShow = true,
  showAfterDelay = 5000 
}: AdSenseSidebarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, showAfterDelay);
      return () => clearTimeout(timer);
    }
  }, [autoShow, showAfterDelay]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: position === "right" ? 200 : -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: position === "right" ? 200 : -200, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-1/2 transform -translate-y-1/2 z-40 ${
          position === "right" ? "right-4" : "left-4"
        }`}
        data-testid="adsense-sidebar"
      >
        <div className="glass rounded-lg shadow-lg overflow-hidden">
          {/* Header de contrôle */}
          <div className="flex items-center justify-between p-2 bg-white/10 border-b border-white/20">
            <span className="text-xs text-gray-300">Publicité</span>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleMinimize}
                className="w-6 h-6 p-0 text-gray-400 hover:text-white"
                data-testid="button-minimize-ad"
              >
                {isMinimized ? <Eye size={12} /> : <EyeOff size={12} />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="w-6 h-6 p-0 text-gray-400 hover:text-white"
                data-testid="button-close-ad"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
          
          {/* Contenu de l'annonce */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-2">
                  <AdSenseVerticalBanner 
                    adSlot={adSlot} 
                    className="m-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook pour gérer l'affichage conditionnel de la sidebar publicitaire
export function useAdSenseSidebar() {
  const [showSidebar, setShowSidebar] = useState(false);

  const enableSidebar = () => setShowSidebar(true);
  const disableSidebar = () => setShowSidebar(false);

  return { showSidebar, enableSidebar, disableSidebar };
}