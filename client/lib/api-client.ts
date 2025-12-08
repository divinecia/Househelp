/**
 * API Client for communicating with backend
 * Handles all HTTP requests with proper error handling
 */

// JWT functions are no longer used - authentication is handled by Supabase
// import { getAccessToken, refreshAccessToken } from "./jwt-auth";

import { supabase } from "./supabase";

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

interface ListResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  message?: string;
}

interface OptionItem {
  id: string;
  name: string;
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
  const { skipAuth = false, _hasRetried = false, ...fetchOptions } = options;

  // Normalize headers to ensure they're always a plain object
  const extraHeaders =
    fetchOptions.headers instanceof Headers
      ? Object.fromEntries(fetchOptions.headers.entries())
      : ((typeof fetchOptions.headers === "object"
          ? fetchOptions.headers
          : {}) as Record<string, string>);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Add authorization token if available and not skipped
  if (!skipAuth) {
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
    } catch (err) {
      console.warn("Failed to get Supabase session", err);
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    let data: unknown;
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
      if (response.status === 401 && !skipAuth && !_hasRetried) {
        // Redirect to login based on user role
        if (typeof window !== "undefined") {
          try {
            const userInfo = sessionStorage.getItem("user_info");
            if (userInfo) {
              const user = JSON.parse(userInfo);
              const role = user.role;
              window.location.href = `/${role}/login`;
            } else {
              window.location.href = "/";
            }
          } catch {
            window.location.href = "/";
          }
        }
        return {
          success: false,
          error: "Unauthorized - Please login again",
        };
      }

      const errorData = data as { error?: string };
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return data as ApiResponse<T>;
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
export async function apiGet<T>(
  endpoint: string,
  skipAuth = false,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "GET",
    skipAuth,
  });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown,
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
  body: unknown,
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
  body: unknown,
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
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  maritalStatus?: string;
  nationalId?: string;
  criminalRecord?: string;
  typeOfWork?: string;
  workExperience?: string;
  expectedWages?: string;
  workingHoursAndDays?: string;
  educationQualification?: string;
  educationCertificate?: string;
  trainingCertificate?: string;
  languageProficiency?: string;
  healthCondition?: string;
  emergencyName?: string;
  emergencyContact?: string;
  bankAccountNumber?: string;
  accountHolder?: string;
  insuranceCompany?: string;
  termsAccepted?: boolean;
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

export async function forgotPassword(email: string) {
  return apiPost("/auth/forgot-password", { email });
}

export async function resetPassword(password: string, token: string) {
  return apiPost("/auth/reset-password", { password, token });
}

// ============================================================
// WORKERS API
// ============================================================

export async function getWorkers(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/workers?${params.toString()}`);
}

export async function getWorker(id: string) {
  return apiGet(`/workers/${id}`);
}

export async function createWorker(data: Record<string, unknown>) {
  return apiPost("/workers", data);
}

export async function updateWorker(id: string, data: Record<string, unknown>) {
  return apiPut(`/workers/${id}`, data);
}

export async function deleteWorker(id: string) {
  return apiDelete(`/workers/${id}`);
}

export async function searchWorkers(filters: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/workers?${params.toString()}`);
}

// ============================================================
// HOMEOWNERS API
// ============================================================

export async function getHomeowners(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/homeowners?${params.toString()}`);
}

export async function getHomeowner(id: string) {
  return apiGet(`/homeowners/${id}`);
}

export async function createHomeowner(data: Record<string, unknown>) {
  return apiPost("/homeowners", data);
}

export async function updateHomeowner(id: string, data: Record<string, unknown>) {
  return apiPut(`/homeowners/${id}`, data);
}

export async function deleteHomeowner(id: string) {
  return apiDelete(`/homeowners/${id}`);
}

// ============================================================
// BOOKINGS API
// ============================================================

export async function getBookings(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/bookings?${params.toString()}`);
}

export async function getBooking(id: string) {
  return apiGet(`/bookings/${id}`);
}

export async function createBooking(data: Record<string, unknown>) {
  return apiPost("/bookings", data);
}

export async function updateBooking(id: string, data: Record<string, unknown>) {
  return apiPut(`/bookings/${id}`, data);
}

