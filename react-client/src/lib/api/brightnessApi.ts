import apiClient from ".";

const brightnessApi = {
    increase: () => apiClient.post("/", { type: "brightness", command: "increase" }),
    decrease: () => apiClient.post("/", { type: "brightness", command: "decrease" }),
    turnOn: () => apiClient.post("/", { type: "brightness", command: "turnOn" }),
    turnOff: () => apiClient.post("/", { type: "brightness", command: "turnOff" }),
    increaseMaxBrightness: (maxBrightness: number) => apiClient.post("/", { type: "brightness", command: "setMax", maxBrightness: maxBrightness }),
}

export default brightnessApi;