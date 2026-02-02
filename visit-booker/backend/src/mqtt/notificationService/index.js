import mqtt from "mqtt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });

const client = mqtt.connect("mqtt://localhost:1883");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmail(data) {
  const user = data?.user ?? "unknown";
  const to = data?.email ?? data?.to ?? null;
  const message = data?.message ?? "(empty message)";
  const subject = data?.subject ?? "Notification";

  if (!to) {
    console.warn(`Email not sent: missing recipient for user ${user}`);
    return { ok: false, channel: "EMAIL", user, reason: "missing recipient" };
  }

  const from = process.env.EMAIL_FROM ?? process.env.GMAIL_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: message,
  });

  console.log(
    `Email sent to ${to} (user ${user}) | subject: ${subject} | id: ${info.messageId}`
  );

  return { ok: true, channel: "EMAIL", user, subject, to, id: info.messageId };
}


client.on("connect", () => {
  console.log("Notification service connected to MQTT broker");
  client.subscribe("notifications/send");
});

client.on("message", async (topic, message) => {
  const data = JSON.parse(message.toString());

  if (data.type === "EMAIL") {
    await sendEmail(data);
  }

});

