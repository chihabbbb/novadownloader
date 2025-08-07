import { motion } from "framer-motion";
import { Zap, Shield, Brain, Video, Smartphone, Lock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Advanced serverless processing ensures your downloads complete in seconds, not minutes.",
    gradient: "from-nova-purple to-nova-pink"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "No registration, no tracking, no data collection. Your privacy is our priority.",
    gradient: "from-nova-cyan to-nova-blue"
  },
  {
    icon: Brain,
    title: "Smart Detection",
    description: "AI-powered URL analysis automatically detects platforms and optimal download settings.",
    gradient: "from-nova-pink to-nova-purple"
  },
  {
    icon: Video,
    title: "Best Quality",
    description: "Download videos in up to 4K resolution and audio in premium quality formats.",
    gradient: "from-nova-blue to-nova-cyan"
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Fully responsive design that works perfectly on all devices and screen sizes.",
    gradient: "from-nova-purple to-nova-cyan"
  },
  {
    icon: Lock,
    title: "Secure HTTPS",
    description: "All downloads are processed through encrypted connections for maximum security.",
    gradient: "from-nova-cyan to-nova-pink"
  }
];

export default function FeaturesGrid() {
  return (
    <div className="max-w-6xl mx-auto mb-16">
      <h3 className="text-3xl font-bold text-white text-center mb-12">
        Why Choose NovaDownloader?
      </h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass hover:bg-white/10 hover:border-nova-purple/50 rounded-2xl p-8 transition-all duration-300 group"
            data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
          >
            <motion.div 
              className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              whileHover={{ rotate: 5 }}
            >
              <feature.icon className="text-white text-2xl" size={24} />
            </motion.div>
            <h4 className="text-xl font-semibold text-white mb-4">{feature.title}</h4>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
