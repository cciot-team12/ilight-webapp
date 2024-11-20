# cciot-dashboard

1. Alarm Configuration
This structure represents an alarm's configuration data, such as time, light intensity, and user preferences.

typescript
Copy code
type AlarmConfig = {
  id: string; // Unique identifier for the alarm
  userId: string; // Associated user
  time: string; // ISO 8601 format (e.g., "07:30:00")
  repeatDays: string[]; // Days to repeat (e.g., ["Monday", "Wednesday"])
  lightIntensity: number; // Percentage (0-100)
  isActive: boolean; // Whether the alarm is currently active
  createdAt: Date; // Timestamp when the alarm was created
  updatedAt?: Date; // Timestamp for the last update
};
2. User Data
This structure represents a user’s profile, storing personal details and preferences.

typescript
Copy code
type User = {
  id: string; // Unique identifier for the user
  name: string; // User's full name
  email: string; // Email address for login and notifications
  alarms: AlarmConfig[]; // List of user's alarms
  createdAt: Date; // Account creation timestamp
};
3. MQTT Message Payload
This structure represents the MQTT message payload exchanged between the ESP32 and the backend.

typescript
Copy code
type MqttPayload = {
  deviceId: string; // Unique ID for the ESP32 device
  action: "TURN_ON" | "TURN_OFF" | "UPDATE_STATUS"; // Action type
  alarmId?: string; // Alarm being modified (optional for some actions)
  lightIntensity?: number; // Light intensity (0-100)
  status?: "ON" | "OFF"; // Current light state
  timestamp: Date; // Timestamp for the message
};
4. Real-Time WebSocket Update
This structure is used to send updates to the frontend via WebSocket.

typescript
Copy code
type WebSocketUpdate = {
  event: "ALARM_TRIGGERED" | "STATUS_UPDATE" | "ALARM_MODIFIED"; // Type of event
  data: {
    alarmId?: string; // Optional alarm-related info
    status?: "ON" | "OFF"; // Current light state
    time?: string; // Time of the alarm
    lightIntensity?: number; // Current light intensity
  };
};
5. Backend API Request/Response Types
These structures represent the request and response payloads for the backend APIs.

Request: Create/Update Alarm
typescript
Copy code
type CreateAlarmRequest = {
  userId: string; // ID of the user
  time: string; // Alarm time in ISO 8601
  repeatDays: string[]; // Days to repeat
  lightIntensity: number; // Light intensity
  isActive: boolean; // Whether the alarm is active
};
Response: Generic API Response
typescript
Copy code
type ApiResponse<T> = {
  success: boolean; // Whether the operation succeeded
  message: string; // Human-readable message
  data?: T; // Optional payload (e.g., created alarm)
};
6. Database Schema Mapping
The database should use these types as references for schemas. For PostgreSQL:

Users Table

sql
Copy code
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
Alarms Table

sql
Copy code
CREATE TABLE alarms (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    time TIME NOT NULL,
    repeat_days VARCHAR[] NOT NULL,
    light_intensity INTEGER CHECK (light_intensity BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
7. Combining the Structures in Node.js
Here’s how you can implement the data structures in a TypeScript-based Node.js project.

typescript
Copy code
// Import necessary libraries
import { v4 as uuidv4 } from "uuid";

// Example: Creating a new alarm
const newAlarm: AlarmConfig = {
  id: uuidv4(),
  userId: uuidv4(),
  time: "07:30:00",
  repeatDays: ["Monday", "Wednesday"],
  lightIntensity: 80,
  isActive: true,
  createdAt: new Date(),
};

// Example: Sending an MQTT payload
const mqttMessage: MqttPayload = {
  deviceId: "ESP32-001",
  action: "TURN_ON",
  lightIntensity: 80,
  timestamp: new Date(),
};

// Example: WebSocket update
const wsUpdate: WebSocketUpdate = {
  event: "ALARM_TRIGGERED",
  data: {
    alarmId: newAlarm.id,
    status: "ON",
    lightIntensity: 80,
  },
};
