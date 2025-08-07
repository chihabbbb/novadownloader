import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import { z } from "zod";
import ytdl from "@distube/ytdl-core";
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

      const isValid = ytdl.validateURL(url);
      let platform = "unknown";
      let title = null;
      let formats: any[] = [];
      let thumbnail = null;
      let duration = null;

      if (isValid) {
        platform = "youtube";
        try {
          const info = await ytdl.getBasicInfo(url, {
            requestOptions: {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            }
          });
          
          title = info.videoDetails.title;
          thumbnail = info.videoDetails.thumbnails?.[0]?.url;
          duration = info.videoDetails.lengthSeconds;
          
          console.log('Info formats bruts:', info.formats.length, 'formats trouvés');
          
          // Formats vidéo avec audio
          const videoFormats = info.formats
            .filter(format => {
              const hasVideo = format.hasVideo;
              const hasAudio = format.hasAudio; 
              const hasQuality = format.qualityLabel;
              console.log(`Format itag=${format.itag}: video=${hasVideo}, audio=${hasAudio}, quality=${format.qualityLabel}`);
              return hasVideo && hasAudio && hasQuality;
            })
            .map(format => ({
              itag: format.itag,
              quality: format.qualityLabel,
              container: format.container || 'mp4',
              type: 'video'
            }));
            
          console.log('Formats vidéo trouvés:', videoFormats);
          
          // Supprimer les doublons et trier
          const uniqueVideoFormats = videoFormats
            .filter((format, index, self) => 
              index === self.findIndex(f => f.quality === format.quality)
            )
            .sort((a, b) => {
              const qualityOrder: { [key: string]: number } = { 
                '1080p': 5, '720p': 4, '480p': 3, '360p': 2, '240p': 1, '144p': 0 
              };
              return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
            });
            
          // Ajouter formats audio
          const audioFormats = [{
            itag: 'audio',
            quality: 'Audio MP3',
            container: 'mp3',
            type: 'audio'
          }];
            
          formats = [...uniqueVideoFormats, ...audioFormats];
          
          console.log('Formats finaux envoyés:', formats);
          
        } catch (error) {
          console.error("Error getting video info:", error);
          // Même si on ne peut pas obtenir les détails, on indique que l'URL est valide
        }
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        platform = "youtube";
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

      // Validate YouTube URL
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      // Detect platform
      const platform = "youtube";

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
      
      // Validate YouTube URL
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

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
      
      const stream = ytdl(url, downloadOptions);
      stream.pipe(res);
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream file" });
        }
      });
      
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
      info = await ytdl.getBasicInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      });
      title = info.videoDetails.title.replace(/[^\w\s-]/gi, ''); // Clean filename
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
    
    // Test stream creation without downloading
    try {
      const testStream = ytdl(url, downloadOptions);
      testStream.destroy(); // Close immediately
    } catch (error) {
      console.error("Error creating download stream:", error);
      throw new Error("Erreur lors de la validation du flux de téléchargement. Veuillez réessayer.");
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
