import axios, { AxiosResponse, AxiosError } from "axios";

// Define interface for API error response
interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

// Configure API with defaults and interceptors
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Log errors for debugging
    console.error("API Error:", error?.response?.data || error.message);

    // Enhance error with more context
    return Promise.reject({
      ...error,
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
    });
  },
);

export { api };
export type { AxiosResponse, AxiosError, ApiErrorResponse };

// Type guard to check if an error is an AxiosError
export const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};
