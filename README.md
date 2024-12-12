# Link to presentation

For editing: https://www.canva.com/design/DAGV_P8oYL8/rmmz3Yk8NORneGSFHBDkhg/edit

View only: https://www.canva.com/design/DAGV_P8oYL8/x02Zj4_Y-8euoRlNDfDCDg/view?utm_content=DAGV_P8oYL8&utm_campaign=designshare&utm_medium=link&utm_source=editor

# System architecture

![CCIOT architecture-System architecture](https://github.com/user-attachments/assets/ed60f3bb-2803-4114-bc10-83b319529f95)

# Type definitions

1. Alarm Configuration
   This structure represents an alarm's configuration data, such as time, light intensity, and user preferences.

```typescript
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
```

2. User Data
   This structure represents a user’s profile, storing personal details and preferences.

```typescript
type User = {
    id: string; // Unique identifier for the user
    name: string; // User's full name
    email: string; // Email address for login and notifications
    alarms: AlarmConfig[]; // List of user's alarms
    createdAt: Date; // Account creation timestamp
    updatedAt?: Date; // Timestamp for the last update
};
```

3. MQTT Message Payload
   This structure represents the MQTT message payload exchanged between the ESP32 and the backend.

```typescript
type MqttPayload = {
    deviceId: string; // Unique ID for the ESP32 device
    action: "TURN_ON" | "TURN_OFF" | "UPDATE_STATUS"; // Action type
    alarmId?: string; // Alarm being modified (optional for some actions)
    lightIntensity?: number; // Light intensity (0-100)
    status?: "ON" | "OFF"; // Current light state
    timestamp: Date; // Timestamp for the message
};
```

4. Real-Time WebSocket Update
   This structure is used to send updates to the frontend via WebSocket.

```typescript
type WebSocketUpdate = {
    event: "ALARM_TRIGGERED" | "STATUS_UPDATE" | "ALARM_MODIFIED"; // Type of event
    data: {
        alarmId?: string; // Optional alarm-related info
        status?: "ON" | "OFF"; // Current light state
        time?: string; // Time of the alarm
        lightIntensity?: number; // Current light intensity
    };
};
```

5. Backend API Request/Response Types
   These structures represent the request and response payloads for the backend APIs.

Request: Create/Update Alarm

```typescript
type CreateAlarmRequest = {
    userId: string; // ID of the user
    time: string; // Alarm time in ISO 8601
    repeatDays: string[]; // Days to repeat
    lightIntensity: number; // Light intensity
    isActive: boolean; // Whether the alarm is active
};
```

Response: Generic API Response

```typescript
type ApiResponse<T> = {
    success: boolean; // Whether the operation succeeded
    message: string; // Human-readable message
    data?: T; // Optional payload (e.g., created alarm)
};
```

6. Database Schema Mapping
   The database should use these types as references for schemas. For PostgreSQL:

Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
    updated_at TIMESTAMP
);
```

Alarms Table

```sql
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
```

7. Combining the Structures in Node.js
   Here’s how you can implement the data structures in a TypeScript-based Node.js project.

```typescript
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
```

Setup instructions for:

# Frontend Setup instructions

Navigate to the frontend directory and install npm dependencies

```bash
cd react-client/ && npm i
```

Run the project

```bash
npm run dev
```

In our project, we also deployed the project to the cloud using cloudflare pages GUI. The steps can be followed here: https://developers.cloudflare.com/pages/get-started/git-integration/ 

---

# Backend on RPi + AWS IoT Setup Instructions

This guide outlines the steps to set up the ilightproj backend using Docker and Kubernetes, while ensuring the proper configuration of AWS environment variables.

---

## Prerequisites

1. **Docker Installed**: Ensure Docker is installed and running on your system.
2. **Kubernetes Cluster**: A Kubernetes cluster should be operational (e.g., k3s for Raspberry Pi).
3. **AWS Credentials**: Obtain AWS credentials and configure them in the `.env` file or as Kubernetes Secrets.
4. **kubectl Installed**: Verify `kubectl` is installed and configured to manage your Kubernetes cluster.

---

## Step 1: Configure AWS Environment Variables

Add the following AWS-related environment variables to your `.env` file:

```plaintext
KEY_PATH=<path-to-aws-private-key>
CERT_PATH=<path-to-aws-certificate>
CA_PATH=<path-to-aws-ca-certificate>
CLIENT_ID=<unique-client-id>
HOST=<aws-iot-host-url>
```

These variables are used for secure communication with AWS IoT Core.

---

## Step 2: Build the Docker Image

Navigate to the backend code directory (e.g., `RPi`):

1. Build the Docker image:

    ```bash
    docker build -t docker.io/ricinbeans/ilightproj-app:latest .
    ```

2. Push the image to a container registry (e.g., Docker Hub):
    ```bash
    docker push docker.io/ricinbeans/ilightproj-app:latest
    ```

Replace `ricinbeans` with your Docker Hub username if applicable.

## Step 3: Deploy to Kubernetes

1. Apply the Kubernetes configuration:

    ```bash
    kubectl apply -f deployment.yaml
    ```

2. Verify the deployment and service:

    ```bash
    kubectl get pods
    kubectl get svc
    ```

3. Access the service using the NodePort:
    ```bash
    kubectl describe svc ilightproj-service
    ```
    Use the `NodePort` value (e.g., `30462`) and the node IP to access the backend: `http://<node-ip>:<node-port>`.

---

PostgresDB
Hardware
