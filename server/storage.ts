import { type Download, type InsertDownload } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createDownload(download: InsertDownload): Promise<Download>;
  getDownload(id: string): Promise<Download | undefined>;
  updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined>;
  getRecentDownloads(): Promise<Download[]>;
}

export class MemStorage implements IStorage {
  private downloads: Map<string, Download>;

  constructor() {
    this.downloads = new Map();
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = randomUUID();
    const download: Download = {
      ...insertDownload,
      id,
      title: null,
      status: "pending",
      progress: 0,
      downloadUrl: null,
      error: null,
      createdAt: new Date(),
    };
    this.downloads.set(id, download);
    return download;
  }

  async getDownload(id: string): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined> {
    const existing = this.downloads.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.downloads.set(id, updated);
    return updated;
  }

  async getRecentDownloads(): Promise<Download[]> {
    return Array.from(this.downloads.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10);
  }
}

export const storage = new MemStorage();
