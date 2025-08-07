import { Download } from "lucide-react";

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
          </div>
        </div>
      </nav>
    </header>
  );
}
