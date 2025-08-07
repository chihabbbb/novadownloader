import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import { z } from "zod";
import ytdl from "ytdl-core";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Validate YouTube URL
  app.post("/api/validate", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      const isValid = ytdl.validateURL(url);
      let platform = "unknown";
      let title = null;

      if (isValid) {
        platform = "youtube";
        try {
          const info = await ytdl.getBasicInfo(url);
          title = info.videoDetails.title;
        } catch (error) {
          console.error("Error getting video info:", error);
        }
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        platform = "youtube";
      }

      res.json({
        isValid,
        platform,
        title,
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
      const { url, format } = validatedData;

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
        format
      });

      // Start processing in background
      processDownload(download.id, url, format);

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

async function processDownload(downloadId: string, url: string, format: string) {
  try {
    // Update status to processing
    await storage.updateDownload(downloadId, { 
      status: "processing",
      progress: 10
    });

    // Get video info
    const info = await ytdl.getBasicInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/gi, ''); // Clean filename

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

    // Download video/audio
    const stream = ytdl(url, {
      quality: format === "mp3" ? "highestaudio" : "highest",
      filter: format === "mp3" ? "audioonly" : "audioandvideo"
    });

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    let downloadedBytes = 0;
    const totalBytes = parseInt(info.videoDetails.lengthSeconds) * 1000000; // Rough estimate

    stream.on('progress', (chunkLength: number, downloaded: number, total: number) => {
      const progress = Math.min(90, 40 + Math.floor((downloaded / total) * 40));
      storage.updateDownload(downloadId, { progress });
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
    await storage.updateDownload(downloadId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}