export async function deleteBooking(id: string) {
  return apiDelete(`/bookings/${id}`);
}

// ============================================================
// PAYMENTS API
// ============================================================

export async function getPayments(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/payments?${params.toString()}`);
}

export async function getPayment(id: string) {
  return apiGet(`/payments/${id}`);
}

export async function createPayment(data: Record<string, unknown>) {
  return apiPost("/payments", data);
}

export async function verifyPayment(transactionId: string) {
  return apiPost("/payments/verify", { transactionId });
}

export async function initializePayPackPayment(data: {
  amount: number;
  phone: string;
  description?: string;
  reference?: string;
}) {
  return apiPost("/payments/paypack/initialize", data);
}

export async function verifyPayPackPayment(transactionId: string) {
  return apiPost("/payments/paypack/verify", { transactionId });
}

// ============================================================
// SERVICES API
// ============================================================

export async function getServices(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/services?${params.toString()}`);
}

export async function getService(id: string) {
  return apiGet(`/services/${id}`);
}

export async function createService(data: Record<string, unknown>) {
  return apiPost("/services", data);
}

export async function updateService(id: string, data: Record<string, unknown>) {
  return apiPut(`/services/${id}`, data);
}

export async function deleteService(id: string) {
  return apiDelete(`/services/${id}`);
}

// ============================================================
// TRAININGS API
// ============================================================

export async function getTrainings(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/trainings?${params.toString()}`);
}

export async function getTraining(id: string) {
  return apiGet(`/trainings/${id}`);
}

export async function createTraining(data: Record<string, unknown>) {
  return apiPost("/trainings", data);
}

export async function updateTraining(id: string, data: Record<string, unknown>) {
  return apiPut(`/trainings/${id}`, data);
}

export async function deleteTraining(id: string) {
  return apiDelete(`/trainings/${id}`);
}

// ============================================================
// REPORTS API
// ============================================================

export async function getReports(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  return apiGet(`/reports?${params.toString()}`);
}

export async function getReport(id: string) {
  return apiGet(`/reports/${id}`);
}

export async function createReport(data: Record<string, unknown>) {
  return apiPost("/reports", data);
}

export async function updateReport(id: string, data: Record<string, unknown>) {
  return apiPut(`/reports/${id}`, data);
}

export async function deleteReport(id: string) {
  return apiDelete(`/reports/${id}`);
}

// ============================================================
// OPTIONS/DROPDOWNS API
// ============================================================

export async function getGenders() {
  return apiGet<ListResponse<OptionItem>>("/options/genders", true);
}

export async function getMaritalStatuses() {
  return apiGet<ListResponse<OptionItem>>("/options/marital-statuses", true);
}

export async function getServiceTypes() {
  return apiGet<ListResponse<OptionItem>>("/options/service-types", true);
}

export async function getInsuranceCompanies() {
  return apiGet<ListResponse<OptionItem>>("/options/insurance-companies", true);
}

export async function getPaymentMethods() {
  return apiGet<ListResponse<OptionItem>>("/options/payment-methods", true);
}

export async function getReportTypes() {
  return apiGet<ListResponse<OptionItem>>("/options/report-types", true);
}

export async function getTrainingCategories() {
  return apiGet<ListResponse<OptionItem>>("/options/training-categories", true);
}

export async function getWageUnits() {
  return apiGet<ListResponse<OptionItem>>("/options/wage-units", true);
}

export async function getLanguageLevels() {
  return apiGet<ListResponse<OptionItem>>("/options/language-levels", true);
}

export async function getResidenceTypes() {
  return apiGet<ListResponse<OptionItem>>("/options/residence-types", true);
}

export async function getWorkerInfoOptions() {
  return apiGet<ListResponse<OptionItem>>("/options/worker-info-options", true);
}

export async function getCriminalRecordOptions() {
  return apiGet<ListResponse<OptionItem>>(
    "/options/criminal-record-options",
    true,
  );
}

export async function getSmokingDrinkingOptions() {
  return apiGet<ListResponse<OptionItem>>(
    "/options/smoking-drinking-options",
    true,
  );
}
