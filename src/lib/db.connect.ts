import mongoose from "mongoose";

const DB_URI = process.env.DB_URL!;

if (!DB_URI) throw new Error("DB_URI is not defined in .env");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDb() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };
    cached.promise = mongoose
      .connect(DB_URI, opts)
      .then((mongoose) => mongoose.connection);
  }
  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    cached.promise = null;
    throw new Error("Failed to connect to database: ", error.message);
  }
  return cached.conn;
}
