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

export default apiClient;
