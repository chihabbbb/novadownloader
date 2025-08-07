import { useEffect } from "react";
import { ADSENSE_CONFIG } from "@/config/adsense";

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
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

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