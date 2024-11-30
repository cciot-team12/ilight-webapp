from machine import RTC
import ntptime
import os
import time
import ujson
import machine
import ssl
import network
from umqtt.simple import MQTTClient

# Enter your wifi SSID and password below.
wifi_ssid = "GSUS"
wifi_password = "sutdisfun"

# Enter your AWS IoT endpoint. You can find it in the Settings page of
# your AWS IoT Core console.
# https://docs.aws.amazon.com/iot/latest/developerguide/iot-connect-devices.html
aws_endpoint = b'a2egqzjr3o735x-ats.iot.ap-southeast-1.amazonaws.com'

# If you followed the blog, these names are already set.
thing_name = "IlightESP32"
client_id = "BlogClient"
private_key = "private.pem.key"
private_cert = "cert.pem.crt"

# Read the files used to authenticate to AWS IoT Core
with open(private_key, 'r') as f:
    key = f.read()
with open(private_cert, 'r') as f:
    cert = f.read()
# Read the root CA certificate
with open('AmazonRootCA1.pem', 'r') as f:
    ca_cert = f.read()

# These are the topics we will subscribe to. We will publish updates to /update.
# We will subscribe to the /update/delta topic to look for changes in the device shadow.
topic_pub = "$aws/things/" + thing_name + "/shadow/update"
topic_sub = "$aws/things/" + thing_name + "/shadow/update/delta"
# ssl_params = {"key": key, "cert": cert,
#               "ca_certs": ca_cert, "server_side": False}

# SSL parameters
ssl_params = {
    "key": key,
    "cert": cert,
    "ca": ca_cert,
    "server_hostname": aws_endpoint
}

# Define pins for LED and light sensor. In this example we are using a FeatherS2.
# The sensor and LED are built into the board, and no external connections are required.
light_sensor = machine.ADC(machine.Pin(4))
light_sensor.atten(machine.ADC.ATTN_11DB)
led = machine.Pin(13, machine.Pin.OUT)
info = os.uname()

# Connect to the wireless network
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
if not wlan.isconnected():
    print('Connecting to network...')
    wlan.connect(wifi_ssid, wifi_password)
    while not wlan.isconnected():
        pass

    print('Connection successful')
    print('Network config:', wlan.ifconfig())


# Set the timezone offset in seconds (e.g., for UTC+0, offset = 0)
timezone_offset = 8 * 3600

print("Synchronizing time...")
try:
    ntptime.settime()
    # Apply timezone offset
    rtc = RTC()
    tm = rtc.datetime()
    rtc.datetime((
        tm[0], tm[1], tm[2], tm[3],
        tm[4] + timezone_offset // 3600,
        tm[5], tm[6], tm[7]
    ))
    print("Time synchronized")
except Exception as e:
    print("Failed to synchronize time:", e)


def mqtt_connect(client=client_id, endpoint=aws_endpoint, sslp=ssl_params):
    mqtt = MQTTClient(client_id=client, server=endpoint,
                      port=8883, keepalive=1200, ssl=True, ssl_params=sslp)
    print("Connecting to AWS IoT...")
    mqtt.connect()
    print("Done")
    return mqtt


def mqtt_publish(client, topic=topic_pub, message=''):
    print("Publishing message...")
    client.publish(topic, message)
    print(message)


def mqtt_subscribe(topic, msg):
    print("Message received...")
    message = ujson.loads(msg)
    print(topic, message)
    if message['state']['led']:
        led_state(message)
    print("Done")


def led_state(message):
    led.value(message['state']['led']['onboard'])


# We use our helper function to connect to AWS IoT Core.
# The callback function mqtt_subscribe is what will be called if we
# get a new message on topic_sub.
try:
    mqtt = mqtt_connect()
    mqtt.set_callback(mqtt_subscribe)
    mqtt.subscribe(topic_sub)
except:
    print("Unable to connect to MQTT.")


while True:
    # Check for messages.
    try:
        mqtt.check_msg()
    except:
        print("Unable to check for messages.")

    mesg = ujson.dumps({
        "state": {
            "reported": {
                "device": {
                    "client": client_id,
                    "uptime": time.ticks_ms(),
                    "hardware": info[0],
                    "firmware": info[2]
                },
                "sensors": {
                    "light": light_sensor.read()
                },
                "led": {
                    "onboard": led.value()
                }
            }
        }
    })

# Using the message above, the device shadow is updated.
    try:
        mqtt_publish(client=mqtt, message=mesg)
    except:
        print("Unable to publish message.")

# Wait for 10 seconds before checking for messages and publishing a new update.
    print("Sleep for 10 seconds")
    time.sleep(10)
