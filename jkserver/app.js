const http = require('http');
const awsIot = require('aws-iot-device-sdk');
require('dotenv').config();
const moment = require('moment'); // For time handling

// AWS IoT Device Configuration
const device = awsIot.device({
  keyPath: process.env.KEY_PATH,
  certPath: process.env.CERT_PATH,
  caPath: process.env.CA_PATH,
  clientId: process.env.CLIENT_ID,
  host: process.env.HOST
});

// State Variables
let alarmTime = null; // The alarm time, e.g., "14:30"
let brightness = 0; // Default brightness (0-100)
let sunriseActive = false; // Flag to track if sunrise simulation is active
let alarmEnabled = true; // Default: Alarm is enabled

function setBrightness(level) {
  brightness = Math.min(100, Math.max(0, level)); // Ensure brightness is between 0 and 100
  console.log(`Brightness set to: ${brightness}%`);
  device.publish('status/brightness', JSON.stringify({ brightness }));
}

function startSunriseSimulation() {
  console.log('Starting sunrise simulation...');
  sunriseActive = true;
  let intervalCount = 0;
  const totalIntervals = 18; // 3 minutes = 180 seconds, divided into 18 steps (10 seconds per step)
  const brightnessStep = Math.ceil(100 / totalIntervals); // Increment per step

  const sunriseInterval = setInterval(() => {
    if (intervalCount < totalIntervals) {
      setBrightness(brightness + brightnessStep);
      intervalCount++;
    } else {
      clearInterval(sunriseInterval);
      sunriseActive = false;
      console.log('Sunrise simulation complete');
    }
  }, 10000); // Increase brightness every 10 seconds
}

function checkAlarm() {
  const currentTime = moment().format('HH:mm'); // Get current time in HH:mm format

  if (!alarmEnabled) {
    return; // Do nothing if the alarm is disabled
  }

  if (alarmTime && moment(alarmTime, 'HH:mm').subtract(3, 'minutes').format('HH:mm') === currentTime && !sunriseActive) {
    startSunriseSimulation();
  }

  if (alarmTime && currentTime === alarmTime) {
    console.log('Alarm triggered!');
    device.publish('status/alarm', JSON.stringify({ message: 'Alarm triggered!' }));
    alarmTime = null; // Clear the alarm to prevent multiple triggers
  }
}

function handleAlarmCommand(data) {
  if (data.command === 'set') {
    alarmTime = data.time; // Set the alarm time
    console.log(`Alarm time set to: ${alarmTime}`);
  } else {
    console.error('Unknown alarm command:', data.command);
  }
}

function handleBrightnessCommand(data) {
  if (data.command === 'increase') {
    setBrightness(brightness + 10);
  } else if (data.command === 'decrease') {
    setBrightness(brightness - 10);
  } else {
    console.error('Unknown brightness command:', data.command);
  }
}

function handleAlarmControlCommand(data) {
  if (data.command === 'on') {
    alarmEnabled = true;
    console.log('Alarm enabled');
  } else if (data.command === 'off') {
    alarmEnabled = false;
    console.log('Alarm disabled');
  } else {
    console.error('Unknown alarm control command:', data.command);
  }
}

const typeMapping = {
  alarm: handleAlarmCommand,
  brightness: handleBrightnessCommand,
  'alarm-control': handleAlarmControlCommand
};

// Set up HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';

    // Collect incoming data
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body); // Parse JSON input
        console.log('Received HTTP input:', data);

        // Route the input to the appropriate handler
        if (data.type && typeMapping[data.type]) {
          typeMapping[data.type](data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success', message: 'Command processed' }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: 'Invalid type or command' }));
        }
      } catch (err) {
        console.error('Error parsing HTTP input:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Method not allowed' }));
  }
});

// Start the HTTP server
server.listen(3000, () => {
  console.log('HTTP server is listening on port 3000');
});

// Periodic Alarm Check
setInterval(checkAlarm, 1000);
