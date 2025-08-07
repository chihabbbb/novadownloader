import { Download } from "lucide-react";
import { AdSenseResponsiveBanner } from "@/components/adsense-banner";
import { getAdSlot } from "@/config/adsense";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 backdrop-blur-xl bg-white/5 mt-24" id="support">
      {/* Zone publicitaire avant le footer */}
      <div className="container mx-auto px-6 py-8">
        <AdSenseResponsiveBanner adSlot={getAdSlot('FOOTER_BANNER')} className="mb-8" />
      </div>
      
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-nova-purple to-nova-cyan rounded-lg flex items-center justify-center">
                <Download className="text-white" size={16} />
              </div>
              <h4 className="text-xl font-bold nova-text-gradient">
                NovaDownloader
              </h4>
            </div>
            <p className="text-gray-400">
              The next-generation media downloader for the modern web. Fast, secure, and completely private.
            </p>
          </div>
          
          <div>
            <h5 className="text-white font-semibold mb-4">Features</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Video Downloads</a></li>
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Audio Extraction</a></li>
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Platform Support</a></li>
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Privacy Tools</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Report Issues</a></li>
              <li><a href="#" className="hover:text-nova-cyan transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 NovaDownloader. Built with ❤️ for the Web3 generation.
          </p>
        </div>
      </div>
    </footer>
  );
}
