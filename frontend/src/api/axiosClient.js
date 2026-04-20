/**
 * Axios HTTP Client Configuration
 * 
 * Centralized Axios instance for all API calls to the Depression Predictor backend.
 * Configures base URL, headers, and response interceptors.
 */

import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});



/**
 * Response interceptor
 * 
 * Handles errors consistently across the app
 * Logs errors to console for debugging
 */
axiosClient.interceptors.response.use(
  (response) => {
    // Log full response for debugging
    console.log('🔵 Full Axios Response:', response);
    console.log('🔵 Response Data:', response.data);
    // Return response data directly for cleaner usage
    return response.data;
  },
  (error) => {
    // Log error details for debugging
    console.error('🔴 Axios Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
      })
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server:', error.request)
    } else {
      // Error in request setup
      console.error('Request error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

/**
 * Request interceptor (optional)
 * 
 * Add authentication headers if needed in the future
 */
axiosClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => Promise.reject(error)
)

export default axiosClient;
