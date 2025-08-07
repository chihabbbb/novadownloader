import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, Video, Music, Rocket, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import type { Download as DownloadType } from "@shared/schema";

export default function DownloadCard() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [validationData, setValidationData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Validate URL as user types
  const validateMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/validate", { url });
      return res.json();
    },
    onSuccess: (data) => {
      setValidationData(data);
    },
  });

  // Start download
  const downloadMutation = useMutation({
    mutationFn: async ({ url, format }: { url: string; format: string }) => {
      const res = await apiRequest("POST", "/api/download", { url, format });
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

  useEffect(() => {
    if (url && url.length > 10) {
      const timer = setTimeout(() => {
        validateMutation.mutate(url);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setValidationData(null);
    }
  }, [url]);

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

    downloadMutation.mutate({ url, format });
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
        {validationData && validationData.platform && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-4 p-4 glass rounded-lg">
              <div className="flex items-center space-x-2">
                {validationData.platform === "youtube" && (
                  <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Y</span>
                  </div>
                )}
                <span className="text-white font-medium">
                  {validationData.platform.charAt(0).toUpperCase() + validationData.platform.slice(1)} detected
                </span>
                {validationData.title && (
                  <span className="text-gray-400 text-sm">- {validationData.title}</span>
                )}
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                validationData.supported ? "bg-green-400" : "bg-red-400"
              }`}></div>
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
              disabled={downloadMutation.isPending || !url}
              data-testid="button-start-download"
              className="group relative px-12 py-4 bg-gradient-to-r from-nova-purple via-nova-blue to-nova-cyan hover:from-nova-cyan hover:via-nova-pink hover:to-nova-purple text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-nova-purple/25"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Rocket size={20} />
                <span>{downloadMutation.isPending ? "Processing..." : "Start Download"}</span>
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
