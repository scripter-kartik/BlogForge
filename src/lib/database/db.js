// src/lib/database/db.js
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * connectDB - safe mongoose connection helper for serverless / node environments
 * Usage: await connectDB();
 */
const connectDB = async () => {
  if (cached.conn) {
    // Already connected
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set.");
  }

  if (!cached.promise) {
    const opts = {
      // use the defaults for recent mongoose versions
      // pass options only if you need to set them
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
