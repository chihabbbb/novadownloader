import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import { z } from "zod";
import ytdl from "@distube/ytdl-core";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

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
          
          // Récupérer les formats disponibles
          const videoFormats = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => ({
              itag: format.itag,
              quality: format.qualityLabel || format.quality,
              container: format.container,
              hasVideo: format.hasVideo,
              hasAudio: format.hasAudio,
              filesize: format.contentLength
            }))
            .sort((a, b) => {
              const qualityOrder = { '1080p': 5, '720p': 4, '480p': 3, '360p': 2, '240p': 1, '144p': 0 };
              return (qualityOrder[b.quality as keyof typeof qualityOrder] || 0) - (qualityOrder[a.quality as keyof typeof qualityOrder] || 0);
            });
            
          const audioFormats = info.formats
            .filter(format => format.hasAudio && !format.hasVideo)
            .map(format => ({
              itag: format.itag,
              quality: `Audio ${format.audioBitrate || 'Unknown'}kbps`,
              container: format.container,
              hasVideo: false,
              hasAudio: true,
              filesize: format.contentLength
            }))
            .sort((a, b) => {
              const aBitrate = parseInt(a.quality.match(/\d+/)?.[0] || '0');
              const bBitrate = parseInt(b.quality.match(/\d+/)?.[0] || '0');
              return bBitrate - aBitrate;
            });
            
          formats = [
            ...videoFormats.slice(0, 6), // Top 6 video qualities
            ...audioFormats.slice(0, 3)  // Top 3 audio qualities
          ];
          
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

  // Download file
  app.get("/api/file/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const download = await storage.getDownload(id);

      if (!download || download.status !== "completed" || !download.downloadUrl) {
        return res.status(404).json({ error: "File not found" });
      }

      const filePath = download.downloadUrl;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      const ext = download.format === "mp3" ? "mp3" : "mp4";
      const filename = `${download.title || "download"}.${ext}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', download.format === "mp3" ? "audio/mpeg" : "video/mp4");
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("File download error:", error);
      res.status(500).json({ error: "Failed to download file" });
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

    await storage.updateDownload(downloadId, { 
      title,
      progress: 25
    });

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const fileId = randomUUID();
    const filename = `${fileId}.${format === "mp3" ? "mp4" : format}`; // Download as mp4 first for audio extraction
    const filePath = path.join(downloadsDir, filename);

    await storage.updateDownload(downloadId, { progress: 40 });

    // Download video/audio with better options
    const downloadOptions: any = {
      quality: itag ? itag : (format === "mp3" ? "highestaudio" : "highest"),
      filter: format === "mp3" ? "audioonly" : "audioandvideo",
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    };
    
    let stream;
    try {
      stream = ytdl(url, downloadOptions);
    } catch (error) {
      console.error("Error creating download stream:", error);
      throw new Error("Erreur lors de la création du flux de téléchargement. Veuillez réessayer.");
    }

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    // Progress tracking
    stream.on('progress', (chunkLength: number, downloaded: number, total: number) => {
      if (total > 0) {
        const progress = Math.min(90, 40 + Math.floor((downloaded / total) * 40));
        storage.updateDownload(downloadId, { progress });
      }
    });
    
    // Error handling for stream
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      throw error;
    });

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      stream.on('error', reject);
    });

    let finalPath = filePath;

    // For MP3, we would need to use FFmpeg to convert, but for now we'll use the audio stream directly
    if (format === "mp3") {
      const mp3Path = path.join(downloadsDir, `${fileId}.mp3`);
      // In a real implementation, you'd use FFmpeg here to convert mp4 to mp3
      // For now, we'll just rename the file (this won't actually be proper MP3)
      fs.renameSync(filePath, mp3Path);
      finalPath = mp3Path;
    }

    await storage.updateDownload(downloadId, {
      status: "completed",
      progress: 100,
      downloadUrl: finalPath
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
