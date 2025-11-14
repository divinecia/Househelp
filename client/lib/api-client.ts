/**
 * API Client for communicating with backend
 * Handles all HTTP requests with proper error handling
 */

import { getAccessToken, refreshAccessToken } from "./jwt-auth";

// Use relative path for API calls (works in both dev and production)
// In dev: /api → http://localhost:5173/api
// In prod: /api → https://your-domain/api
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  _hasRetried?: boolean;
}

/**
 * Make an API request with automatic token handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Normalize headers to ensure they're always a plain object
  const extraHeaders = fetchOptions.headers instanceof Headers
    ? Object.fromEntries(fetchOptions.headers.entries())
    : (typeof fetchOptions.headers === 'object' ? fetchOptions.headers : {}) as Record<string, string>;

  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Add authorization token if available and not skipped
  if (!skipAuth) {
    let token = getAccessToken();

    // Try to refresh if token is missing
    if (!token) {
      token = await refreshAccessToken();
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      // Response is not JSON (could be HTML error page)
      data = {
        error: `HTTP Error: ${response.status}`,
      };
    }

    if (!response.ok) {
      // Handle 401 - token expired or invalid
      if (response.status === 401 && !skipAuth) {
        // Try to refresh token once
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry request with new token
          return apiRequest<T>(endpoint, { ...options, skipAuth: false });
        }
      }

      throw new Error(data.error || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`API Error [${endpoint}]:`, message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "GET",
  });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body: any,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body: any,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "DELETE",
  });
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  body: any,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ============================================================
// AUTHENTICATION API
// ============================================================

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: "worker" | "homeowner" | "admin";
  [key: string]: any;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  return apiPost("/auth/register", payload);
}

export async function loginUser(payload: LoginPayload) {
  return apiPost("/auth/login", payload);
}

export async function getCurrentUser() {
  return apiGet("/auth/me");
}

export async function logoutUser() {
  return apiPost("/auth/logout", {});
}

// ============================================================
// WORKERS API
// ============================================================

export async function getWorkers(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/workers?${params.toString()}`);
}

export async function getWorker(id: string) {
  return apiGet(`/workers/${id}`);
}

export async function createWorker(data: any) {
  return apiPost("/workers", data);
}

export async function updateWorker(id: string, data: any) {
  return apiPut(`/workers/${id}`, data);
}

export async function deleteWorker(id: string) {
  return apiDelete(`/workers/${id}`);
}

export async function searchWorkers(filters: Record<string, any>) {
  return apiGet(`/workers/search/advanced?${new URLSearchParams(filters).toString()}`);
}

// ============================================================
// HOMEOWNERS API
// ============================================================

export async function getHomeowners(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/homeowners?${params.toString()}`);
}

export async function getHomeowner(id: string) {
  return apiGet(`/homeowners/${id}`);
}

export async function createHomeowner(data: any) {
  return apiPost("/homeowners", data);
}

export async function updateHomeowner(id: string, data: any) {
  return apiPut(`/homeowners/${id}`, data);
}

export async function deleteHomeowner(id: string) {
  return apiDelete(`/homeowners/${id}`);
}

// ============================================================
// BOOKINGS API
// ============================================================

export async function getBookings(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/bookings?${params.toString()}`);
}

export async function getBooking(id: string) {
  return apiGet(`/bookings/${id}`);
}

export async function createBooking(data: any) {
  return apiPost("/bookings", data);
}

export async function updateBooking(id: string, data: any) {
  return apiPut(`/bookings/${id}`, data);
}

export async function deleteBooking(id: string) {
  return apiDelete(`/bookings/${id}`);
}

// ============================================================
// PAYMENTS API
// ============================================================

export async function getPayments(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/payments?${params.toString()}`);
}

export async function getPayment(id: string) {
  return apiGet(`/payments/${id}`);
}

export async function createPayment(data: any) {
  return apiPost("/payments", data);
}

export async function verifyPayment(transactionId: string) {
  return apiPost("/payments/verify", { transactionId });
}

// ============================================================
// SERVICES API
// ============================================================

export async function getServices(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/services?${params.toString()}`);
}

export async function getService(id: string) {
  return apiGet(`/services/${id}`);
}

export async function createService(data: any) {
  return apiPost("/services", data);
}

export async function updateService(id: string, data: any) {
  return apiPut(`/services/${id}`, data);
}

export async function deleteService(id: string) {
  return apiDelete(`/services/${id}`);
}

// ============================================================
// TRAININGS API
// ============================================================

export async function getTrainings(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/trainings?${params.toString()}`);
}

export async function getTraining(id: string) {
  return apiGet(`/trainings/${id}`);
}

export async function createTraining(data: any) {
  return apiPost("/trainings", data);
}

export async function updateTraining(id: string, data: any) {
  return apiPut(`/trainings/${id}`, data);
}

export async function deleteTraining(id: string) {
  return apiDelete(`/trainings/${id}`);
}

// ============================================================
// REPORTS API
// ============================================================

export async function getReports(filters?: Record<string, any>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/reports?${params.toString()}`);
}

export async function getReport(id: string) {
  return apiGet(`/reports/${id}`);
}

export async function createReport(data: any) {
  return apiPost("/reports", data);
}

export async function updateReport(id: string, data: any) {
  return apiPut(`/reports/${id}`, data);
}

export async function deleteReport(id: string) {
  return apiDelete(`/reports/${id}`);
}
