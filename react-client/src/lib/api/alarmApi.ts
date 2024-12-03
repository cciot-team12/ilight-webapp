import apiClient from ".";

const alarmApi = {
    set: (alarm: string) => apiClient.post("/", { type: "alarm", command: "set", time: alarm }),
    unset: (alarm: string) => apiClient.post("/", { type: "alarm", command: "unset", time: alarm }),
    turnOn: () => apiClient.post("/", { type: "alarm-control", command: "on" }),
    turnOff: () => apiClient.post("/", { type: "alarm-control", command: "off" }),
    triggerAlarm: () => apiClient.post("/", { type: "alarm-control", command: "triggerAlarm" }),
    get: () => apiClient.get("/"),
}

export default alarmApi;