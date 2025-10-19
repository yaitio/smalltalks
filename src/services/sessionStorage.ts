import type { TalkSession } from '@/types/session';

const DB_NAME = 'smalltalks-sessions';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

class SessionStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = async () => {
        this.db = request.result;

        // Check if database is empty and populate with mock data
        const sessions = await this.getAllSessions();
        if (sessions.length === 0) {
          await this.populateMockData();
        }

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
          });

          // Create indexes
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('topic', 'topic', { unique: false });
        }
      };
    });
  }

  private async populateMockData(): Promise<void> {
    const mockSessions: TalkSession[] = [
      {
        id: '1',
        topic: 'Daily Routine',
        duration: 420,
        createdAt: new Date('2025-10-10').toISOString(),
        updatedAt: new Date('2025-10-10').toISOString(),
        transcript: [
          {
            role: 'assistant',
            text: 'Hi! Let\'s talk about your daily routine. What time do you usually wake up?',
            timestamp: new Date('2025-10-10T08:00:00').toISOString(),
          },
          {
            role: 'user',
            text: 'I usually wake up at 7 AM.',
            timestamp: new Date('2025-10-10T08:00:15').toISOString(),
          },
        ],
      },
      {
        id: '2',
        topic: 'Hobbies and Interests',
        duration: 600,
        createdAt: new Date('2025-10-08').toISOString(),
        updatedAt: new Date('2025-10-08').toISOString(),
        transcript: [
          {
            role: 'assistant',
            text: 'What do you like to do in your free time?',
            timestamp: new Date('2025-10-08T14:00:00').toISOString(),
          },
          {
            role: 'user',
            text: 'I enjoy reading books and playing guitar.',
            timestamp: new Date('2025-10-08T14:00:20').toISOString(),
          },
        ],
      },
      {
        id: '3',
        topic: 'Travel Experience',
        duration: 540,
        createdAt: new Date('2025-10-05').toISOString(),
        updatedAt: new Date('2025-10-05').toISOString(),
        transcript: [
          {
            role: 'assistant',
            text: 'Have you traveled anywhere interesting recently?',
            timestamp: new Date('2025-10-05T16:00:00').toISOString(),
          },
          {
            role: 'user',
            text: 'Yes, I went to Paris last month.',
            timestamp: new Date('2025-10-05T16:00:25').toISOString(),
          },
        ],
      },
      {
        id: '4',
        topic: 'Food Preferences',
        duration: 360,
        createdAt: new Date('2025-10-02').toISOString(),
        updatedAt: new Date('2025-10-02').toISOString(),
        transcript: [
          {
            role: 'assistant',
            text: 'What\'s your favorite type of food?',
            timestamp: new Date('2025-10-02T12:00:00').toISOString(),
          },
          {
            role: 'user',
            text: 'I love Italian food, especially pasta.',
            timestamp: new Date('2025-10-02T12:00:18').toISOString(),
          },
        ],
      },
    ];

    for (const session of mockSessions) {
      await this.saveSession(session);
    }
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async saveSession(session: TalkSession): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save session'));
    });
  }

  async getSession(id: string): Promise<TalkSession | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get session'));
    });
  }

  async getAllSessions(): Promise<TalkSession[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Most recent first

      const sessions: TalkSession[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };

      request.onerror = () => reject(new Error('Failed to get sessions'));
    });
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete session'));
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear sessions'));
    });
  }
}

export const sessionStorage = new SessionStorage();
