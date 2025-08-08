import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import { z } from "zod";
import youtubeDl from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { promisify } from "util";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Validate YouTube URL and get available formats
  app.post("/api/validate", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      // Detect platform
      let platform = "unknown";
      let title = null;
      let formats: any[] = [];
      let thumbnail = null;
      let duration = null;
      let isValid = false;

      // Detect platform from URL
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        platform = "youtube";
        isValid = true;
      } else if (url.includes("tiktok.com") || url.includes("vm.tiktok.com")) {
        platform = "tiktok";
        isValid = true;
      } else if (url.includes("instagram.com")) {
        platform = "instagram";
        isValid = true;
      } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
        platform = "facebook";
        isValid = true;
      } else if (url.includes("twitter.com") || url.includes("x.com")) {
        platform = "twitter";
        isValid = true;
      }

      if (isValid) {
        try {
          // Use yt-dlp to get video info for any platform
          const info = await youtubeDl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:https://www.google.com/']
          });
          
          title = (info as any).title;
          thumbnail = (info as any).thumbnail;
          duration = (info as any).duration;
          
          console.log('Info extraite pour', platform, ':', { title, duration });
          
          // Create standard quality options for all platforms
          const standardFormats = [
            { itag: 'best', quality: 'Meilleure qualité', container: 'mp4', type: 'video' },
            { itag: 'worst[height>=720]', quality: '720p HD', container: 'mp4', type: 'video' },
            { itag: 'worst[height>=480]', quality: '480p Standard', container: 'mp4', type: 'video' },
            { itag: 'worst[height>=360]', quality: '360p Rapide', container: 'mp4', type: 'video' },
            { itag: 'bestaudio', quality: 'Audio MP3', container: 'mp3', type: 'audio' }
          ];
          
          formats = standardFormats;
          
          console.log('Formats standards créés:', formats);
          
        } catch (error) {
          console.error(`Error getting ${platform} info:`, error);
          // Create fallback formats even if we can't get detailed info
          formats = [
            { itag: 'best', quality: 'Meilleure qualité', container: 'mp4', type: 'video' },
            { itag: 'bestaudio', quality: 'Audio MP3', container: 'mp3', type: 'audio' }
          ];
        }
      }

      res.json({
        isValid,
        platform,
        title,
        thumbnail,
        duration,
        formats,
        supported: platform === "youtube"
      });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Failed to validate URL" });
    }
  });

  // Start download
  app.post("/api/download", async (req, res) => {
    try {
      const validatedData = downloadRequestSchema.parse(req.body);
      const { url, format, quality, itag } = validatedData;

      // Detect platform
      let platform = "unknown";
      
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        platform = "youtube";
      } else if (url.includes("tiktok.com") || url.includes("vm.tiktok.com")) {
        platform = "tiktok";
      } else if (url.includes("instagram.com")) {
        platform = "instagram";
      } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
        platform = "facebook";
      } else if (url.includes("twitter.com") || url.includes("x.com")) {
        platform = "twitter";
      } else {
        return res.status(400).json({ 
          error: "Cette plateforme n'est pas supportée.",
          platform: platform,
          supportedPlatforms: ["YouTube", "TikTok", "Instagram", "Facebook", "Twitter"]
        });
      }

      // Create download record
      const download = await storage.createDownload({
        url,
        platform,
        format,
        quality,
        itag
      });

      // Start processing in background
      processDownload(download.id, url, format, quality, itag);

      res.json({ downloadId: download.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to start download" });
    }
  });

  // Get download status
  app.get("/api/download/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const download = await storage.getDownload(id);

      if (!download) {
        return res.status(404).json({ error: "Download not found" });
      }

      res.json(download);
    } catch (error) {
      console.error("Status error:", error);
      res.status(500).json({ error: "Failed to get download status" });
    }
  });

  // Stream file directly (no storage)
  app.get("/api/file/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const download = await storage.getDownload(id);

      if (!download || download.status !== "completed") {
        return res.status(404).json({ error: "Download not ready" });
      }

      const { url, format, quality, itag } = download;
      
      // No need to validate URL for specific platform anymore - yt-dlp handles all platforms

      const ext = format === "mp3" ? "mp3" : "mp4";
      const filename = `${download.title || "download"}.${ext}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === "mp3" ? "audio/mpeg" : "video/mp4");
      
      // Stream directly from YouTube without saving to disk
      let downloadOptions: any;
      
      if (format === "mp3" || (quality && quality.includes('Audio'))) {
        downloadOptions = {
          quality: "highestaudio",
          filter: "audioonly",
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          }
        };
      } else {
        downloadOptions = {
          quality: itag ? itag : "highest",
          filter: "audioandvideo",
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          }
        };
      }
      
      // Use yt-dlp to download and stream directly
      const ytDlpOptions: any = {
        output: '-', // Output to stdout
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: ['referer:https://www.google.com/']
      };
      
      if (format === "mp3" || (quality && quality.includes('Audio'))) {
        ytDlpOptions.extractAudio = true;
        ytDlpOptions.audioFormat = 'mp3';
        ytDlpOptions.audioQuality = '192';
      } else {
        if (itag && typeof itag === 'string' && itag !== 'best') {
          ytDlpOptions.format = itag;
        } else {
          // Platform-specific format selection
          if (url.includes("tiktok.com") || url.includes("vm.tiktok.com")) {
            ytDlpOptions.format = 'best'; // TikTok doesn't support height filtering reliably
          } else if (url.includes("instagram.com")) {
            ytDlpOptions.format = 'best'; // Instagram also has limited format options
          } else if (url.includes("twitter.com") || url.includes("x.com")) {
            ytDlpOptions.format = 'best'; // Twitter/X has limited formats
          } else {
            ytDlpOptions.format = 'best[height<=720]'; // YouTube and others
          }
        }
      }
      
      try {
        const stream = youtubeDl.exec(url, ytDlpOptions);
        stream.stdout?.pipe(res);
        
        stream.on('error', (error) => {
          console.error('yt-dlp stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Failed to stream file" });
          }
        });
        
        stream.on('close', (code) => {
          if (code !== 0) {
            console.error('yt-dlp exited with code:', code);
            if (!res.headersSent) {
              res.status(500).json({ error: "Download failed" });
            }
          }
        });
      } catch (error) {
        console.error('Error starting yt-dlp:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to start download" });
        }
      }
      
    } catch (error) {
      console.error("File download error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download file" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processDownload(downloadId: string, url: string, format: string, quality?: string, itag?: number) {
  try {
    // Update status to processing
    await storage.updateDownload(downloadId, { 
      status: "processing",
      progress: 10
    });

    // Get video info with better error handling
    let info;
    let title = "video";
    
    try {
      info = await youtubeDl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true
      });
      title = (info as any).title.replace(/[^\w\s-]/gi, ''); // Clean filename
    } catch (error) {
      console.error("Error getting video info:", error);
      throw new Error("Impossible d'obtenir les informations de la vidéo. L'URL pourrait être invalide ou la vidéo indisponible.");
    }

    // Just validate the stream can be created, but don't download
    let downloadOptions: any;
    
    if (format === "mp3" || (quality && quality.includes('Audio'))) {
      downloadOptions = {
        quality: "highestaudio",
        filter: "audioonly",
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      };
    } else {
      downloadOptions = {
        quality: itag ? itag : "highest",
        filter: "audioandvideo",
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      };
    }
    
    console.log('Validation des options de téléchargement:', downloadOptions);
    
    // Test if yt-dlp can handle this URL with platform-specific validation
    try {
      const validateOptions: any = {
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: ['referer:https://www.google.com/']
      };
      
      // For some platforms, listing formats might fail even if the URL is valid
      if (url.includes("tiktok.com") || url.includes("vm.tiktok.com") || 
          url.includes("instagram.com") || url.includes("twitter.com") || url.includes("x.com")) {
        // For these platforms, just check if we can get basic info instead of listing formats
        await youtubeDl(url, {
          ...validateOptions,
          dumpSingleJson: true
        });
      } else {
        // For YouTube and others, we can safely list formats
        await youtubeDl(url, {
          ...validateOptions,
          listFormats: true
        });
      }
    } catch (error) {
      console.error("Error validating URL with yt-dlp:", error);
      throw new Error("Erreur lors de la validation de l'URL. Veuillez réessayer.");
    }

    // Mark as completed - file will be streamed directly when requested
    await storage.updateDownload(downloadId, {
      status: "completed",
      progress: 100,
      title,
      url, // Store URL for direct streaming
      format,
      quality,
      itag
    });

  } catch (error) {
    console.error("Processing error:", error);
    
    let errorMessage = "Une erreur inconnue s'est produite";
    
    if (error instanceof Error) {
      if (error.message.includes('Could not extract functions')) {
        errorMessage = "Erreur YouTube: La vidéo pourrait être protégée ou l'URL invalide. Veuillez réessayer.";
      } else if (error.message.includes('Video unavailable')) {
        errorMessage = "Cette vidéo n'est pas disponible pour le téléchargement.";
      } else if (error.message.includes('private')) {
        errorMessage = "Cette vidéo est privée et ne peut pas être téléchargée.";
      } else {
        errorMessage = error.message;
      }
    }
    
    await storage.updateDownload(downloadId, {
      status: "failed",
      error: errorMessage
    });
  }
}
