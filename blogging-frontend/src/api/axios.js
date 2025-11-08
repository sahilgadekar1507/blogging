import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Add access token to all requests
API.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("token");
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle expired access token (401 → call refresh)
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only refresh once per failed request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // Call refresh route
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken
        });

        // Save new access token
        localStorage.setItem("token", res.data.accessToken);

        // Update the request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        // Retry the original request
        return API(originalRequest);

      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
