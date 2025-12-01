import axios from 'axios';

/**
 * Extracts a user-friendly error message from various error types.
 * Handles Axios errors, standard Error objects, and unknown errors.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Handle API errors with our custom format
    const detail = error.response?.data?.detail;
    if (typeof detail === 'object' && detail?.message) {
      return detail.message;
    }
    if (typeof detail === 'string') {
      return detail;
    }
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (!error.response) {
      return 'Network error. Please check your connection.';
    }
    // Generic API error
    return 'An error occurred. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Decodes a JWT token and returns the payload.
 * Returns null if the token is invalid.
 */
export function decodeJWT(token: string): { exp?: number; sub?: string; account_number?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 * Returns true if expired or invalid.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}
