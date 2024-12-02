import apiClient from ".";

const brightnessApi = {
    increase: () => apiClient.post("/", { type: "brightness", command: "increase" }),
    decrease: () => apiClient.post("/", { type: "brightness", command: "decrease" }),
    turnOn: () => apiClient.post("/", { type: "brightness", command: "setMax" }),
    turnOff: () => apiClient.post("/", { type: "brightness", command: "turnOff" }),
}

export default brightnessApi;