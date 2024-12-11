#include "Secrets.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "WiFi.h"
#include <Adafruit_NeoPixel.h>

#define AWS_IOT_SUBSCRIBE_TOPIC "status/brightness"
#define AWS_IOT_PUBLISH_TOPIC "status/alarm"

// Pin connected to the NeoPixel ring (DIN pin)
#define PIXEL_PIN 3
#define NUM_PIXELS 12  // Modify this based on your LED ring size

#define SWITCH_PIN 22  // GPIO pin for the switch

WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

// Create a NeoPixel object
Adafruit_NeoPixel strip(NUM_PIXELS, PIXEL_PIN, NEO_GRB + NEO_KHZ800);

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.println("Connecting to Wi-Fi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("Wi-Fi Connected!");

  // Configure WiFiClientSecure to use the AWS IoT device credentials
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  // Connect to the MQTT broker on the AWS endpoint we defined earlier
  client.setServer(AWS_IOT_ENDPOINT, 8883);

  // Create a message handler
  client.setCallback(messageHandler);

  Serial.println("Connecting to AWS IoT...");

  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }

  if (!client.connected()) {
    Serial.println("AWS IoT Timeout!");
    return;
  }

  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);

  Serial.println("AWS IoT Connected!");
}

void messageHandler(char* topic, byte* payload, unsigned int length) {
  Serial.print("incoming: ");
  Serial.println(topic);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("Error parsing JSON: ");
    Serial.println(error.c_str());
    return;
  }

  // Extract brightness value
  int brightness = doc["brightness"];
  Serial.print("Brightness value received: ");
  Serial.println(brightness);

  // Validate brightness range (0–100)
  if (brightness < 0) brightness = 0;
  if (brightness > 100) brightness = 100;

  // Set the brightness level
  setBrightness(brightness);
}

void setBrightness(int brightnessPercentage) {
  // Map brightness percentage (0–100) to NeoPixel brightness scale (0–255)
  int brightnessLevel = map(brightnessPercentage, 0, 100, 0, 255);

  Serial.print("Setting brightness level to: ");
  Serial.println(brightnessLevel);

  for (int i = 0; i < NUM_PIXELS; i++) {
    strip.setPixelColor(i, strip.Color(brightnessLevel, brightnessLevel, brightnessLevel));  // White light with adjusted brightness
  }
  strip.show();  // Apply the brightness changes
}

void checkSwitch() {
  static bool lastSwitchState = HIGH;  // Assume switch is not pressed initially
  bool currentSwitchState = digitalRead(SWITCH_PIN);

  // Check if the switch state changed from HIGH to LOW (pressed)
  if (lastSwitchState == HIGH && currentSwitchState == LOW) {
    Serial.println("Switch pressed, sending MQTT message...");

    // Create the JSON message
    StaticJsonDocument<200> doc;
    doc["message"] = "Alarm turned off";

    char jsonBuffer[128];
    serializeJson(doc, jsonBuffer);

    // Publish the message to AWS IoT
    if (client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer)) {
      Serial.println("Message sent successfully!");
    } else {
      Serial.println("Failed to send message.");
    }
  }

  // Update the last switch state
  lastSwitchState = currentSwitchState;
}

void setup() {
  Serial.begin(115200);
  connectAWS();

  // Initialize the NeoPixel strip
  strip.begin();
  strip.show();  // Initialize all pixels to 'off'

  // Configure the switch pin as input with pull-up resistor
  pinMode(SWITCH_PIN, INPUT_PULLUP);
}

void loop() {
  client.loop();
  checkSwitch();  // Check if the switch is pressed
  delay(100);
}
