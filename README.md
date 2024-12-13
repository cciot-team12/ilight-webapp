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

# PostgresDB Setup Instructions

Add the following Postgres-releated enviornment variables to your `.env` file:

```
HOST=a2egqzjr3o735x-ats.iot.ap-southeast-1.amazonaws.com
USER=<postgresdb-user>
PASSWORD=<postgresdb-pw>
HOST=ilight.c1ee2wqcwgd4.ap-southeast-2.rds.amazonaws.com
DATABASE=ilight
PORT=5432
```

That's it! You can now run the project.

# Hardware Setup instructions 
This guide outlines the steps to set up the ilightproj hardware which uses ESP32 Wrover, NeoPixel Ring light, a Switch and a 5V power plug. It also details how to establish MQTT connection with AWS IoT Core.

## Step 1: Connect the components
Follow the diagram when connecting the wires.

![Screenshot 2024-12-13 105937](https://github.com/user-attachments/assets/19cc12c6-6b11-40b3-bb1e-8d4f14fb089a)

Connect the GPIO of the NeoPixel Ring light to PIN 3 of the ESP32.
Connect the GPIO of the switch to PIN 22 of the ESP32.

## Step 2: Create a Thing on AWS IOT Cloud, attach policies and save out the certificates and private key

Under All Devices>Things> Create Thing
![create things](https://github.com/user-attachments/assets/c88eac5c-ac1d-4420-8243-67a0c4dd4c38)

Single Thing> Give a name to the thing> 
![create things 2](https://github.com/user-attachments/assets/93b6cee2-a478-4fe2-bf6b-2f72bd2db795)
![create things 3](https://github.com/user-attachments/assets/7aa39517-6263-486c-866b-6a85f55cf420)

Automatically create certificate> Attach IlightESP32_MQTTPolicy > Download all the files in the popup
![create things 4](https://github.com/user-attachments/assets/43da850e-c5de-4d21-be60-27af62a20a2b)
![create things 5](https://github.com/user-attachments/assets/f60a2cc1-1bdb-4205-8ae2-329104a8431d)
![create things 6](https://github.com/user-attachments/assets/34ca4a0c-e3b4-42bc-a7e7-21c0e6ec925d)

## Step 3: Edit the Secrets.h file

At every comment that says change me, change out the dependencies. The following is to be changed:
- Thing name
- Wifi SSID
- Wifi Password
- Endpoint
- Amazon Root CA 1
- Device Certificate      
- Device Private Key
e.g
![thingname](https://github.com/user-attachments/assets/98c6d8ae-d294-4165-ac37-3e97dd9aa76c)
e.g
![private key](https://github.com/user-attachments/assets/5cf7d4be-7adf-4a57-90b9-d12ecb3d6656)

## Step 4: Flash the ESP32
Press once the Reset pin while flashing so that the old sketch can be removed

## Step 5: Check for confirmation message that connection is established
Open the serial monitor which is set to 115200 Baud rate, check for the following messages. The “...” output will continue until connection is established
![photo_6224332318819075757_y](https://github.com/user-attachments/assets/f73f8050-7021-4ac1-a471-ce4b2195bb50)
