
import client from "../mqtt/mqttClient.js";

export function sendNotification({ userId, email, type, topic, subject, message }) {
  const payload = {
    user: userId,
    email,
    type,
    topic,
    subject,
    message,
    createdAt: new Date().toISOString(),
  };

  client.publish("notifications/send", JSON.stringify(payload), { qos: 1 }, (error) => {
    if (error) {
      console.error("Failed to send notification:", error);
    }
  });

}