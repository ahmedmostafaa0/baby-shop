import useAuthStore from "@/store/useAuthStore";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

interface AdminApiConfig {
  baseURL: string;
  isProduction: boolean;
}

export const getAdminApiConfig = (): AdminApiConfig => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error("API Url is not defined");
  }
  const isProduction =
    import.meta.env.VITE_APP_ENV === "production" ||
    import.meta.env.PROD === true;

  return {
    baseURL: `${apiUrl}/api`,
    isProduction,
  };
};

const createApiInstance = (): AxiosInstance => {
  const { baseURL } = getAdminApiConfig();
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 60 * 1000,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const newAccessToken = response.headers["x-access-token"];
      if (newAccessToken) {
        useAuthStore.getState().setToken(newAccessToken);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.code === "ERR_NETWORK") {
        console.error(
          "Network Error: Unable to connect to the server. Please check if the server is running",
        );
      }
          if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await instance.get("/auth/profile");
        return instance(originalRequest);
      } catch (err) {
        useAuthStore.getState().clearAuth();
        location.href = "/login";
      }
    }

    return Promise.reject(error);

    },
  );
  return instance;
};

export const api = createApiInstance();

export default api;