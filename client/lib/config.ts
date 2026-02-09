import useAuth from "@/hooks/useAuth";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

interface AdminApiConfig {
  baseURL: string;
  isProduction: boolean;
}

export const getAdminApiConfig = (): AdminApiConfig => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("API Url is not defined");
  }
  const isProduction =
    process.env.NEXT_PUBLIC_APP_ENV === "production" ||
    process.env.NODE_ENV === 'production';

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
      const token = useAuth.getState().token;
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
        useAuth.getState().setToken(newAccessToken);
      }
      return response;
    },
    (error) => {
      if (error.code === "ERR_NETWORK") {
        console.error(
          "Network Error: Unable to connect to the server. Please check if the server is running",
        );
      }
      if (error.response?.status === 401) {
        useAuth.getState().clearAuth();
        
        const publicPaths = ["/auth/signin", "/auth/signup"];
        if (!publicPaths.includes(location.pathname)) {
          location.href = "/auth/signin";
        }
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

export const api = createApiInstance();

export default api;