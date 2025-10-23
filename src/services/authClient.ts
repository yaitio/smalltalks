/**
 * Auth Client Service
 * Handles authentication operations with backend API
 */

export interface User {
  id: string;
  user_email: string;
  user_name?: string;
  user_language?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthClient {
  private readonly authBypass: boolean;
  private readonly apiBaseUrl: string;

  constructor() {
    this.authBypass = import.meta.env.PUBLIC_AUTH_BYPASS === 'true';
    this.apiBaseUrl =
      import.meta.env.PUBLIC_API_BASE_URL || 'https://api.smalltalks.io/v1/smalltalks';
  }

  /**
   * Check if user is authenticated
   * Calls /auth/info to verify cookie validity
   */
  async isAuthenticated(): Promise<boolean> {
    if (this.authBypass) {
      return true;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/info`, {
        method: 'GET',
        credentials: 'include', // Include cookies in request
        // headers: {
        // 'Content-Type': 'application/json',
        // },
      });

      return response.ok;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  /**
   * Get current user
   * Returns user info from /auth/info endpoint
   */
  async getUser(): Promise<User | null> {
    if (this.authBypass) {
      return {
        id: 'dev-user',
        user_email: 'dev@smalltalks.local',
        user_name: 'Dev User',
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/info`, {
        method: 'GET',
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as User;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  /**
   * Login with email (magic link flow)
   * Stub implementation - will call backend in Week 2
   */
  async login(email: string): Promise<{ success: boolean; message: string }> {
    if (this.authBypass) {
      return {
        success: true,
        message: 'Auth bypass enabled - user logged in',
      };
    }

    // Call backend magic link endpoint (stub)
    // POST /api/v1/auth/magic-link
    return {
      success: true,
      message: 'Magic link sent to email (stub)',
    };
  }

  /**
   * Request magic link for email
   * Sends a magic link to the provided email address
   */
  async requestMagicLink(
    email: string,
    name: string,
    language: string
  ): Promise<{ success: boolean; message: string }> {
    if (this.authBypass) {
      // In dev mode, simulate successful magic link send
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Magic link sent! (Dev mode - check console)',
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          metadata: {
            name,
            language,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send magic link' }));
        return {
          success: false,
          message: error.message || 'Failed to send magic link',
        };
      }

      return {
        success: true,
        message: 'Magic link sent successfully',
      };
    } catch (error) {
      console.error('Failed to request magic link:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (this.authBypass) {
      return;
    }

    // Clear auth cookie (stub - will implement in Week 2)
    // Call backend logout endpoint: POST /api/v1/auth/logout
  }

  /**
   * Refresh authentication token
   * Stub implementation
   */
  async refreshToken(): Promise<boolean> {
    if (this.authBypass) {
      return true;
    }

    // Call backend refresh endpoint (stub)
    // POST /api/v1/auth/refresh
    return false;
  }

  /**
   * Check if auth cookie exists
   */
  private hasAuthCookie(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    return document.cookie.includes('auth_token=');
  }
}

// Export singleton instance
export const authClient = new AuthClient();
