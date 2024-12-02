import apiClient from ".";

const alarmApi = {
    set: (alarm: string) => apiClient.post("/", { type: "alarm", command: "set", time: alarm }),
    unset: (alarm: string) => apiClient.post("/", { type: "alarm", command: "unset", time: alarm }),
}

export default alarmApi;