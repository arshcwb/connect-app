import axios from "axios";

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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await api.post("/user/refresh-token");
                return api(originalRequest);
            } catch (refreshError) {
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