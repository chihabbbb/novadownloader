import { motion } from "framer-motion";
import { ShieldCheck, Check } from "lucide-react";

const privacyFeatures = [
  "No Registration",
  "No Data Tracking", 
  "HTTPS Encrypted"
];

export default function PrivacySection() {
  return (
    <div className="max-w-4xl mx-auto mb-16" id="privacy">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass rounded-2xl p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mb-8 mx-auto animate-pulse-glow"
        >
          <ShieldCheck className="text-white text-3xl" size={32} />
        </motion.div>
        <h3 className="text-3xl font-bold text-white mb-6">100% Private & Secure</h3>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          NovaDownloader processes all downloads client-side when possible, and never stores your URLs, 
          download history, or personal information. We believe your media consumption habits are private.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {privacyFeatures.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/20"
              data-testid={`privacy-${feature.toLowerCase().replace(' ', '-')}`}
            >
              <Check className="text-green-400" size={16} />
              <span className="text-white">{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
