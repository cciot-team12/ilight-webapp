import apiClient from ".";

const alarmApi = {
    set: (alarm: string) => apiClient.post("/", { type: "alarm", command: "set", time: alarm }),
    unset: (alarm: string) => apiClient.post("/", { type: "alarm", command: "unset", time: alarm }),
} // e.g. 07:00 or delete row

export default alarmApi;