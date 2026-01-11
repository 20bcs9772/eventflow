/**
 * API Service
 *
 * Centralized HTTP client for making API requests.
 * Handles authentication headers, error handling, and response parsing.
 */

import { API_CONFIG } from '../config/api';
import { authService } from './auth.service';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Make an HTTP request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, requiresAuth = true } = options;

    const url = `${this.baseURL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = await authService.getIdToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      let data: any;

      if (isJson) {
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, read as text for better error message
          const text = await response.text();
          console.error(
            'Failed to parse JSON response:',
            text.substring(0, 200),
          );
          return {
            success: false,
            message: 'Invalid JSON response from server',
            error: `HTTP ${response.status}`,
          };
        }
      } else {
        // If not JSON, read as text (might be HTML error page)
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));

        // Try to extract error message from HTML if possible
        let errorMessage = 'Request failed';
        if (text.includes('<title>')) {
          const titleMatch = text.match(/<title>(.*?)<\/title>/i);
          if (titleMatch) {
            errorMessage = titleMatch[1];
          }
        }

        return {
          success: false,
          message:
            errorMessage ||
            `Server returned non-JSON response (${contentType || 'unknown'})`,
          error: `HTTP ${response.status}`,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Request failed',
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out',
          error: 'TIMEOUT',
        };
      }

      console.error('API request error:', error);

      return {
        success: false,
        message: error.message || 'Network error',
        error: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    body?: any,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', body, requiresAuth });
  }
}

export const apiService = new ApiService();
export default apiService;
