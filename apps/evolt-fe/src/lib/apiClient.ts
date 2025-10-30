import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response ?? {};

    if (status === 401) {
      const isAuthRoute =
        config.url.includes("/auth/login") ||
        config.url.includes("/auth/nonce") ||
        config.url.includes("/auth/verify-signature");

      if (!isAuthRoute) {
        console.warn("API Client: Received 401, dispatching auth event.");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
