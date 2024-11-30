import axios from "axios";

const apiClient = axios.create({
    baseURL: `http://${import.meta.env.VITE_SERVER_URL}:${import.meta.env.VITE_SERVER_PORT}`,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;