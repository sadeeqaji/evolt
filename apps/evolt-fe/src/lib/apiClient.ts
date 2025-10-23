import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://krishna-incongruent-interconvertibly.ngrok-free.dev/api/v1",
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
