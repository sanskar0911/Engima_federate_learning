import { kafka } from "./kafkaClient.js";
import { processTransactionDirect } from "./consumer.js";

const producer = kafka.producer();

let isKafkaConnected = false;

// ✅ START PRODUCER
export const startProducer = async () => {
  try {
    await producer.connect();
    isKafkaConnected = true;
    console.log("✅ Kafka Producer Connected");
  } catch (error) {
    console.error("❌ Kafka Producer Failed to Connect. Using DIRECT FALLBACK PIPELINE.");
    isKafkaConnected = false;
  }
};

// ✅ SEND TRANSACTION
export const produceTransaction = async (transaction) => {
  if (!isKafkaConnected) {
    // 🔥 Fallback pipeline
    return processTransactionDirect(transaction);
  }

  try {
    await producer.send({
      topic: "transactions",
      messages: [{ value: JSON.stringify(transaction) }],
    });
    // console.log("📤 Transaction sent:", transaction.transactionId);
  } catch (error) {
    console.error("❌ Produce error, trying fallback:", error);
    processTransactionDirect(transaction);
  }
};

// 🚀 TRIGGER FEDERATED TRAINING
export const triggerFederatedTraining = async (options = {}) => {
  const payload = {
    action: "START_TRAINING",
    numClients: options.numClients || 5,
    numRounds: options.numRounds || 5,
    timestamp: Date.now(),
    triggerSource: "NodeBackend_SimulationRoute"
  };

  console.log("🚀 [Kafka Producer] Emitting START_TRAINING trigger to topic 'START_TRAINING'...");

  if (isKafkaConnected) {
    try {
      await producer.send({
        topic: "START_TRAINING",
        messages: [{ value: JSON.stringify(payload) }]
      });
      console.log("✅ [Kafka Producer] Successfully sent START_TRAINING to Kafka broker.");
      return { success: true, viaKafka: true, payload };
    } catch (err) {
      console.error("❌ [Kafka Producer Error] Failed to publish START_TRAINING:", err.message);
    }
  }

  // Fallback direct simulator pipeline if Kafka broker is not running locally
  import("./consumer.js").then(({ simulateFederatedTrainingDirect }) => {
    if (typeof simulateFederatedTrainingDirect === "function") {
      simulateFederatedTrainingDirect(payload);
    }
  });

  return { success: true, viaKafka: false, note: "Trigger dispatched via direct engine fallback", payload };
};