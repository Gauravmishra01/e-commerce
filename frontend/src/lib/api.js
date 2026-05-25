import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const normalizedConfiguredBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, "")
  : "";

const fallbackBaseUrl = import.meta.env.DEV
  ? "http://localhost:8000/api/v1"
  : "/api/v1";

const api = axios.create({
  baseURL: normalizedConfiguredBaseUrl || fallbackBaseUrl,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  },
);

export default api;
