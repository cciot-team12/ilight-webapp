import apiClient from ".";

const alarmApi = {
    set: (alarm: string) => apiClient.post("/", { type: "alarm", command: "set", time: alarm }),
    unset: (alarm: string) => apiClient.post("/", { type: "alarm", command: "unset", time: alarm }),
    turnOn: (id: string) => apiClient.post("/", { type: "alarm-control", command: "on", id: id }),
    turnOff: (id: string) => apiClient.post("/", { type: "alarm-control", command: "off", id: id }),
    triggerAlarm: () => apiClient.post("/", { type: "alarm-control", command: "triggerAlarm" }),
    get: () => apiClient.get("/"),
}

export default alarmApi;