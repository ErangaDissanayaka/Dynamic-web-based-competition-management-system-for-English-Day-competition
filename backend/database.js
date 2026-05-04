import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/English_Day_Competition";

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  await mongoose.connect(mongoUri);
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${mongoUri}`);
}
