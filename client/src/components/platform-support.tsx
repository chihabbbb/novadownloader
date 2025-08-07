import { motion } from "framer-motion";
import { Youtube, Instagram, Facebook, Twitter } from "lucide-react";
import { SiTiktok, SiVimeo } from "react-icons/si";

const platforms = [
  { name: "YouTube", icon: Youtube, color: "text-red-500", supported: true },
  { name: "TikTok", icon: SiTiktok, color: "text-white", supported: false },
  { name: "Instagram", icon: Instagram, color: "text-pink-500", supported: false },
  { name: "Facebook", icon: Facebook, color: "text-blue-500", supported: false },
  { name: "Twitter", icon: Twitter, color: "text-blue-400", supported: false },
  { name: "Vimeo", icon: SiVimeo, color: "text-blue-300", supported: false },
];

export default function PlatformSupport() {
  return (
    <div className="max-w-6xl mx-auto mb-16" id="features">
      <h3 className="text-3xl font-bold text-white text-center mb-12">
        Supported Platforms
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`group glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-nova-cyan/10 ${
              !platform.supported ? "opacity-60" : ""
            }`}
            data-testid={`platform-${platform.name.toLowerCase()}`}
          >
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                {platform.name === "TikTok" || platform.name === "Vimeo" ? (
                  <platform.icon className={`${platform.color} text-3xl group-hover:scale-110 transition-transform duration-300`} />
                ) : (
                  <platform.icon className={`${platform.color} text-3xl group-hover:scale-110 transition-transform duration-300`} size={30} />
                )}
              </div>
              <div className="text-white font-medium">{platform.name}</div>
              {platform.supported && (
                <div className="mt-2">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              )}
              {!platform.supported && (
                <div className="mt-2">
                  <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
