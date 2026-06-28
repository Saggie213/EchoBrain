/**
 * Centralized API helpers for the EchoBrain AI backend.
 * Uses NEXT_PUBLIC_API_URL env var, defaulting to localhost:8000.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ProcessResponse {
  job_id: string;
  video_id: string;
}

export interface VideoMetadata {
  title: string;
  channel: string;
  duration: string;
  url: string;
  video_id: string;
  thumbnail: string;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: "root" | "main" | "sub";
  parent?: string;
  timestamp?: string;
  description?: string;
}

export interface JobResult {
  metadata: VideoMetadata;
  transcript: TranscriptSegment[];
  mindmap: { nodes: MindMapNode[] };
}

export interface JobStatus {
  status: "pending" | "processing" | "completed" | "failed";
  step?: string;
  error?: string;
  result?: JobResult;
  video_id?: string;
}

export interface ChatResponse {
  response: string;
}

export interface VideoSummary {
  id: string;
  title: string;
  url: string;
  status: string;
  created_at: string;
}

export async function processVideo(url: string): Promise<ProcessResponse> {
  const res = await fetch(`${API_BASE}/api/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Failed to start processing");
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/status/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
}

export async function chatWithVideo(videoId: string, message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId, message }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function listVideos(): Promise<VideoSummary[]> {
  const res = await fetch(`${API_BASE}/api/videos`);
  if (!res.ok) return [];
  return res.json();
}
