import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fraud-detection";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ MongoDB Connected:", uri);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Failed (${error.message}).`);
    console.warn("ℹ️ If you have MongoDB installed or MongoDB Atlas, configure MONGO_URI in Backend/.env");
  }
};

export default connectDB;
