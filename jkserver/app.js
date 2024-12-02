const http = require("http");
const awsIot = require("aws-iot-device-sdk");
const axios = require("axios");
const moment = require("moment"); // For time handling
require("dotenv").config(); // Load environment variables

// AWS IoT Device Configuration
const device = awsIot.device({
  keyPath: process.env.KEY_PATH,
  certPath: process.env.CERT_PATH,
  caPath: process.env.CA_PATH,
  clientId: process.env.CLIENT_ID,
  host: process.env.HOST,
});

// State Variables
let alarms = []; // Array of alarms
let brightness = 0; // Current brightness (0-100)
let maxBrightness = 100; // Maximum brightness level
let sunriseActive = false; // Flag to track if sunrise simulation is active
let alarmEnabled = true; // Default: Alarm is enabled
const frontendEndpoint = "http://<frontend-ip>:<port>/alarm"; // Replace with your frontend's IP and port
let sunriseInterval = null;

function logAllAlarms() {
  console.log("Current Alarms:");
  if (alarms.length === 0) {
    console.log("No alarms set.");
  } else {
    alarms.forEach((alarm, index) => {
      console.log(
        `${index + 1}. Time: ${alarm.time}, Repeat: ${alarm.repeat.join(
          ", "
        )}, Disabled: ${alarm.disabled}`
      );
    });
  }
}
// Add a new alarm
function addAlarm(time, repeat) {
  alarms.push({ time, repeat, disabled: false }); // Add the disabled flag
  console.log(`Alarm added: ${time}, Repeat: ${repeat.join(", ")}`);
  logAllAlarms();
}

// Remove an alarm
function removeAlarm(time, repeat) {
  alarms = alarms.filter(
    (alarm) =>
      alarm.time !== time ||
      JSON.stringify(alarm.repeat) !== JSON.stringify(repeat)
  );
  console.log(`Alarm removed: ${time}, Repeat: ${repeat.join(", ")}`);
  logAllAlarms();
}

// Disable a specific alarm
function disableAlarm(time, repeat) {
  let found = false;
  alarms = alarms.map((alarm) => {
    if (
      alarm.time === time &&
      JSON.stringify(alarm.repeat) === JSON.stringify(repeat)
    ) {
      alarm.disabled = true; // Mark the alarm as disabled
      found = true;
    }
    return alarm;
  });

  if (found) {
    console.log(`Alarm disabled: ${time}, Repeat: ${repeat.join(", ")}`);
  } else {
    console.error(
      `No matching alarm found for time: ${time}, Repeat: ${repeat.join(", ")}`
    );
  }
  logAllAlarms();
}

// Enable a specific alarm
function enableAlarm(time, repeat) {
  let found = false;
  alarms = alarms.map((alarm) => {
    if (
      alarm.time === time &&
      JSON.stringify(alarm.repeat) === JSON.stringify(repeat)
    ) {
      alarm.disabled = false; // Enable the alarm
      found = true;
    }
    return alarm;
  });

  if (found) {
    console.log(`Alarm enabled: ${time}, Repeat: ${repeat.join(", ")}`);
  } else {
    console.error(
      `No matching alarm found for time: ${time}, Repeat: ${repeat.join(", ")}`
    );
  }
  logAllAlarms();
}

// Check and trigger alarms
function checkAlarms() {
  const now = moment();
  const currentTime = now.format("HH:mm");
  const currentDay = now.format("dddd"); // e.g., "Monday", "Tuesday"

  alarms.forEach((alarm) => {
    if (
      !alarm.disabled && // Skip disabled alarms
      alarm.time === currentTime &&
      (alarm.repeat.includes("daily") || alarm.repeat.includes(currentDay))
    ) {
      console.log(`Alarm triggered at ${currentTime} on ${currentDay}`);
      triggerAlarm(); // Trigger alarm actions
    }
  });
  logAllAlarms();
}

// Trigger Alarm
function triggerAlarm() {
  console.log("Alarm triggered!");
  device.publish(
    "status/alarm",
    JSON.stringify({ message: "Alarm triggered!" })
  );
  sendHttpRequestToFrontend({ type: "alarm", status: "triggered" });

  // **Start Sunrise Simulation when alarm triggers**
  if (!sunriseActive) {
    startSunriseSimulation();
  }
}

// Send HTTP request to frontend
async function sendHttpRequestToFrontend(payload) {
  try {
    const response = await axios.post(frontendEndpoint, payload);
    console.log(`HTTP request sent to frontend: ${JSON.stringify(payload)}`);
    console.log(`Frontend response: ${response.data}`);
  } catch (error) {
    console.error("Error sending HTTP request to frontend:", error.message);
  }
}

// Set Maximum Brightness
function setMaxBrightness(level) {
  maxBrightness = Math.min(100, Math.max(0, level)); // Ensure maxBrightness is between 0 and 100
  console.log(`Max brightness set to: ${maxBrightness}%`);
  device.publish("status/max-brightness", JSON.stringify({ maxBrightness })); //TODO update this to brightness topic
}

