import axios from "axios";
import { logoutLocal } from "../features/auth/authSlice"; 

let store;

export const injectStore = (_store) => {
    store = _store;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            originalRequest.url.includes("/login") || 
            originalRequest.url.includes("/logout") ||
            originalRequest.url.includes("/refresh-token")
        ) {
            return Promise.reject(error);
        }

        if (originalRequest.url.includes("/user/me")) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/user/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Refresh failed, logging out...", refreshError);
                
                if (store) {
                    store.dispatch(logoutLocal());
                }
                
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;