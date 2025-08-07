import { Download, Settings, CheckCircle } from "lucide-react";
import { isAdSenseConfigured } from "@/config/adsense";

export default function Header() {
  return (
    <header className="relative z-10 pt-8 pb-4">
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-nova-purple to-nova-cyan rounded-lg flex items-center justify-center animate-pulse-glow">
                <Download className="text-white text-lg" size={20} />
              </div>
            </div>
            <h1 className="text-2xl font-bold nova-text-gradient">
              NovaDownloader
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-nova-cyan transition-colors duration-300">
              Features
            </a>
            <a href="#privacy" className="text-gray-300 hover:text-nova-cyan transition-colors duration-300">
              Privacy
            </a>
            <a href="#support" className="text-gray-300 hover:text-nova-cyan transition-colors duration-300">
              Support
            </a>
            
            {/* Indicateur de statut AdSense */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
              isAdSenseConfigured() 
                ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 animate-pulse"
            }`}>
              {isAdSenseConfigured() ? (
                <>
                  <CheckCircle size={12} />
                  <span>AdSense Activé</span>
                </>
              ) : (
                <>
                  <Settings size={12} />
                  <span>Config AdSense</span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
