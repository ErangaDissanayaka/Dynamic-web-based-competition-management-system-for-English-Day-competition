import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/English_Day_Competition";

function getSafeMongoUri(rawUri) {
  try {
    const uri = new URL(rawUri);
    if (uri.password) {
      uri.password = "***";
    }
    return uri.toString();
  } catch {
    return rawUri;
  }
}

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  await mongoose.connect(mongoUri);

  if (!mongoose.connection.db) {
    throw new Error(
      "MongoDB connected, but the database handle is unavailable.",
    );
  }

  await mongoose.connection.db.admin().command({ ping: 1 });
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${getSafeMongoUri(mongoUri)}`);
}
