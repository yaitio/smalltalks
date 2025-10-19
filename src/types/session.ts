export interface TalkSession {
  id: string;
  topic: string;
  duration: number; // in seconds
  transcript: TranscriptEntry[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string; // ISO 8601
}
