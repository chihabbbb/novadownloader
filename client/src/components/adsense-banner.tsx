import { useEffect } from "react";
import { ADSENSE_CONFIG, isAdSenseConfigured } from "@/config/adsense";

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  adLayout?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSenseBanner({ 
  adSlot, 
  adFormat = "auto", 
  adLayout,
  className = "",
  style = {}
}: AdSenseBannerProps) {
  const isConfigured = isAdSenseConfigured();

  useEffect(() => {
    if (isConfigured) {
      try {
        // Push ad to AdSense queue
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [isConfigured]);

  // Si AdSense n'est pas configuré, afficher une zone de prévisualisation
  if (!isConfigured) {
    return (
      <div className={`w-full flex justify-center items-center ${className}`} style={style}>
        <div 
          className="glass rounded-lg flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-nova-purple/50 bg-gradient-to-br from-nova-purple/10 to-nova-cyan/10"
          style={{
            minHeight: "250px",
            ...style
          }}
          data-testid="adsense-preview"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-nova-purple to-nova-cyan rounded-lg flex items-center justify-center mb-4 animate-pulse-glow">
            <span className="text-white font-bold text-lg">Ad</span>
          </div>
          <h3 className="text-white font-semibold mb-2">Zone Publicitaire</h3>
          <p className="text-gray-400 text-sm mb-2">Format: {adFormat}</p>
          <p className="text-gray-500 text-xs">Slot: {adSlot}</p>
          <div className="mt-4 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            Configuration requise
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center items-center ${className}`} style={style}>
      <ins
        className="adsbygoogle glass rounded-lg"
        style={{
          display: "block",
          minHeight: "250px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          ...style
        }}
        data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Composant pour une bannière publicitaire responsive
export function AdSenseResponsiveBanner({ 
  adSlot, 
  className = "" 
}: { 
  adSlot: string; 
  className?: string; 
}) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="auto"
      className={`my-8 ${className}`}
      style={{ minHeight: "250px" }}
    />
  );
}

// Composant pour une bannière rectangulaire
export function AdSenseRectangleBanner({ 
  adSlot, 
  className = "" 
}: { 
  adSlot: string; 
  className?: string; 
}) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="rectangle"
      className={`my-6 ${className}`}
      style={{ width: "300px", height: "250px" }}
    />
  );
}

// Composant pour une bannière verticale
export function AdSenseVerticalBanner({ 
  adSlot, 
  className = "" 
}: { 
  adSlot: string; 
  className?: string; 
}) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="vertical"
      className={`my-6 ${className}`}
      style={{ width: "160px", height: "600px" }}
    />
  );
}