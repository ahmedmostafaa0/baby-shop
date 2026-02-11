import useAuthStore from "@/store/useAuthStore";
import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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

  let isRefreshing = false;
  let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; config: any; }[] = [];

  const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const newAccessToken = response.data?.accessToken;
      if (newAccessToken) {
        useAuthStore.getState().setToken(newAccessToken);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;
      if (!originalRequest) {
        return Promise.reject(error);
      }
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject, config: originalRequest });
          }).then(token => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
            const newAccessToken = data.accessToken;
            useAuthStore.getState().setToken(newAccessToken);
            instance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            resolve(instance(originalRequest));
          } catch (refreshError) {
            processQueue(refreshError as AxiosError);
            useAuthStore.getState().clearAuth();
            const publicPaths = ["/login", "/register"];
            if (!publicPaths.includes(location.pathname)) {
              location.href = "/login";
            }
            reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        });
      }

      if (error.code === "ERR_NETWORK") {
        console.error(
          "Network Error: Unable to connect to the server. Please check if the server is running",
        );
      }
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
        const publicPaths = ["/login", "/register"];
        if (!publicPaths.includes(location.pathname)) {
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