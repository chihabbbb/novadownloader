import { motion } from "framer-motion";
import Background from "@/components/background";
import Header from "@/components/header";
import DownloadCard from "@/components/download-card";
import PlatformSupport from "@/components/platform-support";
import FeaturesGrid from "@/components/features-grid";
import PrivacySection from "@/components/privacy-section";
import Footer from "@/components/footer";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-space-dark font-inter min-h-screen overflow-x-hidden">
      <Background />
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Next-Gen Media
            <span className="nova-text-gradient animate-gradient bg-300% block">
              Downloader
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Download videos and audio from YouTube, TikTok, Instagram, Facebook and more. 
            Lightning-fast, secure, and completely private.
          </motion.p>
        </motion.div>

        <DownloadCard />
        <PlatformSupport />
        <FeaturesGrid />
        <PrivacySection />
      </main>

      <Footer />

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          onClick={scrollToTop}
          data-testid="button-scroll-top"
          className="w-14 h-14 bg-gradient-to-r from-nova-purple to-nova-cyan rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-pulse-glow p-0"
        >
          <ArrowUp size={20} />
        </Button>
      </div>
    </div>
  );
}
