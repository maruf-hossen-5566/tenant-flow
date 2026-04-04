import axios from "axios";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {useAuthStore} from "@/stores/auth-store.js";
import {logTheUserOut} from "@/lib/utils.js";

const client = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache",
        Pragma: "no-cache",
    },
});

client.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState()?.tokens?.access_token;
        const workspaceId = useWorkspaceStore.getState()?.activeWorkspace?.id;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        if (workspaceId) {
            config.headers["X-Tenant-ID"] = workspaceId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);


client.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        const unauthorized = error.response.status === 401 && error.response.data.detail === "Invalid auth credentials";

        if (unauthorized && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = useAuthStore.getState()?.tokens?.refresh_token;
                const response = await client.post('/auth/refresh-token', {refresh_token: refreshToken});
                const newTokens = response.data.tokens;
                useAuthStore.setState({"tokens": newTokens});
                originalRequest.headers.Authorization = `Bearer ${newTokens["access_token"]}`;
                return client(originalRequest);
            } catch (refreshError) {
                logTheUserOut()
                window.location.href = "/login"
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default client;
