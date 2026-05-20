// import axios from "axios";
// import { getBackendUrl } from "./backendUrls"
// import { refreshToken } from "@/services/userUrls";
// import type { AxiosRequestConfig, AxiosResponse } from "axios";
// import { redirectToLogin } from "@/utils/navigation";

// const backendUrl = getBackendUrl();

// const axiosAuth = axios.create({
//   baseURL: `${backendUrl}`,
//   timeout: 30000,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // Enable sending cookies with requests
// });

// // Add an interceptor for request
// axiosAuth.interceptors.request.use(
//   (config) => {
//     // No need to manually attach Authorization header - cookies handle authentication
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// let refreshInProgress = false;

// interface QueuedRequest {
//   resolve: (response: AxiosResponse) => void;
//   reject: (error: unknown) => void;
//   requestConfig: AxiosRequestConfig & { _retry?: boolean };
// }

// let pendingRequests: QueuedRequest[] = [];

// const flushPendingRequests = async (error?: unknown): Promise<void> => {
//   const queue = pendingRequests;
//   pendingRequests = [];

//   if (error) {
//     queue.forEach(({ reject }) => reject(error));
//     return;
//   }

//   await Promise.all(
//     queue.map(async ({ requestConfig, resolve, reject }) => {
//       try {
//         const response = await axiosAuth(requestConfig);
//         resolve(response);
//       } catch (requestError) {
//         reject(requestError);
//       }
//     }),
//   );
// };

// // Track refresh token failures for auto-logout
// interface RefreshFailure {
//   timestamp: number;
// }

// let refreshFailures: RefreshFailure[] = [];
// const REFRESH_FAILURE_THRESHOLD = 3; // Number of failures to trigger logout
// const REFRESH_FAILURE_WINDOW = 60 * 1000; // 1 minute in milliseconds

// // Helper function to clean up old failures outside the time window
// const cleanupOldFailures = (): void => {
//   const now = Date.now();
//   refreshFailures = refreshFailures.filter(
//     (failure) => now - failure.timestamp < REFRESH_FAILURE_WINDOW,
//   );
// };

// // Helper function to track refresh failure and check if logout is needed
// const trackRefreshFailure = (): boolean => {
//   const now = Date.now();

//   // Add current failure
//   refreshFailures.push({ timestamp: now });

//   // Clean up failures outside the time window
//   cleanupOldFailures();

//   // If we have 3 or more failures within the window, trigger logout
//   if (refreshFailures.length >= REFRESH_FAILURE_THRESHOLD) {
//     // console.warn(
//     //   `Token refresh failed ${refreshFailures.length} times in ${REFRESH_FAILURE_WINDOW / 1000} seconds. Auto-logging out.`,
//     // );
//     refreshFailures = []; // Reset failures on logout
//     return true; // Signal that we should logout
//   }

//   return false;
// };

// // Helper function to clear refresh failures on successful refresh
// const clearRefreshFailures = (): void => {
//   refreshFailures = [];
// };

// // Add an interceptor for response error handling, specifically for 401 Unauthorized
// axiosAuth.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // Handle timeout errors
//     if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
//       // console.error("Request timeout or network error:", error.message);
//       return Promise.reject(error);
//     }

//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // Token expired - try refreshing the token
//       if (refreshInProgress) {
//         // If a refresh is already in progress, add the request to the queue
//         return new Promise((resolve, reject) => {
//           pendingRequests.push({
//             resolve: resolve as (response: AxiosResponse) => void,
//             reject,
//             requestConfig: originalRequest,
//           });
//         });
//       }

//       originalRequest._retry = true;
//       refreshInProgress = true;

//       try {
//         // Refresh token is now in httpOnly cookie, no need to pass it explicitly
//         const [status, response] = await refreshToken({});

//         if (status !== 200) {
//           throw new Error("Failed to refresh token");
//         }

//         // Tokens are now set in httpOnly cookies by the server
//         // No need to store them in localStorage

//         // Clear any previous failures on successful refresh
//         clearRefreshFailures();

//         await flushPendingRequests();

//         return axiosAuth(originalRequest); // Retry the original request
//       } catch (error: any) {
//         // Handle error during token refresh (e.g., invalid refresh token)
//         // console.error("Token refresh failed:", error); // Add logging for debugging

//         await flushPendingRequests(error);

//         // Track the failure and check if we should auto-logout
//         const shouldLogout = trackRefreshFailure();

//         if (shouldLogout) {
//           // Auto-logout after 3 failures in 1 minute
//           const reason =
//             error.response?.data?.detail ||
//             "Session invalidated by another login";

//           // Clear any remaining client-side data
//           const keys = Object.keys(localStorage);
//           keys.forEach((key) => {
//             localStorage.removeItem(key);
//           });

//           // Set invalidation flags after clearing
//           localStorage.setItem("sessionInvalidated", "true");
//           localStorage.setItem("sessionInvalidationReason", reason);

//           redirectToLogin();
//         }

//         return Promise.reject(error);
//       } finally {
//         refreshInProgress = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosAuth;