// Set Brightness
function setBrightness(level) {
  brightness = Math.min(maxBrightness, Math.max(0, level)); // Ensure brightness does not exceed maxBrightness
  console.log(`Brightness set to: ${brightness}%`);
  device.publish("status/brightness", JSON.stringify({ brightness }));
}

// Sunrise Simulation
function startSunriseSimulation() {
  console.log("Starting sunrise simulation...");
  sunriseActive = true;
  brightness = 0; // Start from 0 brightness
  let intervalCount = 0;
  const totalIntervals = 18; // 3 minutes = 180 seconds, divided into 18 steps (10 seconds per step)
  const brightnessStep = Math.ceil(maxBrightness / totalIntervals); // Increment per step based on maxBrightness

  // Clear any existing interval
  if (sunriseInterval !== null) {
    clearInterval(sunriseInterval);
  }

  sunriseInterval = setInterval(() => {
    if (intervalCount < totalIntervals && sunriseActive) {
      setBrightness(brightness + brightnessStep); // Increment brightness
      intervalCount++;
    } else {
      clearInterval(sunriseInterval);
      sunriseInterval = null;
      sunriseActive = false;
      console.log("Sunrise simulation complete");
    }
  }, 1000); // Increase brightness every 1 second
}

function stopSunriseSimulation() {
  console.log("Stopping sunrise simulation...");
  if (sunriseInterval !== null) {
    clearInterval(sunriseInterval);
    sunriseInterval = null;
  }
  sunriseActive = false;
  setBrightness(0); // Reset brightness to 0
  console.log("Sunrise simulation stopped");
}

// Handle brightness commands, including setting max brightness
function handleBrightnessCommand(data) {
  if (data.command === "increase") {
    setBrightness(brightness + 10);
  } else if (data.command === "decrease") {
    setBrightness(brightness - 10);
  } else if (data.command === "setMax") {
    setMaxBrightness(100); // Set max brightness
  } else if (data.command === "turnOff") {
    setMaxBrightness(0); // Set max brightness
  } else {
    console.error("Unknown brightness command:", data.command);
  }
}

// Handle alarm commands, including disable and enable
function handleAlarmCommand(data) {
  if (data.command === "set") {
    addAlarm(data.time, ["daily"]); // Add a daily alarm
  } else if (data.command === "remove") {
    removeAlarm(data.time, ["daily"]); // Remove a specific daily alarm
  } else if (data.command === "disable") {
    disableAlarm(data.time, ["daily"]); // Disable a specific daily alarm
  } else if (data.command === "enable") {
    enableAlarm(data.time, ["daily"]); // Enable a specific daily alarm
  } else if (data.message === "Alarm turned off") {
    stopSunriseSimulation();
  } else {
    console.error("Unknown alarm command:", data.command);
  }
}

function handleAlarmControlCommand(data) {
  if (data.command === "on") {
    alarmEnabled = true;
    console.log("Alarm enabled");
  } else if (data.command === "off") {
    alarmEnabled = false;
    console.log("Alarm disabled");
  } else if (data.command === "triggerAlarm") {
    console.log("Alarm triggered");
    device.publish(
      "status/alarm",
      JSON.stringify({ message: "Alarm triggered!" })
    );
    startSunriseSimulation();
  } else {
    console.error("Unknown alarm control command:", data.command);
  }
}

// Type Mapping
const typeMapping = {
  alarm: handleAlarmCommand,
  brightness: handleBrightnessCommand,
  "alarm-control": handleAlarmControlCommand,
};

// MQTT Event: Device Connected
device.on("connect", () => {
  const topic = "status/alarm";
  console.log("Connected to AWS IoT");
  device.subscribe(topic);
  console.log("Subscribed to topic: ", topic);
});

// MQTT Event: Message Received
device.on("message", (topic, payload) => {
  const message = JSON.parse(payload.toString());
  console.log(`MQTT message received on topic "${topic}":`, message);
  if (topic === "status/alarm") handleAlarmCommand(message);
});

// HTTP Server
const server = http.createServer((req, res) => {
  // **Set CORS headers for all responses**
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allowed headers
  // **Handle preflight OPTIONS request**
  if (req.method === "OPTIONS") {
    res.writeHead(204); // No Content
    res.end();
    return;
  }
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        console.log("Received HTTP input:", data);
        if (data.type && typeMapping[data.type]) {
          typeMapping[data.type](data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ status: "success", message: "Command processed" })
          );
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "error",
              message: "Invalid type or command",
            })
          );
        }
      } catch (err) {
        console.error("Error parsing HTTP input:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "error", message: "Method not allowed" }));
  }
});

// Start HTTP Server
server.listen(3000, () => {
  console.log("HTTP server is listening on port 3000");
});

// Periodic Alarm Check
setInterval(checkAlarms, 60000);
