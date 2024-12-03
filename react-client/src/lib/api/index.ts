import axios from "axios";

const apiClient = axios.create({
    baseURL: `https://${import.meta.env.VITE_SERVER_URL}`,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;