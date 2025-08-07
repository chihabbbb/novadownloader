import { motion } from "framer-motion";
import { Settings, Eye, DollarSign } from "lucide-react";

interface AdDemoProps {
  format: "banner" | "rectangle" | "vertical";
  position: string;
  className?: string;
}

export default function AdSenseDemo({ format, position, className = "" }: AdDemoProps) {
  const getFormatSize = () => {
    switch (format) {
      case "banner":
        return { width: "100%", height: "250px" };
      case "rectangle":
        return { width: "300px", height: "250px" };
      case "vertical":
        return { width: "160px", height: "600px" };
      default:
        return { width: "100%", height: "250px" };
    }
  };

  const formatStyles = getFormatSize();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-center ${className}`}
      style={{ minWidth: formatStyles.width, minHeight: formatStyles.height }}
    >
      <div 
        className="glass rounded-xl border-2 border-dashed border-nova-cyan/50 bg-gradient-to-br from-nova-purple/20 via-nova-cyan/20 to-nova-pink/20 flex flex-col items-center justify-center p-6 text-center animate-pulse-glow"
        style={formatStyles}
        data-testid={`ad-demo-${format}`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 bg-gradient-to-br from-nova-purple to-nova-cyan rounded-full flex items-center justify-center mb-4"
        >
          <DollarSign className="text-white" size={20} />
        </motion.div>
        
        <h3 className="text-white font-bold text-lg mb-2 nova-text-gradient">
          Zone Publicitaire
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <Eye size={14} />
            <span>Position: {position}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <Settings size={14} />
            <span>Format: {format}</span>
          </div>
        </div>
        
        <div className="mt-4 px-4 py-2 bg-yellow-500/30 text-yellow-300 text-xs rounded-full border border-yellow-500/50">
          🔧 Configuration AdSense requise
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Configurez vos IDs dans /src/config/adsense.ts
        </div>
      </div>
    </motion.div>
  );
}

// Composant d'aide pour la configuration
export function AdSenseConfigHelper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mb-8"
    >
      <div className="glass rounded-xl p-6 border border-nova-purple/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Settings className="mr-2 text-nova-cyan" />
          Configuration AdSense
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-nova-purple mb-3">Étapes de configuration :</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="text-nova-cyan mr-2">1.</span>
                Créez un compte Google AdSense
              </li>
              <li className="flex items-start">
                <span className="text-nova-cyan mr-2">2.</span>
                Obtenez votre Client ID (ca-pub-...)
              </li>
              <li className="flex items-start">
                <span className="text-nova-cyan mr-2">3.</span>
                Créez des unités publicitaires
              </li>
              <li className="flex items-start">
                <span className="text-nova-cyan mr-2">4.</span>
                Mettez à jour /src/config/adsense.ts
              </li>
              <li className="flex items-start">
                <span className="text-nova-cyan mr-2">5.</span>
                Activez le script dans index.html
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-nova-pink mb-3">Zones disponibles :</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-gray-300">Hero Banner</span>
                <span className="text-nova-cyan">Responsive</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-gray-300">Middle Rectangle</span>
                <span className="text-nova-cyan">300x250</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-gray-300">Footer Banner</span>
                <span className="text-nova-cyan">Responsive</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-gray-300">Sidebar (opt.)</span>
                <span className="text-nova-cyan">160x600</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            💡 <strong>Astuce :</strong> Les zones de prévisualisation disparaîtront automatiquement 
            une fois vos vrais IDs AdSense configurés.
          </p>
        </div>
      </div>
    </motion.div>
  );
}