import apiClient from ".";

const brightnessApi = {
    increase: () => apiClient.post("/", { type: "brightness", command: "increase" }),
    decrease: () => apiClient.post("/", { type: "brightness", command: "decrease" }),
}

export default brightnessApi;