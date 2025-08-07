import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, Video, Music, Rocket, Sparkles, Download, RefreshCw, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Download as DownloadType } from "@shared/schema";

export default function DownloadCard() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedItag, setSelectedItag] = useState<number | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [validationData, setValidationData] = useState<any>(null);
  const [previousUrl, setPreviousUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Validate URL as user types
  const validateMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/validate", { url });
      return res.json();
    },
    onSuccess: (data) => {
      console.log('Données de validation reçues:', data);
      
      // Si pas de formats, ajouter des formats par défaut
      if (data.supported && (!data.formats || data.formats.length === 0)) {
        data.formats = [
          { itag: 22, quality: '720p', container: 'mp4', type: 'video' },
          { itag: 18, quality: '360p', container: 'mp4', type: 'video' },
          { itag: 'audio', quality: 'Audio MP3', container: 'mp3', type: 'audio' }
        ];
        console.log('Formats par défaut ajoutés:', data.formats);
      }
      
      setValidationData(data);
    },
    onError: (error) => {
      console.error('Erreur de validation:', error);
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider l'URL",
        variant: "destructive",
      });
    },
  });

  // Start download
  const downloadMutation = useMutation({
    mutationFn: async ({ url, format, quality, itag }: { url: string; format: string; quality?: string; itag?: number }) => {
      const res = await apiRequest("POST", "/api/download", { url, format, quality, itag });
      return res.json();
    },
    onSuccess: (data) => {
      setDownloadId(data.downloadId);
      toast({
        title: "Download Started",
        description: "Your download is being processed...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to start download",
        variant: "destructive",
      });
    },
  });

  // Poll download status
  const { data: downloadStatus } = useQuery<DownloadType>({
    queryKey: ['/api/download', downloadId],
    enabled: !!downloadId,
    refetchInterval: downloadId ? 2000 : false,
  });

  // Reset state when URL changes significantly
  useEffect(() => {
    if (url !== previousUrl && url.length > 10) {
      // Reset all states for new URL
      setDownloadId(null);
      setSelectedQuality("");
      setSelectedItag(null);
      setValidationData(null);
      
      const timer = setTimeout(() => {
        validateMutation.mutate(url);
      }, 500);
      setPreviousUrl(url);
      return () => clearTimeout(timer);
    } else if (url.length <= 10) {
      setValidationData(null);
      setDownloadId(null);
    }
  }, [url, previousUrl]);

  useEffect(() => {
    if (downloadStatus?.status === "completed") {
      toast({
        title: "Download Complete!",
        description: "Your file is ready for download.",
      });
    } else if (downloadStatus?.status === "failed") {
      toast({
        title: "Download Failed",
        description: downloadStatus.error || "An error occurred",
        variant: "destructive",
      });
    }
  }, [downloadStatus, toast]);

  const handleDownload = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    if (validationData && !validationData.supported) {
      toast({
        title: "Platform Not Supported",
        description: "Currently only YouTube is supported",
        variant: "destructive",
      });
      return;
    }

    downloadMutation.mutate({ 
      url, 
      format, 
      quality: selectedQuality || undefined,
      itag: selectedItag || undefined
    });
  };

  const handleFileDownload = () => {
    if (downloadStatus?.status === "completed") {
      window.open(`/api/file/${downloadId}`, '_blank');
    }
  };

  const placeholders = [
    'https://www.youtube.com/watch?v=...',
    'https://www.tiktok.com/@user/video/...',
    'https://www.instagram.com/p/...',
    'https://www.facebook.com/watch/...'
  ];

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8 shadow-2xl"
      >
        <div className="mb-8">
          <Label htmlFor="url-input" className="block text-white text-lg font-medium mb-4">
            <Link className="mr-2 text-nova-cyan inline" size={20} />
            Paste your media URL here
          </Label>
          
          <div className="relative">
            <Input
              id="url-input"
              type="url"
              placeholder={placeholders[0]}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-testid="input-url"
              className="w-full px-6 py-4 bg-white/5 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nova-purple focus:border-transparent transition-all duration-300 backdrop-blur-sm text-base"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Sparkles className="text-nova-cyan opacity-60" size={20} />
            </div>
          </div>
        </div>

        {/* Platform Detection Display */}
        {(url.includes('youtube') || url.includes('youtu.be') || (validationData && validationData.platform)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="glass rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {validationData.platform === "youtube" && (
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <PlayCircle className="text-white" size={16} />
                    </div>
                  )}
                  <div>
                    <span className="text-white font-medium text-lg">
                      {validationData?.platform ? validationData.platform.charAt(0).toUpperCase() + validationData.platform.slice(1) : 'YouTube'}
                    </span>
                    <div className={`flex items-center space-x-2 mt-1`}>
                      <div className={`w-2 h-2 rounded-full ${
                        validationData.supported ? "bg-green-400 animate-pulse" : "bg-red-400"
                      }`}></div>
                      <span className={`text-xs ${
                        (validationData?.supported !== false) ? "text-green-400" : "text-red-400"
                      }`}>
                        {(validationData?.supported !== false) ? "Supporté" : "Non supporté"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDownloadId(null);
                      validateMutation.mutate(url);
                    }}
                    data-testid="button-refresh-validation"
                    className="text-gray-400 hover:text-nova-cyan"
                  >
                    <RefreshCw size={16} />
                  </Button>
                  
                  {downloadId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDownloadId(null);
                        setSelectedQuality("");
                        setSelectedItag(null);
                        toast({
                          title: "Téléchargement annulé",
                          description: "Vous pouvez maintenant commencer un nouveau téléchargement",
                        });
                      }}
                      data-testid="button-cancel-download"
                      className="text-red-400 hover:text-red-300"
                    >
                      ❌
                    </Button>
                  )}
                </div>
              </div>
              
              {validationData?.title && (
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2 truncate">{validationData.title}</h4>
                  {validationData.duration && (
                    <p className="text-gray-400 text-sm">
                      Durée: {Math.floor(parseInt(validationData.duration) / 60)}:{(parseInt(validationData.duration) % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              )}
              
              {!validationData?.title && url.includes('youtube') && (
                <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
                  <p className="text-blue-400 text-sm">
                    ℹ️ URL YouTube détectée - choisissez une qualité pour télécharger
                  </p>
                </div>
              )}
              
              
              {/* Quality Selection - TOUJOURS afficher */}
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/20">
                <Label className="text-white text-sm font-medium mb-3 block">
                  🎥 Choisir la qualité de téléchargement:
                </Label>
                
                <div className="grid gap-2">
                  {/* Qualités prédéfinies qui fonctionnent toujours */}
                  <button
                    onClick={() => {
                      setSelectedQuality('1080p-22');
                      setSelectedItag(22);
                    }}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedQuality === '1080p-22'
                        ? 'border-nova-purple bg-nova-purple/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-nova-cyan/50'
                    }`}
                    data-testid="quality-1080p"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">1080p HD</span>
                      <span className="text-xs opacity-70">📹 Vidéo • mp4</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedQuality('720p-22');
                      setSelectedItag(22);
                    }}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedQuality === '720p-22'
                        ? 'border-nova-purple bg-nova-purple/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-nova-cyan/50'
                    }`}
                    data-testid="quality-720p"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">720p HD</span>
                      <span className="text-xs opacity-70">📹 Vidéo • mp4</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedQuality('480p-18');
                      setSelectedItag(18);
                    }}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedQuality === '480p-18'
                        ? 'border-nova-purple bg-nova-purple/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-nova-cyan/50'
                    }`}
                    data-testid="quality-480p"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">480p Standard</span>
                      <span className="text-xs opacity-70">📹 Vidéo • mp4</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedQuality('360p-18');
                      setSelectedItag(18);
                    }}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedQuality === '360p-18'
                        ? 'border-nova-purple bg-nova-purple/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-nova-cyan/50'
                    }`}
                    data-testid="quality-360p"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">360p Rapide</span>
                      <span className="text-xs opacity-70">📹 Vidéo • mp4</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedQuality('Audio MP3-audio');
                      setSelectedItag(null);
                    }}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedQuality === 'Audio MP3-audio'
                        ? 'border-nova-cyan bg-nova-cyan/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-nova-cyan/50'
                    }`}
                    data-testid="quality-audio"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Audio MP3</span>
                      <span className="text-xs opacity-70">🎵 Audio seulement • mp3</span>
                    </div>
                  </button>
                </div>
                
                {selectedQuality && (
                  <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-sm">
                    ✓ Qualité sélectionnée: {selectedQuality.split('-')[0]}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Format Selection */}
        <div className="mb-8">
          <h3 className="text-white text-lg font-medium mb-4">
            <Video className="mr-2 text-nova-pink inline" size={20} />
            Download Format
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={format === "mp4" ? "default" : "outline"}
              onClick={() => setFormat("mp4")}
              data-testid="button-format-mp4"
              className={`group p-4 h-auto ${
                format === "mp4"
                  ? "bg-gradient-to-r from-nova-purple/40 to-nova-blue/40 border-nova-purple"
                  : "bg-gradient-to-r from-nova-purple/20 to-nova-blue/20 hover:from-nova-purple/40 hover:to-nova-blue/40"
              } border border-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105`}
            >
              <div className="flex items-center justify-center space-x-3 w-full">
                <Video className="text-nova-purple text-2xl group-hover:scale-110 transition-transform duration-300" size={24} />
                <div className="text-left">
                  <div className="text-white font-medium">Video (MP4)</div>
                  <div className="text-gray-400 text-sm">Best quality available</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant={format === "mp3" ? "default" : "outline"}
              onClick={() => setFormat("mp3")}
              data-testid="button-format-mp3"
              className={`group p-4 h-auto ${
                format === "mp3"
                  ? "bg-gradient-to-r from-nova-cyan/40 to-nova-pink/40 border-nova-cyan"
                  : "bg-gradient-to-r from-nova-cyan/20 to-nova-pink/20 hover:from-nova-cyan/40 hover:to-nova-pink/40"
              } border border-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105`}
            >
              <div className="flex items-center justify-center space-x-3 w-full">
                <Music className="text-nova-cyan text-2xl group-hover:scale-110 transition-transform duration-300" size={24} />
                <div className="text-left">
                  <div className="text-white font-medium">Audio (MP3)</div>
                  <div className="text-gray-400 text-sm">High quality audio</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          {!downloadId && (
            <Button
              onClick={handleDownload}
              disabled={downloadMutation.isPending || !url || (validationData?.formats?.length > 0 && !selectedQuality)}
              data-testid="button-start-download"
              className="group relative px-12 py-4 bg-gradient-to-r from-nova-purple via-nova-blue to-nova-cyan hover:from-nova-cyan hover:via-nova-pink hover:to-nova-purple text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-nova-purple/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Rocket size={20} />
                <span>
                  {downloadMutation.isPending ? "Processing..." : 
                   (validationData?.formats?.length > 0 && !selectedQuality) ? "Select Quality First" :
                   "Start Download"}
                </span>
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-nova-purple via-nova-blue to-nova-cyan opacity-0 group-hover:opacity-100 blur transition-opacity duration-500"></div>
            </Button>
          )}

          {downloadId && downloadStatus?.status === "completed" && (
            <Button
              onClick={handleFileDownload}
              data-testid="button-download-file"
              className="group relative px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center space-x-2">
                <Download size={20} />
                <span>Download File</span>
              </span>
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {downloadId && downloadStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8"
            data-testid="download-progress"
          >
            <div className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">
                  {downloadStatus.status === "processing" ? "Downloading..." : 
                   downloadStatus.status === "completed" ? "Complete!" :
                   downloadStatus.status === "failed" ? "Failed" : "Preparing..."}
                </span>
                <span className="text-nova-cyan font-medium">
                  {downloadStatus.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-nova-purple to-nova-cyan h-full rounded-full transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadStatus.progress || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-3 text-sm text-gray-400 text-center">
                {downloadStatus.status === "processing" ? "Processing your media file..." :
                 downloadStatus.status === "completed" ? "Ready for download!" :
                 downloadStatus.status === "failed" ? downloadStatus.error || "An error occurred" :
                 "Initializing..."}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
