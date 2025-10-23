/**
 * Lessons API Client
 * Handles fetching lessons/conversation history from backend
 */

export interface Lesson {
  id: string;
  topic: string;
  duration: number; // in seconds
  createdAt: string; // ISO 8601
  transcript?: {
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }[];
}

export interface LessonsResponse {
  lessons: Lesson[];
  total: number;
}

export class LessonsClient {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl =
      import.meta.env.PUBLIC_API_BASE_URL || 'https://api.smalltalks.io/v1/smalltalks';
  }

  /**
   * Fetch all lessons for the authenticated user
   */
  async getLessons(): Promise<Lesson[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/agent/lessons`, {
        method: 'GET',
        credentials: 'include', // Include authentication cookies
        // headers: {
        // 'Content-Type': 'application/json',
        // },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.status}`);
      }

      const data = await response.json();

      // Handle different possible response formats
      if (Array.isArray(data)) {
        return data;
      }

      if (data.lessons && Array.isArray(data.lessons)) {
        return data.lessons;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific lesson by ID
   */
  async getLesson(id: string): Promise<Lesson | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/agent/lessons/${id}`, {
        method: 'GET',
        credentials: 'include',
        // headers: {
        // 'Content-Type': 'application/json',
        // },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch lesson: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch lesson ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const lessonsClient = new LessonsClient();
