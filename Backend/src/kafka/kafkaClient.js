import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "fraud-detection-system",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 2
  }
});