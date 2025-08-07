import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  platform: text("platform").notNull(),
  format: text("format").notNull(), // mp4, mp3
  quality: text("quality"), // selected quality
  itag: integer("itag"), // YouTube format tag
  title: text("title"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  progress: integer("progress").default(0),
  downloadUrl: text("download_url"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
  platform: true,
  format: true,
  quality: true,
  itag: true,
});

export const downloadRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  format: z.enum(["mp4", "mp3"], {
    required_error: "Please select a format",
  }),
  quality: z.string().optional(),
  itag: z.number().optional(),
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;
export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
