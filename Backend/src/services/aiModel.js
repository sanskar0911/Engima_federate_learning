import * as tf from "@tensorflow/tfjs";

let model = null;

// 🔥 Train model using feedback data
export const trainModel = async (data) => {
  if (!data.features.length) return;

  const xs = tf.tensor2d(data.features);
  const ys = tf.tensor2d(data.labels);

  model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 8,
      activation: "relu",
      inputShape: [5],
    })
  );

  model.add(
    tf.layers.dense({
      units: 1,
      activation: "sigmoid",
    })
  );

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  await model.fit(xs, ys, {
    epochs: 10,
  });

  console.log("✅ AI Model Trained");
};

// 🔥 Predict fraud probability
export const predictFraud = (features) => {
  try {
    if (!model) return 0;

    const input = tf.tensor2d([features]);
    const prediction = model.predict(input);

    return prediction.dataSync()[0]; // value between 0–1
  } catch (err) {
    return 0;
  }
};